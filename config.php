<?php
declare(strict_types=1);
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
session_start();

// XAMPP/WAMP defaults. Change these if your MySQL user differs.
const DB_HOST = 'localhost', DB_NAME = 'it_career_hub', DB_USER = 'root', DB_PASS = '';

function db(): PDO {
    static $pdo = null;
    if (!$pdo) {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}
function csrf(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function require_login(): void { if (empty($_SESSION['uid'])) { header('Location: login.php'); exit; } }
function login_user(int $id, string $name): void {
    session_regenerate_id(true);
    $_SESSION['uid'] = $id; $_SESSION['uname'] = $name;
    header('Location: index.php'); exit;
}
