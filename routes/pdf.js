// IRONSYNC SIGN - PDF Routes v2.0
const express = require('express');
const router = express.Router();
const { generarPDFConciliacion } = require('../services/pdfConciliacion');

router.post('/generar/:turnoId', async (req, res) => {
  const { turnoId } = req.params;
  try {
    const pdfBuffer = await generarPDFConciliacion(turnoId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=conciliacion_' + turnoId + '.pdf',
      'Content-Length': pdfBuffer.length
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF Error]:', err.message);
    if (err.message === 'Turno no encontrado') return res.status(404).json({ error: err.message });
    if (err.message === 'El turno no tiene firma del residente') return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Error generando PDF' });
  }
});

module.exports = router;
