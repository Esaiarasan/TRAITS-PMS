<?php
// ✅ CORS Headers (must be at top)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// ✅ Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-01');
$end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-m-t');
$report_type = $_GET['type'] ?? 'rent_overdue';

// Rent Overdue Report
if ($report_type === 'rent_overdue') {
    $stmt = $conn->prepare(
        'SELECT rp.payment_id, ta.tenant_code, t.name, rp.amount, rp.due_date 
        FROM rent_payments rp 
        JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
        JOIN tenants t ON ta.tenant_id = t.tenant_id 
        WHERE rp.status = "pending" AND rp.due_date < NOW() AND rp.due_date BETWEEN :start_date AND :end_date'
    );
    $stmt->execute(['start_date' => $start_date, 'end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Rent Collection Summary
elseif ($report_type === 'rent_collection') {
    $stmt = $conn->prepare(
        'SELECT status, SUM(amount) as total, COUNT(*) as count 
        FROM rent_payments 
        WHERE payment_date BETWEEN :start_date AND :end_date 
        GROUP BY status'
    );
    $stmt->execute(['start_date' => $start_date, 'end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Cheque Status Report
elseif ($report_type === 'cheque_status') {
    $stmt = $conn->prepare(
        'SELECT c.cheque_id, c.cheque_number, c.bank_name, c.amount, c.due_date, c.status, ta.tenant_code, t.name 
        FROM cheques c 
        JOIN rent_payments rp ON c.payment_id = rp.payment_id 
        JOIN tenant_assignments ta ON rp.assignment_id = ta.assignment_id 
        JOIN tenants t ON ta.tenant_id = t.tenant_id 
        WHERE c.due_date BETWEEN :start_date AND :end_date'
    );
    $stmt->execute(['start_date' => $start_date, 'end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Tenant Assignment Report
elseif ($report_type === 'tenant_assignment') {
    $stmt = $conn->prepare(
        'SELECT ta.assignment_id, ta.tenant_code, t.name, t.fathers_name, p.property_code, p.flat_number, p.floor_number, ta.start_date, ta.end_date, ta.monthly_rent 
        FROM tenant_assignments ta 
        JOIN tenants t ON ta.tenant_id = t.tenant_id 
        JOIN properties p ON ta.property_id = p.property_id 
        WHERE ta.start_date <= :end_date AND ta.end_date >= :start_date'
    );
    $stmt->execute(['start_date' => $start_date, 'end_date' => $end_date]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

else {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid report type']);
    exit;
}

echo json_encode($data);
