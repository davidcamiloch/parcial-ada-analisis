/* anidados.js – Fase 3: ciclos anidados, llamadas y recursión. Guía paso a paso para construir sumatorias. */
(function () {
  'use strict';
  const F = window.Formulas;

  /** Renderiza texto con fórmulas entre $…$ usando KaTeX. */
  ADA.md = function (txt) {
    return String(txt).replace(/\$([^$]+)\$/g, (m, tex) => ADA.tex(tex));
  };

  /** Gráfica sencilla de crecimiento: T(n) real (puntos) frente a c·g(n) (línea), n = 1..N. */
  ADA.grafica = function (canvas, series, N) {
    const ctx = canvas.getContext('2d'); const W = canvas.width, H = canvas.height; const pad = 36;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    let maxY = 0; const datos = series.map((s) => { const ys = []; for (let n = 1; n <= N; n++) { let y; try { y = s.f(n); } catch (e) { y = NaN; } ys.push(y); if (isFinite(y)) maxY = Math.max(maxY, y); } return { s, ys }; });
    if (!maxY) maxY = 1;
    const X = (n) => pad + (n - 1) / (N - 1) * (W - pad - 10), Y = (y) => H - pad + 8 - (y / maxY) * (H - pad - 20);
    ctx.strokeStyle = '#dde2ea'; ctx.beginPath(); ctx.moveTo(pad, 10); ctx.lineTo(pad, H - pad + 8); ctx.lineTo(W - 10, H - pad + 8); ctx.stroke();
    ctx.fillStyle = '#5b6675'; ctx.font = '11px sans-serif'; ctx.fillText('n', W - 18, H - pad + 22); ctx.fillText('OE', 4, 14); ctx.fillText(String(N), X(N) - 8, H - pad + 22); ctx.fillText('1', X(1) - 3, H - pad + 22);
    ctx.fillText(Math.round(maxY).toLocaleString(), pad + 4, 22);
    datos.forEach(({ s, ys }) => {
      ctx.strokeStyle = s.color; ctx.fillStyle = s.color; ctx.lineWidth = s.punteada ? 1.5 : 2; ctx.setLineDash(s.punteada ? [5, 4] : []);
      ctx.beginPath(); let first = true;
      ys.forEach((y, i) => { if (!isFinite(y)) return; const x = X(i + 1), yy = Y(y); if (first) { ctx.moveTo(x, yy); first = false; } else ctx.lineTo(x, yy); });
      ctx.stroke(); ctx.setLineDash([]);
    });
    let ly = 30; datos.forEach(({ s }) => { ctx.fillStyle = s.color; ctx.fillRect(W - 150, ly - 8, 12, 3); ctx.fillStyle = '#1d2430'; ctx.font = '12px sans-serif'; ctx.fillText(s.nombre, W - 132, ly - 3); ly += 16; });
  };

  function htmlGrafica(metodo, id) {
    return `<details style="margin-top:10px"><summary>📈 Gráfica de crecimiento</summary><canvas id="${id}" width="520" height="220" style="max-width:100%;border:1px solid var(--borde);border-radius:8px;margin-top:6px"></canvas><p class="ayuda">T(n) (convención actual) frente a una constante por la función del Big-O, escalada para coincidir en el último punto. Si las curvas van "pegadas", el orden está bien.</p></details>`;
  }
  function pintarGrafica(cont, metodo, id) {
    const c = cont.querySelector('#' + id); if (!c) return;
    const conv = ADA.conv(); const N = metodo.nGrafica || 40;
    const T = (n) => metodo.lineas ? ADA.Tnum(metodo.lineas, n, conv) : F.ev(metodo.Tn.prof, { n, k: 3 });
    const g = (n) => F.ev(metodo.bigO, { n });
    const esc = T(N) / g(N);
    ADA.grafica(c, [{ nombre: 'T(n)', color: '#c8102e', f: T }, { nombre: 'c·' + metodo.bigO, color: '#2b6cb0', punteada: true, f: (n) => esc * g(n) }], N);
  }

  /* ---------- Guía paso a paso ---------- */
  /** Renderiza pasos secuenciales dentro de `panel`. Devuelve una promesa que se resuelve al terminar. */
  function renderGuia(panel, pasos, puntaje, sec, onDone) {
    let k = 0;
    const porPaso = puntaje.max[sec] / pasos.length;
    function mostrar() {
      if (k >= pasos.length) { onDone(); return; }
      const p = pasos[k];
      const div = ADA.el(`<div class="guia-paso"><div class="guia-num">Paso ${k + 1}/${pasos.length}</div><div class="guia-preg">${ADA.md(p.pregunta)}</div>
        ${p.tipo === 'expr' ? `<div class="campo"><input type="text" class="gin" placeholder="${p.vars ? 'en función de n y ' + p.vars.join(', ') : 'fórmula en n'}"><span class="gest"></span></div>` : `<div class="opciones">${p.opciones.map((o, i) => `<label><input type="radio" name="g${k}" value="${i}"> ${ADA.md(o.txt)}</label>`).join('')}</div>`}
        <div class="gexp"></div>
        <div class="acciones"><button class="primario gcomp">Comprobar</button><button class="grev">Ver respuesta</button></div></div>`);
      panel.appendChild(div);
      let intentos = 0;
      const exp = div.querySelector('.gexp');
      const cerrar = (ok) => {
        div.querySelector('.acciones').remove();
        div.classList.add(ok ? 'ok' : 'rev');
        k++; mostrar();
      };
      div.querySelector('.gcomp').onclick = () => {
        if (p.tipo === 'expr') {
          const inp = div.querySelector('.gin'); const v = inp.value.trim(); if (!v) return;
          const eq = F.equivalentes(v, p.respuesta, { vars: p.vars || [], absTol: p.tol || 0 });
          if (eq.ok) { inp.className = 'gin ok'; div.querySelector('.gest').textContent = '✅'; exp.innerHTML = `<div class="explic ok">${ADA.md(p.ayuda || 'Correcto.')}</div>`; ADA.registrarAcierto(); cerrar(true); }
          else {
            intentos++; inp.className = 'gin mal'; div.querySelector('.gest').textContent = '❌'; puntaje.penalizar(sec, porPaso / 4); ADA.registrarError(p.tag || 'tn');
            const d = eq.diffs && (eq.diffs.find((x) => x.n === 5) || eq.diffs[0]);
            exp.innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'No es equivalente' + (d ? ': para n = ' + d.n + (p.vars && p.vars.length ? ', ' + p.vars[0] + ' = ' + d[p.vars[0]] : '') + ' tu fórmula da ' + (+d.tuyo.toFixed(2)) + ' y la correcta ' + (+d.esperado.toFixed(2)) : '') + '.'}${intentos >= 2 ? '<div class="analogia">' + ADA.md(p.ayuda) + '</div>' : ' Inténtalo de nuevo (o pulsa "Ver respuesta").'}</div>`;
          }
        } else {
          const r = div.querySelector('input[type=radio]:checked'); if (!r) return;
          const o = p.opciones[+r.value];
          div.querySelectorAll('.opciones label').forEach((l) => { const rr = l.querySelector('input'); l.className = p.opciones[+rr.value].ok ? (o.ok || rr.checked ? 'ok' : '') : (rr.checked ? 'mal' : ''); });
          if (o.ok) { exp.innerHTML = `<div class="explic ok">${ADA.md(o.porque)}</div>`; ADA.registrarAcierto(); cerrar(true); }
          else { intentos++; puntaje.penalizar(sec, porPaso / 3); ADA.registrarError(p.tag || 'tn'); exp.innerHTML = `<div class="explic">${ADA.md(o.porque)}</div>`; }
        }
        if (ADA.actualizarPts) ADA.actualizarPts();
      };
      div.querySelector('.grev').onclick = () => {
        puntaje.penalizar(sec, porPaso);
        if (p.tipo === 'expr') { const inp = div.querySelector('.gin'); inp.value = p.respuesta; inp.className = 'gin ok'; exp.innerHTML = `<div class="explic info">${ADA.md(p.ayuda || '')}</div>`; }
        else { const ok = p.opciones.findIndex((o) => o.ok); div.querySelectorAll('.opciones label')[ok].className = 'ok'; exp.innerHTML = `<div class="explic info">${ADA.md(p.opciones[ok].porque)}</div>`; }
        if (ADA.actualizarPts) ADA.actualizarPts();
        cerrar(false);
      };
      div.querySelector('.gin') && div.querySelector('.gin').addEventListener('keydown', (e) => { if (e.key === 'Enter') div.querySelector('.gcomp').click(); });
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const gin = div.querySelector('.gin'); if (gin) gin.focus();
    }
    mostrar();
  }

  /* ---------- Vista tipo A anidado (fase 3) ---------- */
  ADA.vistaAnidados = function (cont, def, inst) {
    const U = ADA.ui;
    const puntaje = new U.Puntaje({ tabla: 35, guia: 35, tn: 15, inv: 5, bigo: 10 });
    const intentos = {};
    let pistaN = 0;
    const verificado = window.ADA_VERIFICADO && window.ADA_VERIFICADO.ids.includes(def.id);
    const soloVeces = !!inst.soloVeces;
    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=${inst.fase}">← ${ADA.MODULOS.find((m) => m.fase === inst.fase).nombre}</a></p>
      <h1><span class="etiqueta A">Tipo A</span> ${ADA.esc(inst.titulo)} ${verificado ? '<span class="etiqueta" title="Conteos verificados ejecutando el código instrumentado">✔ verificado</span>' : ''}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)} · Tamaño de la entrada: ${ADA.esc(inst.tamano || 'n')}</p>
      <div class="enunciado">${inst.enunciado}</div>
      <div class="pasos"><span class="paso activo" data-paso="1">1 · ${soloVeces ? 'Código' : 'Costos y vueltas'}</span><span class="paso" data-paso="2">2 · Sumatorias paso a paso</span><span class="paso" data-paso="3">3 · T(n) y Big-O</span><span class="paso" data-paso="4">4 · Resultado</span></div>
      <div class="panel" id="p1">
        ${soloVeces ? `<pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre><p class="ayuda">Aquí no se cuentan OE: solo cuántas veces corre <code>sum++</code>. Pasa directo a las sumatorias.</p>` : U.tablaLineas(inst, 'anidado') + `<p class="ayuda" style="margin-top:8px">Escribe el <b>costo</b> de cada línea y, en la cabecera de cada ciclo, <b>cuántas vueltas da cada vez que se ejecuta</b> (puede depender de la variable externa: <code>n-1-i</code>, <code>i(i+1)(2i+1)/6</code>; escribe <code>(n/2)</code>, <code>log2(n)</code> sin techos ni pisos: vale ±1). Las líneas de un método llamado aparecen desplegadas bajo la llamada.</p>`}
        <div id="pista1"></div>
        <div class="acciones">${soloVeces ? '<button class="primario" id="btnSeguir">Ir a las sumatorias →</button>' : '<button class="primario" id="btnComprobar1">Comprobar</button><button id="btnTraza">Conteo real (n = 5)</button><button class="secundario" id="btnPista1">Pista</button><button id="btnRevelar1">Ver solución de esta parte</button>'}<span class="pts" id="pts1"></span></div>
        <div id="traza" style="display:none"></div>
      </div>
      <div class="panel bloqueado" id="p2"><h2>Construye y simplifica las sumatorias</h2><div id="guia"></div></div>
      <div class="panel bloqueado" id="p3">
        <h2>${soloVeces ? 'Número de veces y Big-O' : 'T(n), invariante y Big-O'}</h2>
        <div class="campo"><label>${soloVeces ? '#sum++ =' : 'T(n) ='}</label><input type="text" id="inTn" placeholder="${soloVeces ? 'fórmula en n (puedes usar sum(i=1..n, …))' : 'forma simplificada; puedes dejar k'}"><span id="estTn"></span></div><div id="expTn"></div>
        ${inst.invariante && !soloVeces ? '<div class="campo"><label>Invariante</label><input type="text" id="inInv" placeholder="del ciclo externo al salir, ej. i == n"><span id="estInv"></span></div><div id="expInv"></div>' : ''}
        <div class="campo"><label>Big-O</label><input type="text" id="inO" placeholder="ej. O(n^2), O(n log n), O(log^2 n)"><span id="estO"></span></div><div id="expO"></div>
        ${inst.mejorPeor ? '<div class="campo"><label>Mejor/peor caso</label><select id="inMP"><option value="">— elige —</option><option value="si">Hay mejor y peor caso (una condición depende de los datos)</option><option value="no">No hay: siempre se ejecutan las mismas OE</option></select><span id="estMP"></span></div><div id="expMP"></div>' : ''}
        <div class="acciones"><button class="primario" id="btnComprobar3">Comprobar</button><button id="btnRevelar3">Ver solución</button><span class="pts" id="pts3"></span></div>
      </div>
      <div class="panel bloqueado" id="p4"></div>`;

    const $ = (s) => cont.querySelector(s);
    const setPaso = (n) => cont.querySelectorAll('.paso').forEach((e) => { const k = +e.dataset.paso; e.classList.toggle('activo', k === n); e.classList.toggle('hecho', k < n); });
    ADA.actualizarPts = () => { ['#pts1', '#pts3'].forEach((s) => { const e = $(s); if (e) e.textContent = 'Puntos: ' + puntaje.total() + '/100'; }); };
    ADA.actualizarPts();

    let paso1Listo = false;
    function irGuia() {
      if (paso1Listo) return; paso1Listo = true;
      setPaso(2); $('#p2').classList.remove('bloqueado');
      if (!soloVeces) $('#p2').insertAdjacentHTML('afterbegin', `<div class="explic info">Con los costos y vueltas correctos, la estructura que espera el profe es: ${ADA.tex('T(n) = ' + ADA.latexT(inst.lineas, ADA.conv()), true)} Ahora resuélvela por partes.</div>`);
      renderGuia($('#guia'), inst.guia, puntaje, 'guia', () => { setPaso(3); $('#p3').classList.remove('bloqueado'); $('#p3').scrollIntoView({ behavior: 'smooth' }); $('#inTn').focus(); });
    }
    if (soloVeces) $('#btnSeguir').onclick = irGuia;
    else {
      $('#p1').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnComprobar1').click(); });
      $('#btnComprobar1').onclick = () => {
        const r = U.comprobarTabla($('#p1'), inst, puntaje, 'tabla', intentos);
        const rc = U.comprobarCiclos($('#p1'), inst, puntaje, 'tabla', intentos);
        ADA.actualizarPts();
        if (r.todoOk && rc.todoOk) { ADA.registrarAcierto(); ADA.toast('¡Costos y vueltas correctos!', 'ok'); irGuia(); }
        else if (r.nuevosErrores + rc.nuevosErrores) ADA.toast((r.nuevosErrores + rc.nuevosErrores) + ' error(es). Lee las explicaciones.', 'mal');
        else ADA.toast('Faltan casillas por llenar.', 'alt');
      };
      $('#btnTraza').onclick = () => { const t = $('#traza'); if (t.style.display === 'none') { t.innerHTML = U.tablaTraza(inst, 5); t.style.display = ''; } else t.style.display = 'none'; };
      $('#btnPista1').onclick = () => { const ps = inst.pistas || []; if (pistaN < ps.length) { puntaje.pistas += 5 * (pistaN + 1); $('#pista1').insertAdjacentHTML('beforeend', `<div class="pista">💡 ${ADA.md(ps[pistaN])}</div>`); pistaN++; ADA.actualizarPts(); } };
      $('#btnRevelar1').onclick = () => { puntaje.revelar('tabla'); U.revelarTabla($('#p1'), inst); ADA.actualizarPts(); irGuia(); };
    }

    function comprobar3(revelar) {
      const conv = ADA.conv(); let ok = true;
      const inTn = $('#inTn'), expTn = $('#expTn'); const canon = inst.Tn[conv] || inst.Tn.prof;
      if (revelar) { inTn.value = canon; inTn.className = 'ok'; puntaje.revelar('tn'); }
      else if (inTn.className !== 'ok') {
        let eq = inTn.value.trim() ? F.equivalentes(inTn.value, canon, { vars: ['k'], absTol: inst.tolTn || 0 }) : { ok: false };
        if (!eq.ok && inst.TnAprox && inTn.value.trim()) { const ap = F.aproximado(inTn.value, canon); if (ap.ok) eq = ap; }
        if (eq.ok) { inTn.className = eq.aprox ? 'alt' : 'ok'; $('#estTn').textContent = '✅'; expTn.innerHTML = eq.aprox ? `<div class="explic alt">≈ Aceptado como forma aproximada (sin pisos/techos), que es lo que se escribe en el parcial. Exacto: ${ADA.tex(F.aLatex(canon))}.</div>` : ''; }
        else { ok = false; if (inTn.value.trim()) { inTn.className = 'mal'; $('#estTn').textContent = '❌'; puntaje.penalizar('tn', 4); ADA.registrarError('tn'); expTn.innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'No es equivalente. ' + eq.diffs.slice(0, 3).map((d) => `n=${d.n}${canon.includes('k') ? ', k=' + d.k : ''}: tuya=${+d.tuyo.toFixed(1)}, correcta=${+d.esperado.toFixed(1)}`).join('; ')}<details style="margin-top:6px"><summary>Ver el desarrollo paso a paso</summary><div class="pasos-sol">${ADA.pasosT(inst, conv).map((p) => `<div class="item"><div class="txt">${p.txt}</div><div class="formula">${ADA.tex(p.tex, true)}</div></div>`).join('')}</div></details></div>`; } }
      }
      const inInv = $('#inInv');
      if (inInv) {
        const norm = (s) => s.toLowerCase().replace(/\s+/g, '').replace(/==/g, '=');
        const acept = [inst.invariante, ...(inst.invAlt || [])].map(norm);
        if (revelar) { inInv.value = inst.invariante; inInv.className = 'ok'; puntaje.revelar('inv'); }
        else if (inInv.className !== 'ok') {
          if (inInv.value.trim() && acept.includes(norm(inInv.value))) { inInv.className = 'ok'; $('#estInv').textContent = '✅'; $('#expInv').innerHTML = ''; }
          else { ok = false; if (inInv.value.trim()) { inInv.className = 'mal'; $('#estInv').textContent = '❌'; puntaje.penalizar('inv', 2); ADA.registrarError('inv'); $('#expInv').innerHTML = `<div class="explic">La invariante del ciclo externo al salir: <code>${ADA.esc(inst.invariante)}</code>.<div class="analogia">${U.ANALOGIAS.inv}</div></div>`; } }
        }
      }
      const inO = $('#inO');
      if (revelar) { inO.value = 'O(' + inst.bigO + ')'; inO.className = 'ok'; puntaje.revelar('bigo'); }
      else if (inO.className !== 'ok') {
        const r = inO.value.trim() ? F.mismoOrden(inO.value, inst.bigO) : { ok: false };
        if (r.ok) { inO.className = 'ok'; $('#estO').textContent = '✅'; $('#expO').innerHTML = ''; }
        else { ok = false; if (inO.value.trim()) { inO.className = 'mal'; $('#estO').textContent = '❌'; puntaje.penalizar('bigo', 4); ADA.registrarError('bigo'); const tuya = r.error ? null : F.claseDe(inO.value); $('#expO').innerHTML = `<div class="explic">${r.error ? ADA.esc(r.error) : 'Escribiste un orden ' + (tuya ? '<b>' + tuya + '</b>' : 'distinto') + '. '}El término dominante de ${ADA.tex(F.aLatex(canon))} es de orden ${ADA.tex(F.aLatex(inst.bigO))}.<div class="analogia">${U.ANALOGIAS.bigo}</div></div>`; } }
      }
      const inMP = $('#inMP');
      if (inMP) {
        const esperado = /No hay/.test(inst.mejorPeor) && !/Peor caso:/.test(inst.mejorPeor) ? 'no' : 'si';
        if (revelar) inMP.value = esperado;
        else if (inMP.value !== esperado) { ok = false; if (inMP.value) { puntaje.penalizar('inv', 2); $('#expMP').innerHTML = `<div class="explic">${inst.mejorPeor}</div>`; } }
        else { $('#estMP').textContent = '✅'; $('#expMP').innerHTML = ''; }
      }
      ADA.actualizarPts();
      return ok;
    }
    function terminar() {
      setPaso(4); const p4 = $('#p4'); p4.classList.remove('bloqueado');
      const pts = puntaje.total(); ADA.registrarPuntaje(inst.id, pts, inst.variante);
      p4.innerHTML = `<div class="resultado"><div class="nota">${pts}<small> /100 · nota ${(pts / 20).toFixed(1)}</small></div></div>
        ${soloVeces ? `<h3>Solución</h3><p>${ADA.esc(inst.explic)}</p><div class="formula">${ADA.tex(inst.pasos[0].tex, true)}</div>` : U.panelSolucion(inst)}
        ${inst.trampa ? '<div class="analogia"><b>Trampa / aclaración:</b> ' + ADA.esc(inst.trampa) + '</div>' : ''}
        ${htmlGrafica(inst, 'graf')}
        <div class="acciones"><button onclick="ADA.ir('ej',{id:'${inst.id}'})">Repetir</button><button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente ejercicio →</button><button onclick="ADA.ir('modulo',{fase:${inst.fase}})">Volver al módulo</button></div>`;
      p4.querySelector('details').addEventListener('toggle', () => pintarGrafica(p4, inst, 'graf'), { once: true });
      p4.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    $('#p3').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnComprobar3').click(); });
    $('#btnComprobar3').onclick = () => { if (comprobar3(false)) { ADA.registrarAcierto(); ADA.toast('¡Correcto!', 'ok'); terminar(); } else ADA.toast('Revisa lo marcado (o llena lo que falta).', 'mal'); };
    $('#btnRevelar3').onclick = () => { comprobar3(true); terminar(); };
  };

  /* ---------- Vista tipo R (recursivo) ---------- */
  ADA.vistaRecursivo = function (cont, def, inst) {
    const U = ADA.ui;
    const puntaje = new U.Puntaje({ guia: 60, ll: 20, bigo: 20 });
    const verificado = window.ADA_VERIFICADO && window.ADA_VERIFICADO.ids.includes(def.id);
    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=3">← Anidados, llamadas y recursión</a></p>
      <h1><span class="etiqueta R">Recursivo</span> ${ADA.esc(inst.titulo)} ${verificado ? '<span class="etiqueta" title="Número de llamadas verificado ejecutando el código">✔ verificado</span>' : ''}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)} · Tamaño: ${ADA.esc(inst.tamano)}</p>
      <div class="enunciado">${inst.enunciado}</div>
      <div class="pasos"><span class="paso activo" data-paso="1">1 · Recurrencia y desenrollado</span><span class="paso" data-paso="2">2 · Llamadas y Big-O</span><span class="paso" data-paso="3">3 · Resultado</span></div>
      <div class="panel"><pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre><div class="campo"><label>n =</label><input type="text" id="inN" value="16" style="max-width:90px;min-width:70px"><button id="btnCont">Contar llamadas reales</button><span id="outCont" class="ayuda"></span></div></div>
      <div class="panel" id="p1"><div id="guia"></div></div>
      <div class="panel bloqueado" id="p2">
        <div class="campo"><label>Llamadas (±1)</label><input type="text" id="inLl" placeholder="en función de n, ej. log2(n)+1"><span id="estLl"></span></div><div id="expLl"></div>
        <div class="campo"><label>Big-O</label><input type="text" id="inO" placeholder="ej. O(log n), O(n^2)"><span id="estO"></span></div><div id="expO"></div>
        <div class="acciones"><button class="primario" id="btnComp">Comprobar</button><button id="btnRev">Ver solución</button><span class="pts" id="pts"></span></div>
      </div>
      <div class="panel bloqueado" id="p3"></div>`;
    const $ = (s) => cont.querySelector(s);
    const setPaso = (n) => cont.querySelectorAll('.paso').forEach((e) => { const k = +e.dataset.paso; e.classList.toggle('activo', k === n); e.classList.toggle('hecho', k < n); });
    ADA.actualizarPts = () => { $('#pts').textContent = 'Puntos: ' + puntaje.total() + '/100'; };
    ADA.actualizarPts();
    $('#btnCont').onclick = () => {
      const n = Math.max(1, Math.min(2000, parseInt($('#inN').value, 10) || 1));
      const C = { cnt: {}, c(id) { this.cnt[id] = (this.cnt[id] || 0) + 1; }, v() {} };
      try { inst.ejecutar(n, C); $('#outCont').innerHTML = `n = ${n}: <b>${C.cnt.llamada}</b> llamadas · fórmula ${ADA.tex(F.aLatex(inst.llamadas))} = ${(+F.ev(inst.llamadas, { n }).toFixed(2))}`; } catch (e) { $('#outCont').textContent = 'error: ' + e.message; }
    };
    renderGuia($('#guia'), inst.guia, puntaje, 'guia', () => { setPaso(2); $('#p2').classList.remove('bloqueado'); $('#p2').scrollIntoView({ behavior: 'smooth' }); $('#inLl').focus(); });
    function comprobar(revelar) {
      let ok = true;
      const inLl = $('#inLl');
      if (revelar) { inLl.value = inst.llamadas; inLl.className = 'ok'; puntaje.revelar('ll'); }
      else if (inLl.className !== 'ok') {
        const eq = inLl.value.trim() ? F.equivalentes(inLl.value, inst.llamadas, { absTol: (inst.tolLlamadas != null ? inst.tolLlamadas : (inst.tolerancia || 0)) + 1 }) : { ok: false };
        if (eq.ok) { inLl.className = 'ok'; $('#estLl').textContent = '✅'; $('#expLl').innerHTML = ''; }
        else { ok = false; if (inLl.value.trim()) { inLl.className = 'mal'; $('#estLl').textContent = '❌'; puntaje.penalizar('ll', 5); ADA.registrarError('veces'); $('#expLl').innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'No coincide: la fórmula es ' + ADA.tex(F.aLatex(inst.llamadas)) + '. Usa el botón "Contar llamadas reales" con varios n.'}</div>`; } }
      }
      const inO = $('#inO');
      if (revelar) { inO.value = 'O(' + inst.bigO + ')'; inO.className = 'ok'; puntaje.revelar('bigo'); }
      else if (inO.className !== 'ok') {
        const r = inO.value.trim() ? F.mismoOrden(inO.value, inst.bigO) : { ok: false };
        if (r.ok) { inO.className = 'ok'; $('#estO').textContent = '✅'; $('#expO').innerHTML = ''; }
        else { ok = false; if (inO.value.trim()) { inO.className = 'mal'; $('#estO').textContent = '❌'; puntaje.penalizar('bigo', 5); ADA.registrarError('bigo'); $('#expO').innerHTML = `<div class="explic">${r.error ? ADA.esc(r.error) : 'El orden es ' + ADA.tex('O(' + F.aLatex(inst.bigO) + ')') + '. Mira el desenrollado de la guía.'}</div>`; } }
      }
      ADA.actualizarPts(); return ok;
    }
    function terminar() {
      setPaso(3); const p3 = $('#p3'); p3.classList.remove('bloqueado');
      const pts = puntaje.total(); ADA.registrarPuntaje(inst.id, pts, inst.variante);
      p3.innerHTML = `<div class="resultado"><div class="nota">${pts}<small> /100 · nota ${(pts / 20).toFixed(1)}</small></div></div>
        <h3>Solución (desenrollando la recurrencia)</h3><div class="pasos-sol">${inst.pasos.map((p) => `<div class="item"><div class="txt">${p.txt}</div><div class="formula">${ADA.tex(p.tex, true)}</div></div>`).join('')}</div>
        ${inst.trampa ? '<div class="analogia"><b>Trampa / aclaración:</b> ' + ADA.esc(inst.trampa) + '</div>' : ''}
        <div class="acciones"><button onclick="ADA.ir('ej',{id:'${inst.id}'})">Repetir</button><button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente →</button><button onclick="ADA.ir('modulo',{fase:3})">Volver al módulo</button></div>`;
      p3.scrollIntoView({ behavior: 'smooth' });
    }
    $('#p2').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnComp').click(); });
    $('#btnComp').onclick = () => { if (comprobar(false)) { ADA.registrarAcierto(); ADA.toast('¡Correcto!', 'ok'); terminar(); } else ADA.toast('Revisa lo marcado.', 'mal'); };
    $('#btnRev').onclick = () => { comprobar(true); terminar(); };
  };
})();
