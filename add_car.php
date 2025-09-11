<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['carName'] ?? '';
    $desc = $_POST['carDesc'] ?? '';
    $price = $_POST['carPrice'] ?? 0;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imageTmp = $_FILES['image']['tmp_name'];
        $imageName = basename($_FILES['image']['name']);
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $imagePath = $uploadDir . uniqid() . '_' . $imageName;
        if (move_uploaded_file($imageTmp, $imagePath)) {
            $stmt = $pdo->prepare("INSERT INTO cars (name, description, price, image) VALUES (?, ?, ?, ?)");
            $stmt->execute([$name, $desc, $price, $imagePath]);
            echo json_encode(["success" => true, "message" => "Makina u shtua me sukses"]);
            exit;
        } else {
            echo json_encode(["success" => false, "message" => "Ngarkimi i fotos dështoi."]);
            exit;
        }
    } else {
        echo json_encode(["success" => false, "message" => "Nuk u dërgua asnjë foto."]);
        exit;
    }
} else {
    echo json_encode(["success" => false, "message" => "Metoda jo e lejuar."]);
}
?>
