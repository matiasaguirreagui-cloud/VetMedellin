<?php
declare(strict_types=1);

namespace VetMedellin\Application\Shared;

use InvalidArgumentException;
use VetMedellin\Domain\Shared\ResourceRepository;

final class ResourceService
{
    private const FIELDS = [
        'alianzas' => ['id', 'nombre_entidad', 'tipo', 'convenio_detalles', 'telefono', 'activo'],
        'citas' => ['id', 'mascota_id', 'medico_id', 'fecha_hora', 'motivo', 'estado'],
        'detalle_factura' => ['id', 'factura_id', 'producto_id', 'servicio_id', 'cantidad', 'precio_unitario'],
        'duenos' => ['id', 'dni_cedula', 'nombre', 'apellido', 'telefono', 'email', 'direccion', 'ciudad'],
        'facturas' => ['id', 'dueno_id', 'fecha_emision', 'subtotal', 'impuestos', 'total', 'estado_pago', 'metodo_pago'],
        'historias' => ['id', 'mascota_id', 'medico_id', 'cita_id', 'fecha', 'fecha_consulta', 'motivo_consulta', 'sintomas', 'examen_fisico', 'peso', 'temperatura', 'frecuencia_cardiaca', 'frecuencia_respiratoria', 'diagnostico', 'tratamiento', 'plan_tratamiento', 'observaciones', 'proxima_revision'],
        'mascotas' => ['id', 'nombre', 'especie', 'raza', 'dueno_id', 'fecha_nacimiento', 'sexo', 'color', 'microchip', 'peso_actual', 'esterilizado', 'foto_url', 'activo'],
        'medicos' => ['id', 'tarjeta_profesional', 'nombre', 'apellido', 'especialidad', 'telefono', 'email', 'activo'],
        'productos' => ['id', 'codigo_barras', 'nombre', 'descripcion', 'proveedor_id', 'precio_compra', 'precio_venta', 'stock_actual', 'stock_minimo'],
        'proveedores' => ['id', 'nit_tax_id', 'nombre_empresa', 'contacto_nombre', 'telefono', 'email'],
        'registro_vacunacion' => ['id', 'mascota_id', 'vacuna_id', 'medico_id', 'fecha_aplicacion', 'fecha_refuerzo', 'lote'],
        'servicios' => ['id', 'nombre', 'precio'],
        'vacunas' => ['id', 'nombre_vacuna', 'dias_validez'],
    ];

    public function __construct(private ResourceRepository $repository) {}

    public function list(string $resource, array $filters = []): array
    {
        $this->assertResource($resource);
        return $this->repository->findAll($resource, $filters);
    }

    public function get(string $resource, int $id): ?array
    {
        $this->assertResource($resource);
        return $this->repository->findById($resource, $id);
    }

    public function create(string $resource, array $data): int
    {
        $this->assertResource($resource);
        $data = $this->validate($resource, $data, false);
        $required = [
            'duenos' => ['dni_cedula', 'nombre', 'apellido'],
            'mascotas' => ['nombre', 'especie', 'raza', 'dueno_id'],
            'medicos' => ['tarjeta_profesional', 'nombre', 'apellido'],
            'citas' => ['mascota_id', 'doctor_id', 'fecha_hora'],
            'historias' => ['mascota_id', 'doctor_id', 'diagnostico'],
            'facturas' => ['dueno_id', 'total'],
            'productos' => ['nombre'],
        ];
        foreach ($required[$resource] ?? [] as $field) {
            if (!isset($data[$field]) || $data[$field] === '') throw new InvalidArgumentException("El campo {$field} es obligatorio.");
        }
        return $this->repository->create($resource, $data);
    }

    public function update(string $resource, int $id, array $data): bool
    {
        $this->assertResource($resource);
        unset($data['id']);
        if ($data === []) throw new InvalidArgumentException('Se requieren campos para actualizar.');
        return $this->repository->update($resource, $id, $this->validate($resource, $data, true));
    }

    public function delete(string $resource, int $id): bool
    {
        $this->assertResource($resource);
        return $this->repository->delete($resource, $id);
    }

    public function fields(string $resource): array
    {
        $this->assertResource($resource);
        return self::FIELDS[$resource];
    }

    public function vaccineAlerts(): array
    {
        return $this->repository->vaccineAlerts();
    }

    public function financialReport(): array
    {
        return $this->repository->financialReport();
    }

    public function closeAppointment(array $data): void
    {
        foreach (['mascota_id', 'medico_id', 'cita_id', 'diagnostico'] as $field) {
            if (!isset($data[$field]) || $data[$field] === '') throw new InvalidArgumentException("El campo {$field} es obligatorio.");
        }
        $this->repository->closeAppointment($data);
    }

    private function validate(string $resource, array $data, bool $partial): array
    {
        $allowed = array_diff(self::FIELDS[$resource], ['id']);
        foreach (array_keys($data) as $field) {
            if (!in_array($field, $allowed, true)) {
                throw new InvalidArgumentException('El cuerpo contiene un campo no permitido.');
            }
        }
        if ($data === [] && !$partial) {
            throw new InvalidArgumentException('Se requieren datos para crear el registro.');
        }
        if ($resource === 'citas' && isset($data['medico_id'])) {
            $data['doctor_id'] = $data['medico_id'];
            unset($data['medico_id']);
        }
        if ($resource === 'historias') {
            foreach (['medico_id' => 'doctor_id', 'fecha' => 'fecha_consulta', 'examen_physico' => 'examen_fisico', 'tratamiento' => 'plan_tratamiento'] as $from => $to) {
                if (array_key_exists($from, $data) && !array_key_exists($to, $data)) $data[$to] = $data[$from];
                unset($data[$from]);
            }
        }
        return $data;
    }

    private function assertResource(string $resource): void
    {
        if (!isset(self::FIELDS[$resource])) throw new InvalidArgumentException('Recurso no disponible.');
    }
}
