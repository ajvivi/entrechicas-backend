const NOMBRE_CACHE = "entre-chicas-v2";
const archivosAGuardar = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// 1. Instalar la App y guardar los archivos en el celular
self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => {
      return cache.addAll(archivosAGuardar);
    })
  );
});

// 2. Interceptar las cargas para que sea rapidísima
self.addEventListener("fetch", (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((respuesta) => {
      // Si el archivo está guardado, lo damos rápido. Si no, lo pedimos a internet.
      return respuesta || fetch(evento.request);
    })
  );
});