<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(); }
fwrite(STDOUT, 'Los endpoints ahora son adaptadores HTTP de la arquitectura hexagonal en src/. No genere endpoints CRUD directamente.\\n');
