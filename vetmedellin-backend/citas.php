<?php
require_once 'conexion.php';

$table = 'citas';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function citaPayload(string $table): array
{
    $data = validateCrudPayload($table, json_decode(file_get_contents('php://input'), true));
    unset($data['mascota_nombre'], $data['dueno_nombre'], $data['medico_nombre'], $data['medico_apellido']);
    if (isset($data['medico_id'])) {
        $data['doctor_id'] = $data['medico_id'];
        unset($data['medico_id']);
    }
    return $data;
}

try {
    switch ($method) {
        case 'GET':
            $sql = "SELECT c.id, c.mascota_id, c.doctor_id AS medico_id, c.fecha_hora, c.motivo, c.estado,
                           m.nombre AS mascota_nombre, d.nombre AS medico_nombre, d.apellido AS medico_apellido,
                           o.nombre AS dueno_nombre, o.apellido AS dueno_apellido
                    FROM citas c
                    LEFT JOIN mascotas m ON c.mascota_id = m.id
                    LEFT JOIN doctores d ON c.doctor_id = d.id
                    LEFT JOIN duenos o ON m.dueno_id = o.id";
            $params = [];
            if (isset($_GET['id'])) {
                $sql .= ' WHERE c.id = :id';
                $params['id'] = $_GET['id'];
            }
            $sql .= ' ORDER BY c.id DESC';
            $stmt = $conexion->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            echo json_encode(isset($_GET['id']) ? ($rows[0] ?? null) : $rows);
            break;

        case 'POST':
            $data = citaPayload($table);
            if (empty($data['mascota_id']) || empty($data['doctor_id']) || empty($data['fecha_hora'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Mascota, médico y fecha son obligatorios.']);
                break;
            }
            $columns = array_keys($data);
            $stmt = $conexion->prepare('INSERT INTO citas (' . implode(', ', $columns) . ') VALUES (:' . implode(', :', $columns) . ')');
            $stmt->execute($data);
            http_response_code(201);
            echo json_encode(['status' => 'success', 'id' => (int) $conexion->lastInsertId()]);
            break;

        case 'PUT':
            $data = citaPayload($table);
            $id = $_GET['id'] ?? $data['id'] ?? null;
            unset($data['id']);
            if (!$id || !$data) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID y datos para actualizar son obligatorios.']);
                break;
            }
            $assignments = [];
            foreach (array_keys($data) as $field) {
                $assignments[] = "$field = :$field";
            }
            $data['id'] = $id;
            $stmt = $conexion->prepare('UPDATE citas SET ' . implode(', ', $assignments) . ' WHERE id = :id');
            $stmt->execute($data);
            echo json_encode(['status' => 'success', 'message' => 'Cita actualizada.']);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID requerido para eliminar.']);
                break;
            }
            $stmt = $conexion->prepare("UPDATE citas SET estado = 'Cancelada' WHERE id = :id");
            $stmt->execute(['id' => $_GET['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Cita cancelada.']);
            break;

        default:
            http_response_code(405);
            header('Allow: GET, POST, PUT, DELETE, OPTIONS');
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    }
} catch (PDOException $error) {
    http_response_code(409);
    error_log('VetMedellin citas endpoint failed: ' . $error->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'No se pudo completar la operación de citas.']);
}
