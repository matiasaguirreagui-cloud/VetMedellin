<?php
require_once 'conexion.php';

$tabla = 'facturas';
$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        try {
            if (($_GET['action'] ?? '') === 'reporte') {
                $stmt = $conexion->query(
                    'SELECT YEAR(fecha_emision) AS anio, MONTH(fecha_emision) AS mes_numero, '
                    . 'SUM(total) AS total_ingresos, COUNT(*) AS total_facturas '
                    . 'FROM facturas GROUP BY YEAR(fecha_emision), MONTH(fecha_emision) '
                    . 'ORDER BY YEAR(fecha_emision), MONTH(fecha_emision)'
                );
                $meses = [1 => 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                $reporte = array_map(static function (array $row) use ($meses): array {
                    return [
                        'mes' => $meses[(int) $row['mes_numero']],
                        'anio' => (int) $row['anio'],
                        'total_ingresos' => (float) $row['total_ingresos'],
                        'total_facturas' => (int) $row['total_facturas'],
                    ];
                }, $stmt->fetchAll());
                echo json_encode($reporte);
                break;
            }
            if (isset($_GET['id'])) {
                // Consulta con un JOIN para traer los datos de la factura junto al nombre del dueño
                $stmt = $conexion->prepare("SELECT f.*, d.nombre AS dueno_nombre, d.apellido AS dueno_apellido 
                                            FROM $tabla f 
                                            INNER JOIN duenos d ON f.dueno_id = d.id 
                                            WHERE f.id = :id");
                $stmt->execute(['id' => $_GET['id']]);
                $resultado = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($resultado ? $resultado : []);
            } else {
                // Trae todas las facturas ordenadas uniendo la tabla dueños para saber el nombre
                $stmt = $conexion->query("SELECT f.*, d.nombre AS dueno_nombre, d.apellido AS dueno_apellido 
                                          FROM $tabla f 
                                          INNER JOIN duenos d ON f.dueno_id = d.id 
                                          ORDER BY f.id DESC");
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Error de Base de Datos: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = validateCrudPayload($tabla, json_decode(file_get_contents("php://input"), true));
        if ($data) {
            unset($data['id']);
            unset($data['nombre_dueno'], $data['dueno_nombre'], $data['dueno_apellido']);
            
            $columns = implode(', ', array_keys($data));
            $placeholders = ':' . implode(', :', array_keys($data));
            
            try {
                $stmt = $conexion->prepare("INSERT INTO $tabla ($columns) VALUES ($placeholders)");
                $stmt->execute($data);
                echo json_encode(['status' => 'success', 'message' => 'Factura creada con éxito', 'id' => $conexion->lastInsertId()]);
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Datos no proporcionados o inválidos']);
        }
        break;

    case 'PUT':
        $data = validateCrudPayload($tabla, json_decode(file_get_contents("php://input"), true));
        if (isset($data['id'])) {
            $id = $data['id'];
            unset($data['id']);
            unset($data['nombre_dueno'], $data['dueno_nombre'], $data['dueno_apellido']);
            
            $setParts = [];
            foreach (array_keys($data) as $key) {
                $setParts[] = "$key = :$key";
            }
            $setSql = implode(', ', $setParts);
            
            try {
                $stmt = $conexion->prepare("UPDATE $tabla SET $setSql WHERE id = :id");
                $data['id'] = $id;
                $stmt->execute($data);
                echo json_encode(['status' => 'success', 'message' => 'Factura actualizada']);
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID requerido para actualizar']);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            try {
                $stmt = $conexion->prepare("DELETE FROM $tabla WHERE id = :id");
                $stmt->execute(['id' => $_GET['id']]);
                echo json_encode(['status' => 'success', 'message' => 'Factura eliminada']);
            } catch (PDOException $e) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID no proporcionado']);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Método no soportado']);
        break;
}
