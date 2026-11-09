<?php
declare(strict_types=1);

namespace VetMedellin\Http;

use PDOException;
use VetMedellin\Application\Shared\ResourceService;
use VetMedellin\Infrastructure\Database\ConnectionFactory;
use VetMedellin\Infrastructure\Persistence\PdoResourceRepository;

final class Bootstrap
{
    public static function dispatch(string $resource): never
    {
        self::configureHeaders();
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
        try {
            $pdo = ConnectionFactory::create();
            $service = new ResourceService(new PdoResourceRepository($pdo));
            (new ResourceController($service))->handle($resource);
        } catch (PDOException $error) {
            error_log('VetMedellin database connection failed: ' . $error->getMessage());
            JsonResponse::send(['status' => 'error', 'message' => 'No se pudo conectar con la base de datos local.'], 503);
        }
    }

    private static function configureHeaders(): void
    {
        header('Content-Type: application/json; charset=UTF-8');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $configured = getenv('VETMED_FRONTEND_ORIGIN') ?: 'http://localhost:3000';
        $localNext = preg_match('#^http://(?:localhost|127\\.0\\.0\\.1):30[0-9]{2}$#', $origin) === 1;
        if ($origin === $configured || $localNext) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        }
    }
}
