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
require '../lib/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$jwtHandler = new JWTHandler();

// Authentication Middleware
$token = isset($_SERVER['HTTP_AUTHORIZATION']) ? str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']) : '';
if (!$token) {
    http_response_code(401);
    echo json_encode(['message' => 'No token provided']);
    exit;
}
try {
    $decoded = $jwtHandler->decode($token);
    $user_id = $decoded->user_id;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

switch ($method) {
    case 'POST':
        if (isset($_FILES['csv_file'])) {
            // Bulk upload tenants via CSV
            $file = $_FILES['csv_file']['tmp_name'];
            $handle = fopen($file, 'r');
            $headers = fgetcsv($handle); // Skip header row
            while (($data = fgetcsv($handle)) !== false) {
                $stmt = $conn->prepare(
                    'INSERT INTO tenants (name, fathers_name, mobile_number, email, nationality, address, passport_number, eid_number, reference_number, alternate_mobile, workplace, designation) 
                    VALUES (:name, :fathers_name, :mobile_number, :email, :nationality, :address, :passport_number, :eid_number, :reference_number, :alternate_mobile, :workplace, :designation)'
                );
                $stmt->execute([
                    'name' => $data[0],
                    'fathers_name' => $data[1],
                    'mobile_number' => $data[2],
                    'email' => $data[3],
                    'nationality' => $data[4],
                    'address' => $data[5],
                    'passport_number' => $data[6],
                    'eid_number' => $data[7],
                    'reference_number' => $data[8],
                    'alternate_mobile' => $data[9],
                    'workplace' => $data[10],
                    'designation' => $data[11],
                ]);
            }
            fclose($handle);
            echo json_encode(['message' => 'Tenants bulk uploaded successfully']);
        } else {
            // Create tenant
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare(
                'INSERT INTO tenants (name, fathers_name, mobile_number, email, nationality, address, passport_number, eid_number, reference_number, alternate_mobile, workplace, designation) 
                VALUES (:name, :fathers_name, :mobile_number, :email, :nationality, :address, :passport_number, :eid_number, :reference_number, :alternate_mobile, :workplace, :designation)'
            );
            $stmt->execute([
                'name' => $data['name'],
                'fathers_name' => $data['fathers_name'],
                'mobile_number' => $data['mobile_number'],
                'email' => $data['email'],
                'nationality' => $data['nationality'],
                'address' => $data['address'],
                'passport_number' => $data['passport_number'],
                'eid_number' => $data['eid_number'],
                'reference_number' => $data['reference_number'],
                'alternate_mobile' => $data['alternate_mobile'],
                'workplace' => $data['workplace'],
                'designation' => $data['designation'],
            ]);
            echo json_encode(['message' => 'Tenant created successfully']);
        }
        break;

    case 'GET':
        if (isset($_GET['tenant_id'])) {
            // Get detailed tenant info
            $stmt = $conn->prepare('SELECT * FROM tenants WHERE tenant_id = :tenant_id');
            $stmt->execute(['tenant_id' => $_GET['tenant_id']]);
            $tenant = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($tenant);
        } else {
            // Get all tenants
            $stmt = $conn->query('SELECT tenant_id, name, fathers_name, mobile_number, status FROM tenants');
            $tenants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($tenants);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
    }