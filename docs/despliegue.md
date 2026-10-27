# Despliegue y operación

## Cloudflare Workers

Demo publicada: https://boveda-agente-devday.dpenesi.workers.dev. Worker: `boveda-agente-devday`. Versión inicial: `00489407-f5cc-4555-808b-37b03821eeaf`.

El proyecto despliega `public/` como assets estáticos mediante `wrangler.jsonc`. Se necesita Node.js 22+, dependencias instaladas y una cuenta de Cloudflare con permisos de Workers. Confirmar la cuenta y el nombre antes de desplegar: el nombre del Worker debe ser único dentro de esa cuenta.

```bash
npm install
npx wrangler login
npm run test
npm run deploy
```

También se puede usar un token de API apropiado mediante `CLOUDFLARE_API_TOKEN` y, si corresponde, `CLOUDFLARE_ACCOUNT_ID`. No guardarlos en el repositorio. Wrangler informa la URL y la versión publicada. Verificar que cargue el sitio y que funcionen las tres consultas del [guion](casos-de-uso.md).

La demo no necesita Workers AI, base de datos ni secretos. Consultar [assets estáticos de Workers](https://developers.cloudflare.com/workers/static-assets/) y [configuración de Wrangler](https://developers.cloudflare.com/workers/wrangler/configuration/) para detalles y límites vigentes.

## Cambios y reversión

Publicar nuevamente con `npm run deploy` tras revisar el contenido de `public/`. Usar las versiones del Worker en el panel de Cloudflare o las herramientas oficiales para volver a una versión anterior. Revisar el resultado en la URL pública después de revertir.

## Datos

No subir vaults, índices, credenciales ni notas reales. La demo no transmite consultas a un backend; el hosting y la solicitud externa de Google Fonts siguen sujetos a las políticas de sus proveedores. Para uso privado real, diseñar autenticación y transporte local antes de conectar datos sensibles.
