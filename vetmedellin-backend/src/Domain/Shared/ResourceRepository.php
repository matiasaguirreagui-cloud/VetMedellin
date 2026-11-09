<?php
declare(strict_types=1);

namespace VetMedellin\Domain\Shared;

interface ResourceRepository
{
    public function findAll(string $resource, array $filters = []): array;
    public function findById(string $resource, int $id): ?array;
    public function create(string $resource, array $data): int;
    public function update(string $resource, int $id, array $data): bool;
    public function delete(string $resource, int $id): bool;
    public function vaccineAlerts(): array;
    public function financialReport(): array;
    public function closeAppointment(array $data): void;
}
