<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "car_rental";

// Krijo lidhjen
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Merr rezervimet me të dhënat e makinës
$sql = "SELECT r.*, c.name AS car_name, c.image, c.price 
        FROM reservations r
        JOIN cars c ON r.car_id = c.id
        ORDER BY r.created_at DESC
        LIMIT 1";  // merr vetëm rezervimin e fundit
$result = $conn->query($sql);

$reservation = null;
if ($result && $result->num_rows > 0) {
    $reservation = $result->fetch_assoc();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Your Reservation</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
    .car-img {
        width: 100%;
        height: auto;
        border-radius: 12px;
    }
    .reservation-card {
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        padding: 20px;
        margin-top: 40px;
    }
</style>
</head>
<body>

<div class="container">
    <div class="py-5 text-center">
        <h2>Your Car Reservation</h2>
        <p class="lead">Below you can find the details of your reserved car.</p>
    </div>

    <div class="reservation-card bg-light">
        <?php if ($reservation): ?>
            <div class="row">
                <div class="col-md-6">
                    <img src="<?php echo htmlspecialchars($reservation['image']); ?>" alt="<?php echo htmlspecialchars($reservation['car_name']); ?>" class="car-img">
                </div>
                <div class="col-md-6">
                    <h3><?php echo htmlspecialchars($reservation['car_name']); ?></h3>
                    <p><strong>Price per day:</strong> €<?php echo number_format($reservation['price'], 2); ?></p>
                    <p><strong>Pickup date:</strong> <?php echo htmlspecialchars($reservation['pickup_date']); ?></p>
                    <p><strong>Return date:</strong> <?php echo htmlspecialchars($reservation['return_date']); ?></p>
                    <p><strong>Total price:</strong> €<?php echo number_format($reservation['total_price'], 2); ?></p>
                    <p><strong>Customer:</strong> <?php echo htmlspecialchars($reservation['customer_name']); ?> (<?php echo htmlspecialchars($reservation['customer_email']); ?>)</p>
                    <a href="index.php" class="btn btn-outline-primary mt-3">Reserve another car</a>
                </div>
            </div>
        <?php else: ?>
            <div class="alert alert-warning" role="alert">
                No reservation found. Please go back and select a car.
            </div>
        <?php endif; ?>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
