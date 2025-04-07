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

$month = isset($_GET['month']) ? $_GET['month'] : date('Y-m'); // Default to current month

// Total Counts
$total_owners = $conn->query('SELECT COUNT(*) as count FROM owners')->fetch(PDO::FETCH_ASSOC)['count'];
$total_leases = $conn->query('SELECT COUNT(*) as count FROM leases')->fetch(PDO::FETCH_ASSOC)['count'];
$total_properties = $conn->query('SELECT COUNT(*) as count FROM properties')->fetch(PDO::FETCH_ASSOC)['count'];
$total_tenants = $conn->query('SELECT COUNT(*) as count FROM tenants')->fetch(PDO::FETCH_ASSOC)['count'];

// Rent Due This Month
$rent_due = $conn->query("SELECT SUM(rp.amount) as total FROM rent_payments rp WHERE rp.due_date LIKE '$month%' AND rp.status = 'pending'")->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

// Cheques Pending
$cheques_pending = $conn->query("SELECT COUNT(*) as count FROM cheques WHERE status = 'pending' AND due_date LIKE '$month%'")->fetch(PDO::FETCH_ASSOC)['count'];

// Recent Leases (Last 5)
$recent_leases = $conn->query('SELECT l.lease_id, l.property_code, l.lease_start, l.lease_end, l.monthly_rent, o.name 
    FROM leases l JOIN owners o ON l.owner_id = o.owner_id 
    ORDER BY l.created_at DESC LIMIT 5')->fetchAll(PDO::FETCH_ASSOC);

// Rent Collection Status This Month
$rent_status = $conn->query("SELECT status, SUM(amount) as total, COUNT(*) as count 
    FROM rent_payments WHERE payment_date LIKE '$month%' GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);

// Cheque Status Breakdown This Month
$cheque_status = $conn->query("SELECT status, COUNT(*) as count 
    FROM cheques WHERE due_date LIKE '$month%' GROUP BY status")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'metrics' => [
        'total_owners' => $total_owners,
        'total_leases' => $total_leases,
        'total_properties' => $total_properties,
        'total_tenants' => $total_tenants,
        'rent_due' => $rent_due,
        'cheques_pending' => $cheques_pending,
    ],
    'recent_leases' => $recent_leases,
    'rent_status' => $rent_status,
    'cheque_status' => $cheque_status,
]);
