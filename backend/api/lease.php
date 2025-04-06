<?php
header("Access-Control-Allow-Origin: *"); // Or replace * with 'http://localhost:3000' for stricter security
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require '../config/db.php';
// ### REMOVED JWT IMPORT ###
// require '../lib/jwt.php'; // No longer needed

$method = $_SERVER['REQUEST_METHOD'];
// ### REMOVED JWT HANDLER AND AUTHENTICATION MIDDLEWARE ###
// $jwtHandler = new JWTHandler();
// $token = isset($_SERVER['HTTP_AUTHORIZATION']) ? str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']) : '';
// if (!$token) {
//     http_response_code(401);
//     echo json_encode(['message' => 'No token provided']);
//     exit;
// }
// try {
//     $decoded = $jwtHandler->decode($token);
//     $user_id = $decoded->user_id;
// } catch (Exception $e) {
//     http_response_code(401);
//     echo json_encode(['message' => 'Invalid token']);
//     exit;
// }

// ### OPTIONAL SESSION CHECK (Uncomment if session-based auth is desired) ###
// session_start();
// if (!isset($_SESSION['user_id'])) {
//     http_response_code(401);
//     echo json_encode(['message' => 'Not authenticated']);
//     exit;
// }

switch ($method) {
    case 'GET':
        if (isset($_GET['owner_id'])) {
            $owner_id = $_GET['owner_id'];
            $stmt = $conn->prepare('SELECT * FROM leases WHERE owner_id = ?');
            $stmt->execute([$owner_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            $stmt = $conn->query('SELECT * FROM owners');
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($_FILES['csv_file'])) {
            $csv = array_map('str_getcsv', file($_FILES['csv_file']['tmp_name']));
            array_shift($csv); // Remove header
            $stmt = $conn->prepare('INSERT INTO owners (name, mobile_number, email) VALUES (?, ?, ?)');
            foreach ($csv as $row) {
                $stmt->execute([$row[0], $row[1], $row[2]]);
            }
            echo json_encode(['message' => 'Bulk upload successful']);
        } else {
            $stmt = $conn->prepare('INSERT INTO owners (name, mobile_number, email) VALUES (?, ?, ?)');
            $stmt->execute([$data['name'], $data['mobile_number'], $data['email']]);
            echo json_encode(['message' => 'Owner created']);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $lease_id = $data['lease_id'];
        $stmt = $conn->prepare('UPDATE leases SET lease_end = DATE_ADD(lease_end, INTERVAL 1 YEAR) WHERE lease_id = ?');
        $stmt->execute([$lease_id]);
        echo json_encode(['message' => 'Lease renewed']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
}
