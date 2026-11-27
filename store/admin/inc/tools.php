<?php
/* IES Store – RFQ Admin: Excel export, backup, verify & restore. */
declare(strict_types=1);

// ---------- minimal XLSX writer (inline strings, bold header, frozen first row) ----------
function xlsx_col(int $i): string { $s = ''; for ($i++; $i > 0; $i = intdiv($i - 1, 26)) $s = chr(65 + ($i - 1) % 26) . $s; return $s; }
function xlsx_write(string $path, array $sheets): void {
  $esc = fn($v) => htmlspecialchars((string)$v, ENT_XML1 | ENT_QUOTES, 'UTF-8');
  $z = new ZipArchive();
  if ($z->open($path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) throw new RuntimeException('zip');
  $ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>';
  $wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>';
  $rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  $n = 0;
  foreach ($sheets as $name => $rows) {
    $n++;
    $ct .= '<Override PartName="/xl/worksheets/sheet' . $n . '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
    $wb .= '<sheet name="' . $esc(mb_substr($name, 0, 31)) . '" sheetId="' . $n . '" r:id="rId' . $n . '"/>';
    $rels .= '<Relationship Id="rId' . $n . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' . $n . '.xml"/>';
    $widths = [];
    foreach ($rows as $row) foreach (array_values($row) as $i => $v) $widths[$i] = min(60, max($widths[$i] ?? 8, mb_strlen((string)$v) + 2));
    $x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>';
    foreach ($widths as $i => $w) $x .= '<col min="' . ($i + 1) . '" max="' . ($i + 1) . '" width="' . $w . '" customWidth="1"/>';
    $x .= '</cols><sheetData>';
    foreach (array_values($rows) as $r => $row) {
      $x .= '<row r="' . ($r + 1) . '">';
      foreach (array_values($row) as $c => $v) {
        $ref = xlsx_col($c) . ($r + 1);
        $style = $r === 0 ? ' s="1"' : ($r % 2 === 0 ? ' s="2"' : '');
        if (is_int($v) || is_float($v)) $x .= '<c r="' . $ref . '"' . $style . '><v>' . $v . '</v></c>';
        else $x .= '<c r="' . $ref . '" t="inlineStr"' . $style . '><is><t xml:space="preserve">' . $esc($v) . '</t></is></c>';
      }
      $x .= '</row>';
    }
    $x .= '</sheetData>' . (count($rows) > 1 ? '<autoFilter ref="A1:' . xlsx_col(max(0, count($rows[0] ?? []) - 1)) . count($rows) . '"/>' : '') . '</worksheet>';
    $z->addFromString('xl/worksheets/sheet' . $n . '.xml', $x);
  }
  $z->addFromString('[Content_Types].xml', $ct . '</Types>');
  $z->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  $z->addFromString('xl/workbook.xml', $wb . '</sheets></workbook>');
  $z->addFromString('xl/_rels/workbook.xml.rels', $rels . '<Relationship Id="rId' . ($n + 1) . '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  // IES palette: header #4F81BD white bold, alternate rows #DBE5F1, borders #95B3D7, Calibri 11
  $z->addFromString('xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF4F81BD"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDBE5F1"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FF95B3D7"/></left><right style="thin"><color rgb="FF95B3D7"/></right><top style="thin"><color rgb="FF95B3D7"/></top><bottom style="thin"><color rgb="FF95B3D7"/></bottom></border></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf borderId="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf><xf fillId="3" borderId="1" applyFill="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
  $z->close();
}

/** Sheets for the RFQ register export */
function export_sheets(array $list): array {
  $r = [['RFQ No.', 'Received (Baghdad)', 'Status', 'Company', 'Contact', 'Phone', 'Email', 'Delivery city', 'Project / PO ref', 'Required by', 'Lines', 'Total qty', 'Message', 'Language', 'Internal notes', 'Last update']];
  $l = [['RFQ No.', 'Line', 'Source', 'Part number / model', 'Description', 'Qty', 'Customer note']];
  foreach ($list as $q) {
    $c = $q['customer'] ?? [];
    $notes = implode(' | ', array_map(fn($n) => ($n['at'] ?? '') . ' ' . ($n['by'] ?? '') . ': ' . ($n['text'] ?? ''), $q['notes'] ?? []));
    $tq = 0;
    foreach (($q['lines'] ?? []) as $i => $ln) {
      $tq += (int)($ln['qty'] ?? 0);
      $l[] = [$q['id'], $i + 1, strtoupper((string)($ln['src'] ?? '')), (string)($ln['pn'] ?? ''), (string)($ln['d'] ?? ''), (int)($ln['qty'] ?? 0), (string)($ln['note'] ?? '')];
    }
    $r[] = [$q['id'], baghdad($q['received'] ?? ''), $q['status'], $c['company'] ?? '', $c['name'] ?? '', $c['phone'] ?? '', $c['email'] ?? '', $c['city'] ?? '', $c['project'] ?? '', $c['date'] ?? '', count($q['lines'] ?? []), $tq, $c['msg'] ?? '', strtoupper($q['lang'] ?? ''), $notes, baghdad($q['updated'] ?? '')];
  }
  $info = [['Item', 'Value'], ['Report', 'IES Store – RFQ register'], ['Exported', date('Y-m-d H:i') . ' (Baghdad time)'], ['RFQs', count($list)], ['Exported by', $_SESSION['uid'] ?? ''], ['App', APP_NAME . ' v' . APP_VERSION], ['Company', 'AL-KHADRAA INTEGRATED ENGINEERING SERVICES (IES)']];
  return ['RFQs' => $r, 'Lines' => $l, 'Info' => $info];
}

// ---------- backups ----------
function make_backup(string $reason): string {
  ensure_dirs();
  $name = 'IES_Store_RFQ_Backup_' . date('Ymd_His') . '.zip';
  $z = new ZipArchive();
  if ($z->open(BACKUP_DIR . '/' . $name, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) throw new RuntimeException('zip');
  $n = 0;
  foreach (glob(DATA_DIR . '/RFQ-*.json') ?: [] as $f) { $z->addFile($f, 'rfq/' . basename($f)); $n++; }
  if (is_file(STATUS_FILE)) $z->addFile(STATUS_FILE, 'status.json');
  if (is_file(AUDIT_FILE)) $z->addFile(AUDIT_FILE, 'audit.log');
  $tmp = tempnam(UPLOAD_DIR, 'x');
  xlsx_write($tmp, export_sheets(rfqs()));
  $z->addFile($tmp, 'IES_Store_RFQ_Register.xlsx');
  $z->addFromString('manifest.json', json_encode(['app' => APP_NAME, 'version' => APP_VERSION, 'created' => gmdate('c'), 'reason' => $reason, 'rfqs' => $n], JSON_PRETTY_PRINT));
  $z->close();
  @unlink($tmp);
  // keep newest KEEP_BACKUPS
  $all = backups();
  foreach (array_slice($all, KEEP_BACKUPS) as $b) @unlink(BACKUP_DIR . '/' . $b['name']);
  // housekeeping: old rate-limit counters
  foreach (glob(DATA_DIR . '/rl_*.cnt') ?: [] as $f) if (filemtime($f) < time() - 7200) @unlink($f);
  audit('backup', $name, $reason . ', ' . $n . ' RFQs');
  return $name;
}
function backups(): array {
  $out = [];
  foreach (glob(BACKUP_DIR . '/IES_Store_RFQ_Backup_*.zip') ?: [] as $f) $out[] = ['name' => basename($f), 'size' => filesize($f), 'time' => filemtime($f)];
  usort($out, fn($a, $b) => strcmp($b['name'], $a['name']));
  return $out;
}
function daily_backup(): void {
  $today = 'IES_Store_RFQ_Backup_' . date('Ymd');
  foreach (backups() as $b) if (str_starts_with($b['name'], $today)) return;
  if (glob(DATA_DIR . '/RFQ-*.json')) make_backup('automatic daily backup');
}

/** Verify a backup zip. Returns report: errors, warnings, new, existing, status changes. */
function verify_backup(string $file): array {
  $rep = ['errors' => [], 'warnings' => [], 'new' => [], 'existing' => [], 'status' => [], 'files' => []];
  $z = new ZipArchive();
  if ($z->open($file) !== true) { $rep['errors'][] = 'The file is not a valid ZIP backup.'; return $rep; }
  if ($z->locateName('manifest.json') === false) $rep['warnings'][] = 'No manifest.json – the file was not made by this app.';
  $have = [];
  foreach (rfqs() as $q) $have[$q['id']] = true;
  for ($i = 0; $i < $z->numFiles; $i++) {
    $n = $z->getNameIndex($i);
    if (!preg_match('#^rfq/(RFQ-\d{6}-[A-Z0-9]{4}_[a-f0-9]{6}\.json)$#', $n, $m)) continue;
    $r = json_decode((string)$z->getFromIndex($i), true);
    if (!is_array($r) || empty($r['id']) || !preg_match('/^RFQ-\d{6}-[A-Z0-9]{4}$/', (string)$r['id']) || !is_array($r['customer'] ?? null) || !is_array($r['lines'] ?? null)) {
      $rep['errors'][] = t('%s: not a valid RFQ record.', $n);
      continue;
    }
    if (isset($have[$r['id']])) $rep['existing'][] = $r['id'];
    else { $rep['new'][] = $r['id']; $rep['files'][$m[1]] = $i; }
  }
  $sj = $z->getFromName('status.json');
  if ($sj !== false) {
    $s = json_decode($sj, true);
    if (!is_array($s)) $rep['errors'][] = 'status.json is damaged.';
    else {
      $cur = statuses();
      foreach ($s as $id => $v) if (($cur[$id]['status'] ?? 'New') !== ($v['status'] ?? 'New') && !isset($cur[$id])) $rep['status'][] = [$id, $v['status'] ?? 'New'];
    }
  }
  if (!$rep['new'] && !$rep['status'] && !$rep['errors']) $rep['warnings'][] = 'Nothing to restore: every RFQ in the file is already in the register.';
  $z->close();
  return $rep;
}
/** Restore = add missing RFQs and their status/notes. Never overwrites existing records. */
function apply_backup(string $file): array {
  $rep = verify_backup($file);
  if ($rep['errors']) throw new RuntimeException('verify');
  $pre = make_backup('automatic backup before restore');
  $z = new ZipArchive();
  $z->open($file);
  $added = 0;
  foreach ($rep['files'] as $fname => $idx) {
    $tmp = DATA_DIR . '/.' . $fname . '.tmp';
    file_put_contents($tmp, (string)$z->getFromIndex($idx), LOCK_EX);
    rename($tmp, DATA_DIR . '/' . $fname);
    $added++;
  }
  $sj = $z->getFromName('status.json');
  if ($sj !== false && is_array($s = json_decode($sj, true))) {
    $cur = statuses();
    foreach ($s as $id => $v) if (!isset($cur[$id])) $cur[$id] = $v;
    save_statuses($cur);
  }
  $z->close();
  audit('restore', basename($file), $added . ' RFQs added; backup before restore: ' . $pre);
  return ['added' => $added, 'pre' => $pre];
}
