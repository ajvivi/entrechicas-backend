// =========================================================
// 🌸 SERVIDOR Y BASE DE DATOS REAL - ENTRE CHICAS 🌸
// =========================================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer'); // 🌟 CORRECCIÓN: ¡El cartero se presenta al principio!

const app = express();
const puerto = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

// =========================================================
// 🗄️ 1. BASE DE DATOS Y CARGA DE SERVICIOS
// =========================================================
const db = new sqlite3.Database('./salon.db', (err) => {
  if (err) {
    console.error('Ups, error:', err);
  } else {
    console.log('¡Base de datos conectada!');
    
    // Crear gavetas
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
      // 🌟 MAGIA: Llenar los servicios si la tabla está vacía
      db.get("SELECT COUNT(*) AS cantidad FROM servicios", (err, fila) => {
        if (fila.cantidad === 0) {
          console.log("Preparando los hermosos servicios por primera vez... 💅");
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
          console.log("¡Servicios guardados en la base de datos! ✨");
        }
      });
    });
  }
});

// =========================================================
// 🌉 2. RUTAS DE COMUNICACIÓN (API)
// =========================================================

// Ruta para ver si el servidor está vivo
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando perfecto ✨');
});

// 🌟 RUTA NUEVA: Envía los servicios a su página web
app.get('/api/servicios', (req, res) => {
  db.all("SELECT * FROM servicios", [], (err, filas) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Enviamos las filas (los servicios) a la página
    res.json(filas);
  });
});

// =========================================================
// 🕵️‍♂️ RUTA SECRETA: Enviar reservas al panel de administración
// =========================================================
app.get('/api/reservas-secretas', (req, res) => {
  // 🌟 EL TRUCO JOIN: Unimos la tabla reservas con la tabla servicios
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
// 🗑️ RUTA NUEVA: Marcar cita como atendida (Eliminarla)
// =========================================================
app.delete('/api/reservas/:id', (req, res) => {
  // Atrapamos el ID de la reserva que queremos borrar
  const idReserva = req.params.id; 
  
  // Le damos la orden a la base de datos
  db.run("DELETE FROM reservas WHERE id = ?", [idReserva], function(err) {
    if (err) {
      return res.status(500).json({ error: "Error al borrar la cita" });
    }
    res.json({ mensaje: "¡Cita atendida y archivada con éxito!" });
  });
});

// 🌟 RUTA NUEVA: Recibe la reserva, la guarda y envía el correo!
app.post('/api/reservas', (req, res) => {
  const { nombre, correo, telefono, servicio_id, fecha, hora } = req.body;

  // 1. Guardamos la reserva en la Base de Datos (gaveta)
  const insertar = db.prepare(`INSERT INTO reservas (nombre_cliente, correo, telefono, servicio_id, fecha, hora) VALUES (?, ?, ?, ?, ?, ?)`);
  
  insertar.run([nombre, correo, telefono, servicio_id, fecha, hora], function(err) {
    if (err) {
      return res.status(500).json({ error: "Error al guardar en base de datos" });
    }

    // 2. Configuramos el Cartero (Nodemailer)
    let transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'javierypd@gmail.com', // Su correo
        pass: 'mdqp nxbg eicr phdz' // Su contraseña de aplicación
      }
    });

    // 3. Escribimos la carta que le llegará a USTED
    let mensaje = {
      from: '"App Entre Chicas" <javierypd@gmail.com>', 
      to: 'javierypd@gmail.com', 
      subject: '💅 ¡NUEVA RESERVA EN EL SALÓN! 💅',
      text: `¡Felicidades! Tienes una nueva reserva.\n\nClienta: ${nombre}\nTeléfono: ${telefono}\nCorreo: ${correo}\nFecha: ${fecha}\nHora: ${hora}\n\n(ID del Servicio: ${servicio_id})`
    };

    // 4. ¡Enviamos el correo!
    transporter.sendMail(mensaje, (error, info) => {
      if (error) {
        console.log("Error al enviar el correo:", error);
        return res.json({ mensaje: "Cita guardada en sistema, pero no se pudo enviar el aviso por correo." });
      } else {
        console.log("Correo enviado con éxito: " + info.response);
        return res.json({ mensaje: "¡Cita agendada y correo enviado con éxito!" });
      }
    });
  });
});

// =========================================================
// 🚀 3. ENCENDIDO (¡Esto siempre debe ir al puro final!)
// =========================================================
app.listen(puerto, () => {
  console.log(`¡Servidor escuchando en el puerto ${puerto}! 🚀`);
});
