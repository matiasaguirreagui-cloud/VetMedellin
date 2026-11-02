<?php
require_once 'conexion.php';

$allowedFields = ['id', 'nombre', 'especie', 'raza', 'dueno_id', 'fecha_nacimiento', 'sexo', 'color', 'microchip', 'peso_actual', 'esterilizado', 'foto_url', 'activo'];
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function mascotaPayload(array $allowedFields): array
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
    return $data;
}

function ensureRazaId(PDO $conexion, string $especie, string $raza): int
{
    $findSpecies = $conexion->prepare('SELECT id FROM especies WHERE nombre = :nombre LIMIT 1');
    $findSpecies->execute(['nombre' => trim($especie)]);
    $speciesId = $findSpecies->fetchColumn();
    if (!$speciesId) {
        $insertSpecies = $conexion->prepare('INSERT INTO especies (nombre) VALUES (:nombre)');
        $insertSpecies->execute(['nombre' => trim($especie)]);
        $speciesId = (int) $conexion->lastInsertId();
    }

    $findBreed = $conexion->prepare('SELECT id FROM razas WHERE especie_id = :especie_id AND LOWER(nombre) = LOWER(:nombre) LIMIT 1');
    $findBreed->execute(['especie_id' => $speciesId, 'nombre' => trim($raza)]);
    $breedId = $findBreed->fetchColumn();
    if (!$breedId) {
        $insertBreed = $conexion->prepare('INSERT INTO razas (especie_id, nombre) VALUES (:especie_id, :nombre)');
        $insertBreed->execute(['especie_id' => $speciesId, 'nombre' => trim($raza)]);
        $breedId = (int) $conexion->lastInsertId();
    }
    return (int) $breedId;
}

try {
    switch ($method) {
        case 'GET':
            $sql = "SELECT m.id, m.nombre, e.nombre AS especie, r.nombre AS raza, m.dueno_id,
                           m.fecha_nacimiento, m.sexo, m.color, m.microchip, m.peso_actual,
                           m.esterilizado, m.foto_url, m.activo,
                           d.nombre AS dueno_nombre, d.apellido AS dueno_apellido
                    FROM mascotas m
                    INNER JOIN razas r ON m.raza_id = r.id
                    INNER JOIN especies e ON r.especie_id = e.id
                    INNER JOIN duenos d ON m.dueno_id = d.id";
            $params = [];
            if (isset($_GET['id'])) {
                $sql .= ' WHERE m.id = :id';
                $params['id'] = $_GET['id'];
            }
            $sql .= ' ORDER BY m.id DESC';
            $stmt = $conexion->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            echo json_encode(isset($_GET['id']) ? ($rows[0] ?? null) : $rows);
            break;

        case 'POST':
            $data = mascotaPayload($allowedFields);
            if (empty($data['nombre']) || empty($data['dueno_id']) || empty($data['especie']) || empty($data['raza'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Nombre, dueño, especie y raza son obligatorios.']);
                break;
            }
            $conexion->beginTransaction();
            $data['raza_id'] = ensureRazaId($conexion, $data['especie'], $data['raza']);
            unset($data['id'], $data['especie'], $data['raza']);
            $data['activo'] = $data['activo'] ?? 1;
            $columns = array_keys($data);
            $stmt = $conexion->prepare('INSERT INTO mascotas (' . implode(', ', $columns) . ') VALUES (:' . implode(', :', $columns) . ')');
            $stmt->execute($data);
            $id = (int) $conexion->lastInsertId();
            $conexion->commit();
            http_response_code(201);
            echo json_encode(['status' => 'success', 'id' => $id]);
            break;

        case 'PUT':
            $data = mascotaPayload($allowedFields);
            $id = $_GET['id'] ?? $data['id'] ?? null;
            unset($data['id']);
            if (!$id || !$data) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID y datos para actualizar son obligatorios.']);
                break;
            }
            if (isset($data['especie']) || isset($data['raza'])) {
                if (empty($data['especie']) || empty($data['raza'])) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => 'Especie y raza deben enviarse juntas.']);
                    break;
                }
                $conexion->beginTransaction();
                $data['raza_id'] = ensureRazaId($conexion, $data['especie'], $data['raza']);
                unset($data['especie'], $data['raza']);
            }
            $assignments = [];
            foreach (array_keys($data) as $field) {
                $assignments[] = "$field = :$field";
            }
            $data['id'] = $id;
            $stmt = $conexion->prepare('UPDATE mascotas SET ' . implode(', ', $assignments) . ' WHERE id = :id');
            $stmt->execute($data);
            if ($conexion->inTransaction()) {
                $conexion->commit();
            }
            echo json_encode(['status' => 'success', 'message' => 'Mascota actualizada.']);
            break;

        case 'DELETE':
            if (!isset($_GET['id'])) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID requerido para eliminar.']);
                break;
            }
            $stmt = $conexion->prepare('DELETE FROM mascotas WHERE id = :id');
            $stmt->execute(['id' => $_GET['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Mascota eliminada.']);
            break;

        default:
            http_response_code(405);
            header('Allow: GET, POST, PUT, DELETE, OPTIONS');
            echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    }
} catch (Throwable $error) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code($error instanceof PDOException ? 409 : 500);
    error_log('VetMedellin mascotas endpoint failed: ' . $error->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'No se pudo completar la operación de mascotas.']);
}
