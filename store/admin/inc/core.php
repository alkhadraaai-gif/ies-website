<?php
/* IES Store – RFQ Admin core: config, session, CSRF, throttle, audit, data access, i18n.
   Data lives in store/api/data/ (denied to the web by .htaccess). No database needed. */
declare(strict_types=1);

const APP_NAME = 'IES Store RFQ Admin';
const APP_VERSION = '1.0.0';
const APP_DATE = '2026-11-27';
const KEEP_BACKUPS = 30;
const IDLE_MIN = 60;

define('DATA_DIR', realpath(__DIR__ . '/../../api/data') ?: (__DIR__ . '/../../api/data'));
define('CFG_FILE', DATA_DIR . '/admin_config.php');
define('SETUP_FLAG', DATA_DIR . '/SETUP_ALLOWED');
define('STATUS_FILE', DATA_DIR . '/status.json');
define('AUDIT_FILE', DATA_DIR . '/audit.log');
define('BACKUP_DIR', DATA_DIR . '/backups');
define('UPLOAD_DIR', DATA_DIR . '/uploads');
const STATUSES = ['New', 'In progress', 'Quoted', 'Won', 'Lost', 'Closed'];

require __DIR__ . '/lang_ar.php';
date_default_timezone_set('Asia/Baghdad');   // all dates shown to staff in Baghdad time; audit log stays UTC

// ---------- headers ----------
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; frame-ancestors 'none'; form-action 'self'");
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');

// ---------- language ----------
function lang(): string {
  static $l = null;
  if ($l !== null) return $l;
  if (isset($_GET['lang']) && in_array($_GET['lang'], ['en', 'ar'], true)) {
    $l = $_GET['lang'];
    setcookie('iesrfq_lang', $l, ['expires' => time() + 31536000, 'path' => base_path(), 'samesite' => 'Lax', 'secure' => is_https(), 'httponly' => true]);
    return $l;
  }
  if (isset($_COOKIE['iesrfq_lang']) && in_array($_COOKIE['iesrfq_lang'], ['en', 'ar'], true)) return $l = $_COOKIE['iesrfq_lang'];
  return $l = (stripos($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '', 'ar') === 0 ? 'ar' : 'en');
}
function t(string $s, ...$a): string {
  if (lang() === 'ar' && isset(AR[$s])) $s = AR[$s];
  return $a ? vsprintf($s, $a) : $s;
}
function h($s): string { return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
/** isolate Latin text/numbers inside Arabic pages */
function ltr($s): string { return '<bdi dir="ltr">' . h($s) . '</bdi>'; }

function is_https(): bool { return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'); }
function base_path(): string { return rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/store/admin/index.php')), '/') . '/'; }

// ---------- session ----------
function start_session(): void {
  if (session_status() === PHP_SESSION_ACTIVE) return;
  session_name('iesrfq');
  session_set_cookie_params(['lifetime' => 0, 'path' => base_path(), 'secure' => is_https(), 'httponly' => true, 'samesite' => 'Lax']);
  session_start();
  if (!empty($_SESSION['uid']) && (time() - ($_SESSION['seen'] ?? 0)) > IDLE_MIN * 60) {
    $_SESSION = [];
    session_regenerate_id(true);
    $_SESSION['flash'] = ['warn', 'Your session expired after 60 minutes without activity. Please sign in again.'];
  }
  $_SESSION['seen'] = time();
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
function csrf_field(): string { return '<input type="hidden" name="csrf" value="' . h($_SESSION['csrf']) . '">'; }
function check_csrf(): void {
  if (!hash_equals($_SESSION['csrf'] ?? '', (string)($_POST['csrf'] ?? ''))) {
    flash('err', 'The form expired. Please try again.');
    go('index.php');
  }
}
function flash(string $type, string $msg, ...$a): void { $_SESSION['flash'] = [$type, $msg, $a]; }
function go(string $url): never { header('Location: ' . $url); exit; }
function signed_in(): bool { return !empty($_SESSION['uid']); }

// ---------- config & throttle ----------
function cfg(): ?array {
  if (!is_file(CFG_FILE)) return null;
  $c = include CFG_FILE;
  return is_array($c) ? $c : null;
}
function save_cfg(array $c): void {
  ensure_dirs();
  $php = "<?php\n// IES Store RFQ Admin – created " . date('c') . ". Do not share.\nreturn " . var_export($c, true) . ";\n";
  file_put_contents(CFG_FILE, $php, LOCK_EX);
  @chmod(CFG_FILE, 0640);
}
function throttle_key(string $user): string { return DATA_DIR . '/th_' . hash('sha256', strtolower($user) . '|' . ($_SERVER['REMOTE_ADDR'] ?? '')) . '.json'; }
function throttled(string $user): bool {
  $f = throttle_key($user);
  $a = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
  $a = array_values(array_filter($a, fn($ts) => $ts > time() - 900));
  return count($a) >= 8;
}
function note_failure(string $user): void {
  $f = throttle_key($user);
  $a = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
  $a = array_values(array_filter($a, fn($ts) => $ts > time() - 900));
  $a[] = time();
  file_put_contents($f, json_encode($a), LOCK_EX);
}
function clear_failures(string $user): void { @unlink(throttle_key($user)); }

// ---------- audit ----------
function audit(string $action, string $entity = '', string $detail = ''): void {
  ensure_dirs();
  $row = [gmdate('c'), $_SESSION['uid'] ?? '-', $_SERVER['REMOTE_ADDR'] ?? '-', $action, mb_substr($entity, 0, 80), mb_substr(str_replace(["\r", "\n", "\t"], ' ', $detail), 0, 500)];
  file_put_contents(AUDIT_FILE, implode("\t", $row) . "\n", FILE_APPEND | LOCK_EX);
}
function audit_rows(int $limit = 200): array {
  if (!is_file(AUDIT_FILE)) return [];
  $lines = array_slice(file(AUDIT_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [], -$limit);
  return array_reverse(array_map(fn($l) => array_pad(explode("\t", $l), 6, ''), $lines));
}

function ensure_dirs(): void {
  foreach ([DATA_DIR, BACKUP_DIR, UPLOAD_DIR] as $d) if (!is_dir($d)) @mkdir($d, 0750, true);
  if (!is_file(DATA_DIR . '/.htaccess')) file_put_contents(DATA_DIR . '/.htaccess', "Require all denied\n");
}

// ---------- RFQ data ----------
/** All RFQs, newest first. Each: record + _file + status + notes */
function rfqs(): array {
  $st = statuses();
  $out = [];
  foreach (glob(DATA_DIR . '/RFQ-*.json') ?: [] as $f) {
    $r = json_decode((string)file_get_contents($f), true);
    if (!is_array($r) || empty($r['id'])) continue;
    $r['_file'] = basename($f);
    $s = $st[$r['id']] ?? [];
    $r['status'] = in_array($s['status'] ?? '', STATUSES, true) ? $s['status'] : 'New';
    $r['notes'] = $s['notes'] ?? [];
    $r['updated'] = $s['updated'] ?? '';
    $out[] = $r;
  }
  usort($out, fn($a, $b) => strcmp($b['received'] ?? '', $a['received'] ?? ''));
  return $out;
}
function rfq(string $id): ?array {
  foreach (rfqs() as $r) if ($r['id'] === $id) return $r;
  return null;
}
function statuses(): array {
  return is_file(STATUS_FILE) ? (json_decode((string)file_get_contents(STATUS_FILE), true) ?: []) : [];
}
function save_statuses(array $s): void {
  ensure_dirs();
  $tmp = STATUS_FILE . '.tmp';
  file_put_contents($tmp, json_encode($s, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
  rename($tmp, STATUS_FILE);
}
function baghdad(string $iso): string {
  if ($iso === '') return '';
  try { return (new DateTime($iso))->setTimezone(new DateTimeZone('Asia/Baghdad'))->format('Y-m-d H:i'); } catch (Throwable) { return $iso; }
}
