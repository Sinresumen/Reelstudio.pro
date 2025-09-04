-- Crear tabla site_config
CREATE TABLE IF NOT EXISTS site_config (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  whatsapp_number TEXT NOT NULL,
  business_name TEXT NOT NULL,
  pricing JSON NOT NULL,
  sample_videos JSON DEFAULT (JSON_ARRAY()),
  site_content JSON DEFAULT (JSON_OBJECT()),
  messaging_config JSON DEFAULT (JSON_OBJECT()),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla clients
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  username VARCHAR(255) UNIQUE NOT NULL,
  projects JSON DEFAULT (JSON_ARRAY()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla projects
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  client_id VARCHAR(36) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration TEXT,
  quantity INT,
  status TEXT DEFAULT 'pending',
  download_links JSON DEFAULT (JSON_ARRAY()),
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración inicial si no existe
-- Nota: Esto es una aproximación, ya que el INSERT condicional se maneja en el código, pero aquí lo ponemos directo. Ejecuta solo si la tabla está vacía.
INSERT INTO site_config (whatsapp_number, business_name, pricing, site_content) VALUES (
  '+52 55 1234 5678',
  'Reelstudio.pro',
  '{"narratedVideos":{"speeds":{"fast":{"label":"Rápido (2-3 días)","multiplier":1.2},"normal":{"label":"Normal (2-5 días)","multiplier":1},"express":{"label":"Express (1-2 días)","multiplier":1.5}},"durations":{"5-10":{"mxn":1600,"usd":89,"label":"5-10 minutos"},"10-20":{"mxn":2600,"usd":144,"label":"10-20 minutos"},"20-30":{"mxn":3500,"usd":194,"label":"20-30 minutos"}},"quantities":{"15":{"label":"15 videos","multiplier":1},"30":{"label":"30 videos","multiplier":1.8},"60":{"label":"60 videos","multiplier":3.2},"120":{"label":"120 videos","multiplier":5.8}}}},"singingPackages":{"basic":{"mxn":1600,"usd":89,"label":"Básico","videos":15},"premium":{"mxn":5500,"usd":306,"label":"Premium","videos":60},"business":{"mxn":9900,"usd":550,"label":"Empresarial","videos":120},"standard":{"mxn":3000,"usd":167,"label":"Estándar","videos":30}}}',
  '{"heroTitle":"Reelstudio.pro","heroDescription":"Producción de videos profesionales para tu marca","contactEmail":"info@reelstudio.pro","companyDescription":"Producción de videos profesionales","calculatorTitle":"Calculadora de Precios","calculatorDescription":"Obtén una cotización instantánea personalizada para tu proyecto","trustIndicators":{"projects":"100+ Proyectos","rating":"5.0 Calificación","delivery":"Entrega Rápida"}}'
);