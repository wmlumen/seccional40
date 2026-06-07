# SECCIONAL 40 - Sistema de Control Electoral

Sistema web para control de votación electoral - Seccional 40.

## 🔗 Enlaces del Proyecto

| Enlace | Descripción |
|--------|-------------|
| 🗳️ **Sistema de Votación** | [https://wmlumen.github.io/seccional40/index.html](https://wmlumen.github.io/seccional40/index.html) |
| 📊 **Panel de Reporte** | [https://wmlumen.github.io/seccional40/asistencia.html](https://wmlumen.github.io/seccional40/asistencia.html) |

## 📝 Acceso

- **Contraseña:** `Paraguay40`
- **Seleccionar Dirigente:** Dropdown con cédula y nombre

## 📊 Funcionalidades

- Carga automática del padrón electoral desde Google Sheets
- Consulta por cédula con nombre del elector
- Panel de votación con 350 botones por mesa
- Registro de votos, ausentes y controversias
- Panel de reporte por Mesa y por Dirigente
- Código QR para transferencia de posta
- Registro automático a Google Sheets

## 💾 ¿Dónde se guardan los votos?

Los votos se guardan en **tres lugares**:

### 1. **Google Sheets** (Base de datos principal)
**URL:** [https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit](https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit)

- Hoja **"Registros"**: Todos los votos marcados
  - Columnas: `timestamp`, `cedula`, `nombre`, `mesa`, `orden`, `estado`, `accion`, `dirigente`, `dirigenteNombre`, `origen`
- Hoja **"Resumen"**: Estadísticas por mesa
- Hoja **"dirigentes"**: Lista de dirigentes (cédula, nombre)

### 2. **localStorage** (Navegador)
- `seccional40_votos`: Votos marcados (para el panel de reporte)
- `seccional40_padron`: Padrón electoral cargado
- `seccional40_dirigentes`: Lista de dirigentes

### 3. **Google Apps Script** (Backend)
- Recibe los datos desde `index.html`
- Guarda en las hojas de Google Sheets
- Actualiza el resumen automáticamente

## 🚀 Tecnologías

- HTML5 / JavaScript / CSS3
- Tailwind CSS (CDN)
- Google Apps Script (backend)
- Google Sheets (base de datos)

---

**Repositorio:** [wmlumen/seccional40](https://github.com/wmlumen/seccional40)
