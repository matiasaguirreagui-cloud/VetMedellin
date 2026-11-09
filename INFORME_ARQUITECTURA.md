# Informe de arquitectura y funcionamiento — VetMedellin

**Fecha de revisión:** 8 de noviembre de 2026
**Raíz examinada:** `VETMEDELLIN-main`
**Propósito:** describir la aplicación entregada y documentar la reorganización hacia puertos y adaptadores (arquitectura hexagonal).

## 1. Resumen ejecutivo

VetMedellin es una aplicación web local para administrar una clínica veterinaria. La interfaz está hecha con Next.js 16, React 19 y TypeScript. El backend es una API PHP que usa PDO para conectarse a MySQL/MariaDB. En la configuración local descrita por el repositorio, XAMPP aporta MySQL y PHP; Next.js sirve la interfaz y el servidor PHP integrado expone la API en el puerto 8000.

Las capacidades que ya tienen una pantalla son: inicio, médicos, mascotas, dueños, citas, historias clínicas, facturas y productos. El backend también ofrece datos de vacunas, alertas de refuerzo, alianzas y datos de proveedores/servicios. La interfaz consulta recursos con SWR, muestra estado de carga, y las pantallas de gestión usan formularios/modales y notificaciones.

Se cambió la estructura del backend: los endpoints existentes se conservaron como adaptadores de entrada; el controlador HTTP depende del servicio de aplicación; el servicio depende de un puerto de repositorio; y la implementación concreta PDO vive en infraestructura. En el frontend, los hooks de aplicación invocan un puerto HTTP que se enlaza en el composition root con el adaptador `fetch`. Las URL que ya consume la interfaz se mantienen.

## 2. Tecnologías y ejecución

### Frontend

- **Next.js 16.2.6** con App Router y rutas definidas por `app/**/page.tsx`.
- **React 19.2.4** y TypeScript 5.7.3, con `strict: true` y alias `@/*`.
- **SWR** para consulta, revalidación y caché del lado cliente.
- **Tailwind CSS 4**, `tw-animate-css` y estilos globales; `styles/globals.css` es importado desde el layout raíz.
- Componentes accesibles basados en **Radix UI**, además de componentes compartidos de tabla, modal CRUD, calendario, tarjetas, formularios, diálogos, toast y navegación.
- **Framer Motion** para animaciones; **Recharts** para gráficas; **date-fns** para fechas y locale español; **Lucide React** para iconografía; **Three.js / React Three Fiber / Drei** para el componente 3D.
- `@vercel/analytics` se monta solo cuando `NODE_ENV` es `production`.
- Scripts: `npm run dev`, `npm run build`, `npm run start` y `npm run typecheck`.

### Backend

- **PHP** con tipos estrictos en las capas nuevas y **PDO** para MySQL.
- La conexión se configura por variables de entorno; valores locales por defecto: `127.0.0.1:3306`, base `pet_care`, usuario `root` y contraseña vacía.
- Los endpoints usan JSON, CORS limitado al origen configurado y a puertos locales de Next.js, prepared statements y errores de base de datos registrados en el log del servidor.
- El servidor integrado puede iniciarse con `php -S 127.0.0.1:8000` desde `vetmedellin-backend`.

### Base de datos y arranque

Hay dos artefactos que no se deben confundir:

1. `database/schema.sql` crea una base nueva e independiente `vetmedellin_local` y su modelo inicial.
2. El uso local existente está configurado para la base `pet_care`. `database/prepare_pet_care.php` comprueba que esa sea la base seleccionada y solo agrega ciertas columnas faltantes; no crea el esquema completo ni elimina datos.

`iniciar-local.bat` comprueba MySQL con el cliente de XAMPP y abre dos ventanas, una para PHP y otra para Next.js. Docker no es necesario para este flujo.

## 3. Mapa funcional de pantallas y componentes

| Ruta | Responsabilidad principal | Datos/hook |
|---|---|---|
| `/` | Panel de inicio, hero, accesos, vacunas y alianzas | `useVacunas`, `useAlianzas`; secciones de inicio y gráficas |
| `/medicos` | Listar, crear, editar, ver y desactivar/eliminar médicos | `useMedicos` |
| `/mascotas` | Gestión de pacientes, propietarios, especie, raza y datos físicos | `useMascotas`, `useDuenos` |
| `/duenos` | Gestión de propietarios y sus datos de contacto | `useDuenos` |
| `/citas` | Agenda en tabla/calendario; cita asociada a mascota y médico | `useCitas`, `useMascotas`, `useMedicos` |
| `/historias` | Cronología, filtrado por mascota, signos vitales y consulta clínica | `useHistorias`, `useMascotas`, `useMedicos` |
| `/facturas` | Registro, edición y eliminación de facturas; reporte financiero | `useFacturas`, `useDuenos`, `useMascotas`, `useReporteFinanciero` |
| `/productos` | Consulta de existencias y precios | `useProductos` |

El layout global (`app/layout.tsx`) declara idioma español, metadatos, viewport, proveedor de notificaciones, cursor, fondo y barra de navegación. Los componentes se separan entre `components/layout`, `components/home`, `components/calendar`, `components/charts`, `components/data-grid`, `components/modals`, `components/custom` y `components/ui`. `lib/types.ts` concentra contratos TypeScript y `lib/constants.ts` contiene opciones de formularios, estados, navegación y colores.

## 4. Modelo de datos

El esquema nuevo define estas tablas principales y relaciones:

- `duenos`: identificador, documento único, nombre, apellido, contacto, dirección, ciudad y fecha de creación.
- `mascotas`: dueño obligatorio; nacimiento, sexo, peso, color, microchip, esterilización, foto y estado activo. En `schema.sql`, especie y raza son textos; en la base real `pet_care`, se resuelven con los catálogos `especies` y `razas` y una referencia `raza_id`.
- `medicos` en el esquema nuevo. La API de la base existente usa `doctores`; el repositorio traduce a ese nombre.
- `citas`: conecta mascota con médico/doctor, fecha-hora, motivo y estado. El borrado lógico cancela la cita.
- `historias_clinicas`: conecta mascota, médico y, opcionalmente, cita; incluye fecha, motivo, síntomas, examen, diagnóstico, tratamiento, signos vitales y próxima revisión.
- `vacunas` y `registro_vacunacion`: catálogo de vacuna y aplicaciones por mascota, médico, lote, fecha de aplicación y refuerzo.
- `proveedores`, `productos` y `servicios`: datos de inventario/venta, costo, precio y existencias.
- `facturas` y `detalle_factura`: factura de un dueño con fechas, subtotal, impuestos, total, estado de pago, método y líneas de detalle.
- `alianzas_externas`: organización, tipo, convenio, teléfono y estado.
- `usuarios`: username, hash de contraseña, rol y fecha; no se expone mediante un CRUD público.

Las claves foráneas del esquema nuevo restringen asociaciones inválidas. Detalles de factura se eliminan al borrar su factura; la cita referenciada por una historia queda nula si se elimina la cita. La base existente puede tener diferencias respecto de `schema.sql`; por eso `pet_care` debe tratarse como la fuente operativa real.

## 5. API y contratos actuales

Se conservaron los archivos y nombres usados por el cliente web. Cada endpoint de recursos actúa ahora como adaptador HTTP y delega a `endpoint.php`:

- `duenos.php`, `mascotas.php`, `medicos.php`, `citas.php`, `historias.php`/`historias_clinicas.php`.
- `facturas.php`, `productos.php`, `vacunas.php`, `registro_vacunacion.php`.
- `alianzas.php` y `alianzas_externas.php`, `proveedores.php`, `servicios.php`, `detalle_factura.php`.

Los recursos CRUD aceptan `GET`, `POST`, `PUT` y `DELETE` donde aplica. `GET` de colección devuelve arreglos JSON; `GET ?id=` devuelve el recurso; altas y cambios conservan respuestas JSON con estado/mensaje/id; `DELETE` de citas cambia su estado a `Cancelada`.

Consultas complementarias conservadas:

- `GET /vacunas.php?action=alertas`: recordatorios de refuerzo hasta 30 días, con mascota, vacuna y contacto del dueño.
- `GET /facturas.php?action=reporte`: total de ingresos y facturas agrupados por mes y año.
- `GET /historias.php?mascota_id=...`: historial filtrado de una mascota.
- `POST /historias.php?action=cerrar_cita`: registra una historia y marca la cita como atendida dentro de una transacción.

Las asociaciones a tablas y nombres heredados (por ejemplo `medico_id` en la respuesta de citas y `doctor_id` en la persistencia) se traducen dentro del adaptador PDO. El formato JSON de las colecciones sigue siendo el que esperan los hooks existentes, evitando que la refactorización fuerce un cambio en las páginas.

## 6. Arquitectura hexagonal aplicada

### Backend

```text
HTTP (endpoints PHP heredados)
        ↓ adaptador de entrada
Http/Bootstrap + ResourceController + JsonResponse
        ↓
Application/Shared/ResourceService (casos CRUD y validación del recurso)
        ↓ puerto de salida
Domain/Shared/ResourceRepository (contrato)
        ↑ implementa
Infrastructure/Persistence/PdoResourceRepository
        ↓
Infrastructure/Database/ConnectionFactory → MySQL/MariaDB
```

- **Dominio / puerto:** `src/Domain/Shared/ResourceRepository.php` declara operaciones de lectura y escritura sin acoplar el dominio a PDO.
- **Aplicación:** `src/Application/Shared/ResourceService.php` valida el recurso y los campos permitidos y coordina las operaciones CRUD.
- **Entrada HTTP:** `src/Http/Bootstrap.php` prepara CORS y conexión; `ResourceController.php` interpreta método, ruta y JSON; `JsonResponse.php` serializa la salida y el estado HTTP.
- **Infraestructura:** `ConnectionFactory.php` crea PDO; `PdoResourceRepository.php` traduce nombres de tablas, joins y diferencias de `pet_care` y ejecuta SQL parametrizado.
- **Adaptadores de compatibilidad:** los `.php` de la raíz del backend preservan las URL públicas. `src/autoload.php` carga clases sin dependencia externa.
- `backend_generator.php` ya no genera CRUD SQL duplicado que sobrescriba endpoints; informa que las rutas son adaptadores.

### Frontend

```text
Next App Router / componentes React
        ↓
hooks/api/use-api.ts (consulta, mutación y revalidación SWR)
        ↓ puerto ApiPort (lib/application/ports/api-port.ts)
Composition root (lib/composition/api.ts)
        ↓ adaptador
lib/infrastructure/http-client.ts (fetch, JSON y errores)
        ↓ contrato HTTP compatible
API PHP
```

`http-client.ts` encapsula URL base, transporte, parseo, errores HTTP y falta de conexión. Los hooks mantienen estado de consulta y refrescan la colección tras mutaciones. Las páginas no construyen peticiones de red directamente. `lib/api.ts` queda como fachada de compatibilidad.

## 7. Buenas prácticas reforzadas

- Separación de responsabilidades entre transporte, aplicación, puerto y persistencia.
- Lista de recursos/campos permitidos en la capa de aplicación; rechazo de claves inesperadas.
- Consultas con parámetros PDO y tablas escogidas desde un mapa interno, nunca desde el cliente.
- `PDO::ERRMODE_EXCEPTION`, `utf8mb4`, fetch asociativo y prepares nativos.
- Mensajes de error controlados hacia el navegador; detalles técnicos se escriben en el log PHP.
- Manejo uniforme de JSON, métodos no permitidos, CORS y errores de conexión.
- Catálogos de especie/raza y cierre de cita ejecutados dentro de transacciones.
- Compatibilidad de contratos para reducir riesgo de regresión durante la refactorización.
- TypeScript estricto y cliente HTTP centralizado con errores tipados.

## 8. Revisión de funcionamiento y límites comprobados

- PHP lint: **sin errores de sintaxis** en los archivos PHP revisados, incluidas las capas nuevas.
- `npm run typecheck`: **completó sin errores**.
- `npm run build`: **completó sin errores** y prerenderizó las rutas del App Router.
- La comprobación de conexión PDO intentó abrir `127.0.0.1:3306` y el sistema operativo rechazó la conexión. Los datos de `pet_care`, credenciales, permisos, constraints y recorridos UI/API contra MySQL no se pudieron validar en este entorno. Por eso no es técnicamente posible certificar “100% funcional” conectado sin iniciar MySQL y ejecutar la aplicación con esa base activa.
- `database/schema.sql` es una base nueva simplificada y no representa exactamente el esquema de `pet_care`. Para uso real se debe preparar y conservar `pet_care`, tal como indica el README; no importar el esquema nuevo encima.
- `auth.php` y `setup_db.php` son utilidades heredadas y permanecen fuera del CRUD. La interfaz actual no tiene pantalla de inicio de sesión ni los hooks protegen las rutas. El token que devuelve `auth.php` no se persiste como sesión autenticada; antes de desplegar públicamente debe completarse ese flujo y política de autorización.
- Algunas tablas/recursos del backend (por ejemplo detalle de factura, vacunación, proveedores y servicios) no tienen pantalla propia en el frontend actual.
- El conjunto disponible no incorpora un suite de pruebas automatizadas. La validación realizada fue sintáctica y de tipos, no de integración contra una base real.

## 9. Archivos clave modificados o añadidos

- `vetmedellin-backend/src/`: capas de aplicación, dominio, HTTP, PDO y fábrica de conexión.
- `vetmedellin-backend/endpoint.php` y endpoints PHP raíz: adaptadores compatibles con las rutas previas.
- `vet-medellin-frontend/lib/application/ports/api-port.ts`, `lib/composition/api.ts`, `lib/infrastructure/http-client.ts`: puerto, composición y adaptador HTTP.
- `vet-medellin-frontend/hooks/api/use-api.ts`: delega las peticiones al puerto y conserva SWR.
- `README.md`: arranque local, base de datos y mapa de documentación actualizado.
