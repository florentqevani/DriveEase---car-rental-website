<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "car_rental";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$car_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$sql = "SELECT * FROM cars WHERE id = $car_id";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $car = $result->fetch_assoc();
} else {
    die("Car not found.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?php echo htmlspecialchars($car['name']); ?></title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container mt-5 mb-5">
    <div class="row">
        <div class="col-md-6">
            <img src="<?php echo htmlspecialchars($car['image']); ?>" class="img-fluid rounded shadow" alt="Car Image">
        </div>
        <div class="col-md-6">
            <h2><?php echo htmlspecialchars($car['name']); ?></h2>
                        <p><?php echo htmlspecialchars($car['description']); ?></p>
            <h4 class="text-primary">€<?php echo htmlspecialchars($car['price']); ?> / day</h4>

            <form action="checkout.php" method="POST" class="mt-4">
                <input type="hidden" name="car_id" value="<?php echo $car['id']; ?>">
                <div class="mb-3">
                    <label class="form-label">Pickup Date</label>
                    <input type="date" name="pickup_date" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Return Date</label>
                    <input type="date" name="return_date" class="form-control" required>
                </div>
                <button type="submit" name="reserve" class="btn btn-success w-100">Reserve Now</button>
            </form>
        </div>
    </div>
</div>
</body>
</html>
