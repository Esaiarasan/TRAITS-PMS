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
            // Bulk upload cheques via CSV
            $file = $_FILES['csv_file']['tmp_name'];
            $handle = fopen($file, 'r');
            $headers = fgetcsv($handle); // Skip header row
            while (($data = fgetcsv($handle)) !== false) {
                $stmt = $conn->prepare(
                    'INSERT INTO cheques (payment_id, cheque_number, bank_name, amount, date_issued, due_date, issued_to, issued_by) 
                    VALUES (:payment_id, :cheque_number, :bank_name, :amount, :date_issued, :due_date, :issued_to, :issued_by)'
                );
                $stmt->execute([
                    'payment_id' => $data[0],
                    'cheque_number' => $data[1],
                    'bank_name' => $data[2],
                    'amount' => $data[3],
                    'date_issued' => $data[4],
                    'due_date' => $data[5],
                    'issued_to' => $data[6],
                    'issued_by' => $data[7],
                ]);
            }
            fclose($handle);
            echo json_encode(['message' => 'Cheques bulk uploaded successfully']);
        } else {
            // Add cheque
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare(
                'INSERT INTO cheques (payment_id, cheque_number, bank_name, amount, date_issued, due_date, issued_to, issued_by) 
                VALUES (:payment_id, :cheque_number, :bank_name, :amount, :date_issued, :due_date, :issued_to, :issued_by)'
            );
            $stmt->execute([
                'payment_id' => $data['payment_id'],
                'cheque_number' => $data['cheque_number'],
                'bank_name' => $data['bank_name'],
                'amount' => $data['amount'],
                'date_issued' => $data['date_issued'],
                'due_date' => $data['due_date'],
                'issued_to' => $data['issued_to'],
                'issued_by' => $data['issued_by'],
            ]);
            echo json_encode(['message' => 'Cheque added successfully']);
        }
        break;

    case 'GET':
        if (isset($_GET['cheque_id'])) {
            // Get detailed cheque info
            $stmt = $conn->prepare(
                'SELECT c.*, rp.assignment_id, ta.tenant_code, t.name 
                FROM cheques c 
                JOIN rent_payments rp ON c.payment_id = rp.payment_id 
                JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
                JOIN tenants t ON ta.tenant_id = t.tenant_id 
                WHERE c.cheque_id = :cheque_id'
            );
            $stmt->execute(['cheque_id' => $_GET['cheque_id']]);
            $cheque = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($cheque);
        } else {
            // Get all cheques
            $stmt = $conn->query(
                'SELECT c.cheque_id, c.cheque_number, c.bank_name, c.amount, c.due_date, c.status 
                FROM cheques c'
            );
            $cheques = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($cheques);
        }
        break;

    case 'PUT':
        // Update cheque status
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare('UPDATE cheques SET status = :status WHERE cheque_id = :cheque_id');
        $stmt->execute([
            'status' => $data['status'],
            'cheque_id' => $data['cheque_id'],
        ]);
        echo json_encode(['message' => 'Cheque status updated successfully']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
}
