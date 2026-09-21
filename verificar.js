#!/usr/bin/env node
/* verificar.js – VERIFICACIÓN OBLIGATORIA.
   Ejecuta la versión instrumentada de cada ejercicio (todas sus variantes) para varios n y comprueba:
     1. veces(línea) declarada == conteo real, para cada línea y cada n.
     2. T(n) canónico (Σ costo×veces) == Σ costo×conteo real (ambas convenciones).
     3. La forma cerrada Tn declarada == Σ costo×veces (equivalencia algebraica numérica).
     4. bigO declarado es del mismo orden que Tn.
     5. Para cada ciclo: (hasta − desde + 1) == t  y  veces(cond) == t + 1 (o 1 si no entra).
   Uso: node verificar.js [--solo A02]  → sale con código 1 si algo falla. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const F = require('./js/formulas.js');
const ctx = { window: null, console, Math, Array, Object, String, Number, Set, Map, JSON, isFinite, Error, Date, localStorage: undefined, document: undefined, location: undefined, katex: undefined };
ctx.window = ctx; ctx.globalThis = ctx; ctx.Formulas = F;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'js/nucleo.js'), 'utf8'), ctx, { filename: 'nucleo.js' });
const ADA = ctx.ADA;
const dataDir = path.join(__dirname, 'data');
for (const f of fs.readdirSync(dataDir).filter((x) => /^f\d+.*\.js$/.test(x)).sort()) {
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), 'utf8'), ctx, { filename: f });
}

const solo = (() => { const i = process.argv.indexOf('--solo'); return i > 0 ? process.argv[i + 1] : null; })();
const NS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 16, 17, 31, 32, 50, 81, 82, 100, 243, 1000];
const K = 3;
const fallos = [];
let checks = 0;
function fallo(id, msg) { fallos.push('[' + id + '] ' + msg); }

class Contador {
  constructor() { this.cnt = {}; this.traza = []; }
  c(id) { this.cnt[id] = (this.cnt[id] || 0) + 1; }
  v(obj) { if (this.traza.length < 2000) this.traza.push(Object.assign({}, obj)); }
}

function verificarMetodo(id, inst, casos) {
  const plano = ADA.aplanar(inst.lineas);
  const ids = new Set(plano.map((L) => L.id));
  const dup = plano.map((L) => L.id).filter((x, i, a) => a.indexOf(x) !== i);
  if (dup.length) fallo(id, 'ids de línea duplicados: ' + dup.join(','));
  for (const n of NS) {
    if (inst.nMin && n < inst.nMin) continue;
    if (inst.nMax && n > inst.nMax) continue;
    for (const [nombreCaso, datos] of casos) {
      const C = new Contador();
      const datosN = typeof datos === 'function' ? datos(n) : datos;
      try { inst.ejecutar(n, C, datosN); } catch (e) { fallo(id, 'ejecutar lanzó error en n=' + n + ' (' + nombreCaso + '): ' + e.message); continue; }
      for (const idL of Object.keys(C.cnt)) if (!ids.has(idL)) fallo(id, 'ejecutar cuenta un id que no existe en lineas: ' + idL);
      // 1. veces por línea
      const vecesDe = (L) => (nombreCaso === 'peor' && L.vecesPeor) ? L.vecesPeor : (nombreCaso === 'mejor' && L.vecesMejor) ? L.vecesMejor : L.veces;
      for (const L of plano) {
        checks++;
        let esperado;
        try { esperado = F.ev(vecesDe(L), { n }); } catch (e) { fallo(id, 'veces inválido en línea ' + L.id + ': ' + vecesDe(L)); continue; }
        const real = C.cnt[L.id] || 0;
        if (inst.cota && L.cota) { if (esperado < real - 1e-9) fallo(id, `línea "${L.id}" (cota) n=${n}: veces declarado=${vecesDe(L)}→${esperado} es MENOR que el real=${real}`); }
        else if (Math.abs(esperado - real) > 1e-9) fallo(id, `línea "${L.id}" (${nombreCaso}) n=${n}: veces declarado=${vecesDe(L)}→${esperado} pero real=${real}`);
      }
      // 2b. TnMejor (forma cerrada del mejor caso) vs conteo real del caso 'mejor'
      if (nombreCaso === 'mejor' && inst.TnMejor) {
        for (const conv of ['prof', 'hojas']) {
          if (!inst.TnMejor[conv]) continue;
          checks++;
          let real = 0; for (const L of plano) real += ADA.evalCosto(ADA.costoTxt(L, conv), K, n) * (C.cnt[L.id] || 0);
          let cerrada; try { cerrada = F.ev(inst.TnMejor[conv], { n, k: K }); } catch (e) { fallo(id, 'TnMejor.' + conv + ' inválido'); continue; }
          if (Math.abs(cerrada - real) > 1e-6) fallo(id, `TnMejor.${conv} = "${inst.TnMejor[conv]}" da ${cerrada} en n=${n} pero el conteo real (mejor) es ${real}`);
        }
      }
      // 2. T(n) numérico vs conteo real (solo caso base, o cuando el ejercicio dice qué caso es su T(n))
      const casoTn = inst.casoTn || 'base';
      if (nombreCaso === casoTn) {
        for (const conv of ['prof', 'hojas']) {
          checks++;
          let canon = 0, real = 0;
          for (const L of plano) {
            const c = ADA.evalCosto(ADA.costoTxt(L, conv), K, n);
            canon += c * F.ev(vecesDe(L), { n });
            real += c * (C.cnt[L.id] || 0);
          }
          if (inst.realOE) real = inst.realOE(n, conv, K, C); // ejercicios con llamadas cuyo argumento cambia: OE reales contadas aparte
          if (inst.cota) { if (n >= 2 && (canon < real - 1e-6 || canon > 4 * real)) fallo(id, `T(n) ${conv} n=${n} (cota): canon=${canon} debe ser ≥ real=${real} y no más de 4×`); }
          else if (Math.abs(canon - real) > 1e-6) fallo(id, `T(n) ${conv} n=${n}: Σcosto×veces=${canon} ≠ Σcosto×real=${real}`);
          // 3. forma cerrada
          if (inst.Tn && inst.Tn[conv]) {
            checks++;
            let cerrada;
            try { cerrada = F.ev(inst.Tn[conv], { n, k: K }); } catch (e) { fallo(id, 'Tn.' + conv + ' inválido: ' + e.message); continue; }
            if (inst.cota) { if (Math.abs(cerrada - canon) > 1e-6) fallo(id, `Tn.${conv} = "${inst.Tn[conv]}" da ${cerrada} en n=${n} pero Σcosto×veces (cota) es ${canon}`); }
            else if (Math.abs(cerrada - real) > 1e-6) fallo(id, `Tn.${conv} = "${inst.Tn[conv]}" da ${cerrada} en n=${n} pero el conteo real es ${real}`);
          }
        }
      }
    }
  }
  // 4. bigO
  if (inst.Tn && inst.bigO) {
    checks++;
    const r = F.mismoOrden(inst.Tn.prof, inst.bigO, { permitirK: true });
    if (!r.ok) fallo(id, `bigO "${inst.bigO}" no es del orden de Tn "${inst.Tn.prof}"`);
  }
  // 5. ciclos
  for (const L of plano) {
    if (!L.padre) continue;
    const c = L.padre.ciclo;
    if (L.rol === 'cond' && !c.total) {
      for (const n of NS.slice(0, 8)) {
        checks++;
        const t = F.ev(c.t, { n });
        const v = F.ev(L.veces, { n });
        if (Math.abs(v - (t + 1)) > 1e-9) fallo(id, `cond del ciclo ${L.padre.id}: veces=${L.veces} debería ser t+1 con t=${c.t} (n=${n})`);
        if (c.desde != null && c.hasta != null) {
          const span = F.ev(c.hasta, { n }) - F.ev(c.desde, { n }) + 1;
          if (t > 0 && Math.abs(span - t) > 1e-9) fallo(id, `ciclo ${L.padre.id}: (hasta−desde+1)=${span} ≠ t=${t} en n=${n}`);
        }
      }
    }
  }
}

/** Tipo V (¿cuántas vueltas?): la traza debe dar t vueltas (exacto o ±tolerancia) para todo n. */
function verificarVueltas(id, inst) {
  const casos = inst.casos ? Object.entries(inst.casos).map(([nombre, c]) => ({ nombre, t: c.t, datos: c.datos })) : [{ nombre: 'base', t: inst.t, datos: null }];
  for (const n of NS) {
    if (inst.nMin && n < inst.nMin) continue;
    const is = inst.conI ? inst.datosI(n) : [null];
    for (const c of casos) for (const iVal of is) {
      checks++;
      const datos = inst.conI ? iVal : (typeof c.datos === 'function' ? c.datos(n) : c.datos);
      let pasos;
      try { pasos = inst.traza(n, datos); } catch (e) { fallo(id, `traza lanzó error n=${n} (${c.nombre}): ${e.message}`); continue; }
      if (!pasos.length || pasos[pasos.length - 1].cond !== false) { fallo(id, `traza n=${n} (${c.nombre}): la última evaluación debe ser falsa`); continue; }
      if (pasos.slice(0, -1).some((p) => p.cond !== true)) { fallo(id, `traza n=${n} (${c.nombre}): hay evaluaciones falsas antes del final`); continue; }
      const real = pasos.length - 1;
      const env = { n, i: iVal == null ? 0 : iVal };
      let esp; try { esp = F.ev(c.t, env); } catch (e) { fallo(id, 't inválido: ' + c.t); continue; }
      const tol = inst.tolerancia || 0;
      if (Math.abs(esp - real) > tol + 1e-9) fallo(id, `n=${n}${iVal != null ? ', i=' + iVal : ''} (${c.nombre}): t="${c.t}" → ${esp} pero la traza da ${real} (tolerancia ${tol})`);
      if (inst.tExacto && c.nombre === 'base') {
        const ex = F.ev(inst.tExacto, env);
        if (Math.abs(ex - real) > 1e-9) fallo(id, `n=${n}: tExacto="${inst.tExacto}" → ${ex} pero la traza da ${real}`);
      }
    }
  }
}

/** Tipo R (recursivo): llamadas(n) declarado vs llamadas reales; T(n) cerrado vs OE contadas (con tolerancia si es log). */
function verificarRecursivo(id, inst) {
  for (const n of NS) {
    if (inst.nMin && n < inst.nMin) continue;
    if (inst.nMax && n > inst.nMax) continue;
    const C = new Contador();
    let r; try { r = inst.ejecutar(n, C); } catch (e) { fallo(id, 'ejecutar lanzó error n=' + n + ': ' + e.message); continue; }
    checks++;
    const llamadas = C.cnt.llamada || 0;
    const esp = F.ev(inst.llamadas, { n });
    const tol = inst.tolerancia || 0;
    if (Math.abs(esp - llamadas) > tol + 1e-9) fallo(id, `n=${n}: llamadas="${inst.llamadas}" → ${esp} pero se hicieron ${llamadas}`);
    if (inst.Tn && inst.Tn.prof && !inst.tolerancia) {
      const t = F.ev(inst.Tn.prof, { n, k: K });
      const real = (r && r.oe != null) ? r.oe : null;
      if (real != null && Math.abs(t - real) > 1e-6) fallo(id, `n=${n}: Tn="${inst.Tn.prof}" → ${t} pero OE reales = ${real}`);
    }
  }
  if (inst.Tn && inst.bigO) { checks++; const r = F.mismoOrden(inst.Tn.prof, inst.bigO, { permitirK: true }); if (!r.ok) fallo(id, `bigO "${inst.bigO}" no es del orden de Tn "${inst.Tn.prof}"`); }
  // orden medido: razón OE(2n)/OE(n) frente al Big-O declarado
  if (inst.bigO) {
    const oe = (n) => { const C = new Contador(); const r = inst.ejecutar(n, C); return r && r.oe != null ? r.oe : Object.values(C.cnt).reduce((a, b) => a + b, 0); };
    const g = (n) => F.ev(inst.bigO, { n });
    const q1 = oe(64) / g(64), q2 = oe(512) / g(512);
    checks++;
    if (!(q2 / q1 > 1 / 3 && q2 / q1 < 3)) fallo(id, `el crecimiento medido no parece O(${inst.bigO}): OE(64)/g=${q1.toFixed(2)}, OE(512)/g=${q2.toFixed(2)}`);
  }
}

const verificados = [];
for (const def of ADA.ejercicios) {
  if (solo && def.id !== solo) continue;
  for (let v = 0; v < def.variantes.length; v++) {
    const inst = ADA.instancia(def, v);
    const id = def.id + (def.variantes.length > 1 ? '/v' + v : '');
    const antes = fallos.length;
    if (inst.tipo === 'V') { verificarVueltas(id, inst); if (fallos.length === antes) verificados.push(id); continue; }
    if (inst.tipo === 'R') { verificarRecursivo(id, inst); if (fallos.length === antes) verificados.push(id); continue; }
    if (inst.tipo === 'Q') {
      checks++;
      if (inst.tipoQ === 'opcion') { const oks = inst.opciones.filter((o) => o.ok).length; if (oks !== 1) fallo(id, 'debe haber exactamente 1 opción correcta (hay ' + oks + ')'); if (inst.opciones.some((o) => !o.ok && !o.porque)) fallo(id, 'opción incorrecta sin explicación'); }
      else if (inst.tipoQ === 'num') { if (!isFinite(inst.respuesta)) fallo(id, 'respuesta numérica inválida'); }
      else if (inst.tipoQ === 'orden') { const f = { '1': (n) => 1, '5': (n) => 5, 'log n': (n) => Math.log2(n), 'log₃ n': (n) => Math.log(n) / Math.log(3), 'log² n': (n) => Math.log2(n) ** 2, '√n': Math.sqrt, 'n': (n) => n, 'n/2': (n) => n / 2, 'n log n': (n) => n * Math.log2(n), 'n^1.5': (n) => n ** 1.5, 'n²': (n) => n * n, 'n² log n': (n) => n * n * Math.log2(n), 'n³': (n) => n ** 3, '2ⁿ': (n) => 2 ** n, 'n·2ⁿ': (n) => n * 2 ** n, 'n!': (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; } };
        for (let i = 1; i < inst.orden.length; i++) { const a = f[inst.orden[i - 1]], b = f[inst.orden[i]]; if (!a || !b) { fallo(id, 'función sin evaluador: ' + inst.orden[i - 1] + ' / ' + inst.orden[i]); continue; } const menor = (n) => { const x = a(n), y = b(n); return isFinite(x) && isFinite(y) ? x < y : null; }; let r = menor(1e6); if (r === null) r = menor(1e7); if (r === null) r = menor(40) && menor(60); if (!r) fallo(id, 'orden dudoso entre ' + inst.orden[i - 1] + ' y ' + inst.orden[i]); } }
      if (fallos.length === antes) verificados.push(id); continue;
    }
    const metodos = inst.metodos ? inst.metodos : [inst];
    for (const m of metodos) {
      const casos = [['base', null]];
      if (m.datos) { for (const nombre of Object.keys(m.datos)) casos.push([nombre, m.datos[nombre]]); }
      const mid = inst.metodos ? id + ':' + (m.titulo || '') : id;
      try { verificarMetodo(mid, m, casos); } catch (e) { fallo(mid, 'excepción verificando: ' + e.stack); }
    }
    if (fallos.length === antes) verificados.push(id);
  }
}

console.log('Ejercicios/variantes verificados OK: ' + verificados.length + ' (' + checks + ' comprobaciones)');
for (const v of verificados) console.log('  ✓ ' + v);
if (fallos.length) {
  console.error('\nFALLOS (' + fallos.length + '):');
  const vistos = new Set();
  for (const f of fallos) { const k = f.slice(0, 160); if (vistos.has(k)) continue; vistos.add(k); console.error('  ✗ ' + f); }
  process.exit(1);
} else {
  if (!solo) fs.writeFileSync(path.join(dataDir, '_verificado.js'), '/* generado por verificar.js – no editar */\nwindow.ADA_VERIFICADO = ' + JSON.stringify({ fecha: new Date().toISOString(), ids: ADA.ejercicios.map((e) => e.id) }) + ';\n');
  console.log('Todo verificado. Sello escrito en data/_verificado.js');
}
