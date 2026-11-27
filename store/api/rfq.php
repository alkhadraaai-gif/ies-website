<?php
/* IES Store — RFQ receiver (GoDaddy cPanel / al-khadraa.com only).
   Saves each RFQ as JSON in store/api/data/ and e-mails it to IES. No database needed. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
const IES_TO = 'info@ies-iraq.com';
const IES_FROM = 'store@al-khadraa.com';
function out(array $a, int $code = 200): void { http_response_code($code); echo json_encode($a, JSON_UNESCAPED_UNICODE); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['ok' => false, 'error' => 'method'], 405);
$host = parse_url($_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '', PHP_URL_HOST) ?: '';
if ($host !== '' && !preg_match('/(^|\.)al-khadraa\.com$/', $host)) out(['ok' => false, 'error' => 'origin'], 403);
$raw = file_get_contents('php://input', false, null, 0, 200000);
$in = json_decode((string)$raw, true);
if (!is_array($in)) out(['ok' => false, 'error' => 'json'], 400);
if (!empty($in['hp'])) out(['ok' => true, 'id' => 'RFQ']);               // honeypot: pretend success
$dir = __DIR__ . '/data';
if (!is_dir($dir)) @mkdir($dir, 0750, true);
// simple rate limit: 6 RFQs per IP per hour
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$rl = $dir . '/rl_' . hash('sha256', $ip . date('YmdH')) . '.cnt';
$n = (int)@file_get_contents($rl);
if ($n >= 6) out(['ok' => false, 'error' => 'rate'], 429);
@file_put_contents($rl, (string)($n + 1));
$s = fn($v, $max = 300) => mb_substr(trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string)$v)), 0, $max);
$c = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$cust = [];
foreach (['company', 'name', 'phone', 'email', 'city', 'project', 'date'] as $k) $cust[$k] = $s($c[$k] ?? '', 160);
$cust['msg'] = $s($c['msg'] ?? '', 3000);
if ($cust['company'] === '' || $cust['name'] === '' || $cust['phone'] === '') out(['ok' => false, 'error' => 'required'], 422);
if ($cust['email'] !== '' && !filter_var($cust['email'], FILTER_VALIDATE_EMAIL)) $cust['email'] = '';
$lines = [];
foreach (array_slice(is_array($in['lines'] ?? null) ? $in['lines'] : [], 0, 200) as $l) {
  if (!is_array($l)) continue;
  $lines[] = ['src' => $s($l['src'] ?? '', 12), 'pn' => $s($l['pn'] ?? '', 80), 'd' => $s($l['d'] ?? '', 300),
              'qty' => max(1, min(100000, (int)($l['qty'] ?? 1))), 'note' => $s($l['note'] ?? '', 300)];
}
if (!$lines) out(['ok' => false, 'error' => 'empty'], 422);
$id = preg_match('/^RFQ-\d{6}-[A-Z0-9]{4}$/', (string)($in['id'] ?? '')) ? $in['id'] : 'RFQ-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2)));
$rec = ['id' => $id, 'received' => gmdate('c'), 'ip' => $ip, 'lang' => $s($in['lang'] ?? 'en', 2), 'customer' => $cust, 'lines' => $lines, 'page' => $s($in['page'] ?? '', 300)];
file_put_contents($dir . '/' . $id . '_' . bin2hex(random_bytes(3)) . '.json', json_encode($rec, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
$t = "IES STORE – REQUEST FOR QUOTATION $id\n\n";
foreach (['Company' => 'company', 'Contact' => 'name', 'Phone' => 'phone', 'Email' => 'email', 'Delivery city' => 'city', 'Project / PO ref' => 'project', 'Required by' => 'date'] as $lab => $k) $t .= "$lab: " . ($cust[$k] ?: '-') . "\n";
$t .= "\nITEMS:\n";
foreach ($lines as $i => $l) $t .= ($i + 1) . '. [' . strtoupper($l['src']) . '] ' . $l['pn'] . ' x ' . $l['qty'] . ($l['d'] ? ' — ' . $l['d'] : '') . ($l['note'] ? ' | Note: ' . $l['note'] : '') . "\n";
if ($cust['msg'] !== '') $t .= "\nMessage: " . $cust['msg'] . "\n";
$hdr = 'From: IES Store <' . IES_FROM . ">\r\nContent-Type: text/plain; charset=UTF-8\r\n";
if ($cust['email'] !== '') $hdr .= 'Reply-To: ' . $cust['email'] . "\r\n";
$subj = '=?UTF-8?B?' . base64_encode("$id — " . $cust['company']) . '?=';
@mail(IES_TO, $subj, $t, $hdr);
if ($cust['email'] !== '') {
  $ack = ($rec['lang'] === 'ar' ? "شكراً لكم. استلمنا طلب التسعير $id وسيرد مهندسو IES خلال يوم عمل واحد.\n\n" : "Thank you. We received RFQ $id; IES engineers will reply within one working day.\n\n") . $t;
  @mail($cust['email'], '=?UTF-8?B?' . base64_encode("IES – $id") . '?=', $ack, 'From: IES Store <' . IES_FROM . ">\r\nReply-To: " . IES_TO . "\r\nContent-Type: text/plain; charset=UTF-8\r\n");
}
out(['ok' => true, 'id' => $id]);
