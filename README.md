# SECCIONAL 40 - Sistema de Control Electoral

Sistema web completo para control de votación electoral - Seccional 40.

## 🏛️ Matriz de Acceso por Roles

| Página | Dirigente | Miembro de Mesa | PC |
|--------|-----------|-----------------|-----|
| **index.html** (Votación) | ❌ NO | ✅ SÍ (habilitado) | ❌ NO |
| **No_voto.html** (Registro No Voto) | ✅ SÍ | ❌ NO | ✅ SÍ |
| **mesas.html** (Estado Mesas) | ✅ SÍ | ❌ NO | ✅ SÍ |
| **asistencia.html** (Seguimiento) | ❌ NO | ❌ NO | ✅ SÍ |
| **anomalias.html** (Monitoreo) | ❌ NO | ❌ NO | ✅ SÍ |

## 🔑 Acceso por Rol

- **Miembro de Mesa:** Acceso restringido a operadores habilitados
- **Dirigente:** Acceso restringido a usuarios habilitados
- **PC:** Acceso restringido a vistas de monitoreo y soporte

## 🔗 Enlaces del Proyecto

### Colegio Electoral (Operativos)

| Enlace | Descripción | Acceso |
|--------|-------------|--------|
| 🗳️ **Votación** | [index.html](https://wmlumen.github.io/seccional40/index.html) | Sistema principal de votación con 350 botones por mesa |
| 🏛️ **Mesas** | [mesas.html](https://wmlumen.github.io/seccional40/mesas.html) | Vista general de todas las mesas con estadísticas |
| 🚫 **No Voto** | [No_voto.html](https://wmlumen.github.io/seccional40/No_voto.html) | Registro de personas que no votarán |

### Panel de Control (PC - Monitoreo)

| Enlace | Descripción | Acceso |
|--------|-------------|--------|
| 📊 **Seguimiento del Dirigente** | [asistencia.html](https://wmlumen.github.io/seccional40/asistencia.html) | Reporte por dirigente y mesa en tiempo real |
| 🚨 **Anomalías** | [anomalias.html](https://wmlumen.github.io/seccional40/anomalias.html) | Detección de intervalos voto-a-voto anómalos |

## 📝 Acceso

- Todas las vistas operan con acceso restringido
- Las credenciales se administran fuera de esta documentación
- El panel consulta los datos operativos directamente desde Google Sheets

## 🔗 Navegación entre Páginas

Todos los archivos incluyen un **menú de navegación** en el header que permite moverse entre:
- **Colegio:** Votación → Mesas → No Voto
- **PC:** Anomalías → Seguimiento

## 📊 Funcionalidades por Módulo

### 🗳️ index.html (Votación)
- Acceso restringido a miembros de mesa habilitados
- Carga automática del padrón electoral desde Google Sheets
- Consulta por cédula con nombre del elector
- Panel de votación con botones dinámicos por mesa
- Registro de votos, ausentes y controversias
- Código QR para transferencia de posta
- Envía datos a Google Sheets en tiempo real

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

### 1. **Configurar Google Apps Script (CRÍTICO)**

⚠️ **Si la API responde con HTML de login de Google, la web app NO está pública.**

**Pasos para redeploy:**
1. Abrir el editor: `Extensiones` → `Apps Script` en tu Google Sheet
2. Copiar el código completo de `Código.gs`
3. Guardar (Ctrl+S)
4. `Implementar` → `Nueva implementación` → `Aplicación web`
5. **Ejecutar como:** Tu cuenta
6. **Quién tiene acceso:** `Cualquiera` o `Cualquiera, incluso anónimo`
7. **Copiar la URL** generada

**Verificación de publicación:**
- Abrir en navegador: `https://script.google.com/macros/s/ID/exec?action=test`
- Si ves **JSON** ✅ → La API está pública y funcionando
- Si ves **HTML de login de Google** ❌ → La web app NO está pública, repetir pasos 4-6

### 2. **Configurar URL del API**

**URL configurada en todos los archivos:**
```javascript
const API_URL = 'https://script.google.com/macros/s/AKfycbxnReysHMqJ0T3HBCol1seKAAR_DFama04H4ulRkqXVx7Tb4lqfb96CNou2p9lB-dn8rw/exec';
```

**IMPORTANTE:** Después del redeploy, actualizar esta URL en todos los archivos HTML si cambia.

## 💾 Estructura de Google Sheets

**URL:** [https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit](https://docs.google.com/spreadsheets/d/1tDtXxCqV5L70-w5wAXBkb73e3ZKtTu7ni8lJ_AUg73I/edit)

### Hojas del Sistema

| Hoja | Propósito | Columnas |
|------|-----------|----------|
| **Registros** | Todos los votos marcados | `timestamp`, `cedula`, `nombre`, `mesa`, `orden`, `estado`, `accion`, `dirigente`, `dirigenteNombre`, `origen` |
| **Resumen** | Estadísticas por mesa | `Mesa`, `Votos`, `Ausentes`, `Controversias`, `Total`, `Participacion %` |
| **Dirigentes** | Lista de dirigentes habilitados | `Cédula`, `Nombre`, `Datos operativos` |
| **Miembros_mesa** | Miembros de mesa/veedores | `Cédula`, `Nombre`, `Datos operativos`, `Mesa`, `Horario de Inicio`, `Horario de Cierre`, `Estado` |
| **No_voto** | Personas que no votarán | `CEDULA`, `APELLIDO`, `NOMBRE`, `DIRIGENTE`, `No_VOTO` |

### Endpoints del API

| Endpoint | Descripción |
|----------|-------------|
| `POST` | Registrar voto (va a Registros) o no-voto (va a No_voto) |
| `?action=votos` | Obtener todos los votos |
| `?action=no_votos` | Obtener todos los no-votos desde hoja No_voto |
| `?action=dirigentes` | Obtener lista de dirigentes desde hoja Dirigentes |
| `?action=miembros_mesa` | Obtener lista de miembros de mesa desde hoja Miembros_mesa |
| `?action=miembros_mesa_v2` | Obtener lista normalizada de miembros con estado y horarios |
| `?action=registrar_miembro&cedula=...&nombre=...&credencial=...&mesa=...&estado=ACTIVO` | Alta/actualización de miembro de mesa |
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
│ index │                 │No_voto │
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
