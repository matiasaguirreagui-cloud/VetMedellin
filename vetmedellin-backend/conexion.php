<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

$frontendOrigin = getenv('VETMED_FRONTEND_ORIGIN') ?: 'http://localhost:3000';
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isLocalNextOrigin = preg_match('#^http://(?:localhost|127\.0\.0\.1):30[0-9]{2}$#', $requestOrigin) === 1;
if ($requestOrigin === $frontendOrigin || $isLocalNextOrigin) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

function validateCrudPayload(string $table, mixed $payload): array
{
    $allowedColumns = [
        'alianzas_externas' => ['id', 'nombre_entidad', 'tipo', 'convenio_detalles', 'telefono', 'activo'],
        'citas' => ['id', 'mascota_id', 'medico_id', 'fecha_hora', 'motivo', 'estado', 'mascota_nombre', 'dueno_nombre', 'dueno_apellido', 'medico_nombre', 'medico_apellido'],
        'detalle_factura' => ['id', 'factura_id', 'producto_id', 'servicio_id', 'cantidad', 'precio_unitario'],
        'duenos' => ['id', 'dni_cedula', 'nombre', 'apellido', 'telefono', 'email', 'direccion', 'ciudad'],
        'facturas' => ['id', 'dueno_id', 'fecha_emision', 'subtotal', 'impuestos', 'total', 'estado_pago', 'metodo_pago', 'nombre_dueno', 'dueno_nombre', 'dueno_apellido'],
        'historias_clinicas' => ['id', 'mascota_id', 'medico_id', 'cita_id', 'fecha', 'fecha_consulta', 'motivo_consulta', 'sintomas', 'examen_fisico', 'peso', 'temperatura', 'frecuencia_cardiaca', 'frecuencia_respiratoria', 'diagnostico', 'tratamiento', 'plan_tratamiento', 'observaciones', 'proxima_revision'],
        'mascotas' => ['id', 'nombre', 'especie', 'raza', 'dueno_id', 'fecha_nacimiento', 'sexo', 'color', 'microchip', 'peso_actual', 'esterilizado', 'foto_url', 'activo'],
        'medicos' => ['id', 'tarjeta_profesional', 'nombre', 'apellido', 'especialidad', 'telefono', 'email', 'activo'],
        'doctores' => ['id', 'tarjeta_profesional', 'nombre', 'apellido', 'especialidad', 'telefono', 'email', 'activo'],
        'productos' => ['id', 'codigo_barras', 'nombre', 'descripcion', 'proveedor_id', 'precio_compra', 'precio_venta', 'stock_actual', 'stock_minimo'],
        'proveedores' => ['id', 'nit_tax_id', 'nombre_empresa', 'contacto_nombre', 'telefono', 'email'],
        'registro_vacunacion' => ['id', 'mascota_id', 'vacuna_id', 'medico_id', 'fecha_aplicacion', 'fecha_refuerzo', 'lote'],
        'servicios' => ['id', 'nombre', 'precio'],
        'vacunas' => ['id', 'nombre_vacuna', 'dias_validez'],
    ];

    if (!isset($allowedColumns[$table]) || !is_array($payload) || array_is_list($payload)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El cuerpo JSON debe ser un objeto válido.']);
        exit();
    }

    foreach (array_keys($payload) as $column) {
        if (!in_array($column, $allowedColumns[$table], true)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'El cuerpo contiene un campo no permitido.']);
            exit();
        }
    }

    return $payload;
}

$host = getenv('VETMED_DB_HOST') ?: '127.0.0.1';
$port = getenv('VETMED_DB_PORT') ?: '3306';
$database = getenv('VETMED_DB_NAME') ?: 'pet_care';
$username = getenv('VETMED_DB_USER') ?: 'root';
$password = getenv('VETMED_DB_PASSWORD') ?: '';

try {
    $conexion = new PDO(
        "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $error) {
    http_response_code(503);
    error_log('VetMedellin database connection failed: ' . $error->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'No se pudo conectar con la base de datos local.']);
    exit();
}
