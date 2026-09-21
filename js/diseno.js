/* diseno.js – Fase 4: Diseña el algoritmo (tipo B): estrategia → ordenar el código Java → análisis (peor/mejor, O y Ω). */
(function () {
  'use strict';
  const F = window.Formulas;

  function mezclar(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

  ADA.vistaDiseno = function (cont, def, inst) {
    const U = ADA.ui;
    const puntaje = new U.Puntaje({ estrategia: 20, codigo: 25, tn: 15, casos: 10, tmejor: 10, bigo: 10, omega: 10 });
    const verificado = window.ADA_VERIFICADO && window.ADA_VERIFICADO.ids.includes(def.id);
    const lineasCod = inst.codigo.split('\n');
    const medio = lineasCod.slice(1, -1);
    const conMejor = !inst.sinCasos;
    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=${inst.fase}">← ${ADA.MODULOS.find((m) => m.fase === inst.fase).nombre}</a></p>
      <h1><span class="etiqueta B">Tipo B</span> ${ADA.esc(inst.titulo)} ${verificado ? '<span class="etiqueta" title="Solución verificada ejecutando el código instrumentado">✔ verificado</span>' : ''}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)} · Tamaño: ${ADA.esc(inst.tamano)} · Cota pedida: ${inst.cotaO ? ADA.tex('O(' + F.aLatex(inst.cotaO) + ')') : '—'}</p>
      <div class="enunciado">${ADA.esc(inst.enunciado)}<br><code>${ADA.esc(inst.firma)}</code></div>
      <div class="pasos"><span class="paso activo" data-paso="1">1 · Estrategia</span><span class="paso" data-paso="2">2 · Código Java</span><span class="paso" data-paso="3">3 · Análisis</span><span class="paso" data-paso="4">4 · Resultado</span></div>
      <div class="panel" id="p1"><h2>¿Qué estrategia usarías?</h2><p class="ayuda">Detecta cuál cumple la cota y cuál se pasa (p. ej. cuál es O(n²) y cuál O(n)).</p>
        <div class="opciones" id="ops">${inst.estrategias.map((o, i) => `<label><input type="radio" name="est" value="${i}"> ${ADA.esc(o.txt)}</label>`).join('')}</div><div id="expEst"></div>
        <div class="acciones"><button class="primario" id="btnEst">Comprobar</button><span class="pts" id="pts1"></span></div></div>
      <div class="panel bloqueado" id="p2"><h2>Arma el código</h2><p class="ayuda">Haz clic en las líneas del banco en el orden correcto (la firma y la llave final ya están puestas). Las líneas idénticas son intercambiables.</p>
        <div class="dos"><div><h3>Banco de líneas</h3><div id="banco" class="banco"></div></div><div><h3>Tu código</h3><pre class="codigo-grande" id="armado"></pre></div></div>
        <div id="expCod"></div>
        <div class="acciones"><button class="primario" id="btnCod">Comprobar orden</button><button id="btnDeshacer">↶ Deshacer</button><button id="btnReiniciar">Reiniciar</button><button id="btnVerCod">Ver código</button><span class="pts" id="pts2"></span></div></div>
      <div class="panel bloqueado" id="p3"><h2>Análisis</h2><p class="ayuda">Con el código ya armado: T(n) del peor caso (forma simplificada, puedes dejar k), si existen mejor y peor caso, Big-O y Ω.</p>
        <div id="tablaSol"></div>
        <div class="campo"><label>T(n) peor caso =</label><input type="text" id="inTn" placeholder="ej. 10n + 10"><span id="estTn"></span></div><div id="expTn"></div>
        <div class="campo"><label>Mejor/peor caso</label><select id="inCasos"><option value="">— elige —</option><option value="si">Sí existen: hay una condición o salida que depende de los datos</option><option value="no">No existen: siempre se ejecutan las mismas OE</option></select><span id="estCasos"></span></div><div id="expCasos"></div>
        <div class="campo" id="campoMejor" style="display:none"><label>T(n) mejor caso =</label><input type="text" id="inTm" placeholder="ej. 11"><span id="estTm"></span></div><div id="expTm"></div>
        <div class="campo"><label>Big-O</label><input type="text" id="inO" placeholder="ej. O(n)"><span id="estO"></span></div><div id="expO"></div>
        <div class="campo"><label>Ω (mejor caso)</label><input type="text" id="inW" placeholder="ej. Ω(1) o Ω(n)"><span id="estW"></span></div><div id="expW"></div>
        <div class="acciones"><button class="primario" id="btnAn">Comprobar</button><button id="btnRevAn">Ver solución</button><span class="pts" id="pts3"></span></div></div>
      <div class="panel bloqueado" id="p4"></div>`;

    const $ = (s) => cont.querySelector(s);
    const setPaso = (n) => cont.querySelectorAll('.paso').forEach((e) => { const k = +e.dataset.paso; e.classList.toggle('activo', k === n); e.classList.toggle('hecho', k < n); });
    const pts = () => ['#pts1', '#pts2', '#pts3'].forEach((s) => { $(s).textContent = 'Puntos: ' + puntaje.total() + '/100'; });
    pts();

    /* --- paso 1 --- */
    $('#btnEst').onclick = () => {
      const r = $('input[name=est]:checked'); if (!r) { ADA.toast('Elige una estrategia.', 'alt'); return; }
      const o = inst.estrategias[+r.value];
      cont.querySelectorAll('#ops label').forEach((l) => { const rr = l.querySelector('input'); l.className = inst.estrategias[+rr.value].ok ? (o.ok || rr.checked ? 'ok' : '') : (rr.checked ? 'mal' : ''); });
      if (o.ok) { $('#expEst').innerHTML = `<div class="explic ok">${ADA.esc(o.porque)}</div>`; ADA.registrarAcierto(); setPaso(2); $('#p2').classList.remove('bloqueado'); iniciarBanco(); $('#p2').scrollIntoView({ behavior: 'smooth' }); }
      else { puntaje.penalizar('estrategia', 7); ADA.registrarError('estrategia'); $('#expEst').innerHTML = `<div class="explic">${ADA.esc(o.porque)}</div>`; }
      pts();
    };

    /* --- paso 2 --- */
    let banco = [], armado = [];
    function iniciarBanco() { banco = mezclar(medio.map((t, i) => ({ t, i }))); armado = []; pintarBanco(); }
    function pintarBanco() {
      $('#banco').innerHTML = banco.map((it, k) => `<div class="linea-banco" data-k="${k}"><code>${ADA.resaltarJava(it.t.trim())}</code></div>`).join('') || '<p class="ayuda">(vacío)</p>';
      $('#armado').innerHTML = ADA.resaltarJava(lineasCod[0]) + '\n' + armado.map((it) => ADA.resaltarJava(it.t)).join('\n') + (armado.length ? '\n' : '') + ADA.resaltarJava(lineasCod[lineasCod.length - 1]);
      cont.querySelectorAll('.linea-banco').forEach((el) => { el.onclick = () => { const k = +el.dataset.k; const [it] = banco.splice(k, 1); armado.push(it); pintarBanco(); }; });
    }
    $('#btnDeshacer').onclick = () => { if (armado.length) { banco.push(armado.pop()); pintarBanco(); } };
    $('#btnReiniciar').onclick = iniciarBanco;
    function codigoListo(revelado) {
      setPaso(3); $('#p3').classList.remove('bloqueado');
      $('#tablaSol').innerHTML = `<details><summary>Ver el código con la tabla de costos (ayuda)</summary>${U.tablaLineas(inst, 'anidado').replace(/<input[^>]*>/g, '')}</details>`;
      $('#campoMejor').style.display = conMejor ? '' : 'none';
      $('#p3').scrollIntoView({ behavior: 'smooth' }); $('#inTn').focus();
    }
    $('#btnCod').onclick = () => {
      if (armado.length !== medio.length) { ADA.toast('Faltan líneas por colocar.', 'alt'); return; }
      const ok = armado.every((it, k) => it.t.trim() === medio[k].trim());
      if (ok) { $('#expCod').innerHTML = '<div class="explic ok">¡Orden correcto!</div>'; ADA.registrarAcierto(); codigoListo(false); }
      else {
        puntaje.penalizar('codigo', 5); ADA.registrarError('codigo');
        const primera = armado.findIndex((it, k) => it.t.trim() !== medio[k].trim());
        $('#expCod').innerHTML = `<div class="explic">La primera línea fuera de lugar es la ${primera + 2} (<code>${ADA.esc(armado[primera].t.trim())}</code>). Piensa en el orden natural: declarar → recorrer → decidir → retornar.</div>`;
      }
      pts();
    };
    $('#btnVerCod').onclick = () => { puntaje.revelar('codigo'); armado = medio.map((t, i) => ({ t, i })); banco = []; pintarBanco(); $('#expCod').innerHTML = '<div class="explic info">Código completo mostrado.</div>'; pts(); codigoListo(true); };

    /* --- paso 3 --- */
    $('#inCasos').onchange = () => { if (conMejor) $('#campoMejor').style.display = ''; };
    function comprobar(revelar) {
      const conv = ADA.conv(); let ok = true;
      const canon = inst.Tn[conv] || inst.Tn.prof;
      const inTn = $('#inTn');
      if (revelar) { inTn.value = canon; inTn.className = 'ok'; puntaje.revelar('tn'); }
      else if (inTn.className !== 'ok') {
        let eq = inTn.value.trim() ? F.equivalentes(inTn.value, canon, { vars: ['k'] }) : { ok: false };
        if (!eq.ok && inst.TnAprox && inTn.value.trim()) { const ap = F.aproximado(inTn.value, canon); if (ap.ok) eq = ap; }
        if (eq.ok) { inTn.className = eq.aprox ? 'alt' : 'ok'; $('#estTn').textContent = '✅'; $('#expTn').innerHTML = eq.aprox ? `<div class="explic alt">≈ Aceptado como forma aproximada. Exacto: ${ADA.tex(F.aLatex(canon))}.</div>` : ''; }
        else { ok = false; if (inTn.value.trim()) { inTn.className = 'mal'; $('#estTn').textContent = '❌'; puntaje.penalizar('tn', 4); ADA.registrarError('tn'); $('#expTn').innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'No es equivalente. ' + eq.diffs.slice(0, 3).map((d) => `n=${d.n}: tuya=${+d.tuyo.toFixed(1)}, correcta=${+d.esperado.toFixed(1)}`).join('; ')}<details style="margin-top:6px"><summary>Ver el desarrollo</summary><div class="pasos-sol">${ADA.pasosT(inst, conv).map((p) => `<div class="item"><div class="txt">${p.txt}</div><div class="formula">${ADA.tex(p.tex, true)}</div></div>`).join('')}</div></details></div>`; } }
      }
      const sel = $('#inCasos'); const esperado = conMejor ? 'si' : 'no';
      if (revelar) { sel.value = esperado; puntaje.revelar('casos'); $('#campoMejor').style.display = conMejor ? '' : 'none'; }
      else if (sel.value !== esperado) { ok = false; if (sel.value) { puntaje.penalizar('casos', 5); ADA.registrarError('mejorpeor'); $('#expCasos').innerHTML = `<div class="explic">${ADA.esc(inst.mejorPeor)}</div>`; } }
      else { $('#estCasos').textContent = '✅'; $('#expCasos').innerHTML = ''; }
      if (conMejor) {
        const inTm = $('#inTm'); const canonM = inst.TnMejor ? (inst.TnMejor[conv] || inst.TnMejor.prof) : null;
        if (canonM) {
          if (revelar) { inTm.value = canonM; inTm.className = 'ok'; puntaje.revelar('tmejor'); }
          else if (inTm.className !== 'ok') {
            const eq = inTm.value.trim() ? F.equivalentes(inTm.value, canonM, { vars: ['k'] }) : { ok: false };
            if (eq.ok) { inTm.className = 'ok'; $('#estTm').textContent = '✅'; $('#expTm').innerHTML = ''; }
            else { ok = false; if (inTm.value.trim()) { inTm.className = 'mal'; $('#estTm').textContent = '❌'; puntaje.penalizar('tmejor', 4); ADA.registrarError('mejorpeor'); $('#expTm').innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'Mejor caso: ' + ADA.esc(inst.mejorPeor)}</div>`; } }
          }
        }
      } else puntaje.max.tmejor = 0;
      const inO = $('#inO');
      if (revelar) { inO.value = 'O(' + inst.bigO + ')'; inO.className = 'ok'; puntaje.revelar('bigo'); }
      else if (inO.className !== 'ok') {
        const r = inO.value.trim() ? F.mismoOrden(inO.value, inst.bigO) : { ok: false };
        if (r.ok) { inO.className = 'ok'; $('#estO').textContent = '✅'; $('#expO').innerHTML = ''; }
        else { ok = false; if (inO.value.trim()) { inO.className = 'mal'; $('#estO').textContent = '❌'; puntaje.penalizar('bigo', 4); ADA.registrarError('bigo'); $('#expO').innerHTML = `<div class="explic">${r.error ? ADA.esc(r.error) : 'El peor caso es de orden ' + ADA.tex('O(' + F.aLatex(inst.bigO) + ')') + '.'}</div>`; } }
      }
      const inW = $('#inW');
      if (revelar) { inW.value = 'Ω(' + inst.omega + ')'; inW.className = 'ok'; puntaje.revelar('omega'); }
      else if (inW.className !== 'ok') {
        const r = inW.value.trim() ? F.mismoOrden(inW.value, inst.omega) : { ok: false };
        if (r.ok) { inW.className = 'ok'; $('#estW').textContent = '✅'; $('#expW').innerHTML = ''; }
        else { ok = false; if (inW.value.trim()) { inW.className = 'mal'; $('#estW').textContent = '❌'; puntaje.penalizar('omega', 4); ADA.registrarError('mejorpeor'); $('#expW').innerHTML = `<div class="explic">Ω se calcula con el MEJOR caso: ${ADA.tex('\\Omega(' + F.aLatex(inst.omega) + ')')}. ${ADA.esc(inst.mejorPeor)}</div>`; } }
      }
      pts(); return ok;
    }
    function terminar() {
      setPaso(4); const p4 = $('#p4'); p4.classList.remove('bloqueado');
      const p = puntaje.total(); ADA.registrarPuntaje(inst.id, p, inst.variante);
      p4.innerHTML = `<div class="resultado"><div class="nota">${p}<small> /100 · nota ${(p / 20).toFixed(1)}</small></div></div>
        <h3>Código</h3><pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre>
        ${U.panelSolucion(inst)}
        <p><b>Ω:</b> ${ADA.tex('\\Omega(' + F.aLatex(inst.omega) + ')')}</p>
        <div class="acciones"><button onclick="ADA.ir('ej',{id:'${inst.id}'})">Repetir</button><button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente →</button><button onclick="ADA.ir('modulo',{fase:${inst.fase}})">Volver al módulo</button></div>`;
      p4.scrollIntoView({ behavior: 'smooth' });
    }
    $('#p3').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#btnAn').click(); });
    $('#btnAn').onclick = () => { if (comprobar(false)) { ADA.registrarAcierto(); ADA.toast('¡Correcto!', 'ok'); terminar(); } else ADA.toast('Revisa lo marcado (o llena lo que falta).', 'mal'); };
    $('#btnRevAn').onclick = () => { comprobar(true); terminar(); };
  };
})();
