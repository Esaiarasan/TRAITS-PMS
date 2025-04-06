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
            // Bulk upload assignments via CSV
            $file = $_FILES['csv_file']['tmp_name'];
            $handle = fopen($file, 'r');
            $headers = fgetcsv($handle); // Skip header row
            while (($data = fgetcsv($handle)) !== false) {
                $stmt = $conn->prepare(
                    'INSERT INTO tenant_assignments (tenant_id, property_id, tenant_code, start_date, end_date, monthly_rent) 
                    VALUES (:tenant_id, :property_id, :tenant_code, :start_date, :end_date, :monthly_rent)'
                );
                $stmt->execute([
                    'tenant_id' => $data[0],
                    'property_id' => $data[1],
                    'tenant_code' => $data[2],
                    'start_date' => $data[3],
                    'end_date' => $data[4],
                    'monthly_rent' => $data[5],
                ]);
            }
            fclose($handle);
            echo json_encode(['message' => 'Assignments bulk uploaded successfully']);
        } elseif (isset($_POST['action']) && $_POST['action'] === 'rent_entry') {
            // Rent entry
            $data = json_decode($_POST['data'], true);
            $stmt = $conn->prepare(
                'INSERT INTO rent_payments (assignment_id, amount, payment_date, due_date) 
                VALUES (:assignment_id, :amount, :payment_date, :due_date)'
            );
            $stmt->execute([
                'assignment_id' => $data['assignment_id'],
                'amount' => $data['amount'],
                'payment_date' => $data['payment_date'],
                'due_date' => $data['due_date'],
            ]);
            echo json_encode(['message' => 'Rent entered successfully']);
        } else {
            // Assign tenant
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $conn->prepare(
                'INSERT INTO tenant_assignments (tenant_id, property_id, tenant_code, start_date, end_date, monthly_rent) 
                VALUES (:tenant_id, :property_id, :tenant_code, :start_date, :end_date, :monthly_rent)'
            );
            $stmt->execute([
                'tenant_id' => $data['tenant_id'],
                'property_id' => $data['property_id'],
                'tenant_code' => $data['tenant_code'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'monthly_rent' => $data['monthly_rent'],
            ]);
            echo json_encode(['message' => 'Tenant assigned successfully']);
        }
        break;

    case 'GET':
        if (isset($_GET['view']) && $_GET['view'] === 'collection_list') {
            // Collection list (pending payments)
            $stmt = $conn->query(
                'SELECT rp.payment_id, rp.assignment_id, ta.tenant_code, t.name, rp.amount, rp.due_date 
                FROM rent_payments rp 
                JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
                JOIN tenants t ON ta.tenant_id = t.tenant_id 
                WHERE rp.status = "pending"'
            );
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($payments);
        } elseif (isset($_GET['view']) && $_GET['view'] === 'collection_entries') {
            // Collection entries (collected payments)
            $stmt = $conn->query(
                'SELECT rp.payment_id, rp.assignment_id, ta.tenant_code, t.name, rp.amount, rp.payment_date, rp.collected_at 
                FROM rent_payments rp 
                JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
                JOIN tenants t ON ta.tenant_id = t.tenant_id 
                WHERE rp.status = "collected"'
            );
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($payments);
        } elseif (isset($_GET['view']) && $_GET['view'] === 'approvals') {
            // Collection approvals (collected, awaiting approval)
            $stmt = $conn->query(
                'SELECT rp.payment_id, rp.assignment_id, ta.tenant_code, t.name, rp.amount, rp.payment_date, rp.collected_at 
                FROM rent_payments rp 
                JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
                JOIN tenants t ON ta.tenant_id = t.tenant_id 
                WHERE rp.status = "collected"'
            );
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($payments);
        } else {
            // View all assignments
            $stmt = $conn->query(
                'SELECT ta.assignment_id, ta.tenant_id, ta.property_id, ta.tenant_code, ta.start_date, ta.end_date, ta.monthly_rent, 
                       t.name, t.fathers_name, p.property_code, p.flat_number, p.floor_number, p.flat_type, p.rental_type 
                FROM tenant_assignments ta 
                JOIN tenants t ON ta.tenant_id = t.tenant_id 
                JOIN properties p ON ta.property_id = p.property_id'
            );
            $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($assignments);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['action']) && $data['action'] === 'collect') {
            // Mark payment as collected
            $stmt = $conn->prepare(
                'UPDATE rent_payments SET status = "collected", collected_at = NOW() WHERE payment_id = :payment_id'
            );
            $stmt->execute(['payment_id' => $data['payment_id']]);
            echo json_encode(['message' => 'Payment collected successfully']);
        } elseif (isset($data['action']) && $data['action'] === 'approve') {
            // Approve collected payment
            $stmt = $conn->prepare(
                'UPDATE rent_payments SET status = "approved", approved_at = NOW() WHERE payment_id = :payment_id'
            );
            $stmt->execute(['payment_id' => $data['payment_id']]);
            echo json_encode(['message' => 'Payment approved successfully']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
}
