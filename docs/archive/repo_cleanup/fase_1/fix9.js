const fs = require("fs");
let c = fs.readFileSync("flows/admin.js", "utf8");
let cambios = 0;

// FIX 9a: Verificar empresa creada
const oldEmpresa = '.single();\n\n        await supabase.from("usuarios").insert({';
const newEmpresa = '.single();\n\n        if (!nuevaEmpresa) {\n          return "Error al crear empresa. Intenta de nuevo.";\n        }\n\n        await supabase.from("usuarios").insert({';

if (c.includes(oldEmpresa)) {
  c = c.replace(oldEmpresa, newEmpresa);
  cambios++;
  console.log("FIX 9a: Verificar empresa creada");
}

// FIX 9b: Verificar equipo creado
const oldEquipo = '.single();\n\n      await saveSession(telefono, "admin_onboarding", "esperando_siguiente_accion",';
const newEquipo = '.single();\n\n      if (!nuevoEquipo) {\n        return "Error al guardar maquina. Intenta de nuevo.";\n      }\n\n      await saveSession(telefono, "admin_onboarding", "esperando_siguiente_accion",';

if (c.includes(oldEquipo)) {
  c = c.replace(oldEquipo, newEquipo);
  cambios++;
  console.log("FIX 9b: Verificar equipo creado");
}

// FIX 9c: Verificar operador creado
const oldOperador = '.single();\n\n      await supabase\n        .from("asignaciones")\n        .insert({';
const newOperador = '.single();\n\n      if (!nuevoOperador) {\n        return "Error al crear operador. Intenta de nuevo.";\n      }\n\n      await supabase\n        .from("asignaciones")\n        .insert({';

if (c.includes(oldOperador)) {
  c = c.replace(oldOperador, newOperador);
  cambios++;
  console.log("FIX 9c: Verificar operador creado");
}

fs.writeFileSync("flows/admin.js", c);
console.log("FIX 9 TOTAL: " + cambios + " validaciones aplicadas");
