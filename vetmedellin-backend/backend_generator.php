<?php
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit();
}

$tables = [
    'alianzas_externas', 'citas', 'detalle_factura', 'duenos', 'facturas',
    'historias_clinicas', 'mascotas', 'medicos', 'productos', 'proveedores',
    'registro_vacunacion', 'servicios', 'vacunas'
];

foreach ($tables as $table) {
    $code = "<?php
require_once 'conexion.php';

// Validar que la tabla sea segura
\$tabla = '$table';
\$metodo = \$_SERVER['REQUEST_METHOD'];

switch (\$metodo) {
    case 'GET':
        if (isset(\$_GET['id'])) {
            \$stmt = \$conexion->prepare(\"SELECT * FROM \$tabla WHERE id = :id\");
            \$stmt->execute(['id' => \$_GET['id']]);
            echo json_encode(\$stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            \$stmt = \$conexion->query(\"SELECT * FROM \$tabla ORDER BY id DESC\");
            echo json_encode(\$stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        \$data = validateCrudPayload(\$tabla, json_decode(file_get_contents(\"php://input\"), true));
        if (\$data) {
            // Removemos id si viene para autoincrement
            unset(\$data['id']);
            
            \$columns = implode(', ', array_keys(\$data));
            \$placeholders = ':' . implode(', :', array_keys(\$data));
            
            try {
                \$stmt = \$conexion->prepare(\"INSERT INTO \$tabla (\$columns) VALUES (\$placeholders)\");
                \$stmt->execute(\$data);
                echo json_encode(['status' => 'success', 'message' => 'Registro creado', 'id' => \$conexion->lastInsertId()]);
            } catch (PDOException \$e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => \$e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'No data provided']);
        }
        break;

    case 'PUT':
        \$data = validateCrudPayload(\$tabla, json_decode(file_get_contents(\"php://input\"), true));
        if (\$data && isset(\$data['id'])) {
            \$id = \$data['id'];
            unset(\$data['id']);
            
            \$setParts = [];
            foreach (array_keys(\$data) as \$key) {
                \$setParts[] = \"\$key = :\$key\";
            }
            \$setSql = implode(', ', \$setParts);
            
            try {
                \$stmt = \$conexion->prepare(\"UPDATE \$tabla SET \$setSql WHERE id = :id\");
                \$data['id'] = \$id;
                \$stmt->execute(\$data);
                echo json_encode(['status' => 'success', 'message' => 'Registro actualizado']);
            } catch (PDOException \$e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => \$e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID requerido para actualizar']);
        }
        break;

    case 'DELETE':
        if (isset(\$_GET['id'])) {
            try {
                \$stmt = \$conexion->prepare(\"DELETE FROM \$tabla WHERE id = :id\");
                \$stmt->execute(['id' => \$_GET['id']]);
                echo json_encode(['status' => 'success', 'message' => 'Registro eliminado']);
            } catch (PDOException \$e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => \$e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
        break;
}
?>";
    
    file_put_contents(__DIR__ . "/{$table}.php", $code);
}

echo "Archivos CRUD generados exitosamente.";
?>
