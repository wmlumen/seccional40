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

## ⚙️ Configuración

### 1. **Configurar Google Apps Script**

1. Abrir el editor: `Extensiones` → `Apps Script` en tu Google Sheet
2. Copiar el código completo de `Código.gs`
3. Guardar (Ctrl+S)
4. `Implementar` → `Nueva implementación` → `Aplicación web`
5. Ejecutar como: Tu cuenta
6. Acceso: Cualquiera, incluso anónimo
7. **Copiar la URL** generada

### 2. **Configurar URL del API**

Pegar la URL en **dos archivos**:

**`index.html`:**
```javascript
const API_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

**`asistencia.html`:**
```javascript
const API_URL = 'https://script.google.com/macros/s/TU_URL_AQUI/exec';
```

## 💾 ¿Dónde se guardan los votos?

Los votos se guardan directamente en **Google Sheets** en tiempo real:

### 1. **Google Sheets** (Base de datos principal)
**URL:** [https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit](https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit)

- Hoja **"Registros"**: Todos los votos marcados
  - Columnas: `timestamp`, `cedula`, `nombre`, `mesa`, `orden`, `estado`, `accion`, `dirigente`, `dirigenteNombre`, `origen`
- Hoja **"Resumen"**: Estadísticas por mesa
- Hoja **"dirigentes"**: Lista de dirigentes (cédula, nombre)

### 2. **Panel de Reporte en tiempo real**
- El panel `asistencia.html` lee los datos directamente desde Google Sheets cada 5 segundos
- No se usa localStorage (todos los datos van directo a la nube)

## 🚀 Tecnologías

- HTML5 / JavaScript / CSS3
- Tailwind CSS (CDN)
- Google Apps Script (backend)
- Google Sheets (base de datos)

---

**Repositorio:** [wmlumen/seccional40](https://github.com/wmlumen/seccional40)
