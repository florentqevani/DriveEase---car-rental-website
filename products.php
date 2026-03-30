<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "car_rental";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

$sql = "SELECT * FROM cars";
$result = mysqli_query($conn, $sql);

while($row = mysqli_fetch_assoc($result)){
    echo '
    <div class="card m-3" style="width: 18rem;">
        <img src="'.$row['image'].'" class="card-img-top" alt="'.$row['name'].'">
        <div class="card-body">
            <h5 class="card-title">'.$row['name'].'</h5>
            <p class="card-text">Price per day: '.$row['price'].' €</p>
            <a href="product_spec.php?id='.$row['id'].'" class="btn btn-primary">Reserve</a>
        </div>
    </div>';
}
?>
