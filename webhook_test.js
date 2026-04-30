require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const supabase = require("./lib/supabaseClient");
const { procesarInicioTurno, procesarFinTurno, procesarReporteHoras, procesarFoto, verificarZombies, procesarParo, procesarFalla, procesarReanuda, procesarSeleccionMenu, procesarTextoLibreParo, estaEnFlujoMenu } = require("./turnos");
const { requiresAuth, login, getOperador } = require("./services/authService");
const { procesarMensajeFirma } = require("./webhooks/whatsapp");
const signaturesRouter = require("./api/v1/signatures");
