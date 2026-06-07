# SECCIONAL 40 - Sistema de Control Electoral

Sistema web completo para control de votación electoral - Seccional 40.

## 🏛️ Matriz de Acceso por Roles

| Página | Dirigente | Miembro de Mesa | PC |
|--------|-----------|-----------------|-----|
| **index.html** (Votación) | ❌ NO | ✅ SÍ | ❌ NO |
| **dirigente.html** (Panel Dirigente) | ✅ SÍ | ❌ NO | ❌ NO |
| **No_voto.html** (Registro No Voto) | ✅ SÍ | ❌ NO | ✅ SÍ |
| **mesas.html** (Estado Mesas) | ✅ SÍ | ❌ NO | ✅ SÍ |
| **asistencia.html** (Seguimiento) | ❌ NO | ❌ NO | ✅ SÍ |
| **anomalias.html** (Monitoreo) | ❌ NO | ❌ NO | ✅ SÍ |

## 🔑 Contraseñas por Rol

- **Miembro de Mesa:** `Paraguay40` (solo accede a index.html)
- **Dirigente:** Cédula + Contraseña (de hoja "Dirigentes")
- **PC:** `Paraguay40` (accede a No_voto, asistencia, anomalias, mesas)

## 🔗 Enlaces del Proyecto

### Colegio Electoral (Operativos)

| Enlace | Descripción | Acceso |
|--------|-------------|--------|
| 🗳️ **Votación** | [index.html](https://wmlumen.github.io/seccional40/index.html) | Sistema principal de votación con 350 botones por mesa |
| 👤 **Dirigente** | [dirigente.html](https://wmlumen.github.io/seccional40/dirigente.html) | Panel privado de cada dirigente (cédula + contraseña) |
| 🏛️ **Mesas** | [mesas.html](https://wmlumen.github.io/seccional40/mesas.html) | Vista general de todas las mesas con estadísticas |
| 🚫 **No Voto** | [No_voto.html](https://wmlumen.github.io/seccional40/No_voto.html) | Registro de personas que no votarán |

### Panel de Control (PC - Monitoreo)

| Enlace | Descripción | Acceso |
|--------|-------------|--------|
| 📊 **Seguimiento del Dirigente** | [asistencia.html](https://wmlumen.github.io/seccional40/asistencia.html) | Reporte por dirigente y mesa en tiempo real |
| 🚨 **Anomalías** | [anomalias.html](https://wmlumen.github.io/seccional40/anomalias.html) | Detección de intervalos voto-a-voto anómalos |

## 📝 Acceso

- **Contraseña General:** `Paraguay40`
- **Dirigentes:** Cédula + Contraseña (según hoja "Dirigentes")
- **Panel del Dirigente:** Lee directamente desde la hoja "Dirigentes" del Google Sheet

## 🔗 Navegación entre Páginas

Todos los archivos incluyen un **menú de navegación** en el header que permite moverse entre:
- **Colegio:** Votación → Dirigente → Mesas → No Voto
- **PC:** Anomalías → Seguimiento

## 📊 Funcionalidades por Módulo

### 🗳️ index.html (Votación)
- Carga automática del padrón electoral desde Google Sheets
- Consulta por cédula con nombre del elector
- Panel de votación con botones dinámicos por mesa
- Registro de votos, ausentes y controversias
- Código QR para transferencia de posta
- Envía datos a Google Sheets en tiempo real

### 👤 dirigente.html (Panel del Dirigente)
- **Acceso privado** con cédula y contraseña de la hoja "Dirigentes"
- Lee directamente desde el Google Sheet (no CSV)
- Ve solo los votantes que él registró
- Tabs: Ya Votaron, Ausentes, No Votarán, Controversias, Comunicaciones
- Registra comunicaciones con notas
- Registra No Votos directamente
- Actualiza cada 10 segundos

### 🏛️ mesas.html (Mesas)
- Vista general de todas las mesas
- Total de electores por mesa
- Votos registrados y participación
- Gráfico de barras por mesa
- Actualiza cada 30 segundos

### 🚫 No_voto.html (No Voto)
- Registro de personas que no votarán
- Búsqueda por cédula con autocompletado
- Campo: Dirigente, Motivo (Enfermedad, Viaje, Fallecido, Trabajo, Desinterés, Otro)
- Observación opcional
- **Guarda en hoja "No_voto"** con columnas: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO

### 📊 asistencia.html (Seguimiento del Dirigente - PC)
- Reporte por Mesa y por Dirigente
- Progreso por mesa con barras
- Reporte de No Votos en tiempo real
- Actualiza cada 5 segundos

### 🚨 anomalias.html (Anomalías - PC)
- Detección de intervalos voto-a-voto anómalos
- Media calculada a partir de 10 votos por mesa
- Alerta por votos muy rápidos (< 35%) o muy lentos (> 300%)
- Alarma cuando hay 3+ votos rápidos consecutivos
- Detección de No Votos que luego votaron (anomalía crítica)
- Actualiza cada 5 segundos

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

**URL configurada en todos los archivos:**
```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycbz8Eu5eNcfNFH6mttWCV1xSx-SJpCzjNTQrhjYIv8amIo3ptfOjatuDJglN455t7LBYwQ/exec';
```

## 💾 Estructura de Google Sheets

**URL:** [https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit](https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit)

### Hojas del Sistema

| Hoja | Propósito | Columnas |
|------|-----------|----------|
| **Registros** | Todos los votos marcados | `timestamp`, `cedula`, `nombre`, `mesa`, `orden`, `estado`, `accion`, `dirigente`, `dirigenteNombre`, `origen` |
| **Resumen** | Estadísticas por mesa | `Mesa`, `Votos`, `Ausentes`, `Controversias`, `Total`, `Participacion %` |
| **Dirigentes** | Lista de dirigentes con contraseña | `Cédula`, `Nombre`, `Contraseña` |
| **Miembros_mesa** | Miembros de mesa/veedores | `Cédula`, `Nombre`, `Mesa` |
| **No_voto** | Personas que no votarán | `CEDULA`, `APELLIDO`, `NOMBRE`, `DIRIGENTE`, `No_VOTO` |

### Endpoints del API

| Endpoint | Descripción |
|----------|-------------|
| `POST` | Registrar voto (va a Registros) o no-voto (va a No_voto) |
| `?action=votos` | Obtener todos los votos |
| `?action=no_votos` | Obtener todos los no-votos desde hoja No_voto |
| `?action=dirigentes` | Obtener lista de dirigentes desde hoja Dirigentes |
| `?action=miembros_mesa` | Obtener lista de miembros de mesa desde hoja Miembros_mesa |
| `?action=resumen` | Obtener resumen por mesa |
| `?action=mesa&mesa=N` | Obtener votos de una mesa específica |

## 🚀 Tecnologías

- HTML5 / JavaScript / CSS3
- Tailwind CSS (CDN)
- Font Awesome (CDN)
- Google Apps Script (backend)
- Google Sheets (base de datos)

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────┐
│         Google Sheets (Excel)           │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Registros│ │Dirigentes│ │No_voto │ │
│  └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐             │
│  │ Miembros │ │  Resumen │             │
│  │  _mesa   │ │          │             │
│  └──────────┘ └──────────┘             │
└─────────────────────────────────────────┘
                    │
                    │ API (Google Apps Script)
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐     ┌────▼────┐    ┌────▼───┐
│ index │     │dirigente│    │No_voto │
│ .html │     │ .html   │    │ .html  │
│(Miembro│     │(Dirigen)│    │(Dir/PC)│
└───┬───┘     └────┬────┘    └───┬────┘
    │              │             │
    │              │             │
    └──────────────┼─────────────┘
                   │
         ┌─────────▼──────────┐
         │     PC (PC)        │
         │ ┌──────┐ ┌────────┐│
         │ │mesas │ │anomalia││
         │ │.html │ │s.html  ││
         │ └──────┘ └────────┘│
         │ ┌──────────────┐   │
         │ │asistencia.html│  │
         │ └──────────────┘   │
         └────────────────────┘
```

---

**Repositorio:** [wmlumen/seccional40](https://github.com/wmlumen/seccional40)
