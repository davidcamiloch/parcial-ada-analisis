/* examen.js – Fase 6: Jefe final. Examen cronometrado en papel, soluciones y autocalificación con la rúbrica del profe. */
(function () {
  'use strict';
  const F = window.Formulas;

  const RUBRICA = {
    A: [['oe', 'Costo de cada OE encima / al frente de cada línea', 1.0], ['vueltas', 'Cuántas veces se ejecuta cada ciclo (incluidas las trampas)', 1.0], ['sumatorias', 'Sumatorias explícitas y bien resueltas (paso a paso)', 1.0], ['invariante', 'Invariante(s) al salir del ciclo', 0.5], ['tn', 'T(n) simplificado correcto', 0.8], ['bigo', 'Big-O correcto y justificado', 0.7]],
    B: [['estrategia', 'Estrategia correcta que cumple la cota pedida', 1.5], ['codigo', 'Código Java correcto y completo', 1.0], ['tn', 'T(n) del peor caso con OE por línea y sumatoria', 1.0], ['mejorpeor', 'Peor y mejor caso identificados (o justificado que no existen)', 0.75], ['bigo', 'Big-O y Ω correctos', 0.75]],
    C: [['analisis', 'Análisis de cada método: iteraciones y OE por línea', 2.0], ['comparacion', 'Comparación con números concretos (tabla n = 10, 100)', 1.5], ['conclusion', 'Conclusión correcta; aclara si el Big-O cambia o no', 1.5]]
  };
  const REPASO = {
    oe: 'Costos por línea → Fase 1 (A01, A02) y Fase 3 (A24).',
    vueltas: 'Vueltas de cada ciclo → Fase 2 completa, en especial V07–V15 (log, √, ciclos que no entran o corren 1 vez).',
    sumatorias: 'Sumatorias → Fase 3: A09 (independientes), A14/A15 (dependientes, cambio de variable), A10 (Σi²).',
    invariante: 'Invariante = condición al salir del ciclo → Fase 1 (cualquier ejercicio, campo Invariante).',
    tn: 'Armar y simplificar T(n) → Fase 1 (A02) y Fase 3 (A24, A25).',
    bigo: 'Big-O: término dominante, bases de log, √n vs log n → Fase 3 (A24, A25, A22) y teoría.',
    estrategia: 'Diseño con cota → Fase 4 (cuando esté) y sonIgualesD del simulacro (A02).',
    codigo: 'Escribir Java limpio: practica escribiendo a mano las soluciones de A02, X13, X23.',
    mejorpeor: 'Mejor/peor caso → Fase 2 (V16–V18) y Fase 3 (A16, A18).',
    analisis: 'Análisis por método → Fase 1 (C01, C02) y Fase 3 (C03, C04).',
    comparacion: 'Comparar con números → tabla n = 10/100/1000 en C01.',
    conclusion: 'Argumentar con iteraciones e instrucciones, no solo Big-O → C01, C04, X14.'
  };
  const NIVELES = [['bien', 'Bien', 1], ['parcial', 'Parcial', 0.5], ['mal', 'Mal / no lo hice', 0]];

  const fmtT = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0'); };
  const examenPor = (id) => ADA.EXAMENES.find((e) => e.id === id);
  const instPunto = (id) => ADA.instancia(ADA.porId[id], 0);

  /* ---------- Configuración ---------- */
  ADA.vista('examen', function (cont) {
    const e = ADA.estado; const hist = e.examenes || []; const activo = e.examenActivo;
    cont.innerHTML = `<p class="sub"><a href="#inicio">← Inicio</a></p><h1>🏁 Jefe final: simulacro en papel</h1>
      <p class="sub">Misma estructura del simulacro: P1 tipo A con métodos anidados y log · P2 tipo A con trampa · P3 tipo B con cota O(n) · P4 tipo C. Resuelves EN PAPEL con cronómetro; al terminar el juego muestra las soluciones completas y te autocalificas con la rúbrica del profe.</p>
      ${activo ? `<div class="panel" style="border-color:var(--acento)"><b>Tienes un examen en curso</b> (${examenPor(activo.examen).titulo}, empezó ${new Date(activo.inicio).toLocaleTimeString()}). <div class="acciones"><button class="primario" onclick="ADA.ir('examen-activo')">Continuar</button><button onclick="if(confirm('¿Abandonar el examen en curso?')){delete ADA.estado.examenActivo;ADA.guardar();ADA.renderRuta();}">Abandonar</button></div></div>` : ''}
      <div class="panel"><h3>Empezar</h3>
        <div class="campo"><label>Examen</label><select id="selEx">${ADA.EXAMENES.map((x) => `<option value="${x.id}">${x.titulo}${hist.some((h) => h.examen === x.id) ? ' (ya presentado: ' + hist.filter((h) => h.examen === x.id).map((h) => h.nota.toFixed(1)).join(', ') + ')' : ''}</option>`).join('')}</select></div>
        <div class="campo"><label>Tiempo (min)</label><input type="text" id="inMin" value="120" style="max-width:100px;min-width:80px"><span class="ayuda">2 h como el parcial; pon 60 si quieres presión.</span></div>
        <p class="ayuda">Necesitas: hojas, lápiz y la hoja de fórmulas del profe si te la permiten. Durante el examen NO uses el juego para consultar. Al pulsar "Terminé" se registra el tiempo y se muestran las soluciones.</p>
        <div class="acciones"><button class="primario" id="btnStart">Empezar examen ▶</button></div></div>
      ${hist.length ? `<div class="panel"><h3>Historial</h3><table class="cmp"><tr><th>Fecha</th><th>Examen</th><th>Tiempo</th><th>Nota</th><th>P1</th><th>P2</th><th>P3</th><th>P4</th></tr>${hist.slice().reverse().map((h) => `<tr><td>${h.fecha}</td><td>${examenPor(h.examen).titulo}</td><td>${fmtT(h.tiempoMs)}</td><td><b>${h.nota.toFixed(1)}</b></td>${h.puntos.map((p) => '<td>' + p.toFixed(1) + '</td>').join('')}</tr>`).join('')}</table></div>` : ''}`;
    cont.querySelector('#btnStart').onclick = () => {
      const min = Math.max(5, parseInt(cont.querySelector('#inMin').value, 10) || 120);
      ADA.estado.examenActivo = { examen: cont.querySelector('#selEx').value, inicio: Date.now(), duracionMin: min };
      ADA.guardar(); ADA.ir('examen-activo');
    };
  });

  /* ---------- Examen en curso ---------- */
  function htmlPunto(inst, k, imprimir) {
    const tipo = inst.tipo;
    let cuerpo = '';
    if (tipo === 'A') cuerpo = `<p>${ADA.esc(inst.enunciado)}</p><pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre>`;
    else if (tipo === 'B') cuerpo = `<p>${ADA.esc(inst.enunciado)}</p><pre class="codigo-grande">${ADA.esc(inst.firma)}</pre>`;
    else cuerpo = `<p>${ADA.esc(inst.enunciado)}</p><pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre>`;
    return `<div class="panel punto"><h2>Punto ${k + 1} <span class="etiqueta ${tipo}">Tipo ${tipo}</span></h2>${cuerpo}</div>`;
  }
  let timer = null;
  ADA.vista('examen-activo', function (cont) {
    clearInterval(timer);
    const act = ADA.estado.examenActivo;
    if (!act) { ADA.ir('examen'); return; }
    const ex = examenPor(act.examen);
    const puntos = ex.puntos.map(instPunto);
    cont.innerHTML = `<div class="no-print"><p class="sub"><a href="#examen">← Jefe final</a></p></div>
      <div class="exam-cab"><div><h1 style="margin:0">${ex.titulo} · Análisis de Algoritmos</h1><span class="ayuda">Resuelve en papel. Justifica todo: costo por línea, vueltas, sumatorias, invariante, T(n), Big-O.</span></div><div class="reloj" id="reloj">--:--</div></div>
      ${puntos.map((p, k) => htmlPunto(p, k)).join('')}
      <div class="acciones no-print"><button onclick="window.print()">🖨 Imprimir enunciado</button><button class="primario" id="btnFin">Terminé: ver soluciones y calificarme</button></div>`;
    const reloj = cont.querySelector('#reloj');
    const fin = act.inicio + act.duracionMin * 60000;
    function tick() {
      const rest = fin - Date.now();
      reloj.textContent = fmtT(rest);
      reloj.className = 'reloj' + (rest < 10 * 60000 ? ' alerta' : '');
      if (rest <= 0) { clearInterval(timer); ADA.toast('⏰ Tiempo agotado. Se muestran las soluciones.', 'mal', 6000); terminar(true); }
    }
    function terminar(agotado) {
      act.finMs = Date.now(); act.agotado = !!agotado; ADA.guardar();
      ADA.ir('examen-calificar');
    }
    tick(); timer = setInterval(tick, 1000);
    cont.querySelector('#btnFin').onclick = () => { if (confirm('¿Terminaste? Se mostrarán las soluciones y ya no podrás seguir.')) terminar(false); };
  });

  /* ---------- Soluciones + rúbrica ---------- */
  function htmlSolucion(inst) {
    const U = ADA.ui; const conv = ADA.conv();
    if (inst.tipo === 'A') return U.panelSolucion(inst) + (inst.trampa ? `<div class="analogia"><b>Trampa / aclaración:</b> ${ADA.esc(inst.trampa)}</div>` : '');
    if (inst.tipo === 'B') return `<h3>Estrategias</h3><div class="opciones">${inst.estrategias.map((o) => `<label class="${o.ok ? 'ok' : 'mal'}" style="cursor:default">${o.ok ? '✔' : '✘'} ${ADA.esc(o.txt)}<br><span class="ayuda">${ADA.esc(o.porque)}</span></label>`).join('')}</div><h3>Código</h3><pre class="codigo-grande">${ADA.resaltarJava(inst.codigo)}</pre>${U.panelSolucion(inst)}<p><b>Ω:</b> ${ADA.tex('\\Omega(' + F.aLatex(inst.omega || inst.bigO) + ')')}</p>`;
    const [A, B] = inst.metodos;
    let tabla = `<table class="cmp"><tr><th>n</th><th>Iteraciones ${ADA.esc(A.titulo)}</th><th>Iteraciones ${ADA.esc(B.titulo)}</th><th>OE ${ADA.esc(A.titulo)}</th><th>OE ${ADA.esc(B.titulo)}</th></tr>`;
    for (const n of inst.nTabla) tabla += `<tr><td>${n}</td><td>${F.ev(A.iteraciones, { n })}</td><td>${F.ev(B.iteraciones, { n })}</td><td>${ADA.Tnum(A.lineas, n, conv).toLocaleString()}</td><td>${ADA.Tnum(B.lineas, n, conv).toLocaleString()}</td></tr>`;
    tabla += '</table>';
    const ok = inst.opciones.find((o) => o.ok);
    return `<h3>Comparación</h3>${tabla}<div class="explic ok"><b>Más eficiente: ${ADA.esc(inst.metodos[inst.masEficiente].titulo)}.</b> ${ADA.esc(ok.txt)}</div><div class="dos"><div>${U.panelSolucion(A)}</div><div>${U.panelSolucion(B)}</div></div>`;
  }
  function htmlRubrica(tipo, k) {
    return `<div class="rubrica"><h3>Autocalifícate (rúbrica del profe, punto sobre 5.0)</h3><table class="cmp" style="width:100%"><tr><th style="text-align:left">Criterio</th><th>Vale</th>${NIVELES.map((n) => '<th>' + n[1] + '</th>').join('')}</tr>
      ${RUBRICA[tipo].map(([key, txt, peso], i) => `<tr><td style="text-align:left">${txt}</td><td>${peso.toFixed(2)}</td>${NIVELES.map((n) => `<td><input type="radio" name="r${k}_${i}" value="${n[2]}" data-key="${key}" data-peso="${peso}"></td>`).join('')}</tr>`).join('')}</table></div>`;
  }
  ADA.vista('examen-calificar', function (cont) {
    clearInterval(timer);
    const act = ADA.estado.examenActivo;
    if (!act) { ADA.ir('examen'); return; }
    const ex = examenPor(act.examen);
    const puntos = ex.puntos.map(instPunto);
    const usado = (act.finMs || Date.now()) - act.inicio;
    cont.innerHTML = `<p class="sub"><a href="#examen">← Jefe final</a></p><h1>${ex.titulo} · Soluciones y calificación</h1>
      <p class="sub">Tiempo usado: <b>${fmtT(usado)}</b> de ${act.duracionMin} min${act.agotado ? ' · <span class="etiqueta repaso">tiempo agotado</span>' : ''}. Compara tu hoja con cada solución y marca honestamente cada criterio.</p>
      ${puntos.map((p, k) => `<div class="panel"><h2>Punto ${k + 1} <span class="etiqueta ${p.tipo}">Tipo ${p.tipo}</span> · ${ADA.esc(p.titulo)}</h2><details open><summary>Enunciado</summary>${p.tipo === 'B' ? '<p>' + ADA.esc(p.enunciado) + '</p>' : '<pre class="codigo-grande">' + ADA.resaltarJava(p.codigo) + '</pre>'}</details><div class="solucion">${htmlSolucion(p)}</div>${htmlRubrica(p.tipo, k)}</div>`).join('')}
      <div class="panel"><div class="acciones"><button class="primario" id="btnNota">Calcular mi nota</button></div><div id="resultado"></div></div>`;
    cont.querySelector('#btnNota').onclick = () => {
      const notas = []; const repasar = new Map(); let faltan = 0;
      puntos.forEach((p, k) => {
        let nota = 0;
        RUBRICA[p.tipo].forEach(([key, txt, peso], i) => {
          const r = cont.querySelector(`input[name="r${k}_${i}"]:checked`);
          if (!r) { faltan++; return; }
          const v = parseFloat(r.value); nota += peso * v;
          if (v < 1) repasar.set(key, (repasar.get(key) || 0) + peso * (1 - v));
        });
        notas.push(nota);
      });
      if (faltan) { ADA.toast('Faltan ' + faltan + ' criterios por marcar.', 'alt'); return; }
      const final = notas.reduce((a, b) => a + b, 0) / notas.length;
      const reg = { fecha: new Date().toISOString().slice(0, 10), examen: ex.id, tiempoMs: usado, nota: final, puntos: notas, repasar: [...repasar.keys()] };
      (ADA.estado.examenes = ADA.estado.examenes || []).push(reg);
      delete ADA.estado.examenActivo; ADA.guardar();
      const lista = [...repasar.entries()].sort((a, b) => b[1] - a[1]);
      cont.querySelector('#resultado').innerHTML = `<div class="resultado"><div class="nota">${final.toFixed(1)}<small> / 5.0</small></div><p>${notas.map((n, i) => 'P' + (i + 1) + ': ' + n.toFixed(1)).join(' · ')} · tiempo ${fmtT(usado)}</p>
        <p class="ayuda">${final >= 4.5 ? '¡Nivel 5.0! Ahora asegúralo: repite el otro examen con menos tiempo.' : final >= 3.5 ? 'Vas bien; ataca la lista de repaso y vuelve a presentar.' : 'Toca repasar con calma; usa la lista y vuelve a intentarlo mañana temprano.'}</p></div>
        <h3>Qué repasar (ordenado por lo que más puntos te costó)</h3>${lista.length ? '<ol>' + lista.map(([k, v]) => `<li><b>${ADA.esc(RUBRICA.A.concat(RUBRICA.B, RUBRICA.C).find((r) => r[0] === k)[1])}</b> (−${v.toFixed(2)}): ${ADA.esc(REPASO[k])}</li>`).join('') + '</ol>' : '<p>Nada: todo Bien. 🎉</p>'}
        <div class="acciones"><button class="primario" onclick="ADA.ir('examen')">Volver al Jefe final</button><button onclick="ADA.ir('inicio')">Inicio</button></div>`;
      cont.querySelector('#resultado').scrollIntoView({ behavior: 'smooth' });
    };
  });
})();
