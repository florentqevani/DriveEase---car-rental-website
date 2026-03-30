<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
    <title>Car Rental</title>
</head>
<body>
    <!-- navbar -->
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
<div class="container-fluid">
    <a class="navbar-brand" href="index.php" id="logo">Car Rental</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="index.php">Home</a>
        </li>
        <li class="nav-item">
        <a class="nav-link" href="./reservations.php">Reservations</a>
        </li>
        <li class="nav-item" widhth="40">
        <a class="nav-link" href="./login.php" role="button" aria-expanded="false">
            Login
        </a>
        </li>
    </ul>
    </div>
</div>
</nav>

<!-- home -->
<div id="myCarousel" class="carousel slide mb-6" data-bs-ride="carousel">
    <div class="carousel-indicators">
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="0" class="active" aria-label="Slide 1" aria-current="true">
        </button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="1" aria-label="Slide 2" class="">
        </button>
        <button type="button" data-bs-target="#myCarousel" data-bs-slide-to="2" aria-label="Slide 3" class=""></button>
    </div>
    <div class="carousel-inner">
        <div class="carousel-item active">
        <img src="images/banner2.avif" alt="" width="1400" height="650">
            <div class="container">
                <div class="carousel-caption text-start">
                    <h1>Explore Albania with Comfort</h1>
                    <p class="opacity-75">Discover breathtaking landscapes and hidden gems with a reliable rental car. Your adventure starts with us.</p>
                    <p><a class="btn btn-lg btn-primary" href="login.html">Sign up today</a></p>
                </div>
            </div>
        </div>
        <div class="carousel-item">
            <img src="images/banner3.jpg" alt="" height="700" width="1400">
            <div class="container">
                <div class="carousel-caption">
                    <h1>Wide Selection of Vehicles</h1>
                    <p>From economy to luxury – choose the perfect car for your journey. Daily, weekly, and long-term rentals available.</p>
                    <p><a class="btn btn-lg btn-primary" href="#features">Features</a></p>
                </div>
            </div>
        </div>
        <div class="carousel-item">
        <img src="images/banner4.jpg" alt="" height="700" width="1400">
            <div class="container">
                <div class="carousel-caption text-end">
                    <h1>Ready for a new experience?</h1>
                    <p>Get your dream car now.</p>
                    <p><a class="btn btn-lg btn-primary" href="#all_products">Explore Now</a></p>
                </div>
            </div>
        </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
    </button> <button class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
    </button>
</div>

<!-- all products -->
<section class="products" id="all_products">
    <h1>All Products</h1>
    <div class="d-flex flex-wrap justify-content-center">
        <?php include 'products.php'; ?>
    </div>
</section>


<!-- feature -->
<section class="features" id="features">
<div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
      <div class="feature col">
        <div class="feature-icon d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-car-front-fill" viewBox="0 0 16 16">
  <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"/>
</svg>
        </div>
        <h3 class="fs-2">Modern and Diverse Fleet</h3>
        <p>Choose from a wide selection of vehicles – from budget-friendly city cars to luxury SUVs – perfect for exploring Albania’s cities or scenic mountain roads.</p>
      </div>
      <div class="feature col">
        <div class="feature-icon d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-geo-alt-fill" viewBox="0 0 16 16">
  <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
</svg>
        </div>
        <h3 class="fs-2">Nationwide Pickup and Drop-off</h3>
        <p>Pick up your car in Tirana, Durrës, Vlorë, or any major city with flexible delivery and return options across the country.</p>
      </div>
      <div class="feature col">
        <div class="feature-icon d-inline-flex align-items-center justify-content-center text-bg-primary bg-gradient fs-2 mb-3">
         <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-credit-card" viewBox="0 0 16 16">
  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
  <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
</svg>
        </div>
        <h3 class="fs-2">Transparent Pricing, No Hidden Fees</h3>
        <p>Every booking includes basic insurance, unlimited mileage, and 24/7 roadside assistance – everything you need, with no surprise costs.</p>
      </div>
    </div>
    </section>

<!-- footer -->
<div class="container">
  <footer class="py-3 my-4">
    <ul class="nav justify-content-center border-bottom pb-3 mb-3">
      <li class="nav-item"><a href="#home" class="nav-link px-2 text-muted">Home</a></li>
      <li class="nav-item"><a href="#viewfeature" class="nav-link px-2 text-muted">Features</a></li>
      <li class="nav-item"><a href="#" class="nav-link px-2 text-muted">FAQs</a></li>
      <li class="nav-item"><a href="#" class="nav-link px-2 text-muted">About</a></li>
    </ul>
    <p class="text-center text-muted">© 2025</p>
  </footer>
</div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
</body>
</html>