<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = trim($uri, '/');

// Optional: If the project is inside a folder like "TRAITS-PMS", remove it from the URI
$basePath = 'TRAITS-PMS/backend';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
    $uri = trim($uri, '/');
}

switch (true) {
    case strpos($uri, 'api/auth') === 0:
        require 'api/auth.php';
        break;
    case strpos($uri, 'api/lease') === 0:
        require 'api/lease.php';
        break;
    case strpos($uri, 'api/property') === 0:
        require 'api/property.php';
        break;
    case strpos($uri, 'api/tenant') === 0:
        require 'api/tenant.php';
        break;
    case strpos($uri, 'api/rent') === 0:
        require 'api/rent.php';
        break;
    case strpos($uri, 'api/cheque') === 0:
        require 'api/cheque.php';
        break;
    case strpos($uri, 'api/dashboard') === 0:
        require 'api/dashboard.php';
        break;
    case strpos($uri, 'api/reports') === 0:
        require 'api/reports.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['message' => 'Not Found']);
        break;
}
