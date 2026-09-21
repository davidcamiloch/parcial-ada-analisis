/* formulas.js – parser y evaluador de expresiones matemáticas escritas por el estudiante.
   Soporta: n, k, m, + - * / ^, paréntesis, multiplicación implícita (10n, 2n^2, n(n+1)),
   ⌈ ⌉ ⌊ ⌋, √, ², ³, log, log2, log_3(n), log₃(n), ln, sqrt/raiz, ceil/techo, floor/piso.
   Funciona en el navegador (window.Formulas) y en Node (module.exports). */
(function (root) {
  'use strict';

  const SUPER = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
  const FUNCS = {
    log: (x, b) => Math.log(x) / Math.log(b == null ? 2 : b),
    lg: (x) => Math.log2(x),
    ln: (x) => Math.log(x),
    sqrt: (x) => Math.sqrt(x), raiz: (x) => Math.sqrt(x),
    ceil: (x) => Math.ceil(x - 1e-9), techo: (x) => Math.ceil(x - 1e-9),
    floor: (x) => Math.floor(x + 1e-9), piso: (x) => Math.floor(x + 1e-9),
    abs: (x) => Math.abs(x)
  };

  /** Normaliza símbolos unicode a ASCII manejable. */
  function normalizar(s) {
    s = String(s || '').trim();
    s = s.replace(/^T\s*\(\s*n\s*\)\s*=\s*/i, '');     // "T(n) = ..."
    s = s.replace(/^[OΩΘ]\s*\(\s*(.*)\s*\)\s*$/u, '$1'); // "O( ... )"
    s = s.replace(/[−–—]/g, '-').replace(/[×·•]/g, '*').replace(/÷/g, '/');
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((c) => SUPER[c]).join(''));
    s = s.replace(/log([₀₁₂₃₄₅₆₇₈₉]+)/g, (m, d) => 'log_' + [...d].map((c) => SUB[c]).join(''));
    s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => SUB[c]);
    s = s.replace(/\s+/g, ' ');
    return s;
  }

  function tokenizar(s) {
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === ' ') { i++; continue; }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
        let j = i; while (j < s.length && (/[0-9]/.test(s[j]) || (s[j] === '.' && s[j + 1] !== '.'))) j++;
        toks.push({ t: 'num', v: parseFloat(s.slice(i, j)) }); i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) {
        let j = i; while (j < s.length && /[a-zA-Z_0-9]/.test(s[j])) j++;
        let w = s.slice(i, j);
        // separa "log2", "log_3", "log10"
        let m = /^(log)_?([0-9]+)$/.exec(w);
        if (m) { toks.push({ t: 'fn', v: 'log', base: parseFloat(m[2]) }); i = j; continue; }
        if (w === 'sum' || w === 'suma') { toks.push({ t: 'sum' }); i = j; continue; }
        if (w === 'min' || w === 'max') { toks.push({ t: 'fn2', v: w }); i = j; continue; }
        if (w in FUNCS) { toks.push({ t: 'fn', v: w }); i = j; continue; }
        // identificadores pegados: "kn" -> k * n ; "nlogn" -> n log n
        let rest = w;
        while (rest.length) {
          let f = Object.keys(FUNCS).find((name) => rest.startsWith(name));
          if (f && rest.length >= f.length) {
            toks.push({ t: 'fn', v: f }); rest = rest.slice(f.length);
            const mb = /^_?([0-9]+)/.exec(rest);
            if (f === 'log' && mb) { toks[toks.length - 1].base = parseFloat(mb[1]); rest = rest.slice(mb[0].length); }
            continue;
          }
          toks.push({ t: 'id', v: rest[0] }); rest = rest.slice(1);
        }
        i = j; continue;
      }
      if (c === '.' && s[i + 1] === '.') { toks.push({ t: '..' }); i += 2; continue; }
      if (c === '=') { toks.push({ t: '=' }); i++; continue; }
      if ('+-*/^(),'.includes(c)) { toks.push({ t: c }); i++; continue; }
      if (c === '⌈') { toks.push({ t: 'fnopen', v: 'ceil' }); i++; continue; }
      if (c === '⌊') { toks.push({ t: 'fnopen', v: 'floor' }); i++; continue; }
      if (c === '⌉' || c === '⌋') { toks.push({ t: 'fnclose' }); i++; continue; }
      if (c === '√') { toks.push({ t: 'fn', v: 'sqrt' }); i++; continue; }
      if (c === '[') { toks.push({ t: '(' }); i++; continue; }
      if (c === ']') { toks.push({ t: ')' }); i++; continue; }
      throw new Error('Símbolo no reconocido: "' + c + '"');
    }
    return toks;
  }

  /** Construye un AST. */
  function parsear(texto) {
    const toks = tokenizar(normalizar(texto));
    let p = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const esInicioAtomo = (t) => t && (t.t === 'num' || t.t === 'id' || t.t === 'fn' || t.t === 'fn2' || t.t === 'sum' || t.t === '(' || t.t === 'fnopen');

    function expr() {
      let a = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        const op = next().t; const b = term();
        a = { op, a, b };
      }
      return a;
    }
    function term() {
      let a = unary();
      for (;;) {
        const t = peek();
        if (t && (t.t === '*' || t.t === '/')) { next(); a = { op: t.t, a, b: unary() }; }
        else if (esInicioAtomo(t)) { a = { op: '*', a, b: unary() }; }
        else break;
      }
      return a;
    }
    function unary() {
      if (peek() && peek().t === '-') { next(); return { op: 'neg', a: unary() }; }
      if (peek() && peek().t === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      const a = atom();
      if (peek() && peek().t === '^') { next(); return { op: '^', a, b: unary() }; }
      return a;
    }
    function atom() {
      const t = next();
      if (!t) throw new Error('Expresión incompleta');
      if (t.t === 'num') return { num: t.v };
      if (t.t === 'id') return { id: t.v };
      if (t.t === '(') { const e = expr(); if (!peek() || next().t !== ')') throw new Error('Falta cerrar paréntesis'); return e; }
      if (t.t === 'fnopen') { const e = expr(); if (!peek() || next().t !== 'fnclose') throw new Error('Falta cerrar ⌉ o ⌋'); return { fn: t.v, a: e }; }
      if (t.t === 'fn2') {
        if (!peek() || next().t !== '(') throw new Error(t.v + ' debe ir como ' + t.v + '(a, b)');
        const a = expr(); if (!peek() || next().t !== ',') throw new Error(t.v + ': falta la coma');
        const b = expr(); if (!peek() || next().t !== ')') throw new Error(t.v + ': falta cerrar paréntesis');
        return { fn2: t.v, a, b };
      }
      if (t.t === 'sum') {
        if (!peek() || next().t !== '(') throw new Error('sum debe ir como sum(i=a..b, expr)');
        const v = next(); if (!v || v.t !== 'id') throw new Error('sum: falta la variable (sum(i=a..b, expr))');
        if (!peek() || next().t !== '=') throw new Error('sum: falta "="');
        const a = expr();
        if (!peek() || next().t !== '..') throw new Error('sum: falta ".." entre los límites');
        const b = expr();
        if (!peek() || next().t !== ',') throw new Error('sum: falta la coma antes de la expresión');
        const cuerpo = expr();
        if (!peek() || next().t !== ')') throw new Error('sum: falta cerrar paréntesis');
        return { sum: v.v, a, b, cuerpo };
      }
      if (t.t === 'fn') {
        let base = t.base;
        // log^2 n, log_3^2(n): exponente antes del argumento
        let expo = null;
        if (peek() && peek().t === '^') { next(); expo = atom(); }
        let arg;
        if (peek() && peek().t === '(') { next(); arg = expr(); if (!peek() || next().t !== ')') throw new Error('Falta cerrar paréntesis de ' + t.v); }
        else arg = power();   // log n, √n, log n^2 -> log(n^2)
        const nodo = { fn: t.v, a: arg, base };
        return expo ? { op: '^', a: nodo, b: expo } : nodo;
      }
      throw new Error('Token inesperado: ' + (t.v || t.t));
    }
    const ast = expr();
    if (p < toks.length) throw new Error('Sobra texto al final: ' + (toks[p].v || toks[p].t));
    return ast;
  }

  /** delta: si se da, techo/piso se evalúan como x + delta (para la franja de redondeo). */
  function evaluar(ast, vars, delta) {
    if (ast.num != null) return ast.num;
    if (ast.sum) {
      const a = Math.round(evaluar(ast.a, vars)), b = Math.round(evaluar(ast.b, vars));
      let s = 0; const env = Object.assign({}, vars);
      if (b - a > 200000) throw new Error('sumatoria demasiado grande');
      for (let x = a; x <= b; x++) { env[ast.sum] = x; s += evaluar(ast.cuerpo, env, delta); }
      return s;
    }
    if (ast.fn2) { const a = evaluar(ast.a, vars, delta), b = evaluar(ast.b, vars, delta); return ast.fn2 === 'min' ? Math.min(a, b) : Math.max(a, b); }
    if (ast.id != null) {
      if (!(ast.id in vars)) throw new Error('Variable desconocida: ' + ast.id);
      return vars[ast.id];
    }
    if (ast.fn) {
      const x = evaluar(ast.a, vars, delta);
      if (delta && (ast.fn === 'ceil' || ast.fn === 'floor' || ast.fn === 'techo' || ast.fn === 'piso')) return x + delta;
      return FUNCS[ast.fn](x, ast.base);
    }
    const a = evaluar(ast.a, vars, delta);
    if (ast.op === 'neg') return -a;
    const b = evaluar(ast.b, vars, delta);
    switch (ast.op) {
      case '+': return a + b; case '-': return a - b; case '*': return a * b;
      case '/': return a / b; case '^': return Math.pow(a, b);
    }
    throw new Error('Operador desconocido');
  }

  function variablesDe(ast, out = new Set()) {
    if (ast.id != null) out.add(ast.id);
    if (ast.sum) { const inner = variablesDe(ast.cuerpo, new Set()); inner.delete(ast.sum); inner.forEach((v) => out.add(v)); }
    if (ast.a) variablesDe(ast.a, out);
    if (ast.b) variablesDe(ast.b, out);
    return out;
  }

  /** Evalúa un texto con las variables dadas. Lanza Error si es inválido. */
  function ev(texto, vars) { return evaluar(parsear(texto), vars); }

  const PUNTOS_N = [1, 2, 3, 5, 7, 10, 16, 100];
  const PUNTOS_K = [3, 7];

  /** ¿Son algebraicamente equivalentes dos expresiones (evaluando en varios puntos)? */
  function equivalentes(textoA, textoB, opts = {}) {
    const puntosN = opts.puntosN || PUNTOS_N;
    const tol = opts.tol == null ? 1e-6 : opts.tol;
    // Si la respuesta esperada lleva techo/piso, se acepta la forma "con paréntesis" (n/2): cada redondeo puede moverse ±1.
    const conRedondeo = /ceil|floor|techo|piso|[⌈⌊]/.test(String(textoB));
    let A, B;
    try { A = parsear(textoA); } catch (e) { return { ok: false, error: 'No entiendo la expresión: ' + e.message }; }
    B = parsear(textoB);
    const vars = new Set([...variablesDe(A), ...variablesDe(B)]);
    const permitidas = new Set(['n', 'k', 'm', ...(opts.vars || [])]);
    for (const v of vars) if (!permitidas.has(v)) return { ok: false, error: 'Variable no permitida: ' + v + ' (usa n' + (permitidas.has('k') ? ', k' : '') + ')' };
    const diffs = [];
    const ks = vars.has('k') ? PUNTOS_K : [3];
    const ms = vars.has('m') ? [2, 5] : [2];
    const extras = [...vars].filter((v) => !['n', 'k', 'm'].includes(v));
    const muestras = extras.length ? [0, 1, 2, 3, 7] : [0];
    for (const n of puntosN) for (const k of ks) for (const m of ms) for (const x of muestras) for (const y of (extras.length > 1 ? [0, 1, 4, 9] : [0])) {
      const env = { n, k, m, ...(opts.env || {}) };
      extras.forEach((v, idx) => { env[v] = idx === 0 ? x : y; });
      const i = env.i, j = env.j;
      let a, b;
      try { a = evaluar(A, env); b = evaluar(B, env); } catch (e) { return { ok: false, error: e.message }; }
      if (!isFinite(a)) return { ok: false, error: 'La expresión no da un número en n=' + n };
      const d = Math.abs(a - b);
      let dentro = false;
      if (conRedondeo && d > tol * Math.max(1, Math.abs(b))) {
        const lo = evaluar(B, env, -1), hi = evaluar(B, env, 1);
        dentro = a >= Math.min(lo, hi) - 1e-9 && a <= Math.max(lo, hi) + 1e-9;
      }
      if (!dentro && d > tol * Math.max(1, Math.abs(b)) && d > (opts.absTol || 0)) diffs.push({ n, k, i, j, tuyo: a, esperado: b });
    }
    return diffs.length ? { ok: false, diffs } : { ok: true };
  }

  /** ¿Son del mismo orden de crecimiento? (compara la razón f/g en n grande) */
  function mismoOrden(textoA, textoB, opts = {}) {
    let A, B;
    try { A = parsear(textoA); } catch (e) { return { ok: false, error: 'No entiendo la expresión: ' + e.message }; }
    B = parsear(textoB);
    const vars = variablesDe(A);
    const env = Object.assign({ k: 3 }, opts.env || {});
    for (const v of vars) if (v !== 'n' && !(v in env)) return { ok: false, error: 'En Big-O solo se usa n (encontré "' + v + '")' };
    if (!opts.env && vars.has('k') && !opts.permitirK) return { ok: false, error: 'En Big-O no va la constante k' };
    const razon = (n) => { try { return evaluar(A, Object.assign({ n }, env)) / evaluar(B, Object.assign({ n }, env)); } catch (e) { return NaN; } };
    let r1 = razon(100), r2 = razon(1e8);
    if (!isFinite(r1) || !isFinite(r2) || r1 === 0 || r2 === 0) { r1 = razon(100); r2 = razon(3000); }
    if (!isFinite(r1) || !isFinite(r2) || r1 === 0 || r2 === 0) { r1 = razon(10); r2 = razon(30); }
    if (!isFinite(r1) || !isFinite(r2) || r1 <= 0 || r2 <= 0) return { ok: false };
    const q = r2 / r1;
    return { ok: q > 1 / 3 && q < 3 };
  }

  /** ¿Es una forma APROXIMADA aceptable (mismo orden y razón entre 0.4 y 2.5 para n grande)? Para T(n) con logs/raíces sin pisos ni techos. */
  function aproximado(textoA, textoB, opts = {}) {
    const mo = mismoOrden(textoA, textoB, Object.assign({ permitirK: true }, opts));
    if (!mo.ok) return mo;
    let A, B; try { A = parsear(textoA); B = parsear(textoB); } catch (e) { return { ok: false, error: e.message }; }
    for (const n of [16, 100, 1000, 1e6]) {
      let a, b; try { a = evaluar(A, { n, k: 3 }); b = evaluar(B, { n, k: 3 }); } catch (e) { continue; }
      const q = a / b; if (!(q > 0.4 && q < 2.5)) return { ok: false, diffs: [{ n, k: 3, tuyo: a, esperado: b }] };
    }
    return { ok: true, aprox: true };
  }

  /** Clasifica una función de n en una etiqueta legible (para mensajes). */
  function claseDe(texto) {
    const clases = [['1', '1'], ['log n', 'log(n)'], ['√n', 'sqrt(n)'], ['n', 'n'], ['log² n', 'log(n)^2'], ['n log n', 'n*log(n)'], ['n²', 'n^2'], ['n² log n', 'n^2*log(n)'], ['n³', 'n^3'], ['n⁴', 'n^4'], ['n⁵', 'n^5'], ['2ⁿ', '2^n']];
    for (const [nombre, f] of clases) { const r = mismoOrden(texto, f); if (r.ok) return nombre; }
    return null;
  }

  /** Pasa una expresión en sintaxis del juego a LaTeX sencillo (para mostrar lo que escribió el estudiante). */
  function aLatex(texto) {
    let ast; try { ast = parsear(texto); } catch (e) { return texto; }
    const prec = { '+': 1, '-': 1, '*': 2, '/': 2, 'neg': 3, '^': 4 };
    function g(node, parentPrec) {
      let s, pr = 5;
      if (node.num != null) s = String(node.num);
      else if (node.fn2) { s = '\\' + node.fn2 + '(' + g(node.a, 0) + ', ' + g(node.b, 0) + ')'; }
      else if (node.sum) { s = '\\sum_{' + node.sum + '=' + g(node.a, 0) + '}^{' + g(node.b, 0) + '} ' + g(node.cuerpo, 2); pr = 2; }
      else if (node.id != null) s = node.id;
      else if (node.fn) {
        const inner = g(node.a, 0);
        if (node.fn === 'ceil' || node.fn === 'techo' || node.fn === 'floor' || node.fn === 'piso') s = '\\left(' + inner + '\\right)';
        else if (node.fn === 'sqrt' || node.fn === 'raiz') s = '\\sqrt{' + inner + '}';
        else if (node.fn === 'log') s = '\\log_{' + (node.base == null ? 2 : node.base) + '}(' + inner + ')';
        else s = '\\' + node.fn + '(' + inner + ')';
      } else if (node.op === 'neg') { s = '-' + g(node.a, 3); pr = 3; }
      else if (node.op === '/') { s = '\\frac{' + g(node.a, 0) + '}{' + g(node.b, 0) + '}'; pr = 5; }
      else if (node.op === '^') { s = g(node.a, 4) + '^{' + g(node.b, 0) + '}'; pr = 4; }
      else if (node.op === '*') {
        const a = g(node.a, 2), b = g(node.b, 2);
        const numB = node.b.num != null;
        s = a + (numB ? ' \\cdot ' : '') + b; pr = 2;
      } else { s = g(node.a, prec[node.op]) + ' ' + node.op + ' ' + g(node.b, prec[node.op] + 1); pr = prec[node.op]; }
      return pr < parentPrec ? '\\left(' + s + '\\right)' : s;
    }
    return g(ast, 0);
  }

  const api = { normalizar, parsear, evaluar, ev, equivalentes, aproximado, mismoOrden, claseDe, aLatex, variablesDe, PUNTOS_N };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Formulas = api;
})(typeof window !== 'undefined' ? window : globalThis);
