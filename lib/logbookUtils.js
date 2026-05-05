const { normalizarE164 } = require('./telefono');

function variantesTelefono(raw) {
  if (!raw) return [];
  const e164 = normalizarE164(raw);
  if (!e164) return [];
  const sinMas = e164.replace(/^\+/, '');
  const conMas = '+' + sinMas;
  const variantes = new Set([e164, sinMas, conMas]);
  if (sinMas.startsWith('52') && sinMas.length === 12) {
    variantes.add('521' + sinMas.slice(2));
    variantes.add('+521' + sinMas.slice(2));
  }
  if (sinMas.startsWith('521') && sinMas.length === 13) {
    variantes.add('52' + sinMas.slice(3));
    variantes.add('+52' + sinMas.slice(3));
  }
  return Array.from(variantes).filter(Boolean);
}

function parseHorometro(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const normalized = String(raw).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return value;
}

function extraerComandoLogbook(texto) {
  if (!texto) return null;
  const limpio = String(texto).trim().replace(/\s+/g, ' ');
  const tokens = limpio.split(' ');
  const accion = tokens[0] ? tokens[0].toUpperCase() : null;
  if (!accion || !['INICIO', 'FIN'].includes(accion)) return null;
  const maquina = tokens[1] ? tokens[1].toUpperCase() : null;
  const horometro = tokens[2] ? parseHorometro(tokens[2]) : null;
  return { accion, maquina, horometro, raw: limpio };
}

function detectarCanal(params) {
  if (params.horometro === null || params.horometro === undefined) return 'qr_legacy';
  return 'manual';
}

module.exports = { variantesTelefono, parseHorometro, extraerComandoLogbook, detectarCanal };
