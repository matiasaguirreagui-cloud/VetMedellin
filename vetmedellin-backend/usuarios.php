<?php
// Los datos de usuarios contienen hashes de contraseñas y solo deben usarse
// a través del inicio de sesión; no se ofrece un CRUD público para esta tabla.
http_response_code(404);
header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['status' => 'error', 'message' => 'Recurso no disponible.']);
