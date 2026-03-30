<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "car_rental";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $car_id = intval($_POST['car_id']);
    $pickup_date = $_POST['pickup_date'];
    $return_date = $_POST['return_date'];
    $customer_name = $conn->real_escape_string($_POST['customer_name']);
    $customer_email = $conn->real_escape_string($_POST['customer_email']);
    $total_price = floatval($_POST['total_price']);

    $sql = "INSERT INTO reservations (car_id, pickup_date, return_date, customer_name, customer_email, total_price)
            VALUES ($car_id, '$pickup_date', '$return_date', '$customer_name', '$customer_email', $total_price)";

    if ($conn->query($sql) === TRUE) {
        echo "<h2>Reservation Successful!</h2>";
        echo "<p>Thank you, $customer_name. Your reservation has been confirmed.</p>";
        header("Location: reservations.php");
    } else {
        echo "Error: " . $conn->error;
    }
} else {
    header("Location: index.php");
    exit();
}
?>
