<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "car_rental";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_POST['reserve'])) {
    $car_id = intval($_POST['car_id']);
    $pickup_date = $_POST['pickup_date'];
    $return_date = $_POST['return_date'];

    $sql = "SELECT * FROM cars WHERE id = $car_id";
    $result = $conn->query($sql);
    if ($result && $result->num_rows > 0) {
        $car = $result->fetch_assoc();
    } else {
        die("Car not found.");
    }

    $days = (strtotime($return_date) - strtotime($pickup_date)) / (60 * 60 * 24);
    if ($days <= 0) $days = 1;
    $total_price = $days * $car['price'];
} else {
    header("Location: index.php");
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Checkout - <?php echo htmlspecialchars($car['name']); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light p-4">
<div class="container">
    <h1>Checkout</h1>
    <h2><?php echo htmlspecialchars($car['name']); ?></h2>
    <p>From: <?php echo htmlspecialchars($pickup_date); ?> To: <?php echo htmlspecialchars($return_date); ?></p>
    <p>Total days: <?php echo $days; ?></p>
    <h3>Total Price: €<?php echo $total_price; ?></h3>

    <form action="save_reservation.php" method="POST" class="mt-3">
        <input type="hidden" name="car_id" value="<?php echo $car['id']; ?>">
        <input type="hidden" name="pickup_date" value="<?php echo $pickup_date; ?>">
        <input type="hidden" name="return_date" value="<?php echo $return_date; ?>">
        <input type="hidden" name="total_price" value="<?php echo $total_price; ?>">

        <div class="mb-3">
            <label class="form-label">Your Full Name</label>
            <input type="text" name="customer_name" class="form-control" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" name="customer_email" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary w-100">Confirm Reservation</button>
    </form>
</div>
</body>
</html>
