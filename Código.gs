/**
 * Google Apps Script - Backend Seccional 40
 * Recibe datos de votación y los guarda en Google Sheets
 * 
 * Hojas del sistema:
 * - Padrón: SECC, N°, LOCAL DE VOTACION, MESA, ORDEN, CEDULA, APELLIDO, NOMBRE, FEC. NAC, DIRIGENTE, VOTO
 * - Dirigentes: Cédula, Dirigente, Contraseña
 * - Miembros_mesa: Cédula, Dirigente, Contraseña, MESA, HORARIO DE INICIO, HORARIO DE CIERRE
 * - No_voto: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO
 * - Resumen: Mesa, Votos, Ausentes, Controversias, Total, Participacion %
 * - Registros: timestamp, cedula, nombre, mesa, orden, estado, accion, dirigente, dirigenteNombre, origen
 * 
 * USO:
 * 1. Crear nuevo proyecto en https://script.google.com
 * 2. Copiar este código completo en el editor (archivo .gs)
 * 3. Guardar (Ctrl+S)
 * 4. Implementar > Nueva implementación > Aplicación web
 * 5. Ejecutar como: Tu cuenta
 * 6. Acceso: Cualquiera, incluso anónimo
 * 7. Copiar la URL y pegarla en los archivos HTML
 */

const SHEET_REGISTROS = 'Registros';
const SHEET_RESUMEN = 'Resumen';
const SHEET_NO_VOTO = 'No_voto';
const SHEET_DIRIGENTES = 'Dirigentes';
const SHEET_MIEMBROS_MESA = 'Miembros_mesa';

/**
 * Maneja solicitudes POST (registrar voto/consulta/no_voto)
 */
function doPost(e) {
  try {
    if (!e || !e.postData) {
      return jsonResponse({ success: false, error: 'No data received' });
    }

    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Determinar si es un registro de NO VOTO
    const esNoVoto = data.estado === 'no_voto';
    
    if (esNoVoto) {
      // Escribir en la hoja No_voto (columnas: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO)
      let sheet = ss.getSheetByName(SHEET_NO_VOTO);
      if (!sheet) {
        return jsonResponse({ success: false, error: 'Hoja No_voto no encontrada' });
      }
      
      const row = [
        data.cedula || '',
        data.apellido || '',
        data.nombre || '',
        data.dirigente || 'Sin dirigente',
        data.motivo || 'Otro'
      ];
      
      sheet.appendRow(row);
      
      return jsonResponse({ success: true, row: sheet.getLastRow(), tipo: 'no_voto' });
    } else {
      // Escribir en la hoja Registros (timestamp, cedula, nombre, mesa, orden, estado, accion, dirigente, dirigenteNombre, origen)
      let sheet = ss.getSheetByName(SHEET_REGISTROS);
      if (!sheet) {
        sheet = ss.insertSheet(SHEET_REGISTROS);
        sheet.appendRow([
          'timestamp', 'cedula', 'nombre', 'mesa', 'orden', 'estado', 'accion', 'dirigente', 'dirigenteNombre', 'origen'
        ]);
        sheet.getRange(1, 1, 1, 10)
          .setFontWeight('bold')
          .setBackground('#1e3a8a')
          .setFontColor('#ffffff');
        sheet.setFrozenRows(1);
      }
      
      const row = [
        data.timestamp || new Date().toISOString(),
        data.cedula || '',
        data.nombre || '',
        data.mesa || '',
        data.orden || '',
        data.estado || '',
        data.accion || '',
        data.dirigente || 'Dirigente',
        data.dirigenteNombre || 'Dirigente',
        data.origen || 'web'
      ];
      
      sheet.appendRow(row);
      actualizarResumen(ss);
      
      return jsonResponse({ success: true, row: sheet.getLastRow(), tipo: 'registro' });
    }
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal error' });
  }
}

/**
 * Maneja solicitudes GET (obtener datos)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = e.parameter.action || 'status';
    
    if (action === 'status') {
      return jsonResponse({
        status: 'ok',
        service: 'Seccional 40 API',
        timestamp: new Date().toISOString()
      });
    }
    
    if (action === 'resumen') {
      const sheet = ss.getSheetByName(SHEET_RESUMEN);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ mesas: [], total: 0 });
      }
      const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
      const mesas = data.map(row => ({
        mesa: row[0],
        votos: row[1],
        ausentes: row[2],
        controversias: row[3],
        total: row[4],
        participacion: row[5]
      }));
      return jsonResponse({ mesas: mesas, total: mesas.length });
    }
    
    if (action === 'mesa') {
      const mesaNum = parseInt(e.parameter.mesa) || 0;
      const sheet = ss.getSheetByName(SHEET_REGISTROS);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ mesa: mesaNum, registros: [] });
      }
      const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
      const registros = allData
        .filter(row => parseInt(row[3]) === mesaNum)
        .map(row => ({
          timestamp: row[0],
          cedula: row[1],
          nombre: row[2],
          mesa: row[3],
          orden: row[4],
          estado: row[5],
          accion: row[6],
          dirigente: row[7],
          dirigenteNombre: row[8]
        }));
      return jsonResponse({ mesa: mesaNum, registros: registros });
    }
    
    if (action === 'votos') {
      const sheet = ss.getSheetByName(SHEET_REGISTROS);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ registros: [], total: 0 });
      }
      const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
      const registros = allData
        .map(row => ({
          timestamp: row[0],
          cedula: row[1],
          nombre: row[2],
          mesa: row[3],
          orden: row[4],
          estado: row[5],
          accion: row[6],
          dirigente: row[7],
          dirigenteNombre: row[8]
        }))
        .reverse();
      return jsonResponse({ registros: registros, total: registros.length });
    }
    
    if (action === 'no_votos') {
      // Leer desde la hoja No_voto (columnas: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO)
      const sheet = ss.getSheetByName(SHEET_NO_VOTO);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ registros: [], total: 0 });
      }
      const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
      const registros = allData
        .map(row => ({
          cedula: row[0],
          apellido: row[1],
          nombre: row[2],
          dirigente: row[3],
          motivo: row[4]
        }))
        .reverse();
      return jsonResponse({ registros: registros, total: registros.length });
    }
    
    if (action === 'dirigentes') {
      const sheet = ss.getSheetByName(SHEET_DIRIGENTES);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ dirigentes: [], total: 0 });
      }
      const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
      const dirigentes = allData
        .map(row => ({
          cedula: String(row[0] || '').replace(/\./g, '').trim(),
          nombre: String(row[1] || '').trim(),
          contraseña: String(row[2] || '').trim()
        }))
        .filter(d => d.cedula && d.nombre);
      return jsonResponse({ dirigentes: dirigentes, total: dirigentes.length });
    }
    
    if (action === 'miembros_mesa') {
      const sheet = ss.getSheetByName(SHEET_MIEMBROS_MESA);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ miembros: [], total: 0 });
      }
      const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
      const miembros = allData
        .map(row => ({
          cedula: String(row[0] || '').replace(/\./g, '').trim(),
          nombre: String(row[1] || '').trim(),
          contraseña: String(row[2] || '').trim(),
          mesa: String(row[3] || '').trim()
        }))
        .filter(m => m.cedula && m.nombre);
      return jsonResponse({ miembros: miembros, total: miembros.length });
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal error' });
  }
}

/**
 * Actualiza la hoja de Resumen con estadísticas por mesa
 */
function actualizarResumen(ss) {
  let sheet = ss.getSheetByName(SHEET_RESUMEN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESUMEN);
    sheet.appendRow(['Mesa', 'Votos', 'Ausentes', 'Controversias', 'Total', 'Participacion %']);
    sheet.getRange(1, 1, 1, 6)
      .setFontWeight('bold')
      .setBackground('#1e3a8a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  
  const dataSheet = ss.getSheetByName(SHEET_REGISTROS);
  if (!dataSheet || dataSheet.getLastRow() < 2) return;
  
  const data = dataSheet.getRange(2, 1, dataSheet.getLastRow() - 1, 9).getValues();
  
  // Agrupar por mesa
  const stats = {};
  data.forEach(row => {
    const mesa = parseInt(row[3]) || 0;
    const estado = row[5];
    if (!stats[mesa]) {
      stats[mesa] = { votos: 0, ausentes: 0, controversias: 0, total: 0 };
    }
    if (estado === 'voto') stats[mesa].votos++;
    else if (estado === 'ausente') stats[mesa].ausentes++;
    else if (estado === 'controversia') stats[mesa].controversias++;
    stats[mesa].total++;
  });
  
  // Limpiar y reescribir resumen
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clear();
  }
  
  Object.keys(stats).sort((a, b) => a - b).forEach(mesa => {
    const s = stats[mesa];
    const participacion = s.total > 0 ? ((s.votos / s.total) * 100).toFixed(1) : 0;
    sheet.appendRow([mesa, s.votos, s.ausentes, s.controversias, s.total, participacion + '%']);
  });
}

/**
 * Se ejecuta automáticamente al abrir la hoja
 * Actualiza el resumen sin necesidad de trigger manual
 */
function onOpen() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  actualizarResumen(ss);
}

/**
 * Utilidad: devuelve JSON con headers CORS
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
