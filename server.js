// =========================================================
// 🌸 SERVIDOR Y BASE DE DATOS REAL - ENTRE CHICAS 🌸
// =========================================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer'); 

const app = express();
const puerto = process.env.PORT || 3000;

// 🔒 1. CONFIGURACIÓN DE CORS (PERMISOS PARA NETLIFY)
const origenesPermitidos = [
  process.env.FRONTEND_URL, // Su URL de Netlify si la guarda en variables de entorno
  'http://localhost:5500',   // Para pruebas locales
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite conexiones si vienen de Netlify, de pruebas locales o peticiones directas
    if (!origin || origenesPermitidos.indexOf(origin) !== -1 || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Mantiene abierto el acceso para evitar bloqueos en desarrollo
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));

app.use(express.json()); 

// =========================================================
// 🗄️ 2. BASE DE DATOS Y CARGA DE SERVICIOS
// =========================================================
const db = new sqlite3.Database('./salon.db', (err) => {
  if (err) {
    console.error('Ups, error al conectar base de datos:', err);
  } else {
    console.log('¡Base de datos conectada con éxito! ');
    
    // Crear tablas
    db.run(`CREATE TABLE IF NOT EXISTS servicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_cliente TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      servicio_id INTEGER,
      fecha TEXT NOT NULL,
      hora TEXT NOT NULL
    )`, () => {
      // 🌟 Llenar los servicios si la tabla está vacía
      db.get("SELECT COUNT(*) AS cantidad FROM servicios", (err, fila) => {
        if (fila && fila.cantidad === 0) {
          console.log("Preparando los hermosos servicios por primera vez... ");
          const insertar = db.prepare("INSERT INTO servicios (nombre, descripcion) VALUES (?, ?)");
          
          insertar.run("Manicure", "Esmaltado tradicional y soft gel.");
          insertar.run("Pedicure", "Esmaltado permanente y tradicional.");
          insertar.run("Peluquería", "Cortes, tinturas, alisado y más.");
          insertar.run("Depilación", "Cuerpo completo o zona a elección.");
          insertar.run("Faciales", "Limpieza, hidratación y extracción.");
          insertar.run("Cosméticos", "Venta de productos premium.");
          insertar.run("Pestañas", "Ondulación y extensión.");
          insertar.run("Cejas", "Perfilado profesional.");
          
          insertar.finalize();
          console.log("¡Servicios guardados en la base de datos! ");
        }
      });
    });
  }
});

// =========================================================
// 🌉 3. RUTAS DE COMUNICACIÓN (API)
// =========================================================

// Ruta para comprobar el estado del servidor
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor de Entre Chicas está funcionando perfecto ');
});

// 🌟 RUTA: Envía los servicios a su página web
app.get('/api/servicios', (req, res) => {
  db.all("SELECT * FROM servicios", [], (err, filas) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(filas);
  });
});

// =========================================================
// 🕵️‍♂️ RUTA SECRETA: Enviar reservas al panel de administración
// =========================================================
app.get('/api/reservas-secretas', (req, res) => {
  const consultaSQL = `
    SELECT reservas.*, servicios.nombre AS nombre_servicio 
    FROM reservas 
    LEFT JOIN servicios ON reservas.servicio_id = servicios.id 
    ORDER BY reservas.id DESC
  `;
  
  db.all(consultaSQL, [], (err, filas) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(filas);
  });
});

// =========================================================
// 🗑️ RUTA: Marcar cita como atendida (Eliminarla)
// =========================================================
app.delete('/api/reservas/:id', (req, res) => {
  const idReserva = req.params.id; 
  
  db.run("DELETE FROM reservas WHERE id = ?", [idReserva], function(err) {
    if (err) {
      return res.status(500).json({ error: "Error al borrar la cita" });
    }
    res.json({ mensaje: "¡Cita atendida y archivada con éxito!" });
  });
});

// =========================================================
// 📩 RUTA: Recibe la reserva, la guarda y envía el correo
// =========================================================
app.post('/api/reservas', (req, res) => {
  const { nombre, correo, telefono, servicio_id, fecha, hora } = req.body;

  // 1. Guardamos la reserva directamente en la Base de Datos
  const queryInsertar = `INSERT INTO reservas (nombre_cliente, correo, telefono, servicio_id, fecha, hora) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(queryInsertar, [nombre, correo, telefono, servicio_id, fecha, hora], function(err) {
    if (err) {
      console.error("Error al guardar reserva:", err);
      return res.status(500).json({ error: "Error al guardar en la base de datos" });
    }

    // 2. Configuramos el Cartero (Nodemailer) 🔐
    let transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER, // Su correo desde las variables de Render
        pass: process.env.EMAIL_PASS  // Su contraseña de aplicación desde Render
      }
    });

    // 3. Escribimos el mensaje que le llegará a usted
    let mensaje = {
      from: `"App Entre Chicas" <${process.env.EMAIL_USER}>`, 
      to: process.env.EMAIL_USER, 
      subject: '¡NUEVA RESERVA EN EL SALÓN!',
      text: `¡Felicidades! Tienes una nueva reserva.\n\nClienta: ${nombre}\nTeléfono: ${telefono}\nCorreo: ${correo}\nFecha: ${fecha}\nHora: ${hora}\n\n(ID del Servicio: ${servicio_id})`
    };

    // 4. Enviamos el correo
    transporter.sendMail(mensaje, (error, info) => {
      if (error) {
        console.log("Error al enviar el correo:", error);
        return res.json({ mensaje: "Cita guardada en el sistema, pero no se pudo enviar el aviso por correo." });
      } else {
        console.log("Correo enviado con éxito: " + info.response);
        return res.json({ mensaje: "¡Cita agendada y correo enviado con éxito!" });
      }
    });
  });
});

// =========================================================
// 🚀 4. ENCENDIDO DEL SERVIDOR
// =========================================================
app.listen(puerto, () => {
  console.log(`¡Servidor escuchando en el puerto ${puerto}! `);
});
