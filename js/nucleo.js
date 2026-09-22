/* nucleo.js – estado, registro de ejercicios, convenciones, generación de T(n) estilo profe, utilidades UI. */
(function (root) {
  'use strict';
  const F = root.Formulas;
  const ADA = root.ADA || (root.ADA = {});

  /* ---------- Registro de ejercicios ---------- */
  ADA.ejercicios = [];
  ADA.porId = {};
  /** def: {id, fase, tipo, titulo, fuente, variantes:[params...], def(p) => objeto concreto} */
  ADA.registrar = function (def) {
    if (!def.variantes || !def.variantes.length) def.variantes = [{}];
    ADA.ejercicios.push(def);
    ADA.porId[def.id] = def;
    return def;
  };
  /** Construye la instancia concreta de un ejercicio para la variante v. */
  ADA.instancia = function (def, v = 0) {
    const p = def.variantes[v % def.variantes.length];
    const inst = def.def(p);
    inst.id = def.id; inst.fase = def.fase; inst.tipo = def.tipo;
    inst.titulo = inst.titulo || def.titulo; inst.fuente = inst.fuente || def.fuente;
    inst.variante = v % def.variantes.length; inst.nVariantes = def.variantes.length;
    inst.params = p;
    if (inst.metodos) inst.metodos.forEach((m, i) => { m.id = m.id || (def.id + '.' + i); });
    return inst;
  };

  /* ---------- Convenciones ---------- */
  ADA.CONVENCIONES = {
    prof: { nombre: 'Profesor', desc: 'Plantilla Excel + solución del simulacro: declaración+asignación = 2, i++ = 2, condición 1 (t+1 veces), .length = 1 cada vez que se evalúa, cada acceso a arreglo = 1 (también el de la izquierda: v[i] = v[i] + v[j] son 5).' },
    hojas: { nombre: 'Hojas resumen', desc: 'Hojas PNG: cada instrucción vale 1 (int i=0 → 1, i++ → 1); for = 3t+2 con cuerpo 1.' }
  };
  ADA.K_DEMO = 3; // valor numérico de k para tablas

  /* ---------- Estado persistente ---------- */
  const CLAVE = 'ada-parcial-v1';
  const hoy = () => new Date().toISOString().slice(0, 10);
  function estadoInicial() {
    return { convencion: 'prof', puntajes: {}, errores: {}, racha: { actual: 0, mejor: 0 }, dias: { ultimo: null, seguidos: 0 }, repaso: {}, variante: {}, historial: [] };
  }
  ADA.estado = estadoInicial();
  ADA.cargar = function () {
    try { const s = localStorage.getItem(CLAVE); if (s) ADA.estado = Object.assign(estadoInicial(), JSON.parse(s)); } catch (e) { /* sin storage */ }
    // racha de días
    const d = ADA.estado.dias; const h = hoy();
    if (d.ultimo !== h) {
      const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      d.seguidos = d.ultimo === ayer ? d.seguidos + 1 : 1; d.ultimo = h; ADA.guardar();
    }
  };
  ADA.guardar = function () { try { localStorage.setItem(CLAVE, JSON.stringify(ADA.estado)); } catch (e) { /* nada */ } };
  ADA.reiniciar = function () { ADA.estado = estadoInicial(); ADA.guardar(); };
  ADA.conv = () => ADA.estado.convencion;

  ADA.registrarError = function (tag) {
    if (!tag) return;
    ADA.estado.errores[tag] = (ADA.estado.errores[tag] || 0) + 1;
    ADA.estado.racha.actual = 0; ADA.guardar();
  };
  ADA.registrarAcierto = function () {
    const r = ADA.estado.racha; r.actual++; if (r.actual > r.mejor) r.mejor = r.actual; ADA.guardar();
  };
  ADA.registrarPuntaje = function (id, puntos, variante) {
    const p = ADA.estado.puntajes[id] || { mejor: 0, intentos: 0, ultimo: 0 };
    p.intentos++; p.ultimo = puntos; if (puntos > p.mejor) p.mejor = puntos; p.fecha = hoy();
    ADA.estado.puntajes[id] = p;
    ADA.estado.historial.push({ id, puntos, variante, fecha: hoy() });
    if (puntos < 70) ADA.estado.repaso[id] = (ADA.estado.repaso[id] || 0) + 1; else delete ADA.estado.repaso[id];
    ADA.estado.variante[id] = ((ADA.estado.variante[id] || 0) + 1);
    ADA.guardar();
  };
  ADA.puntajeModulo = function (fase) {
    const ejs = ADA.ejercicios.filter((e) => e.fase === fase && !e.oculto);
    if (!ejs.length) return { hechos: 0, total: 0, prom: 0 };
    const hechos = ejs.filter((e) => ADA.estado.puntajes[e.id]);
    const prom = hechos.length ? Math.round(hechos.reduce((s, e) => s + ADA.estado.puntajes[e.id].mejor, 0) / hechos.length) : 0;
    return { hechos: hechos.length, total: ejs.length, prom };
  };

  /* ---------- Etiquetas de errores (para "errores frecuentes") ---------- */
  ADA.TAGS = {
    decl: 'Declaración + asignación cuentan 2',
    asig: 'Asignación simple cuenta 1',
    upd: 'i++ / i = i - 1 cuentan 2 (operación + asignación)',
    cond: 'La condición cuesta 1 (más 1 por operador aritmético)',
    condveces: 'La condición se evalúa t + 1 veces',
    acum: 'x += expr: acceso + operación + asignación',
    indice: 'Aritmética dentro del índice suma 1',
    k: 'new / librería cuestan k (constante)',
    ret: 'return cuesta 1',
    if: 'if cuesta 1 (la comparación)',
    rama: 'En if/else solo corre una rama',
    veces: 'Número de vueltas del ciclo',
    vecesif: 'Cuántas veces entra al if',
    tn: 'Armar T(n) completo',
    inv: 'Invariante = condición al salir del ciclo',
    bigo: 'Big-O: término dominante sin constantes',
    tipoC: 'Comparar con iteraciones e instrucciones, no solo Big-O',
    teoria: 'Concepto teórico (OE, T(n), O/Ω, casos)',
    escalamiento: 'Escalamiento: t₂ = t₁·g(n₂)/g(n₁)',
    estrategia: 'Elegir la estrategia que cumple la cota',
    codigo: 'Escribir/ordenar el código Java',
    mejorpeor: 'Mejor y peor caso, Ω',
    nunca: 'Ciclo que nunca entra: cuesta 1 (la evaluación)',
    noejec: 'Instrucción que no se ejecuta en el caso analizado'
  };

  /* ---------- Modelo de líneas ---------- */
  /** Atajo para definir una línea: L(id, txt, costoProf, costoHojas, veces, extra) */
  ADA.L = (id, txt, prof, hojas, veces, extra = {}) => Object.assign({ id, txt, costo: { prof: String(prof), hojas: String(hojas) }, veces: String(veces) }, extra);

  /** Devuelve todas las líneas con costo, en orden, con su profundidad y el ciclo que las contiene. */
  ADA.aplanar = function (lineas, prof = 0, ciclo = null, out = []) {
    for (const L of lineas) {
      if (L.partes) {
        for (const P of L.partes) out.push(Object.assign({ prof, ciclo, padre: L }, P));
        ADA.aplanar(L.cuerpo || [], prof + 1, L, out);
      } else {
        if (L.costo != null) out.push(Object.assign({ prof, ciclo }, L));
        if (L.cuerpo) ADA.aplanar(L.cuerpo, prof + 1, ciclo, out);
      }
    }
    return out;
  };
  ADA.costoTxt = (L, conv) => String(L.costo[conv] != null ? L.costo[conv] : L.costo.prof);
  ADA.evalCosto = (txt, k = ADA.K_DEMO, n = 1) => F.ev(String(txt), { n, k });
  ADA.evalVeces = (txt, n) => F.ev(String(txt), { n });
  /** T(n) numérico canónico = Σ costo × veces (el costo puede depender de n: llamadas a métodos). */
  ADA.Tnum = function (lineas, n, conv, k = ADA.K_DEMO) {
    let t = 0;
    for (const L of ADA.aplanar(lineas)) t += ADA.evalCosto(ADA.costoTxt(L, conv), k, n) * ADA.evalVeces(L.veces, n);
    return t;
  };

  /* ---------- Generación de la fórmula T(n) estilo profe ---------- */
  const latexCosto = (txt) => F.aLatex(String(txt));
  const latexVeces = (txt) => F.aLatex(String(txt));
  /**
   * Devuelve {tex, partes} donde tex es "9 + \sum_{i=0}^{n-1}(1+2+3+4) + 1" etc.
   * Estrategia: costos fijos en orden, cada ciclo como Σ(...)+cond final; las líneas cuyo
   * número de veces no coincide con el del ciclo van como Σ aparte.
   */
  ADA.latexT = function (lineas, conv) {
    const extras = []; // líneas de un if dentro de un ciclo: van como sumatoria aparte al final
    function bloque(ls, tCiclo) {
      const terms = [];
      for (const L of ls) {
        if (L.partes) {
          const c = L.ciclo;
          const init = L.partes.filter((p) => p.rol === 'init');
          const cond = L.partes.find((p) => p.rol === 'cond');
          const upd = L.partes.filter((p) => p.rol === 'upd');
          init.forEach((p) => terms.push(latexCosto(ADA.costoTxt(p, conv))));
          const dentro = [];
          if (cond) dentro.push(latexCosto(ADA.costoTxt(cond, conv)));
          dentro.push(...bloque(L.cuerpo || [], c.total || c.t));
          upd.forEach((p) => dentro.push(latexCosto(ADA.costoTxt(p, conv))));
          let tNum = 1; try { tNum = F.ev(String(c.t), { n: 10, i: 2, j: 2, c: 2, r: 2, p: 2, q: 2, x: 2, s: 2, u: 2, I: 2 }); } catch (e) { tNum = 1; }
          if (tNum === 0) terms.push(latexCosto(ADA.costoTxt(cond, conv)) + '\\;\\text{(no entra)}');
          else {
            terms.push('\\sum_{' + c.var + '=' + latexVeces(c.desde) + '}^{' + latexVeces(c.hasta) + '}\\left(' + dentro.join(' + ') + '\\right)');
            if (cond) terms.push(latexCosto(ADA.costoTxt(cond, conv)));
          }
        } else if (L.cuerpo) {
          if (L.costo != null) terms.push(...termino(L, tCiclo));
          terms.push(...bloque(L.cuerpo, tCiclo));
        } else if (L.costo != null) terms.push(...termino(L, tCiclo));
      }
      return terms;
    }
    function termino(L, tCiclo) {
      const v = String(L.veces);
      const iguales = tCiclo != null && F.equivalentes(v, String(tCiclo), { vars: ['i', 'j'] }).ok;
      if (tCiclo == null || iguales) { if (F.ev(v, { n: 10 }) === 0 && tCiclo == null) return []; return [latexCosto(ADA.costoTxt(L, conv))]; }
      if (F.ev(v, { n: 10 }) === 0) return [];
      // dentro de un ciclo pero con otro número de veces: sumatoria aparte (se saca del ciclo)
      extras.push('\\sum_{r=1}^{' + latexVeces(v) + '} ' + latexCosto(ADA.costoTxt(L, conv)));
      return [];
    }
    const t = bloque(lineas, null);
    return t.concat(extras).join(' + ');
  };

  /** Pasos de simplificación automáticos para ciclos simples (constante por vuelta). */
  ADA.pasosT = function (inst, conv) {
    if (inst.pasos) return [{ txt: 'Escribo los costos fijos, las sumatorias (una por ciclo, anidadas) y el +1 de cada condición falsa:', tex: 'T(n) = ' + ADA.latexT(inst.lineas, conv) }].concat(inst.pasos[conv] || inst.pasos);
    const pasos = [];
    pasos.push({ txt: 'Escribo los costos fijos, la sumatoria de cada ciclo y el +1 de la condición falsa:', tex: 'T(n) = ' + ADA.latexT(inst.lineas, conv) });
    // Agrupar: fijos y por ciclo
    const plano = ADA.aplanar(inst.lineas);
    const k = ADA.K_DEMO;
    const ciclos = [];
    const fijosTxt = [];
    let fijos = 0, fijosK = 0;
    function costoNum(L) { const c = ADA.costoTxt(L, conv); const conK = F.ev(c, { n: 1, k: 1 }) - F.ev(c, { n: 1, k: 0 }); return { base: F.ev(c, { n: 1, k: 0 }), k: conK }; }
    function agrupar(v, c) {
      let g = ciclos.find((x) => F.equivalentes(x.veces, v).ok);
      if (!g) { g = { veces: v, base: 0, k: 0 }; ciclos.push(g); }
      g.base += c.base; g.k += c.k;
    }
    for (const L of plano) {
      let v = String(L.veces);
      const c = costoNum(L);
      if (L.rol === 'cond' && L.padre) {
        // condición: t veces dentro del ciclo + 1 evaluación final falsa (fija)
        fijos += c.base; fijosK += c.k;
        v = String(L.padre.ciclo.t);
        if (F.ev(v, { n: 10 }) === 0) continue;
      }
      if (F.equivalentes(v, '1').ok) { fijos += c.base; fijosK += c.k; }
      else if (F.equivalentes(v, '0').ok) { /* no se ejecuta */ }
      else agrupar(v, c);
    }
    const fmtK = (b, kk) => (kk ? (b ? b + ' + ' : '') + (kk === 1 ? 'k' : kk + 'k') : String(b));
    const partes = [];
    partes.push(fmtK(fijos, fijosK));
    for (const g of ciclos) partes.push('(' + fmtK(g.base, g.k) + ') \\cdot \\left(' + latexVeces(g.veces) + '\\right)');
    // Paso intermedio: cuántos términos tiene cada sumatoria (b − a + 1), el error más común
    const cuentas = [];
    (function rec(ls) {
      for (const L of ls) {
        if (L.partes && L.ciclo && L.ciclo.desde != null && L.ciclo.hasta != null && F.ev(String(L.ciclo.t), { n: 10 }) > 0) {
          const a = String(L.ciclo.desde), b = String(L.ciclo.hasta), t = String(L.ciclo.t);
          const suma = plano.filter((x) => x.padre === L || (x.ciclo === L && !x.partes)).reduce((s, x) => s + (x.rol === 'init' ? 0 : F.equivalentes(x.veces, x.rol === 'cond' ? t + '+1' : t).ok ? costoNum(x).base : 0), 0);
          const nota = F.equivalentes(b, t).ok ? '' : ' \\quad\\text{(son } ' + latexVeces(t) + ' \\text{ términos, no } ' + latexVeces(b) + ')';
          cuentas.push('\\sum_{' + L.ciclo.var + '=' + latexVeces(a) + '}^{' + latexVeces(b) + '} ' + suma + ' = ' + suma + '\\cdot\\big[(' + latexVeces(b) + ') - (' + latexVeces(a) + ') + 1\\big] = ' + suma + '\\cdot ' + latexVeces(t) + nota);
        }
        if (L.cuerpo) rec(L.cuerpo);
      }
    })(inst.lineas);
    for (const c of cuentas) pasos.push({ txt: 'Cuento los términos de la sumatoria: de a hasta b hay b − a + 1 términos (ojo: el límite superior NO es la cantidad de términos).', tex: c });
    pasos.push({ txt: 'Aplico Σ c = c·(b − a + 1): cada sumatoria de una constante es la constante por el número de vueltas.', tex: 'T(n) = ' + partes.join(' + ') });
    if (inst.Tn) pasos.push({ txt: 'Simplifico:', tex: 'T(n) = ' + F.aLatex(inst.Tn[conv] || inst.Tn.prof) });
    if (inst.bigO) pasos.push({ txt: 'Me quedo con el término dominante y quito constantes:', tex: 'T(n) \\in O(' + F.aLatex(inst.bigO) + ')' });
    return pasos;
  };

  /* ---------- Utilidades UI ---------- */
  ADA.esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  ADA.el = function (html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  ADA.katex = function (el, tex, display) {
    try { root.katex.render(tex, el, { displayMode: !!display, throwOnError: false }); } catch (e) { el.textContent = tex; }
  };
  ADA.tex = (tex, display) => { const s = document.createElement('span'); ADA.katex(s, tex, display); return s.outerHTML; };
  ADA.toast = function (msg, tipo = 'info', ms = 3500) {
    const t = ADA.el('<div class="toast ' + tipo + '">' + msg + '</div>');
    document.body.appendChild(t); setTimeout(() => t.classList.add('ver'), 10);
    setTimeout(() => { t.classList.remove('ver'); setTimeout(() => t.remove(), 400); }, ms);
  };

  const KW = /\b(public|private|static|void|int|long|boolean|double|float|char|return|if|else|for|while|do|new|throw|true|false|null|class|final)\b/g;
  ADA.resaltarJava = function (txt) {
    let s = ADA.esc(txt);
    s = s.replace(/("[^"]*")/g, '<span class="str">$1</span>');
    s = s.replace(/(\/\/.*)$/g, '<span class="com">$1</span>');
    s = s.replace(KW, '<span class="kw">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
    s = s.replace(/\b([A-Z][A-Za-z]+)\b/g, '<span class="tipo">$1</span>');
    return s;
  };

  /* ---------- Router ---------- */
  ADA.vistas = {};
  ADA.vista = function (nombre, fn) { ADA.vistas[nombre] = fn; };
  ADA.ir = function (nombre, params = {}) {
    const q = Object.keys(params).map((k) => k + '=' + encodeURIComponent(params[k])).join('&');
    location.hash = '#' + nombre + (q ? '?' + q : '');
  };
  ADA.renderRuta = function () {
    const h = location.hash.slice(1) || 'inicio';
    const [nombre, q] = h.split('?');
    const params = {};
    if (q) q.split('&').forEach((kv) => { const [k, v] = kv.split('='); params[k] = decodeURIComponent(v || ''); });
    const cont = document.getElementById('vista');
    cont.innerHTML = '';
    window.scrollTo(0, 0);
    const fn = ADA.vistas[nombre] || ADA.vistas.inicio;
    fn(cont, params);
    if (ADA.actualizarCabecera) ADA.actualizarCabecera();
    if (ADA.barraRepaso) ADA.barraRepaso();
  };
})(window);
