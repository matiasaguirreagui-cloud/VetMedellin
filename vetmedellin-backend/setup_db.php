<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit();
}

require_once 'conexion.php';

try {
    // Crear tabla usuarios si no existe
    $sql = "CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conexion->exec($sql);

    // Verificar si el admin ya existe
    $stmt = $conexion->prepare("SELECT COUNT(*) FROM usuarios WHERE username = 'admin'");
    $stmt->execute();
    if ($stmt->fetchColumn() == 0) {
        $password = getenv('VETMED_ADMIN_PASSWORD') ?: (function_exists('readline') ? readline('Define la contraseña para admin: ') : '');
        if ($password === '') {
            fwrite(STDERR, "No se creó admin. Define VETMED_ADMIN_PASSWORD o vuelve a ejecutar este script e ingresa una contraseña.\n");
            exit(1);
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $insert = $conexion->prepare("INSERT INTO usuarios (username, password_hash, rol) VALUES ('admin', :hash, 'admin')");
        $insert->execute(['hash' => $hash]);
        fwrite(STDOUT, "Usuario admin creado.\n");
    } else {
        fwrite(STDOUT, "El usuario admin ya existe.\n");
    }
} catch(PDOException $e) {
    fwrite(STDERR, "No fue posible preparar admin: " . $e->getMessage() . "\n");
    exit(1);
}
?>
