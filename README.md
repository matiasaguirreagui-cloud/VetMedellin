# VetMedellin

Aplicación local para la gestión de una clínica veterinaria que centraliza propietarios, pacientes, citas, historias clínicas, facturación e inventario. El frontend usa Next.js, React y TypeScript; la API usa PHP/PDO; los datos están en MySQL/MariaDB de XAMPP. La solución se organiza ahora siguiendo puertos y adaptadores (arquitectura hexagonal).

## Arranque en Windows

1. En XAMPP, inicia **MySQL** y confirma que esté activo. Apache no es necesario.
2. Abre PowerShell o el Explorador en la carpeta que contiene este README.
3. La aplicación se conecta por defecto a la base existente `pet_care` con `root` y contraseña vacía, configuración habitual local de XAMPP. Si falta alguna columna usada por la interfaz, ejecuta una vez:

   ```powershell
   C:\xampp\php\php.exe .\database\prepare_pet_care.php
   ```

   El preparador solo agrega columnas que falten; no borra ni reemplaza registros. **No importes `database/schema.sql` en `pet_care`**: describe una base nueva e independiente llamada `vetmedellin_local`.
4. Inicia el backend y frontend con `iniciar-local.bat`. El lanzador comprueba MySQL y abre una ventana para el servidor PHP y otra para Next.js.
5. Abre la URL que indique Next.js, normalmente <http://127.0.0.1:3000>. Si ese puerto está ocupado, Next.js selecciona otro disponible.

Para apagar la aplicación, pulsa `Ctrl+C` en las ventanas de PHP y Next.js.

## Arranque manual

Desde la raíz de este repositorio, abre dos terminales:

```powershell
cd .\vetmedellin-backend
C:\xampp\php\php.exe -S 127.0.0.1:8000
```

```powershell
cd .\vet-medellin-frontend
npm.cmd run dev
```

El backend lee `VETMED_DB_HOST`, `VETMED_DB_PORT`, `VETMED_DB_NAME`, `VETMED_DB_USER` y `VETMED_DB_PASSWORD`. Por defecto usa `127.0.0.1:3306`, `pet_care`, `root` y contraseña vacía. Define `VETMED_DB_PASSWORD` si tu usuario tiene contraseña. El frontend permite cambiar la URL del API con `NEXT_PUBLIC_API_URL` (por defecto `http://127.0.0.1:8000`).

## Base existente

La API adapta los nombres que consume la interfaz al esquema real de `pet_care`: los médicos se almacenan en `doctores`, las citas e historias usan `doctor_id`, y especie/raza se resuelven desde `especies` y `razas`. Al crear mascotas, si su especie o raza aún no existe, se añade al catálogo. La base `vetmedellin_local` no se usa ni se elimina.

## Estructura y arquitectura

- `vet-medellin-frontend/`: aplicación Next.js y su interfaz React.
- `vetmedellin-backend/`: API PHP y capas de aplicación, dominio, adaptadores HTTP e infraestructura.
- `database/`: esquema para una instalación nueva y preparador aditivo para la base `pet_care`.
- `iniciar-local.bat`: arranque local para Windows.
- `INFORME_ARQUITECTURA.md`: inventario funcional y técnico, flujo, modelo de datos, API, decisiones y límites.

Docker sigue siendo opcional; XAMPP y Node.js bastan para el flujo local documentado.
