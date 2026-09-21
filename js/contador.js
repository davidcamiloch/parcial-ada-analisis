/* contador.js – Módulo "Contador de OE": vistas para ejercicios tipo A (código → T(n)) y tipo C (comparar). */
(function () {
  'use strict';
  const F = window.Formulas;

  class Contador { constructor() { this.cnt = {}; this.traza = []; } c(id) { this.cnt[id] = (this.cnt[id] || 0) + 1; } v(o) { if (this.traza.length < 500) this.traza.push(Object.assign({}, o)); } }

  const ANALOGIAS = {
    condveces: '<b>Analogía:</b> el portero de una fiesta revisa la boleta de cada persona que entra (t veces) y también la del primero que ya no puede entrar (1 vez más). Por eso la condición se evalúa t + 1 veces.',
    decl: '<b>Analogía:</b> "int x = 0" son dos trabajos: comprar la caja (declarar) y meter algo dentro (asignar). El profe cobra los dos.',
    upd: '<b>Analogía:</b> "i++" es "calcula i + 1" y luego "guárdalo en i": dos pasos, dos OE.',
    acum: '<b>Analogía:</b> "suma += v[i]" es ir a buscar el valor al estante (acceso), sumarlo (operación) y anotar el resultado (asignación).',
    rama: '<b>Analogía:</b> en una bifurcación solo tomas un camino; cuentas el peaje de uno, no de los dos.',
    nunca: '<b>Analogía:</b> preguntar "¿puedo entrar?" cuesta aunque la respuesta sea no. Un ciclo que no entra cobra 1 por la pregunta.',
    bigo: '<b>Analogía:</b> para saber cuánto pesa un camión cargado no importa el peso del conductor: en Big-O solo cuenta el término que más crece.',
    inv: '<b>Idea:</b> la invariante que pide el profe es la condición que se cumple justo al salir del ciclo (la negación de la guarda): si el ciclo era "while (i < n)", al salir i == n.'
  };

  /* ---------- Puntuación por sección ---------- */
  class Puntaje {
    constructor(secciones) { this.max = secciones; this.pen = {}; this.pistas = 0; this.revelado = {}; }
    penalizar(sec, cuanto) { this.pen[sec] = (this.pen[sec] || 0) + cuanto; }
    revelar(sec) { this.revelado[sec] = true; }
    total() {
      let t = 0;
      for (const s of Object.keys(this.max)) t += this.revelado[s] ? 0 : Math.max(0, this.max[s] - (this.pen[s] || 0));
      return Math.max(0, Math.round(t - this.pistas));
    }
  }

  /* ---------- Tabla de líneas (costo / veces) ---------- */
  function filaHtml(L, num, rol) {
    const cls = ['ind0', 'ind1', 'ind2', 'ind3', 'ind4'][Math.min(L.prof || 0, 4)];
    return `<tr class="${rol ? 'parte' : ''} ${L.ciclo && !rol ? '' : ''}" data-id="${L.id}">
      <td class="num">${rol ? '' : num}</td>
      <td class="cod ${cls}" ${rol ? 'data-rol="' + rol + '"' : ''}>${ADA.resaltarJava(L.txt)}</td>
      <td class="in"><input type="text" data-campo="costo" data-id="${L.id}" placeholder="costo" autocomplete="off"></td>
      <td class="in"><input type="text" data-campo="veces" data-id="${L.id}" placeholder="veces" autocomplete="off"></td>
      <td class="est" data-est="${L.id}"></td>
    </tr>`;
  }
  function filaSinCosto(txt, num, prof) {
    const cls = ['ind0', 'ind1', 'ind2', 'ind3', 'ind4'][Math.min(prof, 4)];
    return `<tr class="sin"><td class="num">${num}</td><td class="cod ${cls}">${ADA.resaltarJava(txt)}</td><td></td><td></td><td></td></tr>`;
  }
  const ROLES = { init: 'inicialización', cond: 'condición', upd: 'actualización' };

  /** ¿El método tiene ciclos anidados/dependientes o llamadas desplegadas? → modo "anidado" (costo por línea + vueltas por ciclo). */
  function esAnidado(metodo) { return !!metodo.guia || ADA.aplanar(metodo.lineas).some((L) => L.padre && L.padre.ciclo && L.padre.ciclo.total); }

  /** Genera el HTML de la tabla de líneas de un método. modo: 'simple' (costo + veces) | 'anidado' (costo; vueltas por ciclo). */
  function tablaLineas(metodo, modo) {
    modo = modo || (esAnidado(metodo) ? 'anidado' : 'simple');
    const filas = [];
    let num = 1;
    const cls = (prof) => ['ind0', 'ind1', 'ind2', 'ind3', 'ind4'][Math.min(prof, 4)];
    function fila(L, n, rol, prof) {
      if (modo === 'simple') return filaHtml(Object.assign({ prof }, L), n, rol);
      return `<tr class="${rol ? 'parte' : ''}" data-id="${L.id}">
        <td class="num">${rol ? '' : n}</td>
        <td class="cod ${cls(prof)}" ${rol ? 'data-rol="' + rol + '"' : ''}>${ADA.resaltarJava(L.txt)}</td>
        <td class="in"><input type="text" data-campo="costo" data-id="${L.id}" placeholder="costo" autocomplete="off"></td>
        <td class="ayuda">${L.veces === '0' ? '0 (no corre)' : ''}</td>
        <td class="est" data-est="${L.id}"></td></tr>`;
    }
    function rec(lineas, prof) {
      for (const L of lineas) {
        if (L.partes) {
          if (modo === 'simple') filas.push(`<tr class="ciclo"><td class="num">${num++}</td><td class="cod ${cls(prof)}">${ADA.resaltarJava(L.txt)}</td><td colspan="3" class="ayuda">↓ partes del ciclo</td></tr>`);
          else filas.push(`<tr class="ciclo" data-ciclo="${L.id}"><td class="num">${num++}</td><td class="cod ${cls(prof)}">${ADA.resaltarJava(L.txt)}</td><td class="ayuda" style="text-align:right">vueltas (t) →</td><td class="in"><input type="text" data-campo="t" data-id="${L.id}" placeholder="por ejecución" autocomplete="off"></td><td class="est" data-estt="${L.id}"></td></tr>`);
          for (const P of L.partes) filas.push(fila(P, '', ROLES[P.rol] || P.rol, prof));
          rec(L.cuerpo || [], prof + 1);
          if (L.cierre) filas.push(filaSinCosto(L.cierre, num++, prof));
        } else {
          if (L.costo != null) filas.push(fila(L, num++, null, prof));
          else if (L.txt) filas.push(filaSinCosto(L.txt, num++, prof));
          if (L.llamada) filas.push(`<tr class="sin"><td></td><td class="cod ${cls(prof + 1)}" style="color:var(--info);font-family:var(--sans);font-size:12px">→ dentro de ${ADA.esc(L.llamada)} (se ejecuta en cada llamada):</td><td></td><td></td><td></td></tr>`);
          if (L.cuerpo) { rec(L.cuerpo, prof + 1); if (L.cierre) filas.push(filaSinCosto(L.cierre, num++, prof)); }
        }
      }
    }
    rec(metodo.lineas, 0);
    const html = `<div class="firma">${ADA.esc(metodo.firma || '')}</div>
      <table class="oe"><thead><tr><th>#</th><th>Código</th><th>Costo (OE)</th><th>${modo === 'simple' ? 'Veces' : 'Vueltas del ciclo'}</th><th></th></tr></thead><tbody>${filas.join('')}</tbody></table>`;
    return html;
  }

  /** Modo anidado: comprueba las vueltas (t) escritas en cada cabecera de ciclo. */
  function comprobarCiclos(cont, metodo, puntaje, sec, intentos) {
    let todoOk = true, nuevosErrores = 0;
    function rec(lineas) {
      for (const L of lineas) {
        if (L.partes) {
          const inp = cont.querySelector(`input[data-campo="t"][data-id="${L.id}"]`);
          const est = cont.querySelector(`[data-estt="${L.id}"]`);
          const viejo = cont.querySelector(`tr[data-ciclo="${L.id}"] + tr.explicfila`); if (viejo) viejo.remove();
          if (inp) {
            if (!inp.value.trim()) todoOk = false;
            else if (inp.className !== 'ok') {
              const c = L.ciclo;
              const vars = ['i', 'j', 'c', 'r', 'p', 'q', 'x', 'I', 's', 'u'];
              const eq = F.equivalentes(inp.value, String(c.t), { vars, absTol: c.tol || 0 });
              if (eq.ok) { inp.className = 'ok'; est.textContent = '✅'; }
              else {
                todoOk = false; nuevosErrores++; inp.className = 'mal'; est.textContent = '❌';
                const clave = L.id + '.t'; intentos[clave] = (intentos[clave] || 0) + 1;
                puntaje.penalizar(sec, 3); ADA.registrarError('veces');
                const tr = cont.querySelector(`tr[data-ciclo="${L.id}"]`);
                tr.after(ADA.el(`<tr class="explicfila"><td></td><td colspan="4"><div class="explic"><b>Vueltas:</b> ${eq.error ? ADA.esc(eq.error) : 'este ciclo da ' + ADA.tex(F.aLatex(String(c.t))) + ' vueltas cada vez que se ejecuta' + (c.total && !F.equivalentes(String(c.total), String(c.t)).ok ? ' (en total ' + ADA.tex(F.aLatex(String(c.total))) + ')' : '') + '.'} ${c.valores ? 'Valores: ' + ADA.esc(c.valores) + '.' : ''}${intentos[clave] >= 2 ? '<div class="analogia">Escribe los valores que toma la variable para n = 5 (y un i concreto si depende de i) y cuéntalos: último − primero + 1.</div>' : ''}</div></td></tr>`));
              }
            }
          }
          rec(L.cuerpo || []);
        } else if (L.cuerpo) rec(L.cuerpo);
      }
    }
    rec(metodo.lineas);
    return { todoOk, nuevosErrores };
  }

  /** Comprueba los inputs de una tabla. Devuelve {todoOk, errores:[...]} y pinta los estados. */
  function comprobarTabla(cont, metodo, puntaje, sec, intentos) {
    const conv = ADA.conv();
    const plano = ADA.aplanar(metodo.lineas);
    let todoOk = true; let nuevosErrores = 0;
    const anidado = !cont.querySelector('input[data-campo="veces"]');
    for (const L of plano) {
      const inC = cont.querySelector(`input[data-campo="costo"][data-id="${L.id}"]`);
      const inV = cont.querySelector(`input[data-campo="veces"][data-id="${L.id}"]`) || { value: L.veces, className: '' };
      const est = cont.querySelector(`[data-est="${L.id}"]`);
      const viejo = cont.querySelector(`tr[data-id="${L.id}"] + tr.explicfila`); if (viejo) viejo.remove();
      const msgs = [];
      // costo
      const canon = ADA.costoTxt(L, conv);
      let rc = 'vacio';
      if (inC.value.trim()) {
        const eq = F.equivalentes(inC.value, canon, { vars: ['k'] });
        if (eq.ok) rc = 'ok';
        else {
          const alts = (L.alt && L.alt[conv]) || [];
          if (alts.some((a) => F.equivalentes(inC.value, a, { vars: ['k'] }).ok)) rc = 'alt';
          else rc = eq.error ? 'error:' + eq.error : 'mal';
        }
      }
      inC.className = rc === 'ok' ? 'ok' : rc === 'alt' ? 'alt' : rc === 'vacio' ? '' : 'mal';
      if (rc === 'alt') msgs.push(`<div class="explic alt">≈ Aceptable. El profe lo cuenta como <b>${ADA.esc(canon)}</b>: ${L.porque || ''}</div>`);
      else if (rc.startsWith('error:')) { msgs.push(`<div class="explic">${ADA.esc(rc.slice(6))}</div>`); todoOk = false; }
      else if (rc === 'mal') {
        todoOk = false; nuevosErrores++;
        const clave = L.id + '.costo'; intentos[clave] = (intentos[clave] || 0) + 1;
        puntaje.penalizar(sec, 2); ADA.registrarError(L.tag);
        msgs.push(`<div class="explic"><b>Costo:</b> el profe lo cuenta como <b>${ADA.esc(canon)}</b>. ${L.porque || ''}${ANALOGIAS[L.tag] && intentos[clave] >= 2 ? '<div class="analogia">' + ANALOGIAS[L.tag] + '</div>' : ''}</div>`);
      } else if (rc === 'vacio') todoOk = false;
      // veces
      let rv = 'vacio';
      if (anidado) rv = 'ok';
      else if (inV.value.trim()) {
        const eq = F.equivalentes(inV.value, L.veces);
        rv = eq.ok ? 'ok' : eq.error ? 'error:' + eq.error : 'mal';
        // "n/2" en vez de ⌈n/2⌉: difiere menos de 1 vuelta → aceptable con aclaración (el profe suele admitirlo)
        if (rv === 'mal' && eq.diffs && eq.diffs.every((d) => Math.abs(d.tuyo - d.esperado) < 1)) rv = 'alt';
      }
      if (!anidado) inV.className = rv === 'ok' ? 'ok' : rv === 'alt' ? 'alt' : rv === 'vacio' ? '' : 'mal';
      if (rv === 'alt') {
        const ds = F.equivalentes(inV.value, L.veces).diffs; const ej = ds.find((d) => d.n === 5) || ds.find((d) => d.n === 7) || ds[0];
        msgs.push(`<div class="explic alt">≈ Aceptable, pero el valor exacto es ${ADA.tex(F.aLatex(L.veces))}: para n = ${ej.n} el ciclo da <b>${ej.esperado}</b> vueltas y tu fórmula da ${+ej.tuyo.toFixed(2)}. En el parcial puedes escribir el redondeo si quieres, pero aquí vale así. ${L.porqueVeces || ''}</div>`);
      }
      if (rv.startsWith('error:')) { msgs.push(`<div class="explic">${ADA.esc(rv.slice(6))}</div>`); todoOk = false; }
      else if (rv === 'mal') {
        todoOk = false; nuevosErrores++;
        const clave = L.id + '.veces'; intentos[clave] = (intentos[clave] || 0) + 1;
        const tag = L.rol === 'cond' ? 'condveces' : (L.veces === '0' ? 'noejec' : (L.tag === 'vecesif' ? 'vecesif' : 'veces'));
        puntaje.penalizar(sec, 2); ADA.registrarError(tag);
        const vecesTex = ADA.tex(F.aLatex(L.veces));
        msgs.push(`<div class="explic"><b>Veces:</b> se ejecuta ${vecesTex}. ${L.porqueVeces || (L.ciclo ? 'Está dentro del ciclo, que da ' + ADA.tex(F.aLatex(L.ciclo.ciclo.t)) + ' vueltas.' : 'Está fuera de todo ciclo: corre 1 vez.')}${ANALOGIAS[tag] && intentos[clave] >= 2 ? '<div class="analogia">' + ANALOGIAS[tag] + '</div>' : ''}</div>`);
      } else if (rv === 'vacio') todoOk = false;
      est.textContent = (rc === 'ok' || rc === 'alt') && (rv === 'ok' || rv === 'alt') ? '✅' : (rc === 'mal' || rv === 'mal' || rc.startsWith('error') || rv.startsWith('error')) ? '❌' : '';
      if (msgs.length) {
        const tr = cont.querySelector(`tr[data-id="${L.id}"]`);
        const fila = ADA.el(`<tr class="explicfila"><td></td><td colspan="4">${msgs.join('')}</td></tr>`);
        tr.after(fila);
      }
    }
    return { todoOk, nuevosErrores };
  }

  function revelarTabla(cont, metodo) {
    const conv = ADA.conv();
    for (const L of ADA.aplanar(metodo.lineas)) {
      const inC = cont.querySelector(`input[data-campo="costo"][data-id="${L.id}"]`);
      const inV = cont.querySelector(`input[data-campo="veces"][data-id="${L.id}"]`);
      inC.value = ADA.costoTxt(L, conv); inC.className = 'ok'; if (inV) { inV.value = L.veces; inV.className = 'ok'; }
      cont.querySelector(`[data-est="${L.id}"]`).textContent = '👁';
      const viejo = cont.querySelector(`tr[data-id="${L.id}"] + tr.explicfila`); if (viejo) viejo.remove();
      const tr = cont.querySelector(`tr[data-id="${L.id}"]`);
      tr.after(ADA.el(`<tr class="explicfila"><td></td><td colspan="4"><div class="explic info">${L.porque || ''} ${L.porqueVeces ? '<br>' + L.porqueVeces : ''}</div></td></tr>`));
    }
    cont.querySelectorAll('input[data-campo="t"]').forEach((inp) => {
      const L = ADA.aplanar(metodo.lineas).find((x) => x.padre && x.padre.id === inp.dataset.id);
      if (L) { inp.value = L.padre.ciclo.t; inp.className = 'ok'; cont.querySelector(`[data-estt="${inp.dataset.id}"]`).textContent = '👁'; }
    });
  }

  /** Tabla de valores (traza) para n pequeño. */
  function tablaTraza(metodo, n) {
    const C = new Contador();
    try { metodo.ejecutar(n, C); } catch (e) { return '<div class="explic">No se pudo ejecutar la traza: ' + ADA.esc(e.message) + '</div>'; }
    let html = '';
    if (C.traza.length) {
      const cols = Object.keys(C.traza[0]);
      html += `<p class="ayuda">Valores de las variables cada vez que se evalúa la condición del ciclo (n = ${n}). La última fila es la evaluación que da <b>falso</b> y saca del ciclo.</p><table class="traza"><tr><th>evaluación</th>${cols.map((c) => '<th>' + c + '</th>').join('')}</tr>`;
      C.traza.forEach((f, i) => { html += `<tr class="${i === C.traza.length - 1 ? 'salida' : ''}"><td>${i + 1}${i === C.traza.length - 1 ? ' (sale)' : ''}</td>${cols.map((c) => '<td>' + f[c] + '</td>').join('')}</tr>`; });
      html += '</table>';
    }
    const plano = ADA.aplanar(metodo.lineas);
    html += `<p class="ayuda" style="margin-top:10px">Conteo real de ejecuciones por línea con n = ${n}:</p><table class="traza"><tr><th>línea</th><th>veces reales</th><th>fórmula</th></tr>`;
    for (const L of plano) html += `<tr><td style="text-align:left">${ADA.esc(L.txt)}</td><td>${C.cnt[L.id] || 0}</td><td>${ADA.tex(F.aLatex(L.veces))} = ${F.ev(L.veces, { n })}</td></tr>`;
    html += '</table>';
    return html;
  }

  /** Panel de solución completa estilo profe. */
  function panelSolucion(metodo) {
    const conv = ADA.conv();
    const plano = ADA.aplanar(metodo.lineas);
    let html = `<h3>Solución completa (convención ${ADA.CONVENCIONES[conv].nombre})</h3><table class="oe"><thead><tr><th>Línea</th><th>Operación</th><th>Costo</th><th>Veces</th></tr></thead><tbody>`;
    for (const L of plano) html += `<tr class="${L.rol ? 'parte' : ''}"><td class="cod" ${L.rol ? 'data-rol="' + (ROLES[L.rol] || '') + '"' : ''}>${ADA.resaltarJava(L.txt)}</td><td class="ayuda">${L.porque || ''}</td><td class="mono">${ADA.esc(ADA.costoTxt(L, conv))}</td><td>${ADA.tex(F.aLatex(L.veces))}</td></tr>`;
    html += '</tbody></table>';
    if (metodo.ciclo || !metodo.sinCiclo) {
      const inv = metodo.invariante;
      if (inv) html += `<p><b>Invariante:</b> <code>${ADA.esc(inv)}</code> (condición al salir del ciclo).</p>`;
    }
    html += '<div class="pasos-sol">';
    for (const p of ADA.pasosT(metodo, conv)) html += `<div class="item"><div class="txt">${p.txt}</div><div class="formula">${ADA.tex(p.tex, true)}</div></div>`;
    html += '</div>';
    if (metodo.mejorPeor) html += `<p><b>Mejor / peor caso:</b> ${metodo.mejorPeor}</p>`;
    if (metodo.notas) html += `<div class="explic info">${metodo.notas}</div>`;
    return html;
  }

  /* ---------- Vista ejercicio tipo A ---------- */
  ADA.vista('ej', function (cont, params) {
    const def = ADA.porId[params.id];
    if (!def) { cont.innerHTML = '<p>Ejercicio no encontrado.</p>'; return; }
    const v = params.v != null ? parseInt(params.v, 10) : (ADA.estado.variante[def.id] || 0);
    const inst = ADA.instancia(def, v);
    if (inst.tipo === 'C') return vistaComparar(cont, def, inst);
    if (inst.tipo === 'V') return ADA.vistaVueltas(cont, def, inst);
    if (inst.tipo === 'R') return ADA.vistaRecursivo(cont, def, inst);
    if (inst.tipo === 'B') return ADA.vistaDiseno(cont, def, inst);
    if (inst.tipo === 'Q') return ADA.vistaPregunta(cont, def, inst);
    if (inst.guia) return ADA.vistaAnidados(cont, def, inst);
    const puntaje = new Puntaje({ tabla: 55, tn: 20, inv: 10, bigo: 15 });
    const intentos = {};
    let pistaN = 0;
    const verificado = window.ADA_VERIFICADO && window.ADA_VERIFICADO.ids.includes(def.id);

    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=${inst.fase}">← ${ADA.MODULOS.find((m) => m.fase === inst.fase).nombre}</a></p>
      <h1><span class="etiqueta ${inst.tipo}">Tipo ${inst.tipo}</span> ${ADA.esc(inst.titulo)} ${inst.nVariantes > 1 ? '<span class="etiqueta">variante ' + (inst.variante + 1) + '/' + inst.nVariantes + '</span>' : ''} ${verificado ? '<span class="etiqueta" title="Conteos verificados ejecutando el código instrumentado">✔ verificado</span>' : ''}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)} · Tamaño de la entrada: ${ADA.esc(inst.tamano || 'n')}</p>
      <div class="enunciado">${inst.enunciado}</div>
      <div class="pasos"><span class="paso activo" data-paso="1">1 · Costo y veces por línea</span><span class="paso" data-paso="2">2 · T(n), invariante y Big-O</span><span class="paso" data-paso="3">3 · Resultado</span></div>
      <div class="panel" id="p1">
        ${tablaLineas(inst)}
        <p class="ayuda" style="margin-top:8px">Escribe el <b>costo</b> de cada operación elemental y <b>cuántas veces</b> se ejecuta (en función de n). Puedes usar: <code>n+1</code>, <code>(n/2)</code> (no hace falta techo ni piso), <code>2+k</code>, <code>0</code>. <kbd>Enter</kbd> comprueba.</p>
        <div id="pista1"></div>
        <div class="acciones"><button class="primario" id="btnComprobar1">Comprobar</button><button id="btnTraza">Ver tabla de valores (n = 5)</button><button class="secundario" id="btnPista1">Pista</button><button id="btnRevelar1">Ver solución de esta parte</button><span class="pts" id="pts1"></span></div>
        <div id="traza" style="display:none"></div>
      </div>
      <div class="panel bloqueado" id="p2">
        <h2>Arma el T(n)</h2>
        <p class="ayuda">Escribe T(n) como lo escribirías en el parcial ya simplificado (ej. <code>10n+10</code>, <code>6+6(n/2)</code>, <code>5+k+n(3+k)</code>). Se acepta cualquier forma algebraicamente equivalente.</p>
        <div class="campo"><label>T(n) =</label><input type="text" id="inTn" placeholder="ej. 10n + 10"><span id="estTn"></span></div>
        <div id="expTn"></div>
        ${inst.sinCiclo ? '' : '<div class="campo"><label>Invariante</label><input type="text" id="inInv" placeholder="condición al salir del ciclo, ej. i == n"><span id="estInv"></span></div><div id="expInv"></div>'}
        <div class="campo"><label>Big-O</label><input type="text" id="inO" placeholder="ej. O(n), O(n^2), O(log n), O(1)"><span id="estO"></span></div>
        <div id="expO"></div>
        ${inst.sinCiclo ? `<div class="campo"><label>Mejor/peor caso</label><select id="inMP"><option value="">— elige —</option><option value="no">No hay: siempre se ejecutan las mismas OE</option><option value="si">Sí hay: depende de los datos</option></select><span id="estMP"></span></div><div id="expMP"></div>` : ''}
        <div id="pista2"></div>
        <div class="acciones"><button class="primario" id="btnComprobar2">Comprobar</button><button class="secundario" id="btnPista2">Pista</button><button id="btnRevelar2">Ver solución</button><span class="pts" id="pts2"></span></div>
      </div>
      <div class="panel bloqueado" id="p3"></div>`;

    const p1 = cont.querySelector('#p1'), p2 = cont.querySelector('#p2'), p3 = cont.querySelector('#p3');
    const setPaso = (n) => cont.querySelectorAll('.paso').forEach((e) => { const k = +e.dataset.paso; e.classList.toggle('activo', k === n); e.classList.toggle('hecho', k < n); });
    const actualizarPts = () => { cont.querySelector('#pts1').textContent = 'Puntos: ' + puntaje.total() + '/100'; cont.querySelector('#pts2').textContent = 'Puntos: ' + puntaje.total() + '/100'; };
    actualizarPts();

    p1.addEventListener('keydown', (e) => { if (e.key === 'Enter') cont.querySelector('#btnComprobar1').click(); });
    p2.addEventListener('keydown', (e) => { if (e.key === 'Enter') cont.querySelector('#btnComprobar2').click(); });

    let paso1Listo = false;
    function terminarPaso1() {
      paso1Listo = true; p2.classList.remove('bloqueado'); setPaso(2);
      p2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const conv = ADA.conv();
      const skel = ADA.el(`<div class="explic info">Estructura que espera el profe (con tus costos ya correctos): ${ADA.tex('T(n) = ' + ADA.latexT(inst.lineas, conv), true)} Simplifícala y escríbela abajo.</div>`);
      p2.querySelector('h2').after(skel);
      cont.querySelector('#inTn').focus();
    }
    cont.querySelector('#btnComprobar1').onclick = () => {
      const r = comprobarTabla(p1, inst, puntaje, 'tabla', intentos);
      actualizarPts();
      if (r.todoOk) { ADA.registrarAcierto(); ADA.toast('¡Todas las líneas correctas!', 'ok'); if (!paso1Listo) terminarPaso1(); }
      else if (r.nuevosErrores) ADA.toast(r.nuevosErrores + ' error(es). Lee la explicación bajo cada línea.', 'mal');
      else ADA.toast('Faltan casillas por llenar.', 'alt');
    };
    cont.querySelector('#btnTraza').onclick = () => {
      const t = cont.querySelector('#traza');
      if (t.style.display === 'none') { t.innerHTML = tablaTraza(inst, 5); t.style.display = ''; } else t.style.display = 'none';
    };
    cont.querySelector('#btnPista1').onclick = () => {
      const pistas = inst.pistas || [];
      if (pistaN < pistas.length) { puntaje.pistas += 5 * (pistaN + 1); cont.querySelector('#pista1').insertAdjacentHTML('beforeend', `<div class="pista">💡 Pista ${pistaN + 1}: ${pistas[pistaN]}</div>`); pistaN++; actualizarPts(); }
      else ADA.toast('No hay más pistas: usa "Ver solución de esta parte".', 'alt');
    };
    cont.querySelector('#btnRevelar1').onclick = () => { puntaje.revelar('tabla'); revelarTabla(p1, inst); actualizarPts(); if (!paso1Listo) terminarPaso1(); };

    let pista2N = 0;
    cont.querySelector('#btnPista2').onclick = () => {
      const pistas = [
        'Fijos + Σ(costos por vuelta) + 1 (condición falsa). Reemplaza la sumatoria por costo × vueltas: Σ_{i=a}^{b} c = c·(b − a + 1).',
        'Invariante = lo que se cumple al salir del ciclo (la negación de la condición). Big-O = el término que más crece, sin constantes.'
      ];
      if (pista2N < pistas.length) { puntaje.pistas += 5; cont.querySelector('#pista2').insertAdjacentHTML('beforeend', `<div class="pista">💡 ${pistas[pista2N]}</div>`); pista2N++; actualizarPts(); }
    };
    function comprobarPaso2(revelar) {
      const conv = ADA.conv();
      let ok = true;
      // T(n)
      const inTn = cont.querySelector('#inTn'); const expTn = cont.querySelector('#expTn');
      const canonTn = inst.Tn[conv] || inst.Tn.prof;
      if (revelar) { inTn.value = canonTn; inTn.className = 'ok'; puntaje.revelar('tn'); }
      else if (inTn.className !== 'ok') {
        const eq = F.equivalentes(inTn.value, canonTn, { vars: ['k'] });
        if (eq.ok) { inTn.className = 'ok'; expTn.innerHTML = ''; cont.querySelector('#estTn').textContent = '✅'; }
        else {
          ok = false; inTn.className = inTn.value.trim() ? 'mal' : ''; cont.querySelector('#estTn').textContent = inTn.value.trim() ? '❌' : '';
          if (inTn.value.trim()) {
            puntaje.penalizar('tn', 4); ADA.registrarError('tn');
            let msg = eq.error ? ADA.esc(eq.error) : 'No es equivalente. Evaluando: ' + eq.diffs.slice(0, 3).map((d) => `n=${d.n}${canonTn.includes('k') ? ', k=' + d.k : ''}: tuya=${+d.tuyo.toFixed(2)}, correcta=${+d.esperado.toFixed(2)}`).join('; ') + '.';
            msg += '<details style="margin-top:6px"><summary>Ver el desarrollo paso a paso</summary><div class="pasos-sol">' + ADA.pasosT(inst, conv).map((p) => `<div class="item"><div class="txt">${p.txt}</div><div class="formula">${ADA.tex(p.tex, true)}</div></div>`).join('') + '</div></details>';
            expTn.innerHTML = `<div class="explic">${msg}</div>`;
          }
        }
      }
      // invariante
      const inInv = cont.querySelector('#inInv');
      if (inInv) {
        const norm = (s) => s.toLowerCase().replace(/\s+/g, '').replace(/==/g, '=').replace(/\.length/g, '');
        const acept = [inst.invariante, ...(inst.invAlt || [])].map(norm);
        if (revelar) { inInv.value = inst.invariante; inInv.className = 'ok'; puntaje.revelar('inv'); }
        else if (inInv.className !== 'ok') {
          if (inInv.value.trim() && acept.includes(norm(inInv.value))) { inInv.className = 'ok'; cont.querySelector('#estInv').textContent = '✅'; cont.querySelector('#expInv').innerHTML = ''; }
          else {
            ok = false; inInv.className = inInv.value.trim() ? 'mal' : ''; cont.querySelector('#estInv').textContent = inInv.value.trim() ? '❌' : '';
            if (inInv.value.trim()) { puntaje.penalizar('inv', 3); ADA.registrarError('inv'); cont.querySelector('#expInv').innerHTML = `<div class="explic">La invariante que pide el profe es la condición al <b>salir</b> del ciclo: <code>${ADA.esc(inst.invariante)}</code>. Valores: ${ADA.esc((ADA.aplanar(inst.lineas).find((L) => L.padre) || {}).padre?.ciclo.valores || '')}<div class="analogia">${ANALOGIAS.inv}</div></div>`; }
          }
        }
      }
      // Big-O
      const inO = cont.querySelector('#inO');
      if (revelar) { inO.value = 'O(' + inst.bigO + ')'; inO.className = 'ok'; puntaje.revelar('bigo'); }
      else if (inO.className !== 'ok') {
        const r = inO.value.trim() ? F.mismoOrden(inO.value, inst.bigO) : { ok: false };
        if (r.ok) { inO.className = 'ok'; cont.querySelector('#estO').textContent = '✅'; cont.querySelector('#expO').innerHTML = ''; }
        else {
          ok = false; inO.className = inO.value.trim() ? 'mal' : ''; cont.querySelector('#estO').textContent = inO.value.trim() ? '❌' : '';
          if (inO.value.trim()) {
            puntaje.penalizar('bigo', 4); ADA.registrarError('bigo');
            const tuya = r.error ? null : F.claseDe(inO.value);
            cont.querySelector('#expO').innerHTML = `<div class="explic">${r.error ? ADA.esc(r.error) : 'Escribiste un orden ' + (tuya ? '<b>' + tuya + '</b>' : 'distinto') + '. '}El término dominante de ${ADA.tex(F.aLatex(canonTn))} es ${ADA.tex(F.aLatex(inst.bigO))}: T(n) ∈ O(${ADA.tex(F.aLatex(inst.bigO))}).<div class="analogia">${ANALOGIAS.bigo}</div></div>`;
          }
        }
      }
      // mejor/peor (solo sin ciclo)
      const inMP = cont.querySelector('#inMP');
      if (inMP) {
        if (revelar) { inMP.value = 'no'; }
        else if (inMP.value !== 'no') { ok = false; if (inMP.value) { puntaje.penalizar('inv', 3); cont.querySelector('#expMP').innerHTML = `<div class="explic">${inst.mejorPeor}</div>`; } }
        else { cont.querySelector('#estMP').textContent = '✅'; cont.querySelector('#expMP').innerHTML = ''; }
      }
      actualizarPts();
      return ok;
    }
    function terminar() {
      setPaso(3); p3.classList.remove('bloqueado');
      const pts = puntaje.total();
      ADA.registrarPuntaje(inst.id, pts, inst.variante);
      const nota = (pts / 20).toFixed(1);
      p3.innerHTML = `<div class="resultado"><div class="nota">${pts}<small> /100 · nota ${nota}</small></div><p class="ayuda">${pts >= 90 ? '¡Excelente! Así se ve un 5.0.' : pts >= 70 ? 'Bien. Repasa las explicaciones de lo que fallaste.' : 'Este vuelve a la cola de repaso con otra variante.'}</p></div>
        ${panelSolucion(inst)}
        <div class="acciones">${inst.nVariantes > 1 ? `<button class="primario" onclick="ADA.ir('ej',{id:'${inst.id}',v:${(inst.variante + 1) % inst.nVariantes}})">Otra variante ↻</button>` : ''}<button onclick="ADA.ir('ej',{id:'${inst.id}',v:${inst.variante}})">Repetir</button><button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente ejercicio →</button><button onclick="ADA.ir('modulo',{fase:1})">Volver al módulo</button></div>`;
      p3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    cont.querySelector('#btnComprobar2').onclick = () => { if (comprobarPaso2(false)) { ADA.registrarAcierto(); ADA.toast('¡Correcto!', 'ok'); terminar(); } else ADA.toast('Revisa lo marcado en rojo (o llena lo que falta).', 'mal'); };
    cont.querySelector('#btnRevelar2').onclick = () => { comprobarPaso2(true); terminar(); };
  });

  /* ---------- Vista tipo C: comparar ---------- */
  function vistaComparar(cont, def, inst) {
    const puntaje = new Puntaje({ m0: 35, m1: 35, cmp: 30 });
    const intentos = {};
    const [A, B] = inst.metodos;
    cont.innerHTML = `
      <p class="sub"><a href="#modulo?fase=${inst.fase}">← ${ADA.MODULOS.find((m) => m.fase === inst.fase).nombre}</a></p>
      <h1><span class="etiqueta C">Tipo C</span> ${ADA.esc(inst.titulo)}</h1>
      <p class="sub">Fuente: ${ADA.esc(inst.fuente)}</p>
      <div class="enunciado">${inst.enunciado}</div>
      <div class="pasos"><span class="paso activo" data-paso="1">1 · Analiza los dos métodos</span><span class="paso" data-paso="2">2 · Compara y argumenta</span><span class="paso" data-paso="3">3 · Resultado</span></div>
      <div class="dos">
        ${[A, B].map((M, i) => `<div class="panel" id="m${i}"><h3>${ADA.esc(M.titulo)}</h3>${tablaLineas(M)}
          <div class="campo"><label>T(n) =</label><input type="text" data-tn="${i}" placeholder="ej. 6+6(n/2)"><span data-esttn="${i}"></span></div><div data-exptn="${i}"></div>
          <div class="acciones"><button class="primario" data-comp="${i}">Comprobar</button><button data-traza="${i}">Tabla de valores (n = 5)</button><button data-rev="${i}">Ver solución</button></div><div data-trazadiv="${i}" style="display:none"></div></div>`).join('')}
      </div>
      <div class="panel bloqueado" id="cmp">
        <h2>Comparación</h2>
        <div id="tablaCmp"></div>
        <div class="campo"><label>¿Más eficiente?</label><select id="selMas"><option value="">— elige —</option><option value="0">${ADA.esc(A.titulo)}</option><option value="1">${ADA.esc(B.titulo)}</option><option value="2">Son iguales</option></select></div>
        <p><b>Justificación</b> (elige la que argumentarías en el parcial):</p>
        <div class="opciones" id="ops">${inst.opciones.map((o, i) => `<label><input type="radio" name="op" value="${i}"> ${o.txt}</label>`).join('')}</div>
        <div id="expCmp"></div>
        <div class="acciones"><button class="primario" id="btnCmp">Comprobar</button><span class="pts" id="ptsC"></span></div>
      </div>
      <div class="panel bloqueado" id="p3"></div>`;
    const listo = [false, false];
    const setPaso = (n) => cont.querySelectorAll('.paso').forEach((e) => { const k = +e.dataset.paso; e.classList.toggle('activo', k === n); e.classList.toggle('hecho', k < n); });
    function tablaComparacion() {
      const conv = ADA.conv();
      let html = `<table class="cmp"><tr><th>n</th><th>Iteraciones ${ADA.esc(A.titulo)}</th><th>Iteraciones ${ADA.esc(B.titulo)}</th><th>OE ${ADA.esc(A.titulo)}</th><th>OE ${ADA.esc(B.titulo)}</th></tr>`;
      for (const n of inst.nTabla) html += `<tr><td>${n}</td><td>${F.ev(A.iteraciones, { n })}</td><td>${F.ev(B.iteraciones, { n })}</td><td>${ADA.Tnum(A.lineas, n, conv)}</td><td>${ADA.Tnum(B.lineas, n, conv)}</td></tr>`;
      html += '</table>';
      html += `<p>${ADA.tex('T_1(n) = ' + F.aLatex(A.Tn[conv] || A.Tn.prof))} &nbsp;&nbsp; ${ADA.tex('T_2(n) = ' + F.aLatex(B.Tn[conv] || B.Tn.prof))}</p>`;
      return html;
    }
    function revisarDesbloqueo() {
      if (listo[0] && listo[1]) { cont.querySelector('#cmp').classList.remove('bloqueado'); cont.querySelector('#tablaCmp').innerHTML = tablaComparacion(); setPaso(2); cont.querySelector('#cmp').scrollIntoView({ behavior: 'smooth' }); }
    }
    [A, B].forEach((M, i) => {
      const panel = cont.querySelector('#m' + i);
      const sec = 'm' + i;
      panel.addEventListener('keydown', (e) => { if (e.key === 'Enter') panel.querySelector(`[data-comp="${i}"]`).click(); });
      panel.querySelector(`[data-comp="${i}"]`).onclick = () => {
        const r = comprobarTabla(panel, M, puntaje, sec, intentos);
        const rc = comprobarCiclos(panel, M, puntaje, sec, intentos); r.todoOk = r.todoOk && rc.todoOk; r.nuevosErrores += rc.nuevosErrores;
        const inTn = panel.querySelector(`[data-tn="${i}"]`); const conv = ADA.conv(); const canon = M.Tn[conv] || M.Tn.prof;
        let tnOk = false;
        if (inTn.className === 'ok') tnOk = true;
        else if (inTn.value.trim()) {
          const eq = F.equivalentes(inTn.value, canon, { vars: ['k'] });
          if (eq.ok) { tnOk = true; inTn.className = 'ok'; panel.querySelector(`[data-esttn="${i}"]`).textContent = '✅'; panel.querySelector(`[data-exptn="${i}"]`).innerHTML = ''; }
          else { inTn.className = 'mal'; puntaje.penalizar(sec, 4); ADA.registrarError('tn'); panel.querySelector(`[data-exptn="${i}"]`).innerHTML = `<div class="explic">${eq.error ? ADA.esc(eq.error) : 'No equivale. Estructura: ' + ADA.tex('T(n) = ' + ADA.latexT(M.lineas, conv), true) + ' → ' + ADA.tex(F.aLatex(canon))}</div>`; }
        }
        if (r.todoOk && tnOk) { if (!listo[i]) { listo[i] = true; ADA.registrarAcierto(); ADA.toast(M.titulo + ': ¡correcto!', 'ok'); } revisarDesbloqueo(); }
        else ADA.toast(r.todoOk ? 'Falta el T(n).' : 'Hay errores o casillas vacías.', 'mal');
      };
      panel.querySelector(`[data-traza="${i}"]`).onclick = () => { const d = panel.querySelector(`[data-trazadiv="${i}"]`); if (d.style.display === 'none') { d.innerHTML = tablaTraza(M, 5); d.style.display = ''; } else d.style.display = 'none'; };
      panel.querySelector(`[data-rev="${i}"]`).onclick = () => {
        puntaje.revelar(sec); revelarTabla(panel, M);
        const inTn = panel.querySelector(`[data-tn="${i}"]`); inTn.value = M.Tn[ADA.conv()] || M.Tn.prof; inTn.className = 'ok';
        panel.querySelector(`[data-exptn="${i}"]`).innerHTML = `<div class="explic info">${ADA.tex('T(n) = ' + ADA.latexT(M.lineas, ADA.conv()), true)}</div>`;
        listo[i] = true; revisarDesbloqueo();
      };
    });
    cont.querySelector('#btnCmp').onclick = () => {
      const sel = cont.querySelector('#selMas').value; const op = cont.querySelector('input[name=op]:checked');
      if (!sel || !op) { ADA.toast('Elige el método y una justificación.', 'alt'); return; }
      const o = inst.opciones[+op.value];
      const bien = +sel === inst.masEficiente && o.ok;
      cont.querySelectorAll('#ops label').forEach((l) => { const r = l.querySelector('input'); l.className = inst.opciones[+r.value].ok ? 'ok' : (r.checked ? 'mal' : ''); });
      if (bien) {
        cont.querySelector('#expCmp').innerHTML = `<div class="explic ok">${o.porque}</div>`;
        ADA.registrarAcierto();
        const pts = puntaje.total(); ADA.registrarPuntaje(inst.id, pts, inst.variante); setPaso(3);
        const p3 = cont.querySelector('#p3'); p3.classList.remove('bloqueado');
        p3.innerHTML = `<div class="resultado"><div class="nota">${pts}<small> /100 · nota ${(pts / 20).toFixed(1)}</small></div></div>
          <h3>Cómo se argumenta en el parcial</h3><ol><li>Iteraciones: ${ADA.tex(F.aLatex(A.iteraciones))} frente a ${ADA.tex(F.aLatex(B.iteraciones))}.</li><li>Instrucciones por vuelta: se suman los costos del cuerpo + condición + actualización de cada uno.</li><li>T(n) de cada uno y una tabla con n = 10, 100 (como la de arriba).</li><li>Conclusión: cuál ejecuta menos OE y por qué; y aclarar que el Big-O es el mismo, ${ADA.tex('O(' + F.aLatex(A.bigO) + ')')}.</li></ol>
          <div class="dos"><div>${panelSolucion(A)}</div><div>${panelSolucion(B)}</div></div>
          <div class="acciones"><button class="secundario" onclick="ADA.siguiente('${inst.id}')">Siguiente ejercicio →</button><button onclick="ADA.ir('modulo',{fase:${inst.fase}})">Volver al módulo</button></div>`;
        p3.scrollIntoView({ behavior: 'smooth' });
      } else {
        puntaje.penalizar('cmp', 8); ADA.registrarError('tipoC');
        cont.querySelector('#expCmp').innerHTML = `<div class="explic">${+sel !== inst.masEficiente ? 'El más eficiente es <b>' + ADA.esc(inst.metodos[inst.masEficiente].titulo) + '</b>. ' : ''}${o.porque}</div>`;
        ADA.toast('Revisa la justificación.', 'mal');
      }
      cont.querySelector('#ptsC').textContent = 'Puntos: ' + puntaje.total() + '/100';
    };
  }

  ADA.ui = { tablaLineas, comprobarTabla, comprobarCiclos, revelarTabla, tablaTraza, panelSolucion, Puntaje, ANALOGIAS };
  ADA.siguiente = function (idActual) {
    const lista = ADA.ejercicios.filter((e) => e.fase === ADA.porId[idActual].fase);
    const i = lista.findIndex((e) => e.id === idActual);
    const sig = lista[(i + 1) % lista.length];
    ADA.ir('ej', { id: sig.id });
  };
})();
