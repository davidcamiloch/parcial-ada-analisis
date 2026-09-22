/* app.js – menú principal, módulos, cabecera y arranque. */
(function () {
  'use strict';

  ADA.MODULOS = [
    { fase: 1, nombre: 'Contador de OE', desc: 'Código línea por línea: costo de cada OE, veces, T(n), invariante y Big-O. Incluye comparaciones tipo C.', icono: '🧮' },
    { fase: 2, nombre: '¿Cuántas vueltas?', desc: 'Cabeceras de ciclos: calcula t con traza animada. Incluye <, <=, saltos, log, √, ciclos que no entran y mejor/peor caso.', icono: '🔁' },
    { fase: 3, nombre: 'Anidados, llamadas y recursión', desc: 'Tipo A completo: sumatorias anidadas paso a paso (Σi, Σi², cambio de variable), métodos que se llaman (simulacro P1 y P2), recurrencias desenrolladas.', icono: '🧩' },
    { fase: 4, nombre: 'Diseña el algoritmo', desc: 'Tipo B: elige la estrategia que cumple la cota, arma el código Java, analiza peor/mejor caso, O y Ω. Hoja 1 parte 2 completa + comparaciones.', icono: '✏️' },
    { fase: 5, nombre: 'Teoría rápida', desc: 'Preguntas conceptuales cortas (OE, T(n), O/Ω/Θ, logs, casos, trampas), ordenar funciones por crecimiento y escalamiento (10 ms para n=100 → ¿n=400?).', icono: '📚' },
    { fase: 6, nombre: 'Jefe final: simulacro', desc: 'Dos exámenes nuevos con la estructura del simulacro. Cronómetro, resuelves en papel, soluciones completas y autocalificación con la rúbrica del profe.', icono: '🏁', vista: 'examen' },
    { fase: 7, nombre: 'Chuleta y repaso rápido', desc: 'Chuleta imprimible de 1 página (convención, fórmulas, trampas) y repaso de 20 min armado con tus errores más frecuentes.', icono: '📄', vista: 'repaso' }
  ];

  ADA.actualizarCabecera = function () {
    const e = ADA.estado;
    document.getElementById('stRacha').innerHTML = `🔥 racha <b>${e.racha.actual}</b> (mejor ${e.racha.mejor})`;
    document.getElementById('stDias').innerHTML = `📅 día <b>${e.dias.seguidos}</b>`;
    const hechos = Object.keys(e.puntajes).length;
    document.getElementById('stHechos').innerHTML = `✅ <b>${hechos}</b> ejercicios`;
    document.querySelectorAll('.conv .sw button').forEach((b) => b.classList.toggle('activo', b.dataset.conv === e.convencion));
  };

  ADA.cambiarConvencion = function (c) {
    if (ADA.estado.convencion === c) return;
    const antes = ADA.estado.convencion;
    ADA.estado.convencion = c; ADA.guardar();
    // Si hay un ejercicio abierto, avisar cómo cambia T(n)
    const h = location.hash;
    const m = /#ej\?id=([A-Z0-9]+)/.exec(h);
    const instAbierta = m && ADA.porId[m[1]] ? ADA.instancia(ADA.porId[m[1]], parseInt((/v=(\d+)/.exec(h) || [0, 0])[1], 10)) : null;
    if (instAbierta && (instAbierta.Tn || instAbierta.metodos)) {
      const inst = instAbierta;
      const ms = inst.metodos || [inst];
      const partes = ms.map((M) => `${M.titulo ? M.titulo + ': ' : ''}T(n) = ${M.Tn[antes]} → <b>${M.Tn[c]}</b>`);
      ADA.toast(`Convención <b>${ADA.CONVENCIONES[c].nombre}</b>. ${partes.join(' · ')}. El Big-O no cambia.`, 'alt', 6000);
    } else ADA.toast('Convención: ' + ADA.CONVENCIONES[c].nombre + '. ' + ADA.CONVENCIONES[c].desc, 'info', 5000);
    ADA.renderRuta();
  };

  function claseNota(p) { return p >= 85 ? 'bien' : p >= 60 ? 'regular' : 'malo'; }

  ADA.vista('inicio', function (cont) {
    const e = ADA.estado;
    const repaso = Object.keys(e.repaso);
    const errores = Object.entries(e.errores).sort((a, b) => b[1] - a[1]).slice(0, 6);
    cont.innerHTML = `
      <h1>Parcial 1 · Análisis de Algoritmos</h1>
      <p class="sub">Convención del profe (UFPS) · Simulacro + Hoja 1 · Todo se juega respondiendo. Meta: <b>5.0</b>.</p>
      <div class="tarjetas">${ADA.MODULOS.map((m) => {
        const p = ADA.puntajeModulo(m.fase);
        return `<div class="tarjeta ${m.pronto ? '' : ''}" ${m.pronto ? 'style="opacity:.55;cursor:default"' : `onclick="ADA.ir('${m.vista || 'modulo'}',{fase:${m.fase}})"`}>
          <h3>${m.icono} Fase ${m.fase} · ${m.nombre}</h3><div class="meta">${m.desc}</div>
          ${m.pronto ? '<div class="meta" style="margin-top:6px">(próxima fase)</div>' : m.vista === 'repaso' ? `<div class="meta" style="margin-top:6px">${e.repasoActivo ? 'repaso en curso' : 'listo para el miércoles temprano'}</div>` : m.vista === 'examen' ? `<div class="meta" style="margin-top:6px">${(e.examenes || []).length} presentados${(e.examenes || []).length ? ' · última nota ' + e.examenes[e.examenes.length - 1].nota.toFixed(1) : ''}</div>` : `<div class="meta" style="margin-top:6px">${p.hechos}/${p.total} hechos · promedio ${p.prom}</div><div class="barra"><div style="width:${p.total ? 100 * p.hechos / p.total : 0}%"></div></div>`}
        </div>`; }).join('')}</div>
      <div class="dos" style="margin-top:18px">
        <div class="panel"><h3>🔁 Repetición espaciada</h3>${repaso.length ? '<p class="ayuda">Ejercicios con puntaje bajo; vuelven con otra variante:</p>' + repaso.map((id) => `<span class="chip" style="cursor:pointer" onclick="ADA.ir('ej',{id:'${id}'})">${id} · ${ADA.esc(ADA.porId[id] ? ADA.porId[id].titulo : id)}</span>`).join('') : '<p class="ayuda">Nada pendiente. Lo que falles (menos de 70) aparece aquí.</p>'}</div>
        <div class="panel"><h3>⚠️ Errores más frecuentes</h3>${errores.length ? '<ul class="errores">' + errores.map(([t, c]) => `<li><b>${c}×</b> ${ADA.esc(ADA.TAGS[t] || t)}</li>`).join('') + '</ul>' : '<p class="ayuda">Aún no hay errores registrados.</p>'}</div>
      </div>
      <div class="panel"><h3>Cómo se escribe aquí</h3><p class="ayuda">Costos: números o <code>k</code> (<code>2+k</code>). Veces / T(n): <code>n</code>, <code>n+1</code>, <code>2n^2+3n</code>, <code>10n+10</code>, <code>(n/2)</code> o <code>(n-1)/3 + 1</code> (no hace falta escribir techo ni piso: se acepta la forma con paréntesis), <code>log2(n)</code> o <code>log₂ n</code> (log a secas = base 2), <code>sqrt(n)</code> o <code>√n</code>, <code>n(n+1)/2</code>. Big-O: <code>O(n)</code>, <code>n^2</code>, <code>n log n</code>, <code>1</code>. Se acepta cualquier forma equivalente (se evalúa en n = 1, 2, 5, 10, 100).</p>
      <div class="acciones"><button onclick="if(confirm('¿Borrar todo el progreso?')){ADA.reiniciar();ADA.renderRuta();}">Borrar progreso</button></div></div>
      <p class="pie">Material: SIMULACRO PREVIO1, Hoja 1, plantilla Excel del profe. Ejercicios verificados con código instrumentado (${window.ADA_VERIFICADO ? new Date(window.ADA_VERIFICADO.fecha).toLocaleString() : 'sin sello'}).</p>`;
  });

  ADA.vista('modulo', function (cont, params) {
    const fase = parseInt(params.fase, 10) || 1;
    const m = ADA.MODULOS.find((x) => x.fase === fase);
    const ejs = ADA.ejercicios.filter((e) => e.fase === fase && !e.oculto);
    cont.innerHTML = `<p class="sub"><a href="#inicio">← Inicio</a></p><h1>${m.icono} Fase ${fase} · ${m.nombre}</h1><p class="sub">${m.desc}</p>
      ${fase === 5 ? `<div class="panel"><b>Ronda rápida:</b> 10 preguntas al azar con explicación al fallar. <button class="primario" onclick="ADA.ir('ronda')">⚡ Empezar ronda</button> &nbsp; O practica una a una abajo (las de escalamiento tienen varias variantes).</div>` : ''}
      ${fase === 4 ? `<div class="panel"><b>Método tipo B:</b> 1) lee la cota ("como máximo O(n)") y descarta las estrategias que la superan; 2) escribe el Java más simple que la cumpla; 3) analiza el PEOR caso con la tabla de OE y la sumatoria; 4) busca si alguna condición depende de los datos: si sí, hay mejor caso (Ω); si no, di explícitamente que no existen y O = Ω.</div>` : ''}
      ${fase === 3 ? `<div class="panel"><b>Método:</b> 1) costo de cada línea; 2) vueltas de cada ciclo <i>por ejecución</i> (el interno puede depender de i); 3) sumatoria de adentro hacia afuera: Σ constante = c·(b−a+1), Σ i = n(n+1)/2, Σ i² = n(n+1)(2n+1)/6, cambio de variable m = n−1−i; 4) T(n), invariante del ciclo externo, Big-O. Llamadas: se despliega el método llamado bajo la llamada. Recursión: recurrencia → desenrollar → k = log₂ n.</div>` : ''}
      ${fase === 2 ? `<div class="panel"><b>Método:</b> 1) identifica inicio, condición y salto; 2) escribe los primeros valores de la variable; 3) cuenta con <span class="mono">último − primero + 1</span> (o log si multiplica/divide); 4) verifica con la traza. Recuerda: la condición se evalúa <b>t + 1</b> veces.</div>` : ''}
      ${fase === 1 ? `<div class="panel"><b>Regla del profe en 4 líneas:</b> <code>int x = 0;</code> → 2 · <code>i++</code> → 2 · <code>suma += A[i][i]</code> → 3 · condición → 1 y se evalúa <b>t + 1</b> veces · <b><code>.length</code> vale 1 y se paga cada vez</b> (<code>i &lt; v.length</code> → 2). Modelo: <span class="mono">T(n) = fijos + Σ(cond + cuerpo + actualización) + 1</span>. Cambia la convención arriba a la derecha para ver la diferencia con las hojas resumen.</div>` : ''}
      <div class="tarjetas">${ejs.map((e) => {
        const p = ADA.estado.puntajes[e.id]; const rep = ADA.estado.repaso[e.id];
        return `<div class="tarjeta ${rep ? 'pendiente' : ''}" onclick="ADA.ir('ej',{id:'${e.id}'})">
          <span class="puntos ${p ? claseNota(p.mejor) : ''}">${p ? p.mejor + '/100' : 'nuevo'}</span>
          <h3><span class="etiqueta ${e.tipo}">${e.tipo}</span>${e.id} · ${ADA.esc(e.titulo)}</h3>
          <div class="meta">${ADA.esc(e.fuente)} · ${e.variantes.length} variante${e.variantes.length > 1 ? 's' : ''}${p ? ' · ' + p.intentos + ' intento' + (p.intentos > 1 ? 's' : '') : ''}${rep ? ' · <span class="etiqueta repaso">repasar</span>' : ''}</div>
        </div>`; }).join('')}</div>`;
  });

  window.addEventListener('hashchange', ADA.renderRuta);
  window.addEventListener('DOMContentLoaded', () => {
    ADA.cargar();
    document.querySelectorAll('.conv .sw button').forEach((b) => { b.onclick = () => ADA.cambiarConvencion(b.dataset.conv); });
    ADA.renderRuta();
  });
})();
