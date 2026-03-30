<?php
header("Content-Type: application/json");

$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'car_rental';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT r.id, c.name AS car_name, r.customer_name, r.customer_email, 
               r.pickup_date, r.return_date, r.total_price, r.created_at
        FROM reservations r
        JOIN cars c ON r.car_id = c.id
        ORDER BY r.id DESC";

$result = $conn->query($sql);
$reservations = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $reservations[] = $row;
    }
}

echo json_encode($reservations);
$conn->close();
