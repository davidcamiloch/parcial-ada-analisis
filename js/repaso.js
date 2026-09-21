/* repaso.js – Fase 7: Repaso rápido (20 min) armado con los errores frecuentes, la cola de repaso y los exámenes; y acceso a la chuleta. */
(function () {
  'use strict';

  // Qué ejercicios atacan cada etiqueta de error
  const POR_TAG = {
    decl: ['A02', 'A01'], asig: ['A06', 'A02'], upd: ['A03', 'A02'], acum: ['A02', 'A09'], indice: ['A02', 'B14'], k: ['A01', 'A19'], ret: ['A05'], if: ['A05', 'C01'], rama: ['A05', 'A16'],
    cond: ['C01', 'A08'], condveces: ['A02', 'V01', 'A03'], nunca: ['V14', 'A25', 'X12'], noejec: ['V14', 'A25'],
    veces: ['V03', 'V07', 'V10', 'V13', 'V19'], vecesif: ['C01'], tn: ['A02', 'A14', 'A24'], inv: ['A02', 'A03'],
    bigo: ['Q06', 'Q07', 'Q21', 'A22', 'A25'], tipoC: ['C01', 'C04', 'X14'], teoria: ['Q03', 'Q08', 'Q12'], escalamiento: ['E01', 'E02', 'E03'],
    estrategia: ['B16', 'B12', 'B02'], codigo: ['B16', 'B18'], mejorpeor: ['B16', 'B12', 'A16', 'V18'],
    sumatorias: ['A14', 'A15', 'A10'], oe: ['A02', 'A24'], vueltas: ['V07', 'V10', 'V15'], invariante: ['A02'], analisis: ['C01', 'C03'], comparacion: ['C01'], conclusion: ['C04']
  };
  const BASE = ['A02', 'V07', 'V15', 'A14', 'A25', 'B16', 'C01', 'Q21'];

  ADA.planRepaso = function () {
    const e = ADA.estado; const ids = [];
    const push = (id) => { if (ADA.porId[id] && !ids.includes(id) && ids.length < 8) ids.push(id); };
    // 1) cola de repaso (puntaje < 70)
    Object.keys(e.repaso || {}).forEach(push);
    // 2) qué repasar del último examen
    const ex = (e.examenes || []).slice(-1)[0];
    if (ex) ex.repasar.forEach((k) => (POR_TAG[k] || []).forEach(push));
    // 3) errores frecuentes
    Object.entries(e.errores || {}).sort((a, b) => b[1] - a[1]).forEach(([t]) => (POR_TAG[t] || []).forEach(push));
    // 4) relleno con la base
    BASE.forEach(push);
    return ids;
  };

  ADA.vista('repaso', function (cont) {
    const act = ADA.estado.repasoActivo;
    const ids = act ? act.ids : ADA.planRepaso();
    const e = ADA.estado;
    const errores = Object.entries(e.errores || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
    cont.innerHTML = `<p class="sub"><a href="#inicio">← Inicio</a></p><h1>📄 Chuleta y repaso rápido</h1>
      <div class="dos">
        <div class="panel"><h3>🖨 Chuleta de 1 página</h3><p class="ayuda">Convención del profe, vueltas, sumatorias, logaritmos, método y trampas. Imprímela y repásala la noche anterior.</p><div class="acciones"><a href="chuleta.html" target="_blank"><button class="primario">Abrir chuleta</button></a></div></div>
        <div class="panel"><h3>⏱ Repaso rápido (20 min)</h3><p class="ayuda">${act ? 'Tienes un repaso en curso.' : 'Plan armado con: ejercicios con nota baja, lo marcado en tu último examen y tus errores más frecuentes' + (errores.length ? ' (' + errores.map(([t, c]) => c + '× ' + (ADA.TAGS[t] || t)).join('; ') + ')' : '') + '.'}</p>
          <ol>${ids.map((id, i) => { const d = ADA.porId[id]; const p = e.puntajes[id]; return `<li${act && i < act.k ? ' style="opacity:.5;text-decoration:line-through"' : ''}><a href="#ej?id=${id}">${id}</a> · ${ADA.esc(d.titulo)} <span class="ayuda">(Fase ${d.fase}${p ? ', mejor ' + p.mejor : ', nuevo'})</span></li>`; }).join('')}</ol>
          <div class="acciones">${act ? `<button class="primario" onclick="ADA.ir('ej',{id:'${ids[act.k] || ids[0]}'})">Continuar (${act.k + 1}/${ids.length})</button><button onclick="delete ADA.estado.repasoActivo;ADA.guardar();ADA.renderRuta();">Terminar repaso</button>` : `<button class="primario" id="btnIni">Empezar repaso de 20 min ▶</button><button id="btnRe">Rearmar plan</button>`}</div></div>
      </div>
      <div class="panel"><h3>Checklist del miércoles temprano</h3><ol>
        <li>Ronda de 10 preguntas de teoría (Fase 5) — 5 min.</li><li>Repaso rápido de 20 min (arriba).</li><li>Lee la chuleta completa una vez, sin apuros — 5 min.</li><li>En el parcial: primero lee TODOS los puntos; empieza por el tipo A que mejor veas; escribe costos al frente de cada línea antes de cualquier sumatoria; deja el Big-O con su justificación al final de cada punto.</li></ol></div>`;
    const b = cont.querySelector('#btnIni'); if (b) b.onclick = () => { ADA.estado.repasoActivo = { ids, k: 0, inicio: Date.now(), min: 20 }; ADA.guardar(); ADA.ir('ej', { id: ids[0] }); };
    const r = cont.querySelector('#btnRe'); if (r) r.onclick = () => ADA.renderRuta();
  });

  /* Barra flotante durante el repaso: progreso, tiempo restante, siguiente */
  let timer = null;
  ADA.barraRepaso = function () {
    const viejo = document.getElementById('barraRepaso'); if (viejo) viejo.remove(); clearInterval(timer);
    const act = ADA.estado.repasoActivo; if (!act) return;
    const m = /#ej\?id=([A-Z0-9]+)/.exec(location.hash); const id = m && m[1];
    const idx = id ? act.ids.indexOf(id) : -1;
    if (idx >= 0 && idx > act.k) { act.k = idx; ADA.guardar(); }
    const bar = ADA.el(`<div id="barraRepaso" class="barra-repaso"><span>⏱ Repaso <b>${Math.min(act.k + 1, act.ids.length)}/${act.ids.length}</b> · <span id="brT">--:--</span></span><span class="espacio"></span>${act.k + 1 < act.ids.length ? `<button class="primario" id="brSig">Siguiente → ${act.ids[act.k + 1]}</button>` : '<button class="primario" id="brFin">Terminar ✔</button>'}<button id="brPlan">Plan</button></div>`);
    document.body.appendChild(bar);
    const fin = act.inicio + act.min * 60000;
    const tick = () => { const rest = fin - Date.now(); const s = Math.max(0, Math.floor(rest / 1000)); const t = document.getElementById('brT'); if (t) { t.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') + (rest < 0 ? ' (¡se acabó!)' : ''); } };
    tick(); timer = setInterval(tick, 1000);
    const sig = document.getElementById('brSig'); if (sig) sig.onclick = () => { act.k++; ADA.guardar(); ADA.ir('ej', { id: act.ids[act.k] }); };
    const f = document.getElementById('brFin'); if (f) f.onclick = () => { delete ADA.estado.repasoActivo; ADA.guardar(); ADA.toast('Repaso terminado. ¡A por el 5.0!', 'ok'); ADA.ir('repaso'); };
    document.getElementById('brPlan').onclick = () => ADA.ir('repaso');
  };
})();
