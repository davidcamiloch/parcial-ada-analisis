/* vueltas.js – Fase 2: "¿Cuántas vueltas?" con traza animada. */
(function () {
  'use strict';
  const F = window.Formulas;
  const NS_PRUEBA = [10, 5, 7, 12, 16, 17, 31, 32, 50, 100, 243, 1000, 8, 9, 11, 6, 4, 3, 2, 1]; // primero n "ilustrativos", los degenerados al final

  const TABLA_FORMULAS = `
    <table class="cmp" style="font-size:13px"><tr><th>salto</th><th>condición</th><th>t</th></tr>
    <tr><td>i += m</td><td>i &lt; n</td><td>(n − inicio)/m redondeado arriba</td></tr>
    <tr><td>i += m</td><td>i &lt;= n</td><td>(n − inicio)/m redondeado abajo + 1</td></tr>
    <tr><td>i −= m</td><td>i &gt; n</td><td>(inicio − n)/m redondeado arriba</td></tr>
    <tr><td>i −= m</td><td>i &gt;= n</td><td>(inicio − n)/m redondeado abajo + 1</td></tr>
    <tr><td>i *= m</td><td>i &lt; n</td><td>log_m(n/inicio)</td></tr>
    <tr><td>i *= m</td><td>i &lt;= n</td><td>log_m(n/inicio) + 1</td></tr>
    <tr><td>i /= m</td><td>i &gt; n</td><td>log_m(inicio/n)</td></tr>
    <tr><td>i /= m</td><td>i &gt;= n</td><td>log_m(inicio/n) + 1</td></tr></table><p class="ayuda">Escribe las fórmulas con paréntesis, p. ej. <code>(n/2)</code>, <code>(n-1)/2 + 1</code>: el juego acepta la forma sin techo/piso.</p>`;

  /** Valida la fórmula del estudiante contra la traza real (ground truth), con tolerancia. */
  function validar(texto, inst, caso) {
    let ast;
    try { ast = F.parsear(texto); } catch (e) { return { ok: false, error: 'No entiendo la expresión: ' + e.message }; }
    const vars = F.variablesDe(ast);
    for (const v of vars) if (v !== 'n' && !(inst.conI && v === 'i')) return { ok: false, error: 'Solo se permite n' + (inst.conI ? ' e i' : '') + ' (encontré "' + v + '")' };
    let tol = inst.tolerancia || 0;
    const canonT = caso ? caso.t : inst.t;
    if (/ceil|floor|techo|piso/.test(String(canonT))) tol = Math.max(tol, 1);
    for (const n of NS_PRUEBA) {
      if (inst.nMin && n < inst.nMin) continue;
      const is = inst.conI ? inst.datosI(n) : [null];
      for (const iVal of is) {
        const datos = inst.conI ? iVal : (caso && typeof caso.datos === 'function' ? caso.datos(n) : null);
        const real = inst.traza(n, datos).length - 1;
        let mio; try { mio = F.evaluar(ast, { n, i: iVal == null ? 0 : iVal }); } catch (e) { return { ok: false, error: e.message }; }
        if (!isFinite(mio)) return { ok: false, error: 'Tu fórmula no da un número para n = ' + n };
        if (Math.abs(mio - real) > tol + 1e-9) return { ok: false, n, i: iVal, real, mio, tol };
      }
    }
    return { ok: true };
  }

  function tablaTraza(pasos, hasta) {
    const cols = Object.keys(pasos[0]).filter((c) => c !== 'cond');
    let html = `<table class="traza"><tr><th>evaluación</th>${cols.map((c) => '<th>' + ADA.esc(c) + '</th>').join('')}<th>condición</th><th>vueltas</th></tr>`;
    let vueltas = 0;
    pasos.slice(0, hasta).forEach((p, k) => {
      if (p.cond) vueltas++;
      html += `<tr class="${p.cond ? '' : 'salida'}"><td>${k + 1}</td>${cols.map((c) => '<td>' + ADA.esc(String(p[c])) + '</td>').join('')}<td>${p.cond ? '✔ verdadera' : '✘ falsa → sale'}</td><td>${p.cond ? vueltas : vueltas + ' (fin)'}</td></tr>`;
    });
    html += '</table>';
    return html;
  }

  ADA.vistaVueltas = function (cont, def, inst) {
    let puntos = 100, pistaN = 0, revelado = false, terminado = false;
    const verificado = window.ADA_VERIFICADO && window.ADA_VERIFICADO.ids.includes(def.id);
    const casos = inst.dependeDatos ? Object.entries(inst.casos) : null;
    const lista = ADA.ejercicios.filter((e) => e.fase === 2);
    const idx = lista.findIndex((e) => e.id === def.id);

    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=2">← ¿Cuántas vueltas?</a> · ejercicio ${idx + 1}/${lista.length}</p>
      <h1><span class="etiqueta V">Vueltas</span> ${ADA.esc(inst.titulo)} ${inst.nVariantes > 1 ? '<span class="etiqueta">variante ' + (inst.variante + 1) + '/' + inst.nVariantes + '</span>' : ''} ${verificado ? '<span class="etiqueta" title="t verificado contra la ejecución real">✔ verificado</span>' : ''}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)}</p>
      <div class="panel">
        <pre class="codigo-grande">${ADA.resaltarJava(inst.cabecera)}</pre>
        ${inst.contexto ? '<p class="ayuda">Contexto: ' + ADA.esc(inst.contexto) + '</p>' : ''}
        <p><b>¿Cuántas vueltas da el cuerpo del ciclo?</b> ${inst.dependeDatos ? 'Depende de los datos: da el <b>mejor</b> y el <b>peor</b> caso.' : 'Escribe t en función de n' + (inst.conI ? ' e i' : '') + '.'} ${inst.tolerancia ? '<span class="ayuda">(ciclo logarítmico/raíz: se acepta ±1 vuelta, p. ej. <code>log2(n)</code>)</span>' : ''}</p>
        ${inst.dependeDatos
          ? casos.map(([k, c]) => `<div class="campo"><label>${k === 'mejor' ? 'Mejor caso' : 'Peor caso'} t =</label><input type="text" data-caso="${k}" placeholder="fórmula en n"><span data-est="${k}"></span></div><div data-exp="${k}"></div>`).join('')
          : `<div class="campo"><label>t =</label><input type="text" data-caso="base" placeholder="ej. n, (n/2), log2(n)"><span data-est="base"></span></div><div data-exp="base"></div>`}
        <div id="pistas"></div>
        <div class="acciones"><button class="primario" id="btnComp">Comprobar</button><button class="secundario" id="btnPista">Pista</button><button id="btnRev">Ver solución</button><span class="pts" id="pts">Puntos: 100/100</span></div>
      </div>
      <div class="panel">
        <h3>🎞 Traza</h3>
        <div class="campo"><label>n =</label><input type="text" id="inN" value="${inst.nMin ? Math.max(10, inst.nMin) : 10}" style="max-width:90px;min-width:70px">
          ${inst.conI ? '<label style="min-width:auto">i =</label><input type="text" id="inI" value="3" style="max-width:90px;min-width:70px">' : ''}
          ${inst.dependeDatos ? '<label style="min-width:auto">datos:</label><select id="selCaso">' + casos.map(([k, c]) => `<option value="${k}">${k}: ${ADA.esc(c.desc)}</option>`).join('') + '</select>' : ''}
          <button id="btnTraza">▶ Ver traza</button><button id="btnTodo">⏭ Todo</button></div>
        <div id="traza" class="ayuda">Pulsa "Ver traza" para ver cómo cambia la variable en cada evaluación de la condición.</div>
      </div>
      <div class="panel bloqueado" id="res"></div>`;

    const $ = (s) => cont.querySelector(s);
    const setPts = () => { $('#pts').textContent = 'Puntos: ' + Math.max(0, puntos) + '/100'; };

    // ---- traza animada ----
    let timer = null;
    function pasosActuales() {
      const n = Math.max(0, parseInt($('#inN').value, 10) || 0);
      let datos = null;
      if (inst.conI) datos = parseInt($('#inI').value, 10) || 0;
      else if (inst.dependeDatos) { const c = inst.casos[$('#selCaso').value]; datos = typeof c.datos === 'function' ? c.datos(n) : c.datos; }
      const pasos = inst.traza(n, datos);
      return pasos.length > 60 ? pasos.slice(0, 59).concat([pasos[pasos.length - 1]]) : pasos;
    }
    function animar(todo) {
      clearInterval(timer);
      const pasos = pasosActuales();
      const cont2 = $('#traza');
      if (todo) { cont2.innerHTML = tablaTraza(pasos, pasos.length) + resumen(pasos); return; }
      let k = 1;
      cont2.innerHTML = tablaTraza(pasos, k);
      timer = setInterval(() => { k++; cont2.innerHTML = tablaTraza(pasos, k) + (k >= pasos.length ? resumen(pasos) : ''); if (k >= pasos.length) clearInterval(timer); }, 350);
    }
    function resumen(pasos) {
      const t = pasos.length - 1;
      return `<p><b>${t} vuelta${t === 1 ? '' : 's'}</b> y ${pasos.length} evaluaciones de la condición (${t} verdaderas + 1 falsa = t + 1).</p>`;
    }
    $('#btnTraza').onclick = () => animar(false);
    $('#btnTodo').onclick = () => animar(true);

    // ---- comprobar ----
    function comprobar(revelar) {
      let todoOk = true;
      const entradas = inst.dependeDatos ? casos.map(([k, c]) => [k, c]) : [['base', null]];
      for (const [k, caso] of entradas) {
        const inp = $(`input[data-caso="${k}"]`), est = $(`[data-est="${k}"]`), exp = $(`[data-exp="${k}"]`);
        const canon = caso ? caso.t : inst.t;
        if (revelar) { inp.value = canon; inp.className = 'ok'; est.textContent = '👁'; continue; }
        if (inp.className === 'ok') continue;
        if (!inp.value.trim()) { todoOk = false; continue; }
        const r = validar(inp.value, inst, caso);
        if (r.ok) { inp.className = 'ok'; est.textContent = '✅'; exp.innerHTML = ''; }
        else {
          todoOk = false; inp.className = 'mal'; est.textContent = '❌'; puntos -= 15; ADA.registrarError('veces');
          let msg;
          if (r.error) msg = ADA.esc(r.error);
          else {
            msg = `Para n = ${r.n}${r.i != null ? ', i = ' + r.i : ''} la traza da <b>${r.real}</b> vuelta(s) y tu fórmula da <b>${+r.mio.toFixed(2)}</b>${r.tol ? ' (tolerancia ±' + r.tol + ')' : ''}. Mira la traza con ese n.`;
            $('#inN').value = r.n; if (r.i != null && $('#inI')) $('#inI').value = r.i; if (caso && $('#selCaso')) $('#selCaso').value = k;
            animar(true);
          }
          exp.innerHTML = `<div class="explic">${msg}<details style="margin-top:6px"><summary>Ver explicación</summary>${caso ? '<p><b>' + k + ':</b> ' + ADA.esc(caso.desc) + '</p>' : ''}<p>${ADA.esc(inst.explicacion)}</p><p><b>Patrón:</b> ${ADA.esc(inst.patron)} → ${ADA.esc(inst.formula)}</p></details></div>`;
        }
      }
      setPts();
      return todoOk;
    }
    function terminar() {
      if (terminado) return; terminado = true;
      const pts = revelado ? 0 : Math.max(0, puntos);
      ADA.registrarPuntaje(inst.id, pts, inst.variante);
      const res = $('#res'); res.classList.remove('bloqueado');
      res.innerHTML = `<div class="resultado"><div class="nota">${pts}<small> /100</small></div></div>
        <h3>Solución</h3>
        <p><b>Patrón:</b> ${ADA.esc(inst.patron)} · <b>Fórmula:</b> ${ADA.esc(inst.formula)}</p>
        <p>${ADA.esc(inst.explicacion)}</p>
        ${inst.dependeDatos ? casos.map(([k, c]) => `<p><b>${k}:</b> t = ${ADA.tex(F.aLatex(c.t))} — ${ADA.esc(c.desc)}</p>`).join('') : `<p><b>t = </b>${ADA.tex(F.aLatex(inst.tExacto || inst.t))}${inst.tExacto && inst.tExacto !== inst.t ? ' (en el parcial basta ' + ADA.tex(F.aLatex(inst.t)) + ')' : ''}</p>`}
        ${inst.trampa ? '<div class="analogia"><b>Trampa / aclaración:</b> ' + ADA.esc(inst.trampa) + '</div>' : ''}
        <details style="margin-top:8px"><summary>Tabla de fórmulas generales</summary>${TABLA_FORMULAS}</details>
        <div class="acciones">${inst.nVariantes > 1 ? `<button class="primario" onclick="ADA.ir('ej',{id:'${inst.id}',v:${(inst.variante + 1) % inst.nVariantes}})">Otra variante ↻</button>` : ''}<button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente →</button><button onclick="ADA.ir('modulo',{fase:2})">Volver al módulo</button></div>`;
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('#btnComp').onclick = () => { if (comprobar(false)) { ADA.registrarAcierto(); ADA.toast('¡Correcto!', 'ok'); terminar(); } else ADA.toast('Revisa lo marcado (o llena lo que falta).', 'mal'); };
    cont.querySelectorAll('input[data-caso]').forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnComp').click(); }));
    $('#btnPista').onclick = () => {
      const ps = (inst.pistas || []).concat(['Tabla de fórmulas: ' + TABLA_FORMULAS]);
      if (pistaN < ps.length) { puntos -= pistaN === 0 ? 5 : 10; $('#pistas').insertAdjacentHTML('beforeend', `<div class="pista">💡 ${ps[pistaN]}</div>`); pistaN++; setPts(); }
    };
    $('#btnRev').onclick = () => { revelado = true; comprobar(true); animar(true); terminar(); };
  };
})();
