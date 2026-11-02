<?php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$allowedFields = [
    'id', 'mascota_id', 'medico_id', 'doctor_id', 'cita_id', 'fecha', 'fecha_consulta',
    'motivo_consulta', 'sintomas', 'examen_fisico', 'examen_physico', 'peso', 'temperatura',
    'frecuencia_cardiaca', 'frecuencia_respiratoria', 'diagnostico', 'tratamiento',
    'plan_tratamiento', 'observaciones', 'proxima_revision',
];

function historiaPayload(array $allowedFields): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data) || array_is_list($data)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'El cuerpo JSON debe ser un objeto válido.']);
        exit();
    }
    foreach (array_keys($data) as $field) {
        if (!in_array($field, $allowedFields, true)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'El cuerpo contiene un campo no permitido.']);
            exit();
        }
    }

    if (isset($data['medico_id']) && !isset($data['doctor_id'])) {
        $data['doctor_id'] = $data['medico_id'];
    }
    if (isset($data['fecha']) && !isset($data['fecha_consulta'])) {
        $data['fecha_consulta'] = $data['fecha'];
    }
    if (isset($data['examen_physico']) && !isset($data['examen_fisico'])) {
        $data['examen_fisico'] = $data['examen_physico'];
    }
    if (isset($data['tratamiento']) && !isset($data['plan_tratamiento'])) {
        $data['plan_tratamiento'] = $data['tratamiento'];
    }

    unset($data['medico_id'], $data['fecha'], $data['examen_physico'], $data['tratamiento']);
    return $data;
}

try {
    switch ($method) {
        case 'GET':
            $sql = "SELECT h.*, h.doctor_id AS medico_id, h.fecha_consulta AS fecha,
                           h.plan_tratamiento AS tratamiento,
                           m.nombre AS mascota_nombre, d.nombre AS medico_nombre, d.apellido AS medico_apellido
                    FROM historias_clinicas h
                    LEFT JOIN mascotas m ON h.mascota_id = m.id
                    LEFT JOIN doctores d ON h.doctor_id = d.id";
            $conditions = [];
            $params = [];
            if (isset($_GET['id'])) {
                $conditions[] = 'h.id = :id';
                $params['id'] = $_GET['id'];
            }
            if (isset($_GET['mascota_id'])) {
                $conditions[] = 'h.mascota_id = :mascota_id';
                $params['mascota_id'] = $_GET['mascota_id'];
            }
            if ($conditions) {
                $sql .= ' WHERE ' . implode(' AND ', $conditions);
            }
            $sql .= ' ORDER BY h.id DESC';
            $stmt = $conexion->prepare($sql);
            $stmt->execute($params);
            echo json_encode($stmt->fetchAll());
            break;

        case 'POST':
            $data = historiaPayload($allowedFields);
            if (empty($data['mascota_id']) || empty($data['doctor_id']) || empty($data['diagnostico'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Mascota, médico y diagnóstico son obligatorios.']);
                break;
            }
            unset($data['id']);
            $columns = array_keys($data);
            $stmt = $conexion->prepare('INSERT INTO historias_clinicas (' . implode(', ', $columns) . ') VALUES (:' . implode(', :', $columns) . ')');
            $stmt->execute($data);
            http_response_code(201);
            echo json_encode(['status' => 'success', 'id' => (int) $conexion->lastInsertId()]);
            break;

        case 'PUT':
            $data = historiaPayload($allowedFields);
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
            $stmt = $conexion->prepare('UPDATE historias_clinicas SET ' . implode(', ', $assignments) . ' WHERE id = :id');
            $stmt->execute($data);
            echo json_encode(['status' => 'success', 'message' => 'Historia clínica actualizada.']);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID requerido para eliminar.']);
                break;
            }
            $stmt = $conexion->prepare('DELETE FROM historias_clinicas WHERE id = :id');
            $stmt->execute(['id' => $_GET['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Historia clínica eliminada.']);
            break;

        default:
            http_response_code(405);
            header('Allow: GET, POST, PUT, DELETE, OPTIONS');
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    }
} catch (PDOException $error) {
    http_response_code(409);
    error_log('VetMedellin historias endpoint failed: ' . $error->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'No se pudo completar la operación de historia clínica.']);
}
