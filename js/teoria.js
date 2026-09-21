/* teoria.js – Fase 5: Teoría rápida (opción, numérico, ordenar) y "Ronda" de preguntas encadenadas. */
(function () {
  'use strict';
  const F = window.Formulas;

  /** Renderiza una pregunta dentro de `cont`; llama a onDone(puntos) al terminar. */
  function renderPregunta(cont, inst, onDone) {
    let puntos = 100, intentos = 0;
    const head = `<h2 style="margin-top:0">${ADA.esc(inst.titulo)} <span class="etiqueta">${ADA.esc(inst.fuente)}</span></h2><div class="guia-preg">${ADA.md(ADA.esc(inst.pregunta))}</div>`;
    if (inst.tipoQ === 'opcion') {
      const idx = inst.opciones.map((_, i) => i).sort(() => Math.random() - 0.5);
      cont.innerHTML = head + `<div class="opciones">${idx.map((i) => `<label><input type="radio" name="q" value="${i}"> ${ADA.esc(inst.opciones[i].txt)}</label>`).join('')}</div><div class="qexp"></div><div class="acciones"><button class="primario qcomp">Comprobar</button><span class="pts"></span></div>`;
      cont.querySelector('.qcomp').onclick = () => {
        const r = cont.querySelector('input[name=q]:checked'); if (!r) return;
        const o = inst.opciones[+r.value];
        cont.querySelectorAll('.opciones label').forEach((l) => { const rr = l.querySelector('input'); l.className = inst.opciones[+rr.value].ok ? (o.ok || rr.checked ? 'ok' : '') : (rr.checked ? 'mal' : ''); });
        if (o.ok) { cont.querySelector('.qexp').innerHTML = `<div class="explic ok">${ADA.esc(inst.explicacion)}</div>`; ADA.registrarAcierto(); fin(); }
        else { intentos++; puntos -= 40; ADA.registrarError('teoria'); cont.querySelector('.qexp').innerHTML = `<div class="explic">${ADA.esc(o.porque || 'No.')}${intentos >= 2 ? '<div class="analogia">' + ADA.esc(inst.explicacion) + '</div>' : ''}</div>`; }
      };
    } else if (inst.tipoQ === 'num') {
      cont.innerHTML = head + `<div class="campo"><input type="text" class="qin" placeholder="número (puedes escribir 10*4 o 10*sqrt(16))"><span class="qest"></span></div><div class="qexp"></div><div class="acciones"><button class="primario qcomp">Comprobar</button><button class="qrev">Ver respuesta</button><span class="pts"></span></div>`;
      cont.querySelector('.qcomp').onclick = () => {
        const inp = cont.querySelector('.qin'); let v; try { v = F.ev(inp.value.replace(',', '.'), {}); } catch (e) { cont.querySelector('.qexp').innerHTML = `<div class="explic">No entiendo el número: ${ADA.esc(e.message)}</div>`; return; }
        const ok = Math.abs(v - inst.respuesta) <= (inst.tolRel || 0.02) * Math.abs(inst.respuesta) + 1e-9;
        if (ok) { inp.className = 'qin ok'; cont.querySelector('.qest').textContent = '✅'; cont.querySelector('.qexp').innerHTML = `<div class="explic ok">${ADA.esc(inst.explicacion)}</div>`; ADA.registrarAcierto(); fin(); }
        else { intentos++; puntos -= 25; ADA.registrarError('escalamiento'); inp.className = 'qin mal'; cont.querySelector('.qest').textContent = '❌'; cont.querySelector('.qexp').innerHTML = `<div class="explic">Tu valor: ${+v.toFixed(2)}. ${intentos >= 2 ? ADA.esc(inst.explicacion) : 'Pista: plantea t₂ = t₁ · g(n₂)/g(n₁) con la función del orden.'}</div>`; }
      };
      cont.querySelector('.qrev').onclick = () => { puntos = 0; cont.querySelector('.qin').value = +inst.respuesta.toFixed(2); cont.querySelector('.qexp').innerHTML = `<div class="explic info">${ADA.esc(inst.explicacion)}</div>`; fin(); };
      cont.querySelector('.qin').addEventListener('keydown', (e) => { if (e.key === 'Enter') cont.querySelector('.qcomp').click(); });
      cont.querySelector('.qin').focus();
    } else if (inst.tipoQ === 'orden') {
      const correcto = inst.orden.slice(); let banco = correcto.slice().sort(() => Math.random() - 0.5); let elegido = [];
      cont.innerHTML = head + `<div class="dos"><div><h3>Funciones</h3><div class="banco qbanco"></div></div><div><h3>Tu orden (menor → mayor)</h3><ol class="qorden"></ol></div></div><div class="qexp"></div><div class="acciones"><button class="primario qcomp">Comprobar</button><button class="qdes">↶ Deshacer</button><button class="qrev">Ver respuesta</button><span class="pts"></span></div>`;
      const pintar = () => {
        cont.querySelector('.qbanco').innerHTML = banco.map((f, k) => `<div class="linea-banco" data-k="${k}">${ADA.esc(f)}</div>`).join('') || '<p class="ayuda">(vacío)</p>';
        cont.querySelector('.qorden').innerHTML = elegido.map((f) => `<li>${ADA.esc(f)}</li>`).join('');
        cont.querySelectorAll('.qbanco .linea-banco').forEach((el) => { el.onclick = () => { elegido.push(banco.splice(+el.dataset.k, 1)[0]); pintar(); }; });
      };
      pintar();
      cont.querySelector('.qdes').onclick = () => { if (elegido.length) { banco.push(elegido.pop()); pintar(); } };
      cont.querySelector('.qcomp').onclick = () => {
        if (elegido.length !== correcto.length) { ADA.toast('Coloca todas las funciones.', 'alt'); return; }
        const malas = elegido.map((f, i) => f !== correcto[i] ? i : -1).filter((i) => i >= 0);
        if (!malas.length) { cont.querySelector('.qexp').innerHTML = `<div class="explic ok">¡Correcto! ${ADA.esc(inst.explicacion)}</div>`; ADA.registrarAcierto(); fin(); }
        else { intentos++; puntos -= 25; ADA.registrarError('bigo'); cont.querySelector('.qexp').innerHTML = `<div class="explic">Hay ${malas.length} posición(es) mal; la primera es la ${malas[0] + 1} ("${ADA.esc(elegido[malas[0]])}"). ${intentos >= 2 ? ADA.esc(inst.explicacion) : 'Pista: compara pares vecinos con n = 1000.'}</div>`; }
      };
      cont.querySelector('.qrev').onclick = () => { puntos = 0; elegido = correcto.slice(); banco = []; pintar(); cont.querySelector('.qexp').innerHTML = `<div class="explic info">${ADA.esc(inst.explicacion)}</div>`; fin(); };
    }
    function fin() { cont.querySelector('.acciones').innerHTML = `<span class="pts">Puntos: ${Math.max(0, puntos)}/100</span>`; onDone(Math.max(0, puntos)); }
  }

  /* Vista de una pregunta individual */
  ADA.vistaPregunta = function (cont, def, inst) {
    cont.innerHTML = `<p class="sub"><a href="#modulo?fase=5">← Teoría rápida</a></p><div class="panel" id="q"></div><div id="sig"></div>`;
    renderPregunta(cont.querySelector('#q'), inst, (pts) => {
      ADA.registrarPuntaje(inst.id, pts, inst.variante);
      cont.querySelector('#sig').innerHTML = `<div class="acciones">${inst.nVariantes > 1 ? `<button class="primario" onclick="ADA.ir('ej',{id:'${inst.id}',v:${(inst.variante + 1) % inst.nVariantes}})">Otra variante ↻</button>` : ''}<button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente →</button><button onclick="ADA.ir('modulo',{fase:5})">Volver</button></div>`;
    });
  };

  /* Ronda: N preguntas al azar encadenadas */
  ADA.vista('ronda', function (cont) {
    const defs = ADA.ejercicios.filter((e) => e.fase === 5);
    const N = Math.min(10, defs.length);
    const orden = defs.slice().sort(() => Math.random() - 0.5).slice(0, N);
    let k = 0; const notas = [];
    cont.innerHTML = `<p class="sub"><a href="#modulo?fase=5">← Teoría rápida</a></p><h1>⚡ Ronda de ${N} preguntas</h1><p class="sub" id="prog"></p><div class="panel" id="q"></div><div id="fin"></div>`;
    function siguiente() {
      if (k >= N) {
        const prom = Math.round(notas.reduce((a, b) => a + b, 0) / N);
        cont.querySelector('#q').style.display = 'none';
        cont.querySelector('#fin').innerHTML = `<div class="panel"><div class="resultado"><div class="nota">${prom}<small> /100 · nota ${(prom / 20).toFixed(1)}</small></div><p class="ayuda">${notas.filter((x) => x === 100).length} de ${N} a la primera.</p></div><div class="acciones"><button class="primario" onclick="ADA.renderRuta()">Otra ronda ↻</button><button onclick="ADA.ir('modulo',{fase:5})">Volver</button></div></div>`;
        return;
      }
      const def = orden[k]; const v = Math.floor(Math.random() * def.variantes.length); const inst = ADA.instancia(def, v);
      cont.querySelector('#prog').textContent = `Pregunta ${k + 1} de ${N}`;
      renderPregunta(cont.querySelector('#q'), inst, (pts) => { ADA.registrarPuntaje(inst.id, pts, v); notas.push(pts); k++; cont.querySelector('#q').insertAdjacentHTML('beforeend', '<div class="acciones"><button class="primario" id="btnSig">Siguiente pregunta →</button></div>'); cont.querySelector('#btnSig').onclick = siguiente; cont.querySelector('#btnSig').focus(); });
    }
    siguiente();
  });
})();
