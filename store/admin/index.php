<?php
/* IES Store – RFQ Admin (al-khadraa.com/store/admin/). One admin account; data in store/api/data/. */
declare(strict_types=1);
require __DIR__ . '/inc/core.php';
require __DIR__ . '/inc/tools.php';
start_session();
ensure_dirs();

$p = (string)($_GET['p'] ?? 'list');
$post = $_SERVER['REQUEST_METHOD'] === 'POST';
if ($post) check_csrf();

// ---------- first-time setup ----------
if (cfg() === null) {
  if (!is_file(SETUP_FLAG)) { layout_start(t('Setup locked')); echo '<div class="card"><h1>' . t('Setup locked') . '</h1><p>' . t('No admin account exists and setup is locked. Upload the file SETUP_ALLOWED to store/api/data/ (it is in the package), then reload this page.') . '</p></div>'; layout_end(); exit; }
  if ($post && ($_POST['a'] ?? '') === 'setup') {
    $u = trim((string)($_POST['user'] ?? ''));
    $pw = (string)($_POST['pw'] ?? '');
    if (!preg_match('/^[A-Za-z0-9._-]{3,30}$/', $u)) { flash('err', 'User name: 3–30 letters, digits, dot, dash or underscore.'); go('index.php'); }
    if (strlen($pw) < 10 || $pw !== ($_POST['pw2'] ?? '')) { flash('err', 'Password: at least 10 characters, typed the same twice.'); go('index.php'); }
    save_cfg(['user' => $u, 'hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')]);
    @unlink(SETUP_FLAG);
    $_SESSION['uid'] = $u;
    session_regenerate_id(true);
    audit('setup', $u, 'admin account created; setup locked');
    flash('ok', 'Admin account created. Setup is now locked.');
    go('index.php');
  }
  layout_start(t('First-time setup'));
  echo '<form method="post" action="index.php" class="card narrow"><h1>' . t('First-time setup') . '</h1><p>' . t('Create the admin account for the store RFQ register. Choose your own password; it is stored only as a hash.') . '</p>' . csrf_field() . '<input type="hidden" name="a" value="setup">'
    . '<label>' . t('User name') . '<input name="user" required autocomplete="username" pattern="[A-Za-z0-9._\-]{3,30}"></label>'
    . '<label>' . t('Password (min. 10 characters)') . '<input type="password" name="pw" required minlength="10" autocomplete="new-password"></label>'
    . '<label>' . t('Repeat password') . '<input type="password" name="pw2" required minlength="10" autocomplete="new-password"></label>'
    . '<button class="btn">' . t('Create admin account') . '</button></form>';
  layout_end();
  exit;
}

// ---------- sign in / out ----------
if ($p === 'logout') { audit('sign-out'); $_SESSION = []; session_regenerate_id(true); go('index.php'); }
if (!signed_in()) {
  if ($post && ($_POST['a'] ?? '') === 'login') {
    $u = trim((string)($_POST['user'] ?? ''));
    $c = cfg();
    if (throttled($u)) { flash('err', 'Too many failed attempts. Wait 15 minutes and try again.'); go('index.php'); }
    if (hash_equals(strtolower($c['user']), strtolower($u)) && password_verify((string)($_POST['pw'] ?? ''), $c['hash'])) {
      clear_failures($u);
      session_regenerate_id(true);
      $_SESSION['uid'] = $c['user'];
      audit('sign-in', $c['user']);
      daily_backup();
      go('index.php');
    }
    note_failure($u);
    audit('sign-in failed', mb_substr($u, 0, 30));
    flash('err', 'Wrong user name or password.');
    go('index.php');
  }
  layout_start(t('Sign in'));
  echo '<form method="post" action="index.php" class="card narrow signin"><img src="assets/logo.png" alt="IES" class="biglogo"><h1>' . t('IES Store – RFQ register') . '</h1>' . csrf_field() . '<input type="hidden" name="a" value="login">'
    . '<label>' . t('User name') . '<input name="user" required autocomplete="username" autofocus></label>'
    . '<label>' . t('Password') . '<input type="password" name="pw" required autocomplete="current-password"></label>'
    . '<button class="btn">' . t('Sign in') . '</button></form>';
  layout_end();
  exit;
}

// ---------- actions (POST) ----------
if ($post) {
  $a = (string)($_POST['a'] ?? '');
  if ($a === 'status') {
    $id = (string)($_POST['id'] ?? '');
    $q = rfq($id);
    if (!$q) { flash('err', 'RFQ not found.'); go('index.php'); }
    $new = (string)($_POST['status'] ?? '');
    $note = trim(mb_substr((string)($_POST['note'] ?? ''), 0, 1000));
    if (!in_array($new, STATUSES, true)) { flash('err', 'Choose a valid status.'); go('index.php?p=view&id=' . urlencode($id)); }
    $s = statuses();
    $e = $s[$id] ?? ['status' => 'New', 'notes' => []];
    $changed = ($e['status'] ?? 'New') !== $new;
    if (!$changed && $note === '') { flash('warn', 'Nothing changed.'); go('index.php?p=view&id=' . urlencode($id)); }
    $e['status'] = $new;
    $e['updated'] = gmdate('c');
    if ($note !== '' || $changed) $e['notes'][] = ['at' => date('Y-m-d H:i'), 'by' => $_SESSION['uid'], 'text' => ($changed ? '[' . ($s[$id]['status'] ?? 'New') . ' → ' . $new . '] ' : '') . $note];
    $s[$id] = $e;
    save_statuses($s);
    audit('status', $id, ($changed ? $new : 'note') . ($note !== '' ? ': ' . $note : ''));
    flash('ok', 'RFQ %s updated.', $id);
    go('index.php?p=view&id=' . urlencode($id));
  }
  if ($a === 'backup') { $n = make_backup('manual backup'); flash('ok', 'Backup saved: %s', $n); go('index.php?p=backup'); }
  if ($a === 'upload') {
    $f = $_FILES['file'] ?? null;
    if (!$f || $f['error'] !== UPLOAD_ERR_OK || $f['size'] > 50 * 1024 * 1024) { flash('err', 'Choose a backup ZIP file (max. 50 MB).'); go('index.php?p=backup'); }
    if (!preg_match('/\.zip$/i', (string)$f['name'])) { flash('err', 'Only .zip backup files can be restored.'); go('index.php?p=backup'); }
    $job = bin2hex(random_bytes(8));
    move_uploaded_file($f['tmp_name'], UPLOAD_DIR . '/restore_' . $job . '.zip');
    audit('restore upload', mb_substr((string)$f['name'], 0, 80));
    go('index.php?p=verify&job=' . $job);
  }
  if ($a === 'apply') {
    $job = preg_replace('/[^a-f0-9]/', '', (string)($_POST['job'] ?? ''));
    $file = UPLOAD_DIR . '/restore_' . $job . '.zip';
    if ($job === '' || !is_file($file)) { flash('err', 'The uploaded file is no longer available. Upload it again.'); go('index.php?p=backup'); }
    if (trim((string)($_POST['confirm'] ?? '')) !== 'RESTORE') { flash('err', 'Type RESTORE to confirm.'); go('index.php?p=verify&job=' . $job); }
    try { $r = apply_backup($file); } catch (Throwable) { flash('err', 'The file has errors – nothing was restored.'); go('index.php?p=verify&job=' . $job); }
    @unlink($file);
    flash('ok', 'Restore finished: %s RFQs added. Backup made before restore: %s', $r['added'], $r['pre']);
    go('index.php?p=backup');
  }
  if ($a === 'password') {
    $c = cfg();
    if (!password_verify((string)($_POST['old'] ?? ''), $c['hash'])) { flash('err', 'Current password is wrong.'); go('index.php?p=account'); }
    $pw = (string)($_POST['pw'] ?? '');
    if (strlen($pw) < 10 || $pw !== ($_POST['pw2'] ?? '')) { flash('err', 'Password: at least 10 characters, typed the same twice.'); go('index.php?p=account'); }
    $c['hash'] = password_hash($pw, PASSWORD_DEFAULT);
    save_cfg($c);
    audit('password changed', $c['user']);
    flash('ok', 'Password changed.');
    go('index.php?p=account');
  }
  go('index.php');
}

// ---------- downloads (GET) ----------
if ($p === 'export') {
  $list = rfqs();
  $tmp = tempnam(UPLOAD_DIR, 'x');
  xlsx_write($tmp, export_sheets($list));
  audit('export', 'RFQ register', count($list) . ' RFQs');
  header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  header('Content-Disposition: attachment; filename="IES_Store_RFQ_Register_' . date('Y-m-d') . '.xlsx"');
  header('Content-Length: ' . filesize($tmp));
  readfile($tmp);
  @unlink($tmp);
  exit;
}
if ($p === 'download') {
  $n = basename((string)($_GET['f'] ?? ''));
  if (!preg_match('/^IES_Store_RFQ_Backup_\d{8}_\d{6}\.zip$/', $n) || !is_file(BACKUP_DIR . '/' . $n)) { flash('err', 'Backup not found.'); go('index.php?p=backup'); }
  audit('download backup', $n);
  header('Content-Type: application/zip');
  header('Content-Disposition: attachment; filename="' . $n . '"');
  header('Content-Length: ' . filesize(BACKUP_DIR . '/' . $n));
  readfile(BACKUP_DIR . '/' . $n);
  exit;
}

// ---------- pages ----------
if ($p === 'view') {
  $q = rfq((string)($_GET['id'] ?? ''));
  if (!$q) { flash('err', 'RFQ not found.'); go('index.php'); }
  $c = $q['customer'];
  layout_start($q['id']);
  echo '<p><a href="index.php">← ' . t('All RFQs') . '</a></p><div class="head"><h1>' . ltr($q['id']) . '</h1>' . badge($q['status']) . '</div>';
  echo '<div class="grid2"><section class="card"><h2>' . t('Customer') . '</h2><dl class="kv">';
  foreach (['Company' => 'company', 'Contact' => 'name', 'Phone' => 'phone', 'Email' => 'email', 'Delivery city' => 'city', 'Project / PO ref' => 'project', 'Required by' => 'date'] as $lab => $k) {
    $v = (string)($c[$k] ?? '');
    $val = $v === '' ? '–' : ($k === 'phone' ? '<a href="https://wa.me/' . h(preg_replace('/\D/', '', $v)) . '" rel="noopener" target="_blank">' . ltr($v) . '</a>' : ($k === 'email' ? '<a href="mailto:' . h($v) . '?subject=' . rawurlencode('IES – ' . $q['id']) . '">' . ltr($v) . '</a>' : h($v)));
    echo '<dt>' . t($lab) . '</dt><dd>' . $val . '</dd>';
  }
  echo '<dt>' . t('Received') . '</dt><dd>' . ltr(baghdad($q['received'])) . '</dd><dt>' . t('Language') . '</dt><dd>' . h(strtoupper($q['lang'] ?? '')) . '</dd></dl>';
  if (($c['msg'] ?? '') !== '') echo '<h3>' . t('Message') . '</h3><p class="msg">' . nl2br(h($c['msg'])) . '</p>';
  echo '</section><section class="card"><h2>' . t('Status & notes') . '</h2><form method="post" action="index.php">' . csrf_field() . '<input type="hidden" name="a" value="status"><input type="hidden" name="id" value="' . h($q['id']) . '"><label>' . t('Status') . '<select name="status">';
  foreach (STATUSES as $s) echo '<option value="' . h($s) . '"' . ($s === $q['status'] ? ' selected' : '') . '>' . t($s) . '</option>';
  echo '</select></label><label>' . t('Internal note (not sent to the customer)') . '<textarea name="note" rows="3" maxlength="1000"></textarea></label><button class="btn">' . t('Save') . '</button></form>';
  if ($q['notes']) { echo '<ul class="notes">'; foreach (array_reverse($q['notes']) as $n) echo '<li><small>' . ltr($n['at'] ?? '') . ' · ' . h($n['by'] ?? '') . '</small><br>' . h($n['text'] ?? '') . '</li>'; echo '</ul>'; }
  echo '</section></div><section class="card"><h2>' . t('Items') . ' (' . count($q['lines']) . ')</h2><table class="tbl"><thead><tr><th>#</th><th>' . t('Source') . '</th><th>' . t('Part number / model') . '</th><th>' . t('Description') . '</th><th>' . t('Qty') . '</th><th>' . t('Customer note') . '</th></tr></thead><tbody>';
  foreach ($q['lines'] as $i => $l) echo '<tr><td data-label="#">' . ($i + 1) . '</td><td data-label="' . t('Source') . '">' . h(strtoupper($l['src'] ?? '')) . '</td><td data-label="' . t('Part number / model') . '" class="mono">' . ltr($l['pn'] ?? '') . '</td><td data-label="' . t('Description') . '">' . h($l['d'] ?? '') . '</td><td data-label="' . t('Qty') . '">' . (int)($l['qty'] ?? 0) . '</td><td data-label="' . t('Customer note') . '">' . h($l['note'] ?? '') . '</td></tr>';
  echo '</tbody></table></section>';
  layout_end();
  exit;
}

if ($p === 'backup') {
  layout_start(t('Backup & restore'));
  echo '<h1>' . t('Backup & restore') . '</h1><div class="grid2"><section class="card"><h2>' . t('Save a backup now') . '</h2><p>' . t('A backup ZIP holds every RFQ (JSON), the status and notes file, the audit log and an Excel copy of the register. A backup is also made automatically at the first sign-in of each day and before every restore. The newest 30 are kept.') . '</p><form method="post" action="index.php">' . csrf_field() . '<input type="hidden" name="a" value="backup"><button class="btn">' . t('Save a backup now') . '</button></form></section>';
  echo '<section class="card"><h2>' . t('Restore from a backup') . '</h2><p>' . t('Restore adds RFQs that are missing from the register. It never changes or deletes existing RFQs. The file is checked first; you see the report before anything is changed.') . '</p><form method="post" action="index.php" enctype="multipart/form-data">' . csrf_field() . '<input type="hidden" name="a" value="upload"><label>' . t('Backup ZIP file') . '<input type="file" name="file" accept=".zip" required></label><button class="btn btn-o">' . t('Upload & verify') . '</button></form></section></div>';
  $b = backups();
  echo '<section class="card"><h2>' . t('Saved backups') . ' (' . count($b) . ')</h2>';
  if (!$b) echo '<p>' . t('No backups yet.') . '</p>';
  else { echo '<table class="tbl"><thead><tr><th>' . t('File') . '</th><th>' . t('Date') . '</th><th>' . t('Size') . '</th><th></th></tr></thead><tbody>'; foreach ($b as $x) echo '<tr><td data-label="' . t('File') . '" class="mono">' . ltr($x['name']) . '</td><td data-label="' . t('Date') . '">' . ltr(date('Y-m-d H:i', $x['time'])) . '</td><td data-label="' . t('Size') . '">' . ltr(number_format($x['size'] / 1024, 1) . ' KB') . '</td><td><a class="btn btn-s" href="index.php?p=download&amp;f=' . h(rawurlencode($x['name'])) . '">' . t('Download') . '</a></td></tr>'; echo '</tbody></table>'; }
  echo '</section>';
  layout_end();
  exit;
}

if ($p === 'verify') {
  $job = preg_replace('/[^a-f0-9]/', '', (string)($_GET['job'] ?? ''));
  $file = UPLOAD_DIR . '/restore_' . $job . '.zip';
  if ($job === '' || !is_file($file)) { flash('err', 'The uploaded file is no longer available. Upload it again.'); go('index.php?p=backup'); }
  $r = verify_backup($file);
  layout_start(t('Verification report'));
  echo '<p><a href="index.php?p=backup">← ' . t('Backup & restore') . '</a></p><h1>' . t('Verification report') . '</h1><section class="card"><ul class="sum"><li>' . t('Errors') . ': <b>' . count($r['errors']) . '</b></li><li>' . t('Warnings') . ': <b>' . count($r['warnings']) . '</b></li><li>' . t('RFQs to add') . ': <b>' . count($r['new']) . '</b></li><li>' . t('Already in the register (left unchanged)') . ': <b>' . count($r['existing']) . '</b></li></ul>';
  foreach ($r['errors'] as $e) echo '<p class="flash err">' . h(t($e)) . '</p>';
  foreach ($r['warnings'] as $w) echo '<p class="flash warn">' . h(t($w)) . '</p>';
  if ($r['new']) { echo '<h3>' . t('RFQs to add') . '</h3><p class="mono">' . implode(', ', array_map('ltr', $r['new'])) . '</p>'; }
  if (!$r['errors'] && ($r['new'] || $r['status'])) {
    echo '<form method="post" action="index.php" class="apply">' . csrf_field() . '<input type="hidden" name="a" value="apply"><input type="hidden" name="job" value="' . h($job) . '"><label>' . t('Type RESTORE to confirm') . '<input name="confirm" required pattern="RESTORE" autocomplete="off" dir="ltr"></label><button class="btn">' . t('Apply restore') . '</button></form>';
  } else echo '<p><b>' . t('Apply is locked: nothing to restore or the file has errors.') . '</b></p>';
  echo '</section>';
  layout_end();
  exit;
}

if ($p === 'audit') {
  layout_start(t('Audit log'));
  echo '<h1>' . t('Audit log') . '</h1><section class="card"><table class="tbl"><thead><tr><th>' . t('Time (UTC)') . '</th><th>' . t('User') . '</th><th>' . t('Action') . '</th><th>' . t('Record') . '</th><th>' . t('Details') . '</th></tr></thead><tbody>';
  foreach (audit_rows() as $a) echo '<tr><td data-label="' . t('Time (UTC)') . '">' . ltr(str_replace(['T', '+00:00'], [' ', ''], $a[0])) . '</td><td data-label="' . t('User') . '">' . h($a[1]) . '</td><td data-label="' . t('Action') . '">' . h(t($a[3])) . '</td><td data-label="' . t('Record') . '" class="mono">' . ltr($a[4]) . '</td><td data-label="' . t('Details') . '">' . h($a[5]) . '</td></tr>';
  echo '</tbody></table></section>';
  layout_end();
  exit;
}

if ($p === 'account') {
  layout_start(t('Account'));
  echo '<h1>' . t('Account') . '</h1><form method="post" action="index.php" class="card narrow">' . csrf_field() . '<input type="hidden" name="a" value="password"><h2>' . t('Change password') . '</h2><label>' . t('Current password') . '<input type="password" name="old" required autocomplete="current-password"></label><label>' . t('New password (min. 10 characters)') . '<input type="password" name="pw" required minlength="10" autocomplete="new-password"></label><label>' . t('Repeat password') . '<input type="password" name="pw2" required minlength="10" autocomplete="new-password"></label><button class="btn">' . t('Change password') . '</button></form>';
  layout_end();
  exit;
}

if ($p === 'help') { layout_start(t('Help')); require __DIR__ . '/inc/help_' . lang() . '.php'; layout_end(); exit; }

// ---------- list (default) ----------
$all = rfqs();
$qs = trim((string)($_GET['q'] ?? ''));
$fs = (string)($_GET['s'] ?? '');
$list = array_values(array_filter($all, function ($r) use ($qs, $fs) {
  if ($fs !== '' && $r['status'] !== $fs) return false;
  if ($qs === '') return true;
  $hay = mb_strtolower($r['id'] . ' ' . implode(' ', $r['customer']) . ' ' . implode(' ', array_map(fn($l) => ($l['pn'] ?? '') . ' ' . ($l['d'] ?? ''), $r['lines'])));
  return str_contains($hay, mb_strtolower($qs));
}));
layout_start(t('RFQ register'));
$cnt = array_count_values(array_column($all, 'status'));
echo '<div class="head"><h1>' . t('RFQ register') . '</h1><a class="btn btn-o" href="index.php?p=export">⬇ ' . t('Export to Excel') . '</a></div><div class="kpis"><a class="kpi' . ($fs === '' ? ' on' : '') . '" href="index.php"><b>' . count($all) . '</b><span>' . t('All') . '</span></a>';
foreach (STATUSES as $s) echo '<a class="kpi st-' . h(strtolower(str_replace(' ', '-', $s))) . ($fs === $s ? ' on' : '') . '" href="index.php?s=' . urlencode($s) . '"><b>' . (int)($cnt[$s] ?? 0) . '</b><span>' . t($s) . '</span></a>';
echo '</div><form class="search" method="get" action="index.php"><input type="hidden" name="s" value="' . h($fs) . '"><input type="search" name="q" value="' . h($qs) . '" placeholder="' . t('Search RFQ no., company, phone, part number…') . '"><button class="btn btn-o">' . t('Search') . '</button></form>';
if (!$list) echo '<section class="card"><p>' . ($all ? t('No RFQ matches the search.') : t('No RFQs received yet. RFQs sent from the store appear here.')) . '</p></section>';
else {
  echo '<section class="card"><table class="tbl"><thead><tr><th>' . t('RFQ No.') . '</th><th>' . t('Received') . '</th><th>' . t('Company') . '</th><th>' . t('Contact') . '</th><th>' . t('Phone') . '</th><th>' . t('Lines') . '</th><th>' . t('Status') . '</th></tr></thead><tbody>';
  foreach ($list as $r) echo '<tr class="rowlink" data-href="index.php?p=view&amp;id=' . h(urlencode($r['id'])) . '"><td data-label="' . t('RFQ No.') . '" class="mono"><a href="index.php?p=view&amp;id=' . h(urlencode($r['id'])) . '">' . ltr($r['id']) . '</a></td><td data-label="' . t('Received') . '">' . ltr(baghdad($r['received'] ?? '')) . '</td><td data-label="' . t('Company') . '">' . h($r['customer']['company'] ?? '') . '</td><td data-label="' . t('Contact') . '">' . h($r['customer']['name'] ?? '') . '</td><td data-label="' . t('Phone') . '">' . ltr($r['customer']['phone'] ?? '') . '</td><td data-label="' . t('Lines') . '">' . count($r['lines']) . '</td><td data-label="' . t('Status') . '">' . badge($r['status']) . '</td></tr>';
  echo '</tbody></table></section>';
}
layout_end();

// ---------- layout ----------
function badge(string $s): string { return '<span class="badge st-' . h(strtolower(str_replace(' ', '-', $s))) . '">' . t($s) . '</span>'; }
function layout_start(string $title): void {
  $ar = lang() === 'ar';
  $nav = '';
  if (signed_in()) {
    $p = (string)($_GET['p'] ?? 'list');
    foreach (['list' => 'RFQ register', 'backup' => 'Backup & restore', 'audit' => 'Audit log', 'help' => '❓ Help', 'account' => 'Account'] as $k => $lab)
      $nav .= '<a href="index.php' . ($k === 'list' ? '' : '?p=' . $k) . '"' . (($p === $k || ($k === 'list' && $p === 'view')) ? ' aria-current="page"' : '') . '>' . t($lab) . '</a>';
    $nav .= '<a href="index.php?p=logout">' . t('Sign out') . ' (' . h($_SESSION['uid']) . ')</a>';
  }
  $other = $ar ? 'en' : 'ar';
  $qs = $_GET; $qs['lang'] = $other;
  echo '<!doctype html><html lang="' . lang() . '" dir="' . ($ar ? 'rtl' : 'ltr') . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>' . h($title) . ' · ' . t('IES Store RFQ Admin') . '</title><link rel="icon" href="assets/favicon.png"><link rel="stylesheet" href="assets/admin.css?v=' . APP_VERSION . '"><script src="assets/admin.js?v=' . APP_VERSION . '" defer></script></head><body>'
    . '<header class="top"><div class="wrap"><a class="brand" href="index.php"><span class="logo"><img src="assets/logo.png" alt="IES"></span><span>' . t('IES Store – RFQ Admin') . '</span></a>'
    . ($nav ? '<button class="burger" type="button" aria-label="' . t('Menu') . '" aria-expanded="false">☰</button>' : '') . '<nav class="nav">' . $nav . '<a class="lang" href="index.php?' . h(http_build_query($qs)) . '" lang="' . $other . '">' . ($ar ? 'English' : 'عربي') . '</a></nav></div></header><main class="wrap">';
  if (!empty($_SESSION['flash'])) {
    [$type, $msg] = $_SESSION['flash'];
    $args = $_SESSION['flash'][2] ?? [];
    echo '<p class="flash ' . h($type) . '">' . h(t($msg, ...$args)) . '</p>';
    unset($_SESSION['flash']);
  }
}
function layout_end(): void {
  $ar = lang() === 'ar';
  echo '</main><footer class="foot"><div class="wrap"><span>' . ltr(APP_NAME . ' v' . APP_VERSION . ' · ' . APP_DATE) . ' · ' . ltr((new DateTime('now', new DateTimeZone('Asia/Baghdad')))->format('Y-m-d H:i')) . ' ' . t('(Baghdad time)') . '</span><span>© ' . date('Y') . ' ' . ($ar ? 'شركة الخضراء للخدمات الهندسية المتكاملة (IES). جميع الحقوق محفوظة.' : 'AL-KHADRAA INTEGRATED ENGINEERING SERVICES (IES). All rights reserved.') . '</span></div></footer></body></html>';
}
