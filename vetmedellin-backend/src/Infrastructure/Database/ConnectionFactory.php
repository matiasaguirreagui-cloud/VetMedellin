<?php
declare(strict_types=1);

namespace VetMedellin\Infrastructure\Database;

use PDO;

final class ConnectionFactory
{
    public static function create(): PDO
    {
        $host = getenv('VETMED_DB_HOST') ?: '127.0.0.1';
        $port = getenv('VETMED_DB_PORT') ?: '3306';
        $database = getenv('VETMED_DB_NAME') ?: 'pet_care';
        $username = getenv('VETMED_DB_USER') ?: 'root';
        $password = getenv('VETMED_DB_PASSWORD') ?: '';
        return new PDO(
            "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4",
            $username,
            $password,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
        );
    }
}
