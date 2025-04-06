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

// ✅ Include DB connection
require_once(__DIR__ . '/../config/db.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // ✅ Get and decode input JSON
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    // ✅ Check for missing fields
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required.'
        ]);
        exit();
    }

    // ✅ Query to find user
    $query = "SELECT * FROM users WHERE username = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // ✅ Verify password
        if (password_verify($password, $user['password'])) {
            unset($user['password']); // 🔐 Don't expose hashed password

            // ✅ Parse access & rights safely
            $user['access'] = $user['access'] ?? '';
            $user['rights'] = json_decode($user['rights'] ?? '{}', true);

            // ✅ Success response
            echo json_encode([
                'success' => true,
                'user' => [
                    'user_id' => $user['user_id'],
                    'username' => $user['username'],
                    'mobile_number' => $user['mobile_number'],
                    'role' => $user['role'],
                    'access' => $user['access'],
                    'rights' => $user['rights']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid password.'
            ]);
        }
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found.'
        ]);
    }

} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);
}
