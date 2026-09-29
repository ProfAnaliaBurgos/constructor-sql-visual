// ============================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ============================================================
const SUPABASE_URL = 'https://ksqwemerqysrjqwftnkr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iTHJEcRnoaq-DNIqrJgl0w_pOyYM1DF';

// Inicialización desde el CDN
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// 2. ESTADO Y MANEJO DE TOKENS (PIZARRA SQL)
// ============================================================
let tokensConsulta = [];

// Agrega un token o palabra a la consulta
function agregarToken(valor) {
  tokensConsulta.push(valor);
  actualizarVisor();
}

// Agrega un texto o número ingresado manualmente por el usuario
// Agrega exactamente lo que el alumno escribe en el campo de texto
function agregarValorManual() {
  const input = document.getElementById('input-valor');
  const valor = input.value.trim();

  if (!valor) return;

  // Agrega el token tal cual lo tipeó el alumno
  agregarToken(valor);
  input.value = '';
}

// Borra el último elemento agregado
function borrarUltimo() {
  tokensConsulta.pop();
  actualizarVisor();
}

// Limpia toda la pizarra y la tabla de resultados
function limpiarTodo() {
  tokensConsulta = [];
  actualizarVisor();
  document.getElementById('contenedor-resultado').innerHTML = 
    '<p class="empty-msg">Ejecuta una consulta para ver los registros aquí.</p>';
}

// Actualiza la pantalla del visor SQL
function actualizarVisor() {
  const visor = document.getElementById('visor-sql');
  if (tokensConsulta.length === 0) {
    visor.innerHTML = '<span class="placeholder">Haz clic en los botones para armar la consulta...</span>';
    return;
  }
  
  visor.textContent = tokensConsulta.join(' ');
}

// ============================================================
// 3. EJECUCIÓN Y RENDERIZADO DE RESULTADOS
// ============================================================
async function ejecutarConsulta() {
  const contenedor = document.getElementById('contenedor-resultado');
  const queryStr = tokensConsulta.join(' ').trim();

  // Validación 1: Consulta vacía
  if (!queryStr) {
    contenedor.innerHTML = '<p class="error-msg">⚠️ La consulta está vacía. Seleccioná algunos comandos primero.</p>';
    return;
  }

  // Validación 2: Falta la cláusula FROM (Previene el error de PostgreSQL)
  if (!tokensConsulta.map(t => t.toUpperCase()).includes('FROM')) {
    contenedor.innerHTML = '<p class="error-msg">⚠️ Te falta agregar la cláusula <b>FROM</b> y seleccionar la tabla de donde vas a consultar los datos.</p>';
    return;
  }

  contenedor.innerHTML = '<p class="empty-msg">⏳ Ejecutando consulta en Supabase...</p>';

  try {
    // Enviamos el SQL completo a la función RPC de PostgreSQL
    const { data, error } = await supabaseClient.rpc('ejecutar_sql_nativo', {
      query_text: queryStr
    });

    if (error) throw error;

    // Dibujamos la tabla HTML con los datos
    renderizarTabla(data);

  } catch (err) {
    console.error('Error SQL:', err);
    
    // Traducimos errores comunes para los chicos
    let mensajeError = err.message;
    if (mensajeError.includes('syntax error')) {
      mensajeError = 'Error de sintaxis en tu consulta. Revisá el orden de los comandos o si falta una coma / comilla.';
    }

    contenedor.innerHTML = `<p class="error-msg">❌ Error SQL: ${mensajeError}</p>`;
  }
}

// Genera dinámicamente la tabla HTML según la estructura de los datos devueltos
function renderizarTabla(datos) {
  const contenedor = document.getElementById('contenedor-resultado');

  if (!datos || datos.length === 0) {
    contenedor.innerHTML = '<p class="empty-msg">🔍 La consulta se ejecutó correctamente pero no devolvió ningún registro.</p>';
    return;
  }

  // Obtenemos los nombres de las columnas a partir de las propiedades del primer objeto
  const columnas = Object.keys(datos[0]);

  let htmlTable = '<table class="sql-table"><thead><tr>';
  columnas.forEach(col => {
    htmlTable += `<th>${col}</th>`;
  });
  htmlTable += '</tr></thead><tbody>';

  datos.forEach(fila => {
    htmlTable += '<tr>';
    columnas.forEach(col => {
      const valor = fila[col] !== null && fila[col] !== undefined ? fila[col] : '<i style="color:#6c7086">NULL</i>';
      htmlTable += `<td>${valor}</td>`;
    });
    htmlTable += '</tr>';
  });

  htmlTable += '</tbody></table>';
  contenedor.innerHTML = htmlTable;
}