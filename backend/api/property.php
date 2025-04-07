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

switch ($method) {
    case 'POST':
        if (isset($_FILES['csv_file'])) {
            // Bulk upload properties via CSV
            $file = $_FILES['csv_file']['tmp_name'];
            $handle = fopen($file, 'r');
            $headers = fgetcsv($handle); // Skip header row
            while (($data = fgetcsv($handle)) !== false) {
                $stmt = $conn->prepare(
                    'INSERT INTO properties (lease_id, property_code, floor_number, flat_number, flat_type, rental_type, num_rooms, num_partitions, monthly_rent) 
                    VALUES (:lease_id, :property_code, :floor_number, :flat_number, :flat_type, :rental_type, :num_rooms, :num_partitions, :monthly_rent)'
                );
                $stmt->execute([
                    'lease_id' => $data[0],
                    'property_code' => $data[1],
                    'floor_number' => $data[2],
                    'flat_number' => $data[3],
                    'flat_type' => $data[4],
                    'rental_type' => $data[5],
                    'num_rooms' => $data[6] ?: 0,
                    'num_partitions' => $data[7] ?: 0,
                    'monthly_rent' => $data[8],
                ]);
            }
            fclose($handle);
            echo json_encode(['message' => 'Properties bulk uploaded successfully']);
        } else {
            // Create property
            $data = json_decode(file_get_contents('php://input'), true);
            $occupancy = $data['occupancy'] ? json_encode($data['occupancy']) : null;
            $stmt = $conn->prepare(
                'INSERT INTO properties (lease_id, property_code, floor_number, flat_number, flat_type, rental_type, num_rooms, num_partitions, occupancy, monthly_rent) 
                VALUES (:lease_id, :property_code, :floor_number, :flat_number, :flat_type, :rental_type, :num_rooms, :num_partitions, :occupancy, :monthly_rent)'
            );
            $stmt->execute([
                'lease_id' => $data['lease_id'],
                'property_code' => $data['property_code'],
                'floor_number' => $data['floor_number'],
                'flat_number' => $data['flat_number'],
                'flat_type' => $data['flat_type'],
                'rental_type' => $data['rental_type'],
                'num_rooms' => $data['num_rooms'] ?: 0,
                'num_partitions' => $data['num_partitions'] ?: 0,
                'occupancy' => $occupancy,
                'monthly_rent' => $data['monthly_rent'],
            ]);
            echo json_encode(['message' => 'Property created successfully']);
        }
        break;

    case 'GET':
        if (isset($_GET['property_id'])) {
            // Get detailed property info
            $stmt = $conn->prepare('SELECT * FROM properties WHERE property_id = :property_id');
            $stmt->execute(['property_id' => $_GET['property_id']]);
            $property = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($property['occupancy']) $property['occupancy'] = json_decode($property['occupancy'], true);
            echo json_encode($property);
        } else {
            // Get all properties with calculated occupancy status
            $stmt = $conn->query(
                'SELECT p.property_id, p.property_code, p.flat_number, p.flat_type, p.rental_type, 
                        CASE 
                            WHEN p.rental_type = "Flat" THEN IF(p.occupancy IS NOT NULL, "1/1", "Vacant")
                            WHEN p.rental_type = "Rooms" THEN CONCAT(
                                IFNULL(JSON_LENGTH(p.occupancy), 0), "/", p.num_rooms
                            )
                            WHEN p.rental_type = "Partitions" THEN CONCAT(
                                IFNULL(JSON_LENGTH(p.occupancy), 0), "/", p.num_partitions
                            )
                            WHEN p.rental_type = "Multiple Tenancy" THEN CONCAT(
                                IFNULL(SUM(JSON_EXTRACT(p.occupancy, "$[*]")), 0), "/", p.num_rooms
                            )
                        END as occupancy_status,
                        CASE 
                            WHEN p.occupancy IS NULL THEN "Available"
                            WHEN p.rental_type = "Flat" AND JSON_LENGTH(p.occupancy) > 0 THEN "Occupied"
                            WHEN p.rental_type IN ("Rooms", "Partitions") AND JSON_LENGTH(p.occupancy) = (IF(p.rental_type = "Rooms", p.num_rooms, p.num_partitions)) THEN "Occupied"
                            WHEN p.rental_type = "Multiple Tenancy" AND JSON_LENGTH(p.occupancy) = p.num_rooms THEN "Occupied"
                            ELSE "Partially Occupied"
                        END as availability
                FROM properties p'
            );
            $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($properties);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['message' => 'Method not allowed']);
}
