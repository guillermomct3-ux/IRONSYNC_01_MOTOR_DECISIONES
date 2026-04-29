const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function verificarFolio(req, res) {
  const { folio } = req.params;

  // 1. Obtener el último hash guardado para este folio
  const { data: hashRow, error: hashError } = await supabase
    .from('pdf_hashes')
    .select('sha256, creado_at')
    .eq('folio', folio)
    .order('creado_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (hashError || !hashRow) {
    return res.status(404).send(
      '<html><body style="font-family:sans-serif;max-width:600px;margin:4rem auto;text-align:center;">' +
      '<h2>Documento no encontrado</h2>' +
      '<p>Folio ' + folio + ' no existe en el registro de IronSync.</p>' +
      '</body></html>'
    );
  }

  // 2. Intentar descargar el PDF original desde Storage
  const { data: fileData, error: fileError } = await supabase
    .storage
    .from('reportes')
    .download('pdfs/' + folio + '.pdf');

  let esValido = false;
  let hashReal = 'No disponible';

  if (!fileError && fileData) {
    const buffer = Buffer.from(await fileData.arrayBuffer());
    hashReal = crypto.createHash('sha256').update(buffer).digest('hex');
    esValido = (hashReal === hashRow.sha256);
  }

  const color = esValido ? 'green' : 'red';
  const texto = esValido ? 'DOCUMENTO AUTENTICO' : 'DOCUMENTO ALTERADO / NO COINICIDE';
  const desc = esValido
    ? 'El PDF que posee coincide exactamente con el registrado por IronSync.'
    : 'El archivo que enviaron ha sido modificado despues de su firma.';

  res.send(
    '<html><head><title>IronSync - Verificar documento</title></head>' +
    '<body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;">' +
    '<h1>IronSync - Verificacion de autenticidad</h1>' +
    '<p><strong>Folio:</strong> ' + folio + '</p>' +
    '<p><strong>Fecha de registro:</strong> ' + new Date(hashRow.creado_at).toLocaleString('es-MX') + '</p>' +
    '<hr/>' +
    '<h2>Estado: <span style="color:' + color + '">' + texto + '</span></h2>' +
    '<p>' + desc + '</p>' +
    '<hr/>' +
    '<details><summary>Detalles tecnicos</summary>' +
    '<p>Hash guardado: <code>' + hashRow.sha256 + '</code></p>' +
    '<p>Hash calculado: <code>' + hashReal + '</code></p>' +
    '</details>' +
    '<p><a href="/">Volver al inicio</a></p>' +
    '</body></html>'
  );
}

module.exports = { verificarFolio };
