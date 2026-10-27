# Bóveda Agente

Prototipo para DevDay Exchange Mendoza: una experiencia para consultar notas personales con evidencia, combinando sincronización cifrada, búsqueda local y un agente. [ovaultd](https://github.com/kastormdz/ovaultd) y [obsidian-rag](https://github.com/kastormdz/obsidian-rag) son proyectos independientes.

Demo pública: https://boveda-agente-devday.dpenesi.workers.dev

## Qué funciona hoy

La web muestra el concepto y permite buscar en tres notas ficticias dentro del navegador. Es una búsqueda por coincidencia de palabras: **no usa IA, no accede a un vault real y no conecta los dos proyectos**. Los datos de ejemplo son públicos y forman parte del sitio desplegado.

## Ejecutar

Requisitos: Node.js 22+ y npm. En este directorio:

```bash
npm install
npm run dev
npm test
```

Abrí la URL que indique Wrangler. Alternativamente, serví `public/` con un servidor HTTP estático. Para publicar en Cloudflare Workers: configurá una cuenta con acceso de despliegue y ejecutá `npm run deploy`. Ver [despliegue](docs/despliegue.md).

## Documentación

- [Propuesta completa de producto](docs/propuesta.md)
- [Arquitectura y decisiones](docs/arquitectura.md)
- [Casos de uso y guion de demo](docs/casos-de-uso.md)
- [Plan de implementación y evaluación](docs/plan.md)
- [Despliegue y operación](docs/despliegue.md)

## Privacidad y límites

**Regla del repositorio:** todo su contenido es público. No se deben subir credenciales, datos personales, notas reales, información de clientes ni otros datos confidenciales o sensibles. Los ejemplos, fixtures y casos de uso deben usar únicamente datos inventados. Ver [reglas para contribuciones](AGENTS.md).

La demo no envía las consultas ni los datos de ejemplo a una API de búsqueda. Cloudflare sirve los archivos del sitio; la tipografía se solicita a Google Fonts. No cargues información privada en el código ni en `public/`. La arquitectura real requiere revisión de seguridad, control de consentimiento y verificación de integridad antes de prometer protección contra un servidor malicioso.
