<?php
// proxy.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// The target backend API
$url = 'https://app.yourdailylight.org/dailylight/devotionals';

// Read the incoming JSON payload from the frontend
$data = file_get_contents('php://input');

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);

if ($data) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
}

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($data)
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => curl_error($ch)]);
} else {
    http_response_code($httpcode);
    echo $response;
}

curl_close($ch);
?>
