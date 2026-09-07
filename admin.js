// 🌟 1. IMPORTAMOS LAS HERRAMIENTAS DE GOOGLE (Incluyendo addDoc para guardar diagnósticos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🌟 2. SU CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDkKlFcUItqWb5fTJ6eEZ6oZGLHNhA6P5E",
  authDomain: "entre-chicas-2a101.firebaseapp.com",
  projectId: "entre-chicas-2a101",
  storageBucket: "entre-chicas-2a101.firebasestorage.app",
  messagingSenderId: "1095500308471",
  appId: "1:1095500308471:web:db4f7fb134424fc53cd8f2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================
// 🛡️ 3. EL GUARDIÁN: PEDIR CONTRASEÑA AL ENTRAR
// =========================================================
const passwordCorrecta = "admin2026"; 
const intento = prompt("✋ ALTO AHÍ: Por favor, ingrese su contraseña secreta:");

if (intento === passwordCorrecta) {
  alert("¡Acceso concedido! Bienvenido a su panel, jefe. ");
  cargarTodasLasReservas();
} else {
  alert("Contraseña incorrecta. Intruso detectado. 🚨");
  document.body.innerHTML = "<h1 style='text-align:center; margin-top:100px; color:#6a4c9c;'>Acceso Denegado 🛑</h1>";
}

// =========================================================
// 🪄 4. LA MAGIA: TRAER RESERVAS, ESTADÍSTICAS Y DIBUJAR TABLA
// =========================================================
async function cargarTodasLasReservas() {
  const cuerpoTabla = document.getElementById('cuerpoTabla');
  if(!cuerpoTabla) return;
  
  cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Cargando reservas secretas... ⏳</td></tr>';

  let contadorCitasHoy = 0;
  let contadorTotal = 0;

  const fechaLocal = new Date();
  fechaLocal.setMinutes(fechaLocal.getMinutes() - fechaLocal.getTimezoneOffset());
  const strHoy = fechaLocal.toISOString().split('T')[0];

  try {
    const consulta = await getDocs(collection(db, "reservas"));
    cuerpoTabla.innerHTML = '';
    
    contadorTotal = consulta.size;

    if (consulta.empty) {
      cuerpoTabla.innerHTML = "<tr><td colspan='7' style='padding: 20px; text-align: center;'>Aún no hay reservas guardadas. 📭</td></tr>";
    } else {
      consulta.forEach((documento) => {
        const reserva = documento.data();
        const idReserva = documento.id; 

        if (reserva.fecha === strHoy) contadorCitasHoy++;

        const fila = document.createElement('tr');
        fila.setAttribute('data-id', idReserva); 
        fila.style.borderBottom = "1px solid #eee";
        
        fila.innerHTML = `
          <td style="padding: 15px; color: #999; font-size: 0.8em;">...${idReserva.slice(-5)}</td>
          <td class="celda-editable" data-campo="nombre" style="padding: 15px;"><strong>${reserva.nombre || 'Sin nombre'}</strong></td>
          <td class="celda-editable" data-campo="telefono" style="padding: 15px;">${reserva.telefono || 'Sin teléfono'}</td>
          <td class="celda-editable" data-campo="servicio" style="padding: 15px; color: #6a4c9c;"><strong>${reserva.servicio || 'No especificado'}</strong></td>
          <td class="celda-editable" data-campo="fecha" style="padding: 15px;">${reserva.fecha || 'Sin fecha'}</td>
          <td class="celda-editable" data-campo="hora" style="padding: 15px;">${reserva.hora || 'Sin hora'}</td>
          <td style="padding: 15px;">
            <button class="btn-atendida" data-id="${idReserva}" style="background-color: #dcfce7; color: #166534; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s;">
              ✅ Atendida
            </button>
          </td>
        `;
        cuerpoTabla.appendChild(fila);
      });
    }

    // 🌟 Actualizar Círculos de Estado
    const circuloTotal = document.getElementById('circulo-total');
    const circuloHoy = document.getElementById('circulo-hoy');
    const circuloCapacidad = document.getElementById('circulo-capacidad');
    const circuloEstado = document.getElementById('circulo-estado');

    if(circuloTotal) circuloTotal.innerText = contadorTotal;
    if(circuloHoy) circuloHoy.innerText = contadorCitasHoy;
    if(circuloCapacidad) {
      let porcentaje = Math.round((contadorTotal / 20) * 100);
      if (porcentaje > 100) porcentaje = 100;
      circuloCapacidad.innerText = porcentaje + '%';
    }
    if(circuloEstado) {
      circuloEstado.innerText = '100%';
      circuloEstado.style.borderColor = '#20a53a';
      circuloEstado.style.color = '#20a53a';
    }

    // 🚀 Llamamos a los Gráficos Inteligentes de Chart.js
    if(window.procesarEstadisticas) {
      const datosPuros = consulta.docs.map(doc => doc.data());
      window.procesarEstadisticas(datosPuros);
    }

    // 🗑️ Botones de Atendida (Borrar cita)
    const botonesAtendida = document.querySelectorAll('.btn-atendida');
    botonesAtendida.forEach(boton => {
      boton.addEventListener('click', async (e) => {
        const idParaBorrar = e.target.getAttribute('data-id');
        if (confirm("¿Segura que quiere marcar esta cita como atendida? Desaparecerá de la lista.")) {
          try {
            e.target.innerText = "Procesando... ⏳";
            await deleteDoc(doc(db, "reservas", idParaBorrar));
            alert("¡Cita completada con éxito! ✨");
            cargarTodasLasReservas(); 
          } catch (error) {
            console.error("Error al borrar:", error);
            alert("Hubo un error al intentar actualizar la cita.");
            e.target.innerText = "✅ Atendida";
          }
        }
      });
    });

  } catch (error) {
    console.error("Error al traer las reservas:", error);
    cuerpoTabla.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Hubo un error de conexión con Firebase.</td></tr>';
  }
}

// =========================================================
// ⏱️ 5. RELOJ DE SESIÓN ACTIVA
// =========================================================
let segundosActivos = 0;
function actualizarTiempoActivo() {
  segundosActivos++;
  const horas = Math.floor(segundosActivos / 3600);
  const minutos = Math.floor((segundosActivos % 3600) / 60);
  const segundos = segundosActivos % 60;
  
  const h = String(horas).padStart(2, '0');
  const m = String(minutos).padStart(2, '0');
  const s = String(segundos).padStart(2, '0');
  
  const reloj = document.getElementById('tiempo-activo');
  if (reloj) reloj.innerText = `${h}:${m}:${s}`;
}
setInterval(actualizarTiempoActivo, 1000);

// =========================================================
// ✏️ 6. EL MODO EDICIÓN (ESTILO EXCEL) 📊
// =========================================================
let modoEdicion = false;
const btnArreglar = document.getElementById('btnArreglar');

if (btnArreglar) {
  btnArreglar.addEventListener('click', async () => {
    modoEdicion = !modoEdicion; 
    const celdasEditables = document.querySelectorAll('.celda-editable');
    
    if (modoEdicion) {
      btnArreglar.innerHTML = '💾 Guardar Cambios';
      btnArreglar.style.backgroundColor = '#20a53a';
      btnArreglar.style.color = 'white';
      
      celdasEditables.forEach(celda => {
        celda.setAttribute('contenteditable', 'true');
        celda.style.backgroundColor = '#fffbea'; 
        celda.style.border = '1px dashed #f39c12';
        celda.style.outline = 'none';
      });
    } else {
      btnArreglar.innerHTML = '⏳ Guardando...';
      
      const filas = document.querySelectorAll('#cuerpoTabla tr[data-id]');
      for (let fila of filas) {
        const idDoc = fila.getAttribute('data-id');
        try {
          await updateDoc(doc(db, "reservas", idDoc), {
            nombre: fila.querySelector('[data-campo="nombre"]').innerText,
            telefono: fila.querySelector('[data-campo="telefono"]').innerText,
            servicio: fila.querySelector('[data-campo="servicio"]').innerText,
            fecha: fila.querySelector('[data-campo="fecha"]').innerText,
            hora: fila.querySelector('[data-campo="hora"]').innerText
          });
        } catch (error) {
          console.error("Error al actualizar: ", error);
        }
      }
      
      celdasEditables.forEach(celda => {
        celda.setAttribute('contenteditable', 'false');
        celda.style.backgroundColor = 'transparent';
        celda.style.border = 'none';
      });
      
      btnArreglar.innerHTML = '✏️ Arreglar';
      btnArreglar.style.backgroundColor = 'transparent';
      btnArreglar.style.color = '#20a53a';
      
      alert("¡Cambios guardados en la nube! ☁️");
      cargarTodasLasReservas();
    }
  });
}

// =========================================================
// 🔄 7. BOTONES DE ACTUALIZAR Y REINICIAR
// =========================================================
const btnActualizar = document.getElementById('btnActualizar');
if (btnActualizar) {
  btnActualizar.addEventListener('click', async () => {
    btnActualizar.innerHTML = '⏳ Sincronizando...';
    btnActualizar.style.color = '#f39c12';
    await cargarTodasLasReservas();
    btnActualizar.innerHTML = '🔄 Actualizar';
    btnActualizar.style.color = '#20a53a'; 
  });
}

const btnReiniciar = document.getElementById('btnReiniciar');
if (btnReiniciar) {
  btnReiniciar.addEventListener('click', () => {
    if (confirm("⚠️ ¿Desea reiniciar el sistema y cerrar su sesión?")) {
      window.location.reload(); 
    }
  });
}

// =========================================================
// 🧭 8. NAVEGACIÓN REAL DEL MENÚ LATERAL (Motor SPA)
// =========================================================
const botonesMenu = document.querySelectorAll('.menu-item');
const pantallas = document.querySelectorAll('.pantalla-modulo');

botonesMenu.forEach(boton => {
  boton.addEventListener('click', () => {
    botonesMenu.forEach(btn => btn.classList.remove('active'));
    pantallas.forEach(pantalla => pantalla.style.display = 'none');
    
    boton.classList.add('active');
    const idPantallaObjetivo = boton.getAttribute('data-target');
    const pantallaAMostrar = document.getElementById(idPantallaObjetivo);
    
    if (pantallaAMostrar) pantallaAMostrar.style.display = 'block';
  });
});

// =========================================================
// ⚡ 9. MOTOR DE ACCIONES RÁPIDAS (Atajos de Inicio)
// =========================================================
const botonesAtajo = document.querySelectorAll('.btn-atajo[data-destino]');
botonesAtajo.forEach(atajo => {
  atajo.addEventListener('mouseenter', () => atajo.style.transform = 'translateY(-5px)');
  atajo.addEventListener('mouseleave', () => atajo.style.transform = 'translateY(0)');
  atajo.addEventListener('click', () => {
    const destino = atajo.getAttribute('data-destino');
    const botonMenu = document.querySelector(`.menu-item[data-target="${destino}"]`);
    if(botonMenu) botonMenu.click();
  });
});

// =========================================================
// 📊 10. MOTOR DE ESTADÍSTICAS INTELIGENTES (Chart.js)
// =========================================================
let graficoInstancia = null; 

window.procesarEstadisticas = function(listaReservas) {
  let conteoServicios = {};
  let totalCitas = 0;

  listaReservas.forEach(reserva => {
    totalCitas++;
    let nombreServicio = reserva.servicio || 'Otro';
    if (conteoServicios[nombreServicio]) {
      conteoServicios[nombreServicio]++;
    } else {
      conteoServicios[nombreServicio] = 1;
    }
  });

  let servicioTop = "Aún no hay datos";
  let maxReservas = 0;
  for (const [servicio, cantidad] of Object.entries(conteoServicios)) {
    if (cantidad > maxReservas) {
      maxReservas = cantidad;
      servicioTop = servicio;
    }
  }

  const textoEstrella = document.getElementById('servicio-estrella');
  const textoTotal = document.getElementById('total-citas-stats');
  if(textoEstrella) textoEstrella.innerText = servicioTop;
  if(textoTotal) textoTotal.innerText = totalCitas;

  const contextoGrafico = document.getElementById('graficoServicios');
  if(contextoGrafico) {
    if (graficoInstancia) graficoInstancia.destroy();
    
    graficoInstancia = new Chart(contextoGrafico, {
      type: 'bar',
      data: {
        labels: Object.keys(conteoServicios),
        datasets: [{
          label: 'Reservas por Servicio',
          data: Object.values(conteoServicios),
          backgroundColor: 'rgba(106, 76, 156, 0.7)',
          borderColor: 'rgba(106, 76, 156, 1)',
          borderWidth: 2,
          borderRadius: 5 
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
  }
};

// =========================================================
// 🧠 11. ESCÁNER FACIAL IA + GUARDADO EN HISTORIAL
// =========================================================
const videoAdmin = document.getElementById('video-camara-admin');
const msjCamaraAdmin = document.getElementById('mensaje-camara-admin');
const btnEncenderAdmin = document.getElementById('btn-encender-admin');
const btnAnalizarAdmin = document.getElementById('btn-analizar-admin');
const divResultadoAdmin = document.getElementById('resultado-escaner-admin');
const inputNombreClienta = document.getElementById('nombre-clienta-escaner');

let camaraAdmin = null;
let modeloIAAdmin = null;
const URL_MODELO_ADMIN = "https://teachablemachine.withgoogle.com/models/gKeaTJIRU/";

// Cargar la lista del historial desde Firebase
async function cargarHistorialClientas() {
  const cuerpoDir = document.getElementById('cuerpoDirectorio');
  if (!cuerpoDir) return;

  try {
    const consulta = await getDocs(collection(db, "historial_clientas"));
    cuerpoDir.innerHTML = '';

    if (consulta.empty) {
      cuerpoDir.innerHTML = "<tr><td colspan='3' style='text-align: center; padding: 20px; color: #888;'>Aún no hay diagnósticos guardados. 📭</td></tr>";
      return;
    }

    consulta.forEach(documento => {
      const data = documento.data();
      cuerpoDir.innerHTML += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 15px;"><strong>${data.nombre}</strong></td>
          <td style="padding: 15px; color: #6a4c9c; font-weight: 500;">${data.diagnostico} (${data.certeza}%)</td>
          <td style="padding: 15px; font-size: 0.85em; color: #888;">${data.fecha}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error al cargar historial:", error);
  }
}
cargarHistorialClientas();

// Cargar cerebro IA
async function cargarModeloAdmin() {
  try {
    const modelURL = URL_MODELO_ADMIN + "model.json";
    const metadataURL = URL_MODELO_ADMIN + "metadata.json";
    if (window.tmImage) {
      modeloIAAdmin = await tmImage.load(modelURL, metadataURL);
      console.log("¡Cerebro IA cargado en el panel! ");
    }
  } catch (error) {
    console.error("Error al cargar la IA:", error);
  }
}
cargarModeloAdmin();

// Control Cámara
if(btnEncenderAdmin) {
  btnEncenderAdmin.addEventListener('click', async () => {
    if (!camaraAdmin) {
      try {
        camaraAdmin = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        videoAdmin.srcObject = camaraAdmin;
        msjCamaraAdmin.style.display = 'none';
        videoAdmin.style.display = 'block';
        btnEncenderAdmin.innerText = "🔴 Apagar";
        btnEncenderAdmin.style.backgroundColor = "#e74c3c";
        btnAnalizarAdmin.disabled = false;
        btnAnalizarAdmin.style.backgroundColor = "#20a53a";
        btnAnalizarAdmin.style.cursor = "pointer";
      } catch (error) {
        alert("No se pudo acceder a la cámara. 🥺");
      }
    } else {
      const pistas = camaraAdmin.getTracks();
      pistas.forEach(pista => pista.stop());
      camaraAdmin = null;
      videoAdmin.style.display = 'none';
      msjCamaraAdmin.style.display = 'block';
      if(divResultadoAdmin) divResultadoAdmin.style.display = 'none';
      btnEncenderAdmin.innerText = " Encender";
      btnEncenderAdmin.style.backgroundColor = "#6a4c9c";
      btnAnalizarAdmin.disabled = true;
      btnAnalizarAdmin.style.backgroundColor = "#ccc";
      btnAnalizarAdmin.style.cursor = "not-allowed";
    }
  });
}

// Analizar y Guardar en Firebase
if(btnAnalizarAdmin) {
  btnAnalizarAdmin.addEventListener('click', async () => {
    const nombreClienta = inputNombreClienta.value.trim() || 'Clienta Anónima';
    if (!modeloIAAdmin) return alert("La IA está cargando, un segundito... ⏳");
    
    divResultadoAdmin.style.display = "block";
    divResultadoAdmin.innerHTML = "Analizando rostro y guardando en Firebase... 💾";
    btnAnalizarAdmin.disabled = true;

    try {
      const predicciones = await modeloIAAdmin.predict(videoAdmin);
      let mejorPrediccion = predicciones[0];
      
      for (let i = 1; i < predicciones.length; i++) {
        if (predicciones[i].probability > mejorPrediccion.probability) {
          mejorPrediccion = predicciones[i];
        }
      }

      const diagnostico = mejorPrediccion.className;
      const porcentaje = Math.round(mejorPrediccion.probability * 100);
      const fechaActual = new Date().toLocaleDateString('es-ES');
      
      // 🌟 MAGIA: Guardar el documento en Firestore
      await addDoc(collection(db, "historial_clientas"), {
        nombre: nombreClienta,
        diagnostico: diagnostico,
        certeza: porcentaje,
        fecha: fechaActual
      });

      divResultadoAdmin.innerHTML = `
        <h4 style="color: #20a53a; margin-bottom: 5px;">¡Guardado con éxito! </h4>
        <p style="margin: 0; font-size: 1em;"><strong>${nombreClienta}</strong>: ${diagnostico} (${porcentaje}%)</p>
      `;
      
      inputNombreClienta.value = '';
      cargarHistorialClientas(); // Actualiza la tabla visual al instante

    } catch (error) {
      console.error(error);
      divResultadoAdmin.innerHTML = "Error al escanear o guardar. Intente nuevamente. ❌";
    }
    
    btnAnalizarAdmin.innerText = " Analizar y Guardar";
    btnAnalizarAdmin.disabled = false;
  });
}
