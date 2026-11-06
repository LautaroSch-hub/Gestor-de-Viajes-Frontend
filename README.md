# Viajes con Karen (sitio + panel de administración)

React + Redux Toolkit + Vite + Tailwind.

## Correr
```
npm install
npm run dev
```
- Sitio: `/`  ·  Panel: `/admin` (botón **Ingresar** arriba a la derecha).

## Dos modos (se elige con `VITE_API_URL` en `.env`)
- **Con backend** (`VITE_API_URL=http://localhost:3000`): usa la API del proyecto `agencia-viajes-backend` (PostgreSQL + Cloudinary). Login real con el usuario creado en el backend. Los pasos están en el README del backend.
- **Demo** (`VITE_API_URL` vacío): todo se guarda en el `localStorage` del navegador, con login de prueba `admin@viajesconkaren.com` / `admin1234`. Sirve para probar el panel sin servidor.

La conmutación está en `src/services/api.js`; las implementaciones son `api.remote.js` (fetch a la API) y `api.demo.js` (navegador). Tienen las mismas funciones, por eso el resto de la app no cambia.

## Panel
- **Resumen**: métricas, ofertas por vencer, destinos sin imágenes.
- **Viajes**: crear/editar de cualquier categoría y alcance, con o sin oferta; agregar/quitar oferta; activar/desactivar (no se borra); duplicar; vista previa de la tarjeta.
- **Destinos**: se cargan una vez con sus imágenes y se reutilizan en todos sus viajes.
- **Consultas**: bandeja con lo que llega de los formularios de la web (marcar atendida, responder por mail/WhatsApp).

## Importante
Las rutas del panel en el front solo ocultan pantallas; la protección real de los datos la da el backend (cookie de sesión en cada pedido).
