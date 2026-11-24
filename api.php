<?php
require 'config.php';
header('Content-Type: application/json');
function out($d, int $c = 200) { http_response_code($c); echo json_encode($d); exit; }
if (empty($_SESSION['uid'])) out(['error' => 'Not signed in'], 401);
$uid = (int)$_SESSION['uid'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $s = db()->prepare('SELECT item_id FROM saved_items WHERE user_id = ?');
        $s->execute([$uid]);
        $saved = array_column($s->fetchAll(), 'item_id');
        $s = db()->prepare('SELECT skill_id, status FROM user_skills WHERE user_id = ?');
        $s->execute([$uid]);
        $skills = [];
        foreach ($s->fetchAll() as $r) $skills[$r['skill_id']] = $r['status'];
        out(['username' => $_SESSION['uname'], 'saved' => $saved, 'skills' => (object)$skills]);
    }
    // POST: JSON body + CSRF header
    if (!hash_equals(csrf(), $_SERVER['HTTP_X_CSRF'] ?? '')) out(['error' => 'Bad token'], 403);
    $b = json_decode(file_get_contents('php://input'), true) ?? [];
    $act = $b['action'] ?? '';
    if ($act === 'toggle_save') {
        $id = (string)($b['item_id'] ?? '');
        if (!preg_match('/^[sj]\d{1,3}$/', $id)) out(['error' => 'Invalid item'], 422);
        $s = db()->prepare('DELETE FROM saved_items WHERE user_id = ? AND item_id = ?');
        $s->execute([$uid, $id]);
        if ($s->rowCount() === 0)
            db()->prepare('INSERT INTO saved_items (user_id, item_id) VALUES (?,?)')->execute([$uid, $id]);
        out(['ok' => true]);
    }
    if ($act === 'set_skill') {
        $id = (string)($b['skill_id'] ?? ''); $st = (string)($b['status'] ?? '');
        if (!preg_match('/^[a-z]{2,8}$/', $id) || !in_array($st, ['', 'learning', 'have'], true)) out(['error' => 'Invalid skill'], 422);
        if ($st === '') db()->prepare('DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?')->execute([$uid, $id]);
        else db()->prepare('INSERT INTO user_skills (user_id, skill_id, status) VALUES (?,?,?) ON DUPLICATE KEY UPDATE status = VALUES(status)')->execute([$uid, $id, $st]);
        out(['ok' => true]);
    }
    out(['error' => 'Unknown action'], 400);
} catch (PDOException $x) {
    out(['error' => 'Database error'], 500);
}
