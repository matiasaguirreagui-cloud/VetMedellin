<?php
require_once 'conexion.php';

$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($data['username']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(["error" => "Usuario y contraseña requeridos"]);
        exit();
    }

    $stmt = $conexion->prepare("SELECT * FROM usuarios WHERE username = :username");
    $stmt->execute(['username' => $data['username']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($data['password'], $user['password_hash'])) {
        // En una app real de producción usaríamos JWT, pero para esta implementación
        // enviaremos un token simple o identificador de sesión.
        $token = bin2hex(random_bytes(16));
        
        echo json_encode([
            "status" => "success",
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "rol" => $user['rol']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Credenciales incorrectas"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
