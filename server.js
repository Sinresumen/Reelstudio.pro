const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar express
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configurar sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    secure: false, // cambiar a true si usas HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Conexión a la base de datos
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT || 3306,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME
    });
    console.log('✅ Conectado a MySQL');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
}

// Middleware de autenticación
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.status(401).json({ message: 'No autenticado' });
}

// =================== RUTAS API ===================

// Configuración
app.get('/api/config', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM site_config LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo configuración' });
  }
});

app.post('/api/config', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    await db.execute(
      'UPDATE site_config SET whatsapp_number = ?, business_name = ?, pricing = ?, site_content = ?, updated_at = NOW() WHERE id = (SELECT id FROM (SELECT id FROM site_config LIMIT 1) as temp)',
      [
        updates.whatsappNumber || updates.whatsapp_number,
        updates.businessName || updates.business_name,
        JSON.stringify(updates.pricing),
        JSON.stringify(updates.siteContent || updates.site_content)
      ]
    );
    
    const [rows] = await db.execute('SELECT * FROM site_config LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando configuración' });
  }
});

// Autenticación admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Lothborja1') {
    req.session.isAuthenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
  }
});

app.get('/api/admin/check-auth', (req, res) => {
  res.json({ isAuthenticated: !!req.session?.isAuthenticated });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Calculadora de precios
app.post('/api/calculate-price', async (req, res) => {
  try {
    const { type, duration, quantity, speed } = req.body;
    
    const [rows] = await db.execute('SELECT pricing FROM site_config LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }
    
    const pricing = rows[0].pricing;
    let basePriceMXN = 0;
    let basePriceUSD = 0;
    
    if (type === 'narrated') {
      const durationPrice = pricing.narratedVideos.durations[duration];
      const quantityMultiplier = pricing.narratedVideos.quantities[quantity]?.multiplier || 1;
      const speedMultiplier = pricing.narratedVideos.speeds[speed]?.multiplier || 1;
      
      if (durationPrice) {
        basePriceMXN = durationPrice.mxn * quantityMultiplier * speedMultiplier;
        basePriceUSD = durationPrice.usd * quantityMultiplier * speedMultiplier;
      }
    } else if (type === 'singing') {
      const packageInfo = pricing.singingPackages[quantity];
      if (packageInfo) {
        basePriceMXN = packageInfo.mxn;
        basePriceUSD = packageInfo.usd;
      }
    }
    
    res.json({
      basePriceMXN: Math.round(basePriceMXN),
      basePriceUSD: Math.round(basePriceUSD)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculando precio' });
  }
});

// Clientes
app.get('/api/clients', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo clientes' });
  }
});

app.get('/api/clients/username/:username', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM clients WHERE username = ?', [req.params.username]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cliente' });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, username } = req.body;
    await db.execute(
      'INSERT INTO clients (name, email, phone, username) VALUES (?, ?, ?, ?)',
      [name, email, phone, username]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error creando cliente' });
  }
});

// Proyectos
app.get('/api/projects/client/:clientId', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM projects WHERE client_id = ?', [req.params.clientId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo proyectos' });
  }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { clientId, name, type, duration, quantity, status } = req.body;
    await db.execute(
      'INSERT INTO projects (client_id, name, type, duration, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, name, type, duration, quantity, status || 'pending']
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error creando proyecto' });
  }
});

// Servir archivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📱 Sitio web: http://localhost:${PORT}`);
    console.log(`🔧 Admin: 5 clics en logo + password "Lothborja1"`);
  });
});