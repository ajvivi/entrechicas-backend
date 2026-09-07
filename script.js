// 🌟 1. IMPORTAMOS LAS HERRAMIENTAS DE GOOGLE (FIREBASE) ¡SIEMPRE ARRIBA!
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 🌟 2. SU CÓDIGO MÁGICO DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDkKlFcUItqWb5fTJ6eEZ6oZGLHNhA6P5E",
  authDomain: "entre-chicas-2a101.firebaseapp.com",
  projectId: "entre-chicas-2a101",
  storageBucket: "entre-chicas-2a101.firebasestorage.app",
  messagingSenderId: "1095500308471",
  appId: "1:1095500308471:web:db4f7fb134424fc53cd8f2",
  measurementId: "G-D7SBKDYP9E"
};

// 🌟 3. INICIAMOS LA BASE DE DATOS FIRESTORE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================
// 🌸 INICIO DE LAS ANIMACIONES Y EVENTOS DE LA PÁGINA
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const cajitaServicios = document.getElementById('servicioSelect') || document.getElementById('servicio');
  
  if (cajitaServicios) {
    const listaServicios = [
      "Manicure y Pedicure",
      "Peluquería y Peinados",
      "Depilación",
      "Tratamientos Faciales",
      "Lifting de Pestañas",
      "Diseño de Cejas",
      "Maquillaje Profesional"
    ];

    cajitaServicios.innerHTML = '<option value="" disabled selected>Seleccione un servicio...</option>';

    listaServicios.forEach(servicio => {
      const opcion = document.createElement('option');
      opcion.value = servicio;
      opcion.textContent = servicio;
      cajitaServicios.appendChild(opcion);
    });
  }
  
  // =========================================================
  // 💌 ENVÍO DE RESERVA DIRECTO A GOOGLE FIRESTORE
  // =========================================================
  const formularioReserva = document.getElementById('formularioReserva');
  const modal = document.getElementById('modalReservas'); 

  if (formularioReserva) {
    formularioReserva.addEventListener('submit', async (e) => {
      e.preventDefault(); 

      const selectServicio = document.getElementById('servicioSelect') || document.getElementById('servicio');

      const datosReserva = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        servicio: selectServicio ? selectServicio.value : 'No especificado',
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        fecha_creacion: new Date() 
      };

      try {
        await addDoc(collection(db, "reservas"), datosReserva);
        alert(`¡Cita agendada con éxito!\n¡Gracias por confiar en nosotras, ${datosReserva.nombre}! 💖`);
        
        formularioReserva.reset(); 
        if (modal) modal.classList.remove('activo'); 
        
      } catch (error) {
        console.error('Ups, error al guardar en Firebase:', error);
        alert('Ocurrió un detalle al agendar. Por favor, intente nuevamente.');
      }
    });
  }

  // =========================================================
  // 🎵 CONTROL DE AUDIO DEL VIDEO DE FONDO (VERSIÓN CLÁSICA)
  // =========================================================
  const videoFondo = document.querySelector('.video-fondo-pantalla') || document.getElementById('videoFondo');
  const btnAudio = document.getElementById('btnAudio');

  if (videoFondo && btnAudio) {
    videoFondo.muted = true; // Empieza en silencio por reglas del navegador
    
    btnAudio.addEventListener('click', () => {
      if (videoFondo.muted) {
        videoFondo.muted = false;
        btnAudio.innerHTML = '🔊 Silenciar'; 
      } else {
        videoFondo.muted = true;
        btnAudio.innerHTML = '🔇 Activar Sonido';
      }
    });
  }
  
  // =========================================================
  // 🪟 CONTROL DEL MODAL (POP-UP) DE RESERVAS 
  // =========================================================
  const btnAbrir = document.getElementById('btnAbrirModal');
  const btnCerrar = document.getElementById('btnCerrarModal');

  if (modal && btnAbrir && btnCerrar) {
    btnAbrir.addEventListener('click', (e) => {
      e.preventDefault(); 
      modal.classList.add('activo');
    });

    btnCerrar.addEventListener('click', () => {
      modal.classList.remove('activo');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('activo');
      }
    });
  }

  // =========================================================
  // 🎬 EFECTO 3D: MOUSE + SCROLL EN EL VIDEO DE FONDO 🖱️📜
  // =========================================================
  let ratonX = 0;
  let scrollY = 0;

  document.addEventListener('mousemove', (evento) => {
    const centroX = window.innerWidth / 2;
    ratonX = (evento.clientX - centroX) / 40; 
    actualizarVideo3D(); 
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    actualizarVideo3D(); 
  });

  function actualizarVideo3D() {
    if (videoFondo) {
      let inclinacion3D = scrollY * 0.03; 
      let profundidadZ = scrollY * -0.5;

      videoFondo.style.transform = `
        perspective(1000px) 
        translate3d(${ratonX}px, 0px, ${profundidadZ}px) 
        rotateX(${inclinacion3D}deg) 
        scale(1.2)
      `;
    }
  }

  // =========================================================
  // 🃏 INCLINACIÓN 3D INTERACTIVA EN TARJETAS
  // =========================================================
  const tarjetasInteractivas = document.querySelectorAll('.tarjeta-servicios-grande, .tarjeta-nosotros-grande');

  tarjetasInteractivas.forEach(tarjeta => {
    tarjeta.addEventListener('mousemove', (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotarX = (y / rect.height) * -8;
      const rotarY = (x / rect.width) * 8;

      tarjeta.style.transform = `rotateX(${rotarX}deg) rotateY(${rotarY}deg)`;
      if(tarjeta.classList.contains('tarjeta-nosotros-grande')) {
         tarjeta.style.boxShadow = `0 30px 60px rgba(0,0,0,0.12)`;
      }
    });

    tarjeta.addEventListener('mouseleave', () => {
      tarjeta.style.transform = 'rotateX(0deg) rotateY(0deg)';
      if(tarjeta.classList.contains('tarjeta-nosotros-grande')) {
         tarjeta.style.boxShadow = `0 20px 50px rgba(0,0,0,0.1)`;
      }
    });
  });

  const fotoNosotros = document.querySelector('.tarjeta-nosotros-grande .lado-foto img');
  window.addEventListener('scroll', () => {
    if (fotoNosotros) {
      let scrollActual = window.scrollY;
      fotoNosotros.style.transform = `translateY(${scrollActual * 0.03}px)`;
    }
  });

  // =========================================================
  // 📸 MOTOR DEL ESCÁNER FACIAL CON INTELIGENCIA ARTIFICIAL 🧠
  // =========================================================
  const videoCamara = document.getElementById('video-camara');
  const mensajeCamara = document.getElementById('mensaje-camara');
  const btnEncender = document.getElementById('btn-encender');
  const btnAnalizar = document.getElementById('btn-analizar');
  const divResultado = document.getElementById('resultado-escaner'); 

  let conexionCamara = null; 
  let modeloIA = null; 

  const URL_MODELO = "https://teachablemachine.withgoogle.com/models/gKeaTJIRU/";

  async function cargarModelo() {
    const modelURL = URL_MODELO + "model.json";
    const metadataURL = URL_MODELO + "metadata.json";
    try {
      modeloIA = await tmImage.load(modelURL, metadataURL);
      console.log("¡Cerebro de Inteligencia Artificial cargado y listo! 🧠✨");
    } catch (error) {
      console.error("Error al cargar la IA:", error);
    }
  }
  cargarModelo(); 

  if(btnEncender) {
    btnEncender.addEventListener('click', async () => {
      if (!conexionCamara) {
        try {
          conexionCamara = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
          });
          
          videoCamara.srcObject = conexionCamara;
          mensajeCamara.style.display = 'none';
          videoCamara.style.display = 'block';
          
          btnEncender.innerText = "🔴 Apagar Cámara";
          btnEncender.style.backgroundColor = "#e74c3c"; 
          
          btnAnalizar.disabled = false;
          btnAnalizar.style.backgroundColor = "#20a53a"; 
          btnAnalizar.style.cursor = "pointer";

        } catch (error) {
          console.error("Error al acceder a la cámara:", error);
          alert("¡Ups! Necesitamos su permiso para encender la cámara y ver su hermosa piel. 🥺📸");
        }
      } else {
        const pistas = conexionCamara.getTracks();
        pistas.forEach(pista => pista.stop()); 
        conexionCamara = null;
        
        videoCamara.style.display = 'none';
        mensajeCamara.style.display = 'block';
        
        if(divResultado) divResultado.style.display = 'none'; 
        
        btnEncender.innerText = "📷 Encender Cámara";
        btnEncender.style.backgroundColor = "#6a4c9c";
        
        btnAnalizar.disabled = true;
        btnAnalizar.style.backgroundColor = "#ccc";
        btnAnalizar.style.cursor = "not-allowed";
      }
    });
  }

  if(btnAnalizar) {
    btnAnalizar.addEventListener('click', async () => {
      if (!modeloIA) {
        alert("La IA aún se está despertando... Espere un segundito y vuelva a intentar. 😴");
        return;
      }

      if(divResultado) {
        divResultado.style.display = "block";
        divResultado.innerHTML = "Analizando su piel con Inteligencia Artificial... 🤖✨";
      }
      btnAnalizar.innerText = "Pensando... ⏳";
      btnAnalizar.disabled = true;

      try {
        const predicciones = await modeloIA.predict(videoCamara);
        
        let mejorPrediccion = predicciones[0];
        for (let i = 1; i < predicciones.length; i++) {
          if (predicciones[i].probability > mejorPrediccion.probability) {
            mejorPrediccion = predicciones[i];
          }
        }

        const nombrePiel = mejorPrediccion.className; 
        const porcentaje = Math.round(mejorPrediccion.probability * 100);

        let recomendacion = "";
        
        if (nombrePiel.toLowerCase().includes("grasa")) {
          recomendacion = "Recomendamos nuestra <b>Limpieza Facial Profunda Mificante</b> para controlar el brillo y equilibrar su cutis. ✨";
        } else if (nombrePiel.toLowerCase().includes("seca")) {
          recomendacion = "Recomendamos nuestra <b>Hidratación Intensiva con Ácido Hialurónico</b> para devolverle la vida y suavidad a su rostro. 💧";
        } else if (nombrePiel.toLowerCase().includes("mixta")) {
          recomendacion = "Recomendamos nuestro <b>Tratamiento Equilibrante</b>, perfecto para cuidar cada zona de su rostro de forma específica. 🌸";
        } else {
          recomendacion = "Recomendamos nuestra maravillosa <b>Limpieza Facial Estándar</b> y una evaluación en persona. 🧖‍♀️";
        }

        if(divResultado) {
          divResultado.innerHTML = `
            <h3 style="color: #6a4c9c; margin-bottom: 8px;">Diagnóstico: ${nombrePiel} (${porcentaje}%)</h3>
            <p style="color: #555; font-size: 1.05em; line-height: 1.4; margin:0;">${recomendacion}</p>
          `;
        }

      } catch (error) {
        console.error("Error al analizar:", error);
        if(divResultado) divResultado.innerHTML = "Hubo un pequeño error. Intente acercar más su rostro a la cámara. 📸";
      }

      btnAnalizar.innerText = "✨ Analizar Piel";
      btnAnalizar.disabled = false;
    });
  }

  // =========================================================
// 🪟 CONTROL DE LA VENTANA FLOTANTE DEL ESCÁNER IA
// =========================================================
const btnAbrirEscaner = document.getElementById('btnAbrirEscaner');
const modalEscanerFlotante = document.getElementById('modalEscanerFlotante');
const btnCerrarEscaner = document.getElementById('btnCerrarEscaner');

if (btnAbrirEscaner && modalEscanerFlotante && btnCerrarEscaner) {
  
  // 1. Al presionar el botón nuevo, se abre la ventana
  btnAbrirEscaner.addEventListener('click', (e) => {
    e.preventDefault(); 
    modalEscanerFlotante.classList.add('activo');
  });

  // 2. Al presionar la X, se cierra
  btnCerrarEscaner.addEventListener('click', () => {
    modalEscanerFlotante.classList.remove('activo');
    
    // Detalle VIP: Si la cámara quedó prendida, la apagamos automáticamente por privacidad
    const btnApagar = document.getElementById('btn-encender');
    if (btnApagar && btnApagar.innerText.includes("Apagar")) {
      btnApagar.click(); 
    }
  });
}

}); // 🌟 ¡CIERRE FINAL DEL DOMContentLoaded! 🌟