<?php
require 'config.php';
if (!empty($_SESSION['uid'])) { header('Location: index.php'); exit; }
$mode = ($_GET['mode'] ?? 'login') === 'register' ? 'register' : 'login';
$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals(csrf(), $_POST['csrf'] ?? '')) { $err = 'Session expired. Please try again.'; }
    else {
        $mode = ($_POST['mode'] ?? '') === 'register' ? 'register' : 'login';
        $u = trim($_POST['username'] ?? ''); $p = $_POST['password'] ?? '';
        try {
            if ($mode === 'register') {
                $em = trim($_POST['email'] ?? '');
                if (!preg_match('/^[A-Za-z0-9_]{3,30}$/', $u)) $err = 'Username: 3–30 letters, numbers or underscores.';
                elseif (!filter_var($em, FILTER_VALIDATE_EMAIL)) $err = 'Enter a valid email address.';
                elseif (strlen($p) < 8) $err = 'Password must be at least 8 characters.';
                else {
                    $s = db()->prepare('SELECT 1 FROM users WHERE username = ? OR email = ?');
                    $s->execute([$u, $em]);
                    if ($s->fetch()) $err = 'That username or email is already taken.';
                    else {
                        db()->prepare('INSERT INTO users (username, email, password_hash) VALUES (?,?,?)')
                            ->execute([$u, $em, password_hash($p, PASSWORD_DEFAULT)]);
                        login_user((int)db()->lastInsertId(), $u);
                    }
                }
            } else {
                $s = db()->prepare('SELECT id, username, password_hash FROM users WHERE username = ? OR email = ?');
                $s->execute([$u, $u]); $r = $s->fetch();
                if ($r && password_verify($p, $r['password_hash'])) login_user((int)$r['id'], $r['username']);
                else $err = 'Wrong username or password.';
            }
        } catch (PDOException $x) {
            $err = 'Database error. Is MySQL running and database.sql imported?';
        }
    }
}
$reg = $mode === 'register';
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $reg ? 'Create account' : 'Sign in' ?> · IT Career Hub</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="login-page">
<form class="login-card" method="post" autocomplete="on">
  <h1>💻 IT Career Hub</h1>
  <p class="note"><?= $reg ? 'Create your account to save jobs and track skills.' : 'Sign in to see your saved jobs and skills.' ?></p>
  <?php if ($err): ?><div class="err"><?= e($err) ?></div><?php endif; ?>
  <input type="hidden" name="csrf" value="<?= e(csrf()) ?>">
  <input type="hidden" name="mode" value="<?= $mode ?>">
  <label><?= $reg ? 'Username' : 'Username or email' ?>
    <input name="username" required value="<?= e($_POST['username'] ?? '') ?>"></label>
  <?php if ($reg): ?>
  <label>Email <input type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>"></label>
  <?php endif; ?>
  <label>Password <input type="password" name="password" required minlength="<?= $reg ? 8 : 1 ?>"></label>
  <button class="btn" type="submit"><?= $reg ? 'Create account' : 'Sign in' ?></button>
  <p class="note"><?= $reg ? 'Already registered? <a href="login.php">Sign in</a>' : 'New here? <a href="login.php?mode=register">Create an account</a>' ?></p>
</form>
</body>
</html>
