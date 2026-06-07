/**
 * Google Apps Script - Backend Seccional 40
 * Recibe datos de votaciÃ³n y los guarda en Google Sheets
 * 
 * Hojas del sistema:
 * - PadrÃ³n: SECC, NÂ°, LOCAL DE VOTACION, MESA, ORDEN, CEDULA, APELLIDO, NOMBRE, FEC. NAC, DIRIGENTE, VOTO
 * - Dirigentes: CÃ©dula, Dirigente, ContraseÃ±a
 * - Miembros_mesa: CÃ©dula, Dirigente, ContraseÃ±a, MESA, HORARIO DE INICIO, HORARIO DE CIERRE
 * - No_voto: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO
 * - Resumen: Mesa, Votos, Ausentes, Controversias, Total, Participacion %
 * - Registros: timestamp, cedula, nombre, mesa, orden, estado, accion, dirigente, dirigenteNombre, origen
 * 
 * USO:
 * 1. Crear nuevo proyecto en https://script.google.com
 * 2. Copiar este cÃ³digo completo en el editor (archivo .gs)
 * 3. Guardar (Ctrl+S)
 * 4. Implementar > Nueva implementaciÃ³n > AplicaciÃ³n web
 * 5. Ejecutar como: Tu cuenta
 * 6. Acceso: Cualquiera, incluso anÃ³nimo
 * 7. Copiar la URL y pegarla en los archivos HTML
 */

const SHEET_REGISTROS = 'Registros';
const SHEET_RESUMEN = 'Resumen';
const SHEET_NO_VOTO = 'No_voto';
const SHEET_DIRIGENTES = 'Dirigentes';
const SHEET_MIEMBROS_MESA = 'Miembros_mesa';

function normalizarTexto(valor) {
  return String(valor || '').trim();
}

function normalizarCedula(valor) {
  return normalizarTexto(valor).replace(/[.\s,-]/g, '');
}

function normalizarEstadoMiembro(valor) {
  const estado = normalizarTexto(valor).toUpperCase();
  return estado || 'ACTIVO';
}

function ensureMiembrosSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_MIEMBROS_MESA);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MIEMBROS_MESA);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Cedula', 'Nombre', 'Contrasena', 'Mesa', 'Horario de Inicio', 'Horario de Cierre', 'Estado']);
    sheet.getRange(1, 1, 1, 7)
      .setFontWeight('bold')
      .setBackground('#1e3a8a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function obtenerMiembros(sheet) {
  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }
  const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 7)).getValues();
  return allData
    .map(function(row, index) {
      return {
        rowNumber: index + 2,
        cedula: normalizarCedula(row[0]),
        nombre: normalizarTexto(row[1]),
        contrasena: normalizarTexto(row[2]),
        mesa: normalizarTexto(row[3]),
        horarioInicio: normalizarTexto(row[4]),
        horarioCierre: normalizarTexto(row[5]),
        estado: normalizarEstadoMiembro(row[6])
      };
    })
    .filter(function(miembro) {
      return miembro.cedula && miembro.nombre;
    });
}

/**
 * Maneja solicitudes POST (registrar voto/consulta/no_voto)
 * AGREGAR LOGS PARA DEPURACION
 */
function doPost(e) {
  try {
    Logger.log('=== doPost INICIADO ===');
    Logger.log('Evento recibido: ' + JSON.stringify(e));
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data;
    
    // Intentar obtener datos de postData
    if (e && e.postData && e.postData.contents) {
      Logger.log('Datos de postData: ' + e.postData.contents);
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        Logger.log('Error parseando JSON: ' + parseError.message);
        Logger.log('Contenido: ' + e.postData.contents);
        return jsonResponse({ success: false, error: 'Error parseando JSON: ' + parseError.message });
      }
    } 
    // Si no hay postData, intentar obtener de parameter
    else if (e && e.parameter) {
      Logger.log('Datos de parameter: ' + JSON.stringify(e.parameter));
      data = e.parameter;
    }
    else {
      Logger.log('ERROR: No hay datos en el request');
      return jsonResponse({ success: false, error: 'No data received' });
    }
    
    Logger.log('Data procesada: ' + JSON.stringify(data));
    
    // Determinar si es un registro de NO VOTO
    var esNoVoto = data.estado === 'no_voto' || data.action === 'no_voto';
    Logger.log('Es no_voto: ' + esNoVoto);
    
    if (esNoVoto) {
      // Escribir en la hoja No_voto (columnas: CEDULA, APELLIDO, NOMBRE, DIRIGENTE, No_VOTO)
      var sheetNoVoto = ss.getSheetByName(SHEET_NO_VOTO);
      if (!sheetNoVoto) {
        Logger.log('ERROR: Hoja No_voto no encontrada');
        return jsonResponse({ success: false, error: 'Hoja No_voto no encontrada' });
      }
      
      var rowNoVoto = [
        data.cedula || '',
        data.apellido || '',
        data.nombre || '',
        data.dirigente || 'Sin dirigente',
        data.motivo || 'Otro'
      ];
      
      Logger.log('Escribiendo en No_voto: ' + JSON.stringify(rowNoVoto));
      sheetNoVoto.appendRow(rowNoVoto);
      Logger.log('Escrito en fila: ' + sheetNoVoto.getLastRow());
      
      return jsonResponse({ success: true, row: sheetNoVoto.getLastRow(), tipo: 'no_voto' });
    } else {
      // Escribir en la hoja Registros
      var sheetRegistros = ss.getSheetByName(SHEET_REGISTROS);
      if (!sheetRegistros) {
        Logger.log('Creando hoja Registros...');
        sheetRegistros = ss.insertSheet(SHEET_REGISTROS);
        sheetRegistros.appendRow([
          'timestamp', 'cedula', 'nombre', 'mesa', 'orden', 'estado', 'accion', 'dirigente', 'dirigenteNombre', 'origen'
        ]);
        sheetRegistros.getRange(1, 1, 1, 10)
          .setFontWeight('bold')
          .setBackground('#1e3a8a')
          .setFontColor('#ffffff');
        sheetRegistros.setFrozenRows(1);
      }
      
      var rowRegistros = [
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
      
      Logger.log('Escribiendo en Registros: ' + JSON.stringify(rowRegistros));
      sheetRegistros.appendRow(rowRegistros);
      Logger.log('Escrito en fila: ' + sheetRegistros.getLastRow());
      
      actualizarResumen(ss);
      
      return jsonResponse({ success: true, row: sheetRegistros.getLastRow(), tipo: 'registro' });
    }
    
  } catch (err) {
    Logger.log('ERROR GENERAL: ' + err.message);
    Logger.log('Stack: ' + err.stack);
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
    
    if (action === 'test') {
      // Endpoint de prueba para verificar que el POST funciona
      return jsonResponse({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        sheets: {
          registros: ss.getSheetByName(SHEET_REGISTROS) ? 'Existe' : 'No existe',
          no_voto: ss.getSheetByName(SHEET_NO_VOTO) ? 'Existe' : 'No existe',
          dirigentes: ss.getSheetByName(SHEET_DIRIGENTES) ? 'Existe' : 'No existe',
          resumen: ss.getSheetByName(SHEET_RESUMEN) ? 'Existe' : 'No existe'
        }
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
          contrasena: String(row[2] || '').trim()
        }))
        .filter(d => d.cedula && d.nombre);
      return jsonResponse({ dirigentes: dirigentes, total: dirigentes.length });
    }

    if (action === 'miembros_mesa_v2') {
      const sheet = ensureMiembrosSheet(ss);
      const miembros = obtenerMiembros(sheet);
      return jsonResponse({ miembros: miembros, total: miembros.length });
    }

    if (action === 'validar_miembro') {
      const cedula = normalizarCedula(e.parameter.cedula);
      const password = normalizarTexto(e.parameter.password);
      const sheet = ensureMiembrosSheet(ss);
      const miembros = obtenerMiembros(sheet);
      const miembro = miembros.find(m => m.cedula === cedula && m.contrasena === password);

      if (!miembro) {
        return jsonResponse({ success: false, error: 'Credenciales invÃ¡lidas' });
      }

      if (miembro.estado !== 'ACTIVO') {
        return jsonResponse({ success: false, error: 'Miembro no habilitado', estado: miembro.estado });
      }

      return jsonResponse({
        success: true,
        miembro: {
          cedula: miembro.cedula,
          nombre: miembro.nombre,
          mesa: miembro.mesa,
          horarioInicio: miembro.horarioInicio,
          horarioCierre: miembro.horarioCierre,
          estado: miembro.estado
        }
      });
    }

    if (action === 'registrar_miembro') {
      const cedula = normalizarCedula(e.parameter.cedula);
      const nombre = normalizarTexto(e.parameter.nombre);
      const password = normalizarTexto(e.parameter.password);
      const mesa = normalizarTexto(e.parameter.mesa);
      const horarioInicio = normalizarTexto(e.parameter.horarioInicio);
      const horarioCierre = normalizarTexto(e.parameter.horarioCierre);
      const estado = normalizarEstadoMiembro(e.parameter.estado);

      if (!cedula || !nombre || !password) {
        return jsonResponse({ success: false, error: 'CÃ©dula, nombre y contraseÃ±a son obligatorios' });
      }

      const sheet = ensureMiembrosSheet(ss);
      const miembros = obtenerMiembros(sheet);
      const existente = miembros.find(m => m.cedula === cedula);
      const row = [[cedula, nombre, password, mesa, horarioInicio, horarioCierre, estado]];

      if (existente) {
        sheet.getRange(existente.rowNumber, 1, 1, 7).setValues(row);
        return jsonResponse({ success: true, accion: 'actualizado', row: existente.rowNumber });
      }

      sheet.appendRow(row[0]);
      return jsonResponse({ success: true, accion: 'creado', row: sheet.getLastRow() });
    }
    
    if (action === 'miembros_mesa') {
      const sheet = ensureMiembrosSheet(ss);
      if (!sheet || sheet.getLastRow() < 2) {
        return jsonResponse({ miembros: [], total: 0 });
      }
      const miembros = obtenerMiembros(sheet);
      return jsonResponse({ miembros: miembros, total: miembros.length });
    }
    
    // NUEVO: Endpoint para registrar voto/no_voto via GET (mÃ¡s confiable en GAS)
    if (action === 'registrar') {
      var data = e.parameter;
      Logger.log('Registrar via GET: ' + JSON.stringify(data));
      
      var esNoVoto = data.estado === 'no_voto';
      
      if (esNoVoto) {
        var sheetNoVoto = ss.getSheetByName(SHEET_NO_VOTO);
        if (!sheetNoVoto) {
          return jsonResponse({ success: false, error: 'Hoja No_voto no encontrada' });
        }
        
        var rowNoVoto = [
          data.cedula || '',
          data.apellido || '',
          data.nombre || '',
          data.dirigente || 'Sin dirigente',
          data.motivo || 'Otro'
        ];
        
        sheetNoVoto.appendRow(rowNoVoto);
        return jsonResponse({ success: true, row: sheetNoVoto.getLastRow(), tipo: 'no_voto' });
      } else {
        var sheetRegistros = ss.getSheetByName(SHEET_REGISTROS);
        if (!sheetRegistros) {
          sheetRegistros = ss.insertSheet(SHEET_REGISTROS);
          sheetRegistros.appendRow(['timestamp', 'cedula', 'nombre', 'mesa', 'orden', 'estado', 'accion', 'dirigente', 'dirigenteNombre', 'origen']);
          sheetRegistros.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
          sheetRegistros.setFrozenRows(1);
        }
        
        var rowRegistros = [
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
        
        sheetRegistros.appendRow(rowRegistros);
        actualizarResumen(ss);
        return jsonResponse({ success: true, row: sheetRegistros.getLastRow(), tipo: 'registro' });
      }
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message || 'Internal error' });
  }
}

/**
 * Actualiza la hoja de Resumen con estadÃ­sticas por mesa
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
 * Se ejecuta automÃ¡ticamente al abrir la hoja
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

