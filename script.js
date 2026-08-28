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
  
  // =========================================================
  // 1. EFECTO DE MOVIMIENTO DE LA IMAGEN 📸
  // =========================================================
  const contenedor = document.getElementById('contenedorInteractiva');
  const imagen = document.getElementById('imagenMovil');

  if (contenedor && imagen) {
    contenedor.addEventListener('mousemove', (evento) => {
      const rect = contenedor.getBoundingClientRect();
      const x = evento.clientX - rect.left; 
      const y = evento.clientY - rect.top;
      const centroX = rect.width / 2;
      const centroY = rect.height / 2;
      
      let moverX = (x - centroX) / 30;
      let moverY = (y - centroY) / 30;
      
      imagen.style.transform = `translate(${moverX}px, ${moverY}px) scale(1.05)`;
    });

    contenedor.addEventListener('mouseleave', () => {
      imagen.style.transition = 'transform 0.5s ease-out';
      imagen.style.transform = `translate(0px, 0px) scale(1)`;
    });

    contenedor.addEventListener('mouseenter', () => {
      imagen.style.transition = 'transform 0.1s ease-out';
    });
  }

  // =========================================================
  // 💌 2. ENVÍO DE RESERVA DIRECTO A GOOGLE FIRESTORE
  // =========================================================
  const formularioReserva = document.getElementById('formularioReserva');
  const modal = document.getElementById('modalReservas'); 

  if (formularioReserva) {
    formularioReserva.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita que la página se recargue

      // Buscamos el servicio (soportando los dos IDs que tenía en su código)
      const selectServicio = document.getElementById('servicioSelect') || document.getElementById('servicio');

      // Recopilamos los datos de la clienta
      const datosReserva = {
        nombre: document.getElementById('nombre').value,
        correo: document.getElementById('correo').value,
        telefono: document.getElementById('telefono').value,
        servicio: selectServicio ? selectServicio.value : 'No especificado',
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        fecha_creacion: new Date() // Guarda el momento exacto en que reservó
      };

      try {
        // 🚀 ¡MAGIA! Guardamos los datos en la colección "reservas" de Firestore
        await addDoc(collection(db, "reservas"), datosReserva);
        
        alert(`¡Cita agendada con éxito!\n¡Gracias por confiar en nosotras, ${datosReserva.nombre}! `);
        
        formularioReserva.reset(); // Limpiamos el formulario
        if (modal) modal.classList.remove('activo'); // Cerramos el modal
        
      } catch (error) {
        console.error('Ups, error al guardar en Firebase:', error);
        alert('Ocurrió un detalle al agendar. Por favor, intente nuevamente.');
      }
    });
  }

  // =========================================================
  // 4. CONTROL DE AUDIO DEL VIDEO DE FONDO 🎵
  // =========================================================
  const videoFondo = document.querySelector('.video-fondo-pantalla');
  const btnAudio = document.getElementById('btnAudio');

  if (videoFondo && btnAudio) {
    videoFondo.muted = true;
    
    btnAudio.addEventListener('click', () => {
      if (videoFondo.muted) {
        videoFondo.muted = false;
        btnAudio.innerHTML = ' Silenciar'; 
      } else {
        videoFondo.muted = true;
        btnAudio.innerHTML = ' Activar Sonido';
      }
    });
  }
  
  // =========================================================
  // 5. CONTROL DEL MODAL (POP-UP) DE RESERVAS 
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
  // 🎬 6. EFECTO 3D PREMIUM: MOUSE + SCROLL 🖱️📜✨
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
  // 🃏 INCLINACIÓN 3D INTERACTIVA EN TARJETA DE SERVICIOS
  // =========================================================
  const tarjetaGrande = document.querySelector('.tarjeta-servicios-grande');

  if (tarjetaGrande) {
    tarjetaGrande.addEventListener('mousemove', (e) => {
      const rect = tarjetaGrande.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotarX = (y / rect.height) * -8;
      const rotarY = (x / rect.width) * 8;

      tarjetaGrande.style.transform = `rotateX(${rotarX}deg) rotateY(${rotarY}deg)`;
    });

    tarjetaGrande.addEventListener('mouseleave', () => {
      tarjetaGrande.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  // =========================================================
  // 📸 EFECTO 3D Y SCROLL PARALLAX EN "SOBRE NOSOTROS"
  // =========================================================
  const tarjetaNosotros = document.querySelector('.tarjeta-nosotros-grande');
  const fotoNosotros = document.querySelector('.tarjeta-nosotros-grande .lado-foto img');

  if (tarjetaNosotros) {
    tarjetaNosotros.addEventListener('mousemove', (e) => {
      const rect = tarjetaNosotros.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotarX = (y / rect.height) * -6; 
      const rotarY = (x / rect.width) * 6;

      tarjetaNosotros.style.transform = `rotateX(${rotarX}deg) rotateY(${rotarY}deg) translateY(-10px)`;
      tarjetaNosotros.style.boxShadow = `0 30px 60px rgba(0,0,0,0.12)`;
    });

    tarjetaNosotros.addEventListener('mouseleave', () => {
      tarjetaNosotros.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
      tarjetaNosotros.style.boxShadow = `0 20px 50px rgba(0,0,0,0.1)`;
    });
  }

  window.addEventListener('scroll', () => {
    if (fotoNosotros) {
      let scrollActual = window.scrollY;
      fotoNosotros.style.transform = `translateY(${scrollActual * 0.03}px)`;
    }
  });

}); // 🌟 ¡CIERRE FINAL DEL DOMContentLoaded! 🌟

