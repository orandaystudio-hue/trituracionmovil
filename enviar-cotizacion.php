<?php
declare(strict_types=1);

// HostGator executes this endpoint. No credentials or customer data are stored in the website.
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $code, bool $ok, string $message, array $fields = []): void {
    http_response_code($code);
    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'fields' => $fields], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        $title = $ok ? 'Solicitud enviada' : 'Revisa tu solicitud';
        echo '<!doctype html><html lang="es-MX"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.$title.' | Trituración Móvil</title><link rel="stylesheet" href="estilos.css"><main class="receipt"><p class="eyebrow">Trituración Móvil</p><h1>'.$title.'</h1><p>'.$safe.'</p><a class="btn btn-navy" href="./#contacto">Volver al sitio</a><a class="text-link" href="tel:+528123895162">Llamar al 81 2389 5162</a></main></html>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Envía tu solicitud desde el formulario del sitio.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384 || !empty($_FILES)) {
    respond(413, false, 'La solicitud es demasiado extensa. Resume los detalles y vuelve a intentarlo.');
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
    $serverHost = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
    if ($originHost === '' || $originHost !== $serverHost) {
        respond(403, false, 'Envía tu solicitud desde el formulario de Trituración Móvil.');
    }
}
$limits = ['nombre' => 100, 'empresa' => 140, 'telefono' => 24, 'correo' => 160, 'material' => 100, 'cantidad' => 100, 'ubicacion' => 140, 'mensaje' => 2000, 'consentimiento' => 10, 'sitio' => 150];
$data = [];
$invalid = [];
foreach ($limits as $key => $limit) {
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || !preg_match('//u', $value) || strlen($value) > $limit * 4) {
        $invalid[] = $key; $data[$key] = ''; continue;
    }
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value) || ($key !== 'mensaje' && strpos($value, "\n") !== false)) {
        $invalid[] = $key;
    }
    preg_match_all('/./us', $value, $characters);
    if (count($characters[0]) > $limit) $invalid[] = $key;
    $data[$key] = $value;
}
if ($data['sitio'] !== '') respond(422, false, 'No se pudo procesar la solicitud. Inténtalo desde el sitio.');
if (strlen($data['nombre']) < 2) $invalid[] = 'nombre';
$digits = preg_replace('/[^0-9]/', '', $data['telefono']);
if (!preg_match('/^(?:52)?[0-9]{10}$/', $digits) || !preg_match('/^[0-9+() .-]+$/', $data['telefono'])) $invalid[] = 'telefono';
if ($data['correo'] !== '' && !filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) $invalid[] = 'correo';
$materials = ['', 'Documentos y archivo muerto', 'Inventario', 'Medios digitales', 'Uniformes y textiles', 'Publicidad e imagen de empresa', 'Material clínico y artículos de salud', 'Otro material'];
if (!in_array($data['material'], $materials, true)) $invalid[] = 'material';
if ($data['consentimiento'] !== 'si') $invalid[] = 'consentimiento';
if ($invalid) respond(422, false, 'Revisa tu nombre, teléfono y los campos indicados. Acepta el uso de tus datos para atender la solicitud.', array_values(array_unique($invalid)));

// Limit repeated requests using only a hashed IP and timestamps, outside the public directory.
$bucket = sys_get_temp_dir().DIRECTORY_SEPARATOR.'tm-cotizacion-'.hash('sha256', __FILE__.($_SERVER['REMOTE_ADDR'] ?? 'unknown')).'.json';
$file = @fopen($bucket, 'c+');
if (!$file || !flock($file, LOCK_EX)) {
    if ($file) fclose($file);
    respond(503, false, 'No pudimos procesar la solicitud. Inténtalo nuevamente o llámanos al 81 2389 5162.');
}
$now = time();
$history = json_decode(stream_get_contents($file) ?: '[]', true);
if (!is_array($history)) $history = [];
$history = array_values(array_filter($history, static fn($t) => is_int($t) && $t > $now - 86400));
$recent = array_filter($history, static fn($t) => $t > $now - 900);
if (count($recent) >= 3 || count($history) >= 6) {
    flock($file, LOCK_UN); fclose($file);
    header('Retry-After: 900');
    respond(429, false, 'Ya recibimos varios intentos desde tu conexión. Espera unos minutos o llámanos al 81 2389 5162.');
}
$history[] = $now;
rewind($file); ftruncate($file, 0); fwrite($file, json_encode($history)); fflush($file);
flock($file, LOCK_UN); fclose($file);

$recipient = 'trituracionmovil.mty@gmail.com';
$sender = getenv('TM_MAIL_FROM') ?: 'contacto@trituracionmovil.com';
if (!filter_var($sender, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $sender)) {
    respond(503, false, 'No pudimos enviar la solicitud. Por favor, llámanos al 81 2389 5162.');
}
$subject = '=?UTF-8?B?'.base64_encode('Nueva solicitud de cotización | Trituración Móvil').'?=';
$labels = ['nombre' => 'Nombre de contacto', 'empresa' => 'Empresa', 'telefono' => 'Teléfono', 'correo' => 'Correo electrónico', 'material' => 'Material', 'cantidad' => 'Cantidad aproximada', 'ubicacion' => 'Ubicación', 'mensaje' => 'Detalles'];
$body = "SOLICITUD DE COTIZACIÓN — TRITURACIÓN MÓVIL\r\n\r\n";
foreach ($labels as $key => $label) {
    $value = $data[$key] !== '' ? $data[$key] : 'No indicado';
    $body .= $label.': '.str_replace("\n", "\r\n", $value)."\r\n\r\n";
}
$body .= "El visitante autorizó el uso de estos datos para atender su solicitud y contactarlo.\r\nOrigen: formulario de trituracionmovil.com\r\n";
$headers = ['From' => 'Trituracion Movil <'.$sender.'>', 'MIME-Version' => '1.0', 'Content-Type' => 'text/plain; charset=UTF-8', 'Content-Transfer-Encoding' => 'base64'];
if ($data['correo'] !== '') $headers['Reply-To'] = $data['correo'];
$accepted = function_exists('mail') && @mail($recipient, $subject, chunk_split(base64_encode($body)), $headers);
if (!$accepted) {
    error_log('Trituracion Movil: el servidor no acepto el envio del formulario.');
    respond(503, false, 'No pudimos enviar tu solicitud. Tus datos permanecen en el formulario. Inténtalo nuevamente o llámanos al 81 2389 5162.');
}
respond(200, true, 'Tu solicitud fue enviada. Nuestro equipo se pondrá en contacto contigo para evaluar el servicio.');
