CREATE DATABASE IF NOT EXISTS vetmedellin_local
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vetmedellin_local;

CREATE TABLE IF NOT EXISTS duenos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dni_cedula VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  direccion VARCHAR(255) NULL,
  ciudad VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS medicos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tarjeta_profesional VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad VARCHAR(120) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proveedores (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nit_tax_id VARCHAR(40) NOT NULL,
  nombre_empresa VARCHAR(150) NOT NULL,
  contacto_nombre VARCHAR(150) NULL,
  telefono VARCHAR(30) NULL,
  email VARCHAR(150) NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mascotas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(30) NOT NULL,
  raza VARCHAR(100) NOT NULL DEFAULT '',
  dueno_id INT UNSIGNED NOT NULL,
  fecha_nacimiento DATE NULL,
  sexo VARCHAR(20) NULL,
  color VARCHAR(80) NULL,
  microchip VARCHAR(80) NULL,
  peso_actual DECIMAL(7,2) NULL,
  esterilizado TINYINT(1) NOT NULL DEFAULT 0,
  foto_url VARCHAR(500) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_mascotas_dueno FOREIGN KEY (dueno_id) REFERENCES duenos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS citas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT UNSIGNED NOT NULL,
  medico_id INT UNSIGNED NOT NULL,
  fecha_hora DATETIME NOT NULL,
  motivo VARCHAR(500) NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Programada',
  CONSTRAINT fk_citas_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
  CONSTRAINT fk_citas_medico FOREIGN KEY (medico_id) REFERENCES medicos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historias_clinicas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT UNSIGNED NOT NULL,
  medico_id INT UNSIGNED NULL,
  cita_id INT UNSIGNED NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_consulta DATETIME NULL,
  motivo_consulta TEXT NULL,
  sintomas TEXT NULL,
  examen_fisico TEXT NULL,
  peso DECIMAL(7,2) NULL,
  temperatura DECIMAL(5,2) NULL,
  frecuencia_cardiaca SMALLINT UNSIGNED NULL,
  frecuencia_respiratoria SMALLINT UNSIGNED NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NULL,
  plan_tratamiento TEXT NULL,
  observaciones TEXT NULL,
  proxima_revision DATE NULL,
  CONSTRAINT fk_historias_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
  CONSTRAINT fk_historias_medico FOREIGN KEY (medico_id) REFERENCES medicos(id),
  CONSTRAINT fk_historias_cita FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vacunas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_vacuna VARCHAR(150) NOT NULL,
  dias_validez INT UNSIGNED NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS registro_vacunacion (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mascota_id INT UNSIGNED NOT NULL,
  vacuna_id INT UNSIGNED NOT NULL,
  medico_id INT UNSIGNED NULL,
  fecha_aplicacion DATE NOT NULL,
  fecha_refuerzo DATE NULL,
  lote VARCHAR(80) NULL,
  CONSTRAINT fk_registro_mascota FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
  CONSTRAINT fk_registro_vacuna FOREIGN KEY (vacuna_id) REFERENCES vacunas(id),
  CONSTRAINT fk_registro_medico FOREIGN KEY (medico_id) REFERENCES medicos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  precio DECIMAL(12,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_barras VARCHAR(80) NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NULL,
  proveedor_id INT UNSIGNED NULL,
  precio_compra DECIMAL(12,2) NOT NULL DEFAULT 0,
  precio_venta DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_actual INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_productos_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS facturas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dueno_id INT UNSIGNED NOT NULL,
  fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  estado_pago VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  metodo_pago VARCHAR(30) NULL,
  CONSTRAINT fk_facturas_dueno FOREIGN KEY (dueno_id) REFERENCES duenos(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_factura (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  factura_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NULL,
  servicio_id INT UNSIGNED NULL,
  cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_detalle_factura FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_detalle_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alianzas_externas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_entidad VARCHAR(150) NOT NULL,
  tipo VARCHAR(40) NULL,
  convenio_detalles TEXT NULL,
  telefono VARCHAR(30) NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
