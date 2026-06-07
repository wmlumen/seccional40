/**
 * Google Apps Script - Backend Seccional 40
 * Recibe datos de votación y los guarda en Google Sheets
 * 
 * USO:
 * 1. Crear nuevo proyecto en https://script.google.com
 * 2. Copiar este código completo en el editor (archivo .gs)
 * 3. Guardar (Ctrl+S)
 * 4. Implementar > Nueva implementación > Aplicación web
 * 5. Ejecutar como: Tu cuenta
 * 6. Acceso: Cualquiera, incluso anónimo
 * 7. Copiar la URL y pegarla en index.html (variable API_URL)
 */

const SHEET_NAME = 'Registros';
const SHEET_RESUMEN = 'Resumen';
const SHEET_NO_VOTOS = 'No_votos';

/**
 * Maneja solicitudes POST (registrar voto/consulta)
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
    const nombreHoja = esNoVoto ? SHEET_NO_VOTOS : SHEET_NAME;
    
    let sheet = ss.getSheetByName(nombreHoja);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(nombreHoja);
      if (esNoVoto) {
        sheet.appendRow([
          'timestamp', 'cedula', 'nombre', 'mesa', 'orden', 'estado', 'accion', 'motivo', 'observacion', 'origen'
        ]);
        sheet.getRange(1, 1, 1, 10)
          .setFontWeight('bold')
          .setBackground('#dc2626')
          .setFontColor('#ffffff');
      } else {
        sheet.appendRow([
          'timestamp', 'cedula', 'nombre', 'mesa', 'orden', 'estado', 'accion', 'dirigente', 'dirigenteNombre', 'origen'
        ]);
        sheet.getRange(1, 1, 1, 10)
          .setFontWeight('bold')
          .setBackground('#1e3a8a')
          .setFontColor('#ffffff');
      }
      sheet.setFrozenRows(1);
    }
    
    let row;
    if (esNoVoto) {
      row = [
        data.timestamp || new Date().toISOString(),
        data.cedula || '',
        data.nombre || '',
        data.mesa || '',
        data.orden || '',
        data.estado || '',
        data.accion || '',
        data.motivo || '',
        data.observacion || '',
        data.origen || 'web'
      ];
    } else {
      row = [
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
    }
    
    sheet.appendRow(row);
    
    // Actualizar resumen solo si no es no_voto
    if (!esNoVoto) {
      actualizarResumen(ss);
    }
    
    return jsonResponse({ success: true, row: sheet.getLastRow(), tipo: esNoVoto ? 'no_voto' : 'registro' });
    
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
      const sheet = ss.getSheetByName(SHEET_NAME);
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
      const sheet = ss.getSheetByName(SHEET_NAME);
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
        .reverse(); // Más recientes primero
      return jsonResponse({ registros: registros, total: registros.length });
    }
    
    if (action === 'no_votos') {
      const sheet = ss.getSheetByName(SHEET_NO_VOTOS);
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
          motivo: row[7],
          observacion: row[8],
          origen: row[9]
        }))
        .reverse();
      return jsonResponse({ registros: registros, total: registros.length });
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal error' });
  }
}

/**
 * Actualiza la hoja de resumen con estadísticas por mesa
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
  
  const dataSheet = ss.getSheetByName(SHEET_NAME);
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
