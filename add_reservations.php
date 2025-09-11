<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "Invalid JSON"]);
    exit;
}

$car_name = $data['car_name'] ?? '';
$customer_name = $data['customer_name'] ?? '';
$email = $data['email'] ?? '';
$pickup_date = $data['pickup_date'] ?? '';
$return_date = $data['return_date'] ?? '';
$pickup_location = $data['pickup_location'] ?? '';
$dropoff_location = $data['dropoff_location'] ?? '';
$total_price = $data['total_price'] ?? 0;

if ($car_name && $customer_name && $pickup_date && $return_date && $pickup_location && $dropoff_location && $total_price) {
    $stmt = $pdo->prepare("INSERT INTO reservations (car_name, customer_name, email, pickup_date, return_date, pickup_location, dropoff_location, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$car_name, $customer_name, $email, $pickup_date, $return_date, $pickup_location, $dropoff_location, $total_price]);

    echo json_encode(["success" => true, "message" => "Reservation created successfully"]);
} else {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
}
?>
