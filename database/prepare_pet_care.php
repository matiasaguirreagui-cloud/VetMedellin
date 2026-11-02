<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit();
}

require_once __DIR__ . '/../vetmedellin-backend/conexion.php';

if ($conexion->query('SELECT DATABASE()')->fetchColumn() !== 'pet_care') {
    fwrite(STDERR, "La migración solo se ejecuta sobre pet_care; revisa VETMED_DB_NAME.\n");
    exit(1);
}

$requiredColumns = [
    'mascotas' => [
        'activo' => 'TINYINT(1) NOT NULL DEFAULT 1',
    ],
    'historias_clinicas' => [
        'peso' => 'DECIMAL(5,2) NULL',
        'temperatura' => 'DECIMAL(5,2) NULL',
        'frecuencia_cardiaca' => 'SMALLINT UNSIGNED NULL',
        'frecuencia_respiratoria' => 'SMALLINT UNSIGNED NULL',
        'observaciones' => 'TEXT NULL',
    ],
];

try {
    foreach ($requiredColumns as $table => $columns) {
        $stmt = $conexion->prepare(
            'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table'
        );
        $stmt->execute(['table' => $table]);
        $existingColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($columns as $column => $definition) {
            if (!in_array($column, $existingColumns, true)) {
                $conexion->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
                fwrite(STDOUT, "Agregada columna $table.$column\n");
            }
        }
    }
    fwrite(STDOUT, "pet_care está lista para VetMedellin; no se eliminaron ni reemplazaron datos.\n");
} catch (PDOException $error) {
    fwrite(STDERR, "No fue posible preparar pet_care: " . $error->getMessage() . "\n");
    exit(1);
}
