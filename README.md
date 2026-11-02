# VetMedellin

Aplicación local para la gestión de una clínica veterinaria. El frontend usa Next.js, React y TypeScript; la API usa PHP/PDO; los datos están en MySQL/MariaDB de XAMPP.

## Arrancar en Windows

1. En XAMPP, inicia **MySQL** y confirma que está en verde. No necesitas iniciar Apache.
2. Abre PowerShell o el Explorador en la carpeta que contiene este README. Esta es la raíz real del código (`VETMEDELLIN-main\VETMEDELLIN-main` en la descarga anidada). No vuelvas a entrar en otra carpeta `VETMEDELLIN-main`.
3. La aplicación se conecta a la base ya existente `pet_care` con `root` y contraseña vacía, que es la configuración actual de XAMPP. Si todavía no se ejecutó la preparación compatible, ejecuta una vez:

   ```powershell
   C:\xampp\php\php.exe .\database\prepare_pet_care.php
   ```

   Este paso solo agrega las columnas que necesita la interfaz (`mascotas.activo` y signos clínicos); no borra ni reemplaza registros. **No importes `database/schema.sql` en `pet_care`**: ese archivo es solo para una instalación nueva separada.
4. Inicia frontend y API con:

   ```text
   iniciar-local.bat
   ```

   También puedes abrir el archivo `iniciar-local.bat` desde el Explorador. No hace falta cambiar la política de ejecución de PowerShell. El script usa `npm.cmd`, comprueba MySQL y abre una ventana para PHP y otra para Next.js.
5. Abre la URL que indique la ventana de Next.js, normalmente <http://127.0.0.1:3000>. Si ese puerto ya está ocupado, Next.js seleccionará otro disponible, como 3001. El script no cierra procesos que ya estén usando puertos.

Para apagar la aplicación, pulsa `Ctrl+C` en las ventanas de PHP y Next.js. No uses `taskkill` con un PID que no hayas comprobado.

## Arranque manual

Desde esta misma raíz del proyecto, abre dos terminales:

```powershell
cd .\vetmedellin-backend
C:\xampp\php\php.exe -S 127.0.0.1:8000
```

```powershell
cd .\vet-medellin-frontend
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Ejecuta `npm.cmd run dev` **después de entrar en `vet-medellin-frontend`**; el `package.json` no está en la raíz del proyecto. Si prefieres no cambiar de carpeta, usa el lanzador `iniciar-local.bat` desde la raíz.

El backend lee `VETMED_DB_HOST`, `VETMED_DB_PORT`, `VETMED_DB_NAME`, `VETMED_DB_USER` y `VETMED_DB_PASSWORD`. Por defecto usa `127.0.0.1:3306`, `pet_care`, `root` y contraseña vacía. Si `root` tiene contraseña, define `VETMED_DB_PASSWORD` antes de iniciar PHP.

## Base existente

La API conserva los nombres que consume la interfaz y los adapta al esquema real de `pet_care`: médicos se leen de `doctores`, médico de citas e historias se guarda en `doctor_id`, y especie/raza se resuelven desde `especies` y `razas`. Al crear una mascota con una especie o raza nueva, la API registra esa opción en las tablas de catálogo.

La base `vetmedellin_local` creada durante la preparación anterior no se utiliza ni se elimina. `pet_care` es la base activa de la aplicación.

## Docker

Docker sigue siendo opcional. XAMPP y Node.js bastan para el uso local en este equipo.
