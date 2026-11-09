<?php
declare(strict_types=1);

namespace VetMedellin\Infrastructure\Persistence;

use PDO;
use VetMedellin\Domain\Shared\ResourceRepository;

final class PdoResourceRepository implements ResourceRepository
{
    private const TABLES = [
        'alianzas' => 'alianzas_externas', 'citas' => 'citas', 'detalle_factura' => 'detalle_factura',
        'duenos' => 'duenos', 'facturas' => 'facturas', 'historias' => 'historias_clinicas',
        'mascotas' => 'mascotas', 'medicos' => 'doctores', 'productos' => 'productos',
        'proveedores' => 'proveedores', 'registro_vacunacion' => 'registro_vacunacion',
        'servicios' => 'servicios', 'vacunas' => 'vacunas',
    ];

    public function __construct(private PDO $pdo) {}

    public function findAll(string $resource, array $filters = []): array
    {
        [$sql, $params] = $this->selectQuery($resource, $filters);
        $orderBy = match ($resource) { 'mascotas' => 'm.id', 'citas' => 'c.id', 'historias' => 'h.id', 'facturas' => 'f.id', 'productos' => 'p.id', default => 'id' };
        $sql .= " ORDER BY $orderBy DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(string $resource, int $id): ?array
    {
        $rows = $this->findAll($resource, ['id' => $id]);
        return $rows[0] ?? null;
    }

    public function create(string $resource, array $data): int
    {
        if ($resource === 'mascotas') return $this->createPet($data);
        $table = self::TABLES[$resource];
        if ($resource === 'citas' && isset($data['medico_id'])) { $data['doctor_id'] = $data['medico_id']; unset($data['medico_id']); }
        $this->insert($table, $data);
        return (int) $this->pdo->lastInsertId();
    }

    public function update(string $resource, int $id, array $data): bool
    {
        if ($resource === 'mascotas' && (isset($data['especie']) || isset($data['raza']))) {
            $current = $this->findById('mascotas', $id);
            if (!$current) return false;
            $breedId = $this->ensureBreed((string)($data['especie'] ?? $current['especie']), (string)($data['raza'] ?? $current['raza']));
            unset($data['especie'], $data['raza']);
            $data['raza_id'] = $breedId;
        }
        if ($resource === 'citas' && isset($data['medico_id'])) { $data['doctor_id'] = $data['medico_id']; unset($data['medico_id']); }
        if ($resource === 'historias') {
            foreach (['medico_id' => 'doctor_id', 'fecha' => 'fecha_consulta', 'examen_physico' => 'examen_fisico', 'tratamiento' => 'plan_tratamiento'] as $from => $to) {
                if (array_key_exists($from, $data) && !array_key_exists($to, $data)) $data[$to] = $data[$from];
                unset($data[$from]);
            }
        }
        if (!$data) return false;
        $table = self::TABLES[$resource];
        $set = implode(', ', array_map(static fn(string $key): string => "`$key` = :$key", array_keys($data)));
        $data['__id'] = $id;
        $stmt = $this->pdo->prepare("UPDATE `$table` SET $set WHERE id = :__id");
        $stmt->execute($data);
        return $stmt->rowCount() > 0 || $this->exists($table, $id);
    }

    public function delete(string $resource, int $id): bool
    {
        if ($resource === 'citas') {
            $stmt = $this->pdo->prepare("UPDATE citas SET estado = 'Cancelada' WHERE id = :id");
            $stmt->execute(['id' => $id]);
            return $stmt->rowCount() > 0 || $this->exists('citas', $id);
        }
        $table = self::TABLES[$resource];
        $stmt = $this->pdo->prepare("DELETE FROM `$table` WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function vaccineAlerts(): array
    {
        $sql = "SELECT m.nombre AS nombre_mascota, v.nombre_vacuna, rv.fecha_refuerzo, CONCAT(d.nombre, ' ', d.apellido) AS nombre_dueno, d.telefono AS telefono_dueno, d.email AS email_dueno, DATEDIFF(rv.fecha_refuerzo, CURRENT_DATE()) AS dias_restantes FROM registro_vacunacion rv INNER JOIN mascotas m ON rv.mascota_id=m.id INNER JOIN vacunas v ON rv.vacuna_id=v.id INNER JOIN duenos d ON m.dueno_id=d.id WHERE rv.fecha_refuerzo BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY) ORDER BY rv.fecha_refuerzo";
        return $this->pdo->query($sql)->fetchAll();
    }

    public function financialReport(): array
    {
        $stmt = $this->pdo->query('SELECT YEAR(fecha_emision) AS anio, MONTH(fecha_emision) AS mes_numero, SUM(total) AS total_ingresos, COUNT(*) AS total_facturas FROM facturas GROUP BY YEAR(fecha_emision), MONTH(fecha_emision) ORDER BY YEAR(fecha_emision), MONTH(fecha_emision)');
        $months = [1=>'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        return array_map(static fn(array $row): array => ['mes'=>$months[(int)$row['mes_numero']], 'anio'=>(int)$row['anio'], 'total_ingresos'=>(float)$row['total_ingresos'], 'total_facturas'=>(int)$row['total_facturas']], $stmt->fetchAll());
    }

    public function closeAppointment(array $data): void
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('INSERT INTO historias_clinicas (mascota_id, doctor_id, cita_id, fecha_consulta, motivo_consulta, sintomas, examen_fisico, diagnostico, plan_tratamiento, proxima_revision) VALUES (:mascota_id, :doctor_id, :cita_id, :fecha_consulta, :motivo_consulta, :sintomas, :examen_fisico, :diagnostico, :plan_tratamiento, :proxima_revision)');
            $stmt->execute([
                'mascota_id' => $data['mascota_id'], 'doctor_id' => $data['medico_id'], 'cita_id' => $data['cita_id'],
                'fecha_consulta' => $data['fecha_consulta'] ?? date('Y-m-d H:i:s'), 'motivo_consulta' => $data['motivo_consulta'] ?? null,
                'sintomas' => $data['sintomas'] ?? null, 'examen_fisico' => $data['examen_fisico'] ?? null,
                'diagnostico' => $data['diagnostico'], 'plan_tratamiento' => $data['plan_tratamiento'] ?? null,
                'proxima_revision' => $data['proxima_revision'] ?: null,
            ]);
            $appointment = $this->pdo->prepare("UPDATE citas SET estado='Atendida' WHERE id=:id");
            $appointment->execute(['id' => $data['cita_id']]);
            if ($appointment->rowCount() === 0) {
                $check = $this->pdo->prepare('SELECT id FROM citas WHERE id=:id');
                $check->execute(['id' => $data['cita_id']]);
                if (!$check->fetchColumn()) throw new \InvalidArgumentException('La cita indicada no existe.');
            }
            $this->pdo->commit();
        } catch (\Throwable $error) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            throw $error;
        }
    }

    private function selectQuery(string $resource, array $filters): array
    {
        $queries = [
            'mascotas' => 'SELECT m.id, m.nombre, e.nombre AS especie, r.nombre AS raza, m.dueno_id, m.fecha_nacimiento, m.sexo, m.color, m.microchip, m.peso_actual, m.esterilizado, m.foto_url, m.activo, d.nombre AS dueno_nombre, d.apellido AS dueno_apellido FROM mascotas m INNER JOIN razas r ON m.raza_id = r.id INNER JOIN especies e ON r.especie_id = e.id INNER JOIN duenos d ON m.dueno_id = d.id',
            'medicos' => 'SELECT id, tarjeta_profesional, nombre, apellido, especialidad, telefono, email, activo FROM doctores',
            'citas' => 'SELECT c.id, c.mascota_id, c.doctor_id AS medico_id, c.fecha_hora, c.motivo, c.estado, m.nombre AS mascota_nombre, d.nombre AS medico_nombre, d.apellido AS medico_apellido, o.nombre AS dueno_nombre, o.apellido AS dueno_apellido FROM citas c LEFT JOIN mascotas m ON c.mascota_id=m.id LEFT JOIN doctores d ON c.doctor_id=d.id LEFT JOIN duenos o ON m.dueno_id=o.id',
            'historias' => 'SELECT h.*, h.doctor_id AS medico_id, h.fecha_consulta AS fecha, h.examen_fisico AS examen_physico, h.plan_tratamiento AS tratamiento, m.nombre AS mascota_nombre, d.nombre AS medico_nombre, d.apellido AS medico_apellido FROM historias_clinicas h LEFT JOIN mascotas m ON h.mascota_id=m.id LEFT JOIN doctores d ON h.doctor_id=d.id',
            'facturas' => 'SELECT f.*, d.nombre AS dueno_nombre, d.apellido AS dueno_apellido FROM facturas f INNER JOIN duenos d ON f.dueno_id=d.id',
            'productos' => 'SELECT p.*, pr.nombre_empresa AS proveedor_nombre FROM productos p LEFT JOIN proveedores pr ON p.proveedor_id=pr.id',
        ];
        $table = self::TABLES[$resource];
        $sql = $queries[$resource] ?? "SELECT * FROM `$table`";
        $idColumn = match ($resource) { 'citas' => 'c.id', 'historias' => 'h.id', 'facturas' => 'f.id', 'mascotas' => 'm.id', 'productos' => 'p.id', default => 'id' };
        $where = [];
        $params = [];
        if (isset($filters['id'])) { $where[] = "$idColumn = :id"; $params['id'] = $filters['id']; }
        if ($resource === 'historias' && isset($filters['mascota_id'])) { $where[] = 'h.mascota_id = :mascota_id'; $params['mascota_id'] = $filters['mascota_id']; }
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        return [$sql, $params];
    }

    private function createPet(array $data): int
    {
        $breedId = $this->ensureBreed((string)($data['especie'] ?? ''), (string)($data['raza'] ?? ''));
        unset($data['especie'], $data['raza'], $data['id']);
        $data['raza_id'] = $breedId;
        $this->insert('mascotas', $data);
        return (int)$this->pdo->lastInsertId();
    }

    private function ensureBreed(string $species, string $breed): int
    {
        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare('SELECT id FROM especies WHERE nombre = :name LIMIT 1');
            $stmt->execute(['name' => trim($species)]);
            $speciesId = $stmt->fetchColumn();
            if (!$speciesId) { $this->insert('especies', ['nombre' => trim($species)]); $speciesId = $this->pdo->lastInsertId(); }
            $stmt = $this->pdo->prepare('SELECT id FROM razas WHERE especie_id = :species AND LOWER(nombre) = LOWER(:name) LIMIT 1');
            $stmt->execute(['species' => $speciesId, 'name' => trim($breed)]);
            $breedId = $stmt->fetchColumn();
            if (!$breedId) { $this->insert('razas', ['especie_id' => $speciesId, 'nombre' => trim($breed)]); $breedId = $this->pdo->lastInsertId(); }
            $this->pdo->commit();
            return (int)$breedId;
        } catch (\Throwable $error) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $error; }
    }

    private function insert(string $table, array $data): void
    {
        if (!$data) throw new \InvalidArgumentException('Se requieren datos para guardar.');
        $columns = implode(', ', array_map(static fn(string $key): string => "`$key`", array_keys($data)));
        $params = implode(', ', array_map(static fn(string $key): string => ":$key", array_keys($data)));
        $stmt = $this->pdo->prepare("INSERT INTO `$table` ($columns) VALUES ($params)");
        $stmt->execute($data);
    }

    private function exists(string $table, int $id): bool
    {
        $stmt = $this->pdo->prepare("SELECT 1 FROM `$table` WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return (bool)$stmt->fetchColumn();
    }
}
