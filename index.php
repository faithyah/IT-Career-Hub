<?php
require 'config.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf" content="<?= e(csrf()) ?>">
<title>IT Career Hub</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<header><div class="wrap">
  <span class="who"><?= e($_SESSION['uname']) ?> · <a href="logout.php">Log out</a></span>
  <h1>IT Career Hub</h1>
  <p>Explore IT jobs, side income ideas and the skills behind them.</p>
  <nav id="nav"></nav>
</div></header>
<main id="main"></main>
<script src="assets/js/catalog.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
