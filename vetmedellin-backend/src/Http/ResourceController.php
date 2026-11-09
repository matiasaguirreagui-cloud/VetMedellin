<?php
declare(strict_types=1);

namespace VetMedellin\Http;

use InvalidArgumentException;
use PDOException;
use Throwable;
use VetMedellin\Application\Shared\ResourceService;

final class ResourceController
{
    public function __construct(private ResourceService $service) {}

    public function handle(string $resource): never
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT) ?: null;
        $action = $_GET['action'] ?? '';
        try {
            if ($method === 'GET') {
                if ($resource === 'vacunas' && $action === 'alertas') JsonResponse::send($this->service->vaccineAlerts());
                if ($resource === 'facturas' && $action === 'reporte') JsonResponse::send($this->service->financialReport());
                if ($id !== null) {
                    $row = $this->service->get($resource, $id);
                    JsonResponse::send($row ?? ($resource === 'facturas' ? [] : null));
                }
                $filters = [];
                if (isset($_GET['mascota_id'])) $filters['mascota_id'] = filter_var($_GET['mascota_id'], FILTER_VALIDATE_INT);
                JsonResponse::send($this->service->list($resource, array_filter($filters, static fn($value) => $value !== false)));
            }

            if (!in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
                header('Allow: GET, POST, PUT, DELETE, OPTIONS');
                JsonResponse::send(['status' => 'error', 'message' => 'Método no permitido.'], 405);
            }
            if ($method === 'DELETE') {
                if ($id === null) JsonResponse::send(['status' => 'error', 'message' => 'ID requerido para eliminar.'], 400);
                $deleted = $this->service->delete($resource, $id);
                if (!$deleted) JsonResponse::send(['status' => 'error', 'message' => 'El registro indicado no existe.'], 404);
                JsonResponse::send(['status' => 'success', 'message' => $resource === 'citas' ? 'Cita cancelada.' : 'Registro eliminado.', 'deleted' => $deleted]);
            }

            $data = $this->readPayload();
            if ($resource === 'historias' && $method === 'POST' && $action === 'cerrar_cita') {
                $this->service->closeAppointment($data);
                JsonResponse::send(['status' => 'success', 'message' => 'Cita cerrada e historia clínica registrada.'], 201);
            }
            if ($method === 'POST') {
                $newId = $this->service->create($resource, $data);
                JsonResponse::send(['status' => 'success', 'message' => 'Registro creado.', 'id' => $newId], 201);
            }
            $id = $id ?? (isset($data['id']) ? (int)$data['id'] : null);
            if (!$id) JsonResponse::send(['status' => 'error', 'message' => 'ID requerido para actualizar.'], 400);
            if (!$this->service->update($resource, $id, $data)) JsonResponse::send(['status' => 'error', 'message' => 'El registro indicado no existe.'], 404);
            JsonResponse::send(['status' => 'success', 'message' => 'Registro actualizado.']);
        } catch (InvalidArgumentException $error) {
            JsonResponse::send(['status' => 'error', 'message' => $error->getMessage()], 400);
        } catch (PDOException $error) {
            error_log('VetMedellin persistence error: ' . $error->getMessage());
            JsonResponse::send(['status' => 'error', 'message' => 'No se pudo completar la operación. Verifica los datos y las relaciones existentes.'], 409);
        } catch (Throwable $error) {
            error_log('VetMedellin request error: ' . $error->getMessage());
            JsonResponse::send(['status' => 'error', 'message' => 'No se pudo procesar la solicitud.'], 500);
        }
    }

    private function readPayload(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        if (!is_array($data) || ($data !== [] && array_is_list($data))) throw new InvalidArgumentException('El cuerpo JSON debe ser un objeto válido.');
        return $data;
    }

}
