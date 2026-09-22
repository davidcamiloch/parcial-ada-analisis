/* data/f2.js – Fase 2: ¿Cuántas vueltas? (tipo V)
   Cada ejercicio: cabecera (código), t (fórmula en n), tolerancia (0 exacta, 1 = se acepta ±1 vuelta, p. ej. log),
   traza(n, datos) → lista de evaluaciones de la condición [{vars..., cond:true|false}] (la última es la falsa).
   casos: {mejor:{t, datos(n), desc}, peor:{...}} cuando depende de los datos. */
(function () {
  'use strict';
  const idiv = (a, b) => Math.trunc(a / b);
  const reg = (o) => ADA.registrar(Object.assign({ fase: 2, tipo: 'V', variantes: [{}] }, o));

  /** Traza genérica para for/while de una variable: inicio, cond(v), paso(v). */
  function trazaSimple(nombre, inicio, cond, paso, extra) {
    const pasos = []; let v = inicio; let guard = 0;
    for (;;) {
      const ok = cond(v);
      pasos.push(Object.assign({ [nombre]: v, cond: ok }, extra ? extra(v) : {}));
      if (!ok || ++guard > 100000) break;
      v = paso(v);
    }
    return pasos;
  }

  /* ---------- Incremento ---------- */
  reg({
    id: 'V01', titulo: 'for clásico: i < n', fuente: 'Simulacro P3', variantes: [{ ini: 0, lim: 'n', op: '<' }, { ini: 1, lim: 'n', op: '<' }, { ini: 3, lim: 'n', op: '<' }],
    def: (p) => ({
      cabecera: `for (int i = ${p.ini}; i < n; i++)`,
      t: p.ini === 0 ? 'n' : `n - ${p.ini}`, tolerancia: 0, nMin: p.ini,
      patron: '+m con <', formula: 't = ⌈(n − inicio)/m⌉ = ⌈(n − ' + p.ini + ')/1⌉ = ' + (p.ini === 0 ? 'n' : 'n − ' + p.ini),
      explicacion: `i toma los valores ${p.ini}, ${p.ini + 1}, …, n−1. Desde ${p.ini} hasta n−1 hay (n−1) − ${p.ini} + 1 = ${p.ini === 0 ? 'n' : 'n − ' + p.ini} valores.`,
      pistas: ['Escribe los valores de i para n = 5 y cuéntalos.', 'Fórmula +m con "<": ⌈(límite − inicio)/m⌉.'],
      traza: (n) => trazaSimple('i', p.ini, (i) => i < n, (i) => i + 1)
    })
  });
  reg({
    id: 'V02', titulo: '< versus <=', fuente: 'Hoja 1 #4 (for i = 1 to n)', variantes: [{ ini: 1, op: '<=' }, { ini: 0, op: '<=' }],
    def: (p) => ({
      cabecera: `for (int i = ${p.ini}; i <= n; i++)`,
      t: p.ini === 1 ? 'n' : 'n + 1', tolerancia: 0,
      patron: '+m con <=', formula: 't = ⌊(n − inicio)/m⌋ + 1 = (n − ' + p.ini + ') + 1 = ' + (p.ini === 1 ? 'n' : 'n + 1'),
      explicacion: `Con <= el límite SÍ entra: i = ${p.ini}, …, n. Son n − ${p.ini} + 1 = ${p.ini === 1 ? 'n' : 'n + 1'} valores. (Con "<" habría uno menos.)`,
      trampa: 'El "=" de <= añade una vuelta respecto a "<". Compara: "i = 0; i < n" → n vueltas; "i = 0; i <= n" → n + 1.',
      pistas: ['¿Entra i = n? Con <= sí.', 'Fórmula +m con "<=": ⌊(límite − inicio)/m⌋ + 1.'],
      traza: (n) => trazaSimple('i', p.ini, (i) => i <= n, (i) => i + 1)
    })
  });
  reg({
    id: 'V03', titulo: 'salto de 2 en 2', fuente: 'Simulacro P2(b) suma2', variantes: [{ m: 2 }, { m: 3 }, { m: 4 }],
    def: (p) => ({
      cabecera: `for (int i = 0; i < n; i = i + ${p.m})`,
      t: `ceil(n/${p.m})`, tolerancia: 0,
      patron: '+m con <', formula: `t = ⌈(n − 0)/${p.m}⌉ = ⌈n/${p.m}⌉`,
      explicacion: `i = 0, ${p.m}, ${2 * p.m}, … mientras sea < n. Para n = 10: ${Array.from({ length: Math.ceil(10 / p.m) }, (_, k) => k * p.m).join(', ')} → ${Math.ceil(10 / p.m)} = ⌈10/${p.m}⌉. Para n = ${10 + 1}: ⌈11/${p.m}⌉ = ${Math.ceil(11 / p.m)}. El techo redondea hacia arriba porque la última vuelta "incompleta" también cuenta.`,
      pistas: ['Cuenta los valores para n = 10 y para n = 11: ¿te da lo mismo? Usa techo.', `Fórmula +m con "<": ⌈(n − inicio)/m⌉ = ⌈n/${p.m}⌉.`],
      traza: (n) => trazaSimple('i', 0, (i) => i < n, (i) => i + p.m)
    })
  });
  reg({
    id: 'V04', titulo: 'salto de m en m con <=', fuente: 'Hoja resumen', variantes: [{ ini: 1, m: 3 }, { ini: 2, m: 5 }],
    def: (p) => ({
      cabecera: `for (int i = ${p.ini}; i <= n; i += ${p.m})`,
      t: `floor((n - ${p.ini})/${p.m}) + 1`, tolerancia: 0,
      patron: '+m con <=', formula: `t = ⌊(n − ${p.ini})/${p.m}⌋ + 1`,
      explicacion: `i = ${p.ini}, ${p.ini + p.m}, ${p.ini + 2 * p.m}, … ≤ n. El k-ésimo valor es ${p.ini} + k·${p.m}; entra mientras k ≤ (n − ${p.ini})/${p.m}, o sea k = 0 … ⌊(n − ${p.ini})/${p.m}⌋: son ⌊(n − ${p.ini})/${p.m}⌋ + 1 valores. Para n = 10: ${Array.from({ length: Math.floor((10 - p.ini) / p.m) + 1 }, (_, k) => p.ini + k * p.m).join(', ')}.`,
      pistas: ['Con <= se usa piso + 1 (el "+1" es el valor inicial, que siempre entra si inicio ≤ n).', `t = ⌊(n − ${p.ini})/${p.m}⌋ + 1`],
      traza: (n) => trazaSimple('i', p.ini, (i) => i <= n, (i) => i + p.m)
    })
  });

  /* ---------- Decremento ---------- */
  reg({
    id: 'V05', titulo: 'decreciente i--', fuente: 'Hoja 1 #16 aSaber', variantes: [{ forma: 'n-1' }, { forma: 'n' }],
    def: (p) => ({
      cabecera: p.forma === 'n-1' ? 'for (int i = n - 1; i >= 0; i--)' : 'for (int i = n; i > 0; i--)',
      t: 'n', tolerancia: 0,
      patron: '−m', formula: p.forma === 'n-1' ? 't = ⌊(inicio − límite)/m⌋ + 1 = (n − 1 − 0) + 1 = n' : 't = ⌈(inicio − límite)/m⌉ = ⌈(n − 0)/1⌉ = n',
      explicacion: p.forma === 'n-1' ? 'i = n−1, n−2, …, 0: son n valores (de 0 a n−1). Sale con i = −1.' : 'i = n, n−1, …, 1: son n valores. Sale con i = 0.',
      pistas: ['Escribe los valores para n = 4.', 'Un ciclo que baja de 1 en 1 da tantas vueltas como valores recorre: (inicio − último) + 1.'],
      traza: (n) => p.forma === 'n-1' ? trazaSimple('i', n - 1, (i) => i >= 0, (i) => i - 1) : trazaSimple('i', n, (i) => i > 0, (i) => i - 1)
    })
  });
  reg({
    id: 'V06', titulo: 'decreciente de 2 en 2', fuente: 'Hoja 1 #17 aSaber', variantes: [{ m: 2 }, { m: 3 }],
    def: (p) => ({
      cabecera: `for (int i = n - 1; i >= 0; i -= ${p.m})`,
      t: `ceil(n/${p.m})`, tolerancia: 0,
      patron: '−m con >=', formula: `t = ⌊(inicio − límite)/m⌋ + 1 = ⌊(n − 1)/${p.m}⌋ + 1 = ⌈n/${p.m}⌉`,
      explicacion: `i = n−1, n−${1 + p.m}, n−${1 + 2 * p.m}, … ≥ 0. Para n = 5: ${Array.from({ length: Math.ceil(5 / p.m) }, (_, k) => 4 - k * p.m).join(', ')} → ${Math.ceil(5 / p.m)}. Para n = 6: ${Array.from({ length: Math.ceil(6 / p.m) }, (_, k) => 5 - k * p.m).join(', ')} → ${Math.ceil(6 / p.m)}. Identidad útil: ⌊(n−1)/m⌋ + 1 = ⌈n/m⌉.`,
      pistas: ['Prueba con n = 5 y n = 6: ¿cuántos valores ≥ 0 recorre?', `⌊(n − 1)/${p.m}⌋ + 1, que es lo mismo que ⌈n/${p.m}⌉.`],
      traza: (n) => trazaSimple('i', n - 1, (i) => i >= 0, (i) => i - p.m)
    })
  });

  /* ---------- Multiplicación ---------- */
  reg({
    id: 'V07', titulo: 'multiplicativo i *= 2', fuente: 'Hoja resumen', variantes: [{ m: 2, op: '<' }, { m: 2, op: '<=' }],
    def: (p) => ({
      cabecera: `for (int i = 1; i ${p.op} n; i *= ${p.m})`,
      t: p.op === '<' ? 'ceil(log2(n))' : 'floor(log2(n)) + 1', tExacto: p.op === '<' ? 'ceil(log2(n))' : 'floor(log2(n)) + 1', tolerancia: 1,
      patron: '×m', formula: p.op === '<' ? 't = ⌈log₂(n / inicio)⌉ = ⌈log₂ n⌉' : 't = ⌊log₂(n / inicio)⌋ + 1 = ⌊log₂ n⌋ + 1',
      explicacion: `i = 1, 2, 4, 8, … = 2^k. Entra mientras 2^k ${p.op} n ⇔ k ${p.op} log₂ n. Para n = 10: 1, 2, 4, 8 → 4 = ⌈log₂ 10⌉ = ⌈3.32⌉. Para n = 8 con "<": 1, 2, 4 → 3 (8 no entra); con "<=": 1, 2, 4, 8 → 4 = ⌊3⌋ + 1.`,
      trampa: 'Multiplicar la variable ⇒ logaritmo. La base del log es el factor (×2 → log₂, ×3 → log₃). En el parcial basta escribir log₂ n; aquí se acepta ±1 vuelta.',
      pistas: ['i = 1, 2, 4, 8, 16… ¿cuántos de esos son < n? Piensa en 2^k < n.', 'k < log₂ n ⇒ t = ⌈log₂ n⌉ (para "<"); con "<=" es ⌊log₂ n⌋ + 1.'],
      traza: (n) => trazaSimple('i', 1, (i) => (p.op === '<' ? i < n : i <= n), (i) => i * p.m)
    })
  });
  reg({
    id: 'V08', titulo: 'k *= 3 (simulacro algunValor, j = 1)', fuente: 'Simulacro P2', variantes: [{ m: 3 }, { m: 4 }],
    def: (p) => ({
      cabecera: `for (int k = 1; k < (n * j); k *= ${p.m})`, contexto: 'con j = 1, así que el límite es n',
      t: `ceil(log${p.m}(n))`, tExacto: `ceil(log${p.m}(n))`, tolerancia: 1,
      patron: '×m', formula: `t = ⌈log_${p.m}(n / 1)⌉ = ⌈log_${p.m} n⌉`,
      explicacion: `k = 1, ${p.m}, ${p.m * p.m}, ${p.m ** 3}, … = ${p.m}^r. Entra mientras ${p.m}^r < n ⇔ r < log_${p.m} n. Para n = 10: 1, ${p.m}, ${p.m * p.m}${p.m ** 2 < 10 ? '' : ' (no)'} → ${Math.ceil(Math.log(10) / Math.log(p.m) - 1e-9)}. En el parcial escribe log_${p.m}(n) y di que es la base porque multiplica por ${p.m}.`,
      trampa: 'Ojo: en el simulacro el otro ciclo divide entre 9 (log₉), y log₉ n = log₃ n / 2: ambos son O(log n).',
      pistas: [`k = 1, ${p.m}, ${p.m * p.m}, … ¿cuántos son < n?`, `⌈log_${p.m} n⌉`],
      traza: (n) => trazaSimple('k', 1, (k) => k < n * 1, (k) => k * p.m)
    })
  });
  reg({
    id: 'V09', titulo: 'empieza en n y llega a n²', fuente: 'Variante', variantes: [{ m: 2 }, { m: 3 }],
    def: (p) => ({
      cabecera: `for (int i = n; i < n * n; i *= ${p.m})`,
      t: `ceil(log${p.m}(n))`, tExacto: `ceil(log${p.m}(n))`, tolerancia: 1,
      patron: '×m', formula: `t = ⌈log_${p.m}(límite / inicio)⌉ = ⌈log_${p.m}(n² / n)⌉ = ⌈log_${p.m} n⌉`,
      explicacion: `i = n, ${p.m}n, ${p.m * p.m}n, … = n·${p.m}^r < n² ⇔ ${p.m}^r < n ⇔ r < log_${p.m} n. Lo que importa es la razón límite/inicio, no el límite solo.`,
      trampa: 'Cuando el inicio no es 1, el log es de (límite / inicio). Aquí n²/n = n.',
      pistas: ['Divide el límite entre el inicio: n²/n = n.', `⌈log_${p.m} n⌉`],
      traza: (n) => trazaSimple('i', n, (i) => i < n * n, (i) => i * p.m)
    })
  });

  /* ---------- División ---------- */
  reg({
    id: 'V10', titulo: 'k = k / 2 hasta 0 (simulacro P1)', fuente: 'Simulacro P1', variantes: [{ m: 2 }, { m: 4 }],
    def: (p) => ({
      cabecera: `for (int k = n; k > 0; k = k / ${p.m})`,
      t: `floor(log${p.m}(n)) + 1`, tExacto: `floor(log${p.m}(n)) + 1`, tolerancia: 1,
      patron: '÷m (división entera)', formula: `t = ⌊log_${p.m}(inicio / (límite + 1))⌋ + 1 = ⌊log_${p.m} n⌋ + 1`,
      explicacion: `k = n, n/${p.m}, n/${p.m}², … (división entera) hasta llegar a 0. Para n = 10 y m = 2: 10, 5, 2, 1 → 4 = ⌊log₂ 10⌋ + 1 = 3 + 1. El "+1" es la vuelta con k = 1 (que 1/${p.m} = 0 y ahí sale).`,
      trampa: 'La respuesta del simulacro dice log₃ pero el ciclo divide entre 2 → log₂. Mismo Big-O; en la sumatoria escribe la base correcta.',
      pistas: ['Escribe la secuencia para n = 10 (división entera: 5/2 = 2).', `⌊log_${p.m} n⌋ + 1 ≈ log_${p.m} n`],
      traza: (n) => trazaSimple('k', n, (k) => k > 0, (k) => idiv(k, p.m))
    })
  });
  reg({
    id: 'V11', titulo: 'n = n / 9 mientras n > 1 (getUFPS)', fuente: 'Simulacro P2', variantes: [{ m: 9 }, { m: 2 }],
    def: (p) => ({
      cabecera: `while (n > 1) { ...; n = n / ${p.m}; }`,
      t: `log${p.m}(n)`, tExacto: `floor(log${p.m}(n/2)) + 1`, tolerancia: 1,
      patron: '÷m con > 1', formula: `t ≈ log_${p.m} n (exacto con división entera: ⌊log_${p.m}(n/2)⌋ + 1)`,
      explicacion: `n, n/${p.m}, n/${p.m}², … mientras sea > 1. Para n = 100 y m = 9: 100 → 11 → 1: 2 vueltas ≈ log₉ 100 = 2.1. Para n = 1000: 1000 → 111 → 12 → 1: 3 = ⌊log₉ 1000⌋ = 3.`,
      trampa: 'log₉ n = log₃ n / log₃ 9 = (log₃ n)/2. Por eso getUFPS (log₉ n vueltas × algunValor con log₃ n) da (log₃ n)²/2 → Θ(log² n).',
      pistas: [`n se divide entre ${p.m} cada vuelta hasta valer 1: log_${p.m} n vueltas.`, `t ≈ log_${p.m} n`],
      traza: (n) => trazaSimple('n', n, (v) => v > 1, (v) => idiv(v, p.m))
    })
  });
  reg({
    id: 'V12', titulo: 'n /= 10 (sumDigits)', fuente: 'Hoja 1 #22', variantes: [{}],
    def: () => ({
      cabecera: 'while (n != 0) { sum += n % 10; n /= 10; }',
      t: 'floor(log10(n)) + 1', tExacto: 'floor(log10(n)) + 1', tolerancia: 1,
      patron: '÷10', formula: 't = número de dígitos de n = ⌊log₁₀ n⌋ + 1',
      explicacion: 'Cada vuelta quita un dígito: 12345 → 1234 → 123 → 12 → 1 → 0: 5 vueltas = 5 dígitos = ⌊log₁₀ 12345⌋ + 1 = 4 + 1. El tamaño de la entrada es el VALOR n, y el ciclo es O(log n).',
      trampa: 'Aquí n es un número, no un arreglo. Dividir entre 10 ⇒ log₁₀; en Big-O, O(log n).',
      pistas: ['¿Cuántas veces puedes quitar el último dígito de 12345?', 'dígitos = ⌊log₁₀ n⌋ + 1'],
      traza: (n) => trazaSimple('n', n, (v) => v !== 0, (v) => idiv(v, 10))
    })
  });

  /* ---------- Raíz ---------- */
  reg({
    id: 'V13', titulo: 'guess * guess < n (sqrt)', fuente: 'Hoja 1 #20', variantes: [{ op: '<' }, { op: '<=' }],
    def: (p) => ({
      cabecera: `for (int guess = 1; guess * guess ${p.op} n; guess++)`,
      t: p.op === '<' ? 'ceil(sqrt(n)) - 1' : 'floor(sqrt(n))', tExacto: p.op === '<' ? 'ceil(sqrt(n)) - 1' : 'floor(sqrt(n))', tolerancia: 1,
      patron: '√', formula: p.op === '<' ? 't = ⌈√n⌉ − 1 ≈ √n' : 't = ⌊√n⌋ ≈ √n',
      explicacion: `guess = 1, 2, 3, … entra mientras guess² ${p.op} n ⇔ guess ${p.op} √n. Para n = 10: guess = 1, 2, 3 (9 < 10), 4 (16 no) → 3 ≈ √10 = 3.16. Para n = 16 con "<": 1, 2, 3 → 3 = ⌈4⌉ − 1; con "<=": 1, 2, 3, 4 → 4.`,
      trampa: p.op === '<' ? 'Con "<" el propio guess = √n nunca entra, así que "if (guess*guess == n) return guess" jamás se cumple: la función siempre devuelve −1. ¡Es un bug del ejercicio, y el profe puede preguntarlo!' : 'Comparar guess·guess con n equivale a comparar guess con √n.',
      pistas: ['guess² < n ⇔ guess < √n.', p.op === '<' ? '⌈√n⌉ − 1 (≈ √n)' : '⌊√n⌋ (≈ √n)'],
      traza: (n) => trazaSimple('guess', 1, (g) => (p.op === '<' ? g * g < n : g * g <= n), (g) => g + 1, (g) => ({ 'guess²': g * g }))
    })
  });

  /* ---------- Trampas: no entra / ~1 vez ---------- */
  reg({
    id: 'V14', titulo: 'while (n2 < j) con n2 = j + d', fuente: 'Simulacro P2 (n2 < j)', variantes: [{ d: 10 }, { d: 1 }],
    def: (p) => ({
      cabecera: `int n2 = j + ${p.d};\nwhile (n2 < j) { c += k * n * j; n2++; }`, contexto: 'j = n (o cualquier valor)',
      t: '0', tolerancia: 0,
      patron: 'nunca entra', formula: 't = 0 (pero la condición se evalúa 1 vez: cuesta 1)',
      explicacion: `n2 empieza valiendo j + ${p.d}, que ya es mayor que j, así que "n2 < j" es falsa desde la primera evaluación. 0 vueltas. En T(n) va como 1 (la evaluación) y no aporta al Big-O.`,
      trampa: 'Mira SIEMPRE el valor inicial contra la condición antes de aplicar fórmulas. Si empieza "del lado equivocado", no entra.',
      pistas: ['¿Cuánto vale n2 al llegar al while? ¿Es menor que j?', 't = 0; la evaluación falsa cuesta 1.'],
      traza: (n) => trazaSimple('n2', n + p.d, (v) => v < n, (v) => v + 1, () => ({ j: n }))
    })
  });
  reg({
    id: 'V15', titulo: 'M(n): for con i = i / 2 desde n² + c', fuente: 'Simulacro P1', variantes: [{ c: 5 }, { c: 3 }],
    def: (p) => ({
      cabecera: `int x = n * n + ${p.c};\nfor (int i = x; i >= n * n; i = i / 2)`, contexto: 'n ≥ 3',
      t: '1', tolerancia: 0, nMin: 3,
      patron: 'casi constante', formula: 't = 1 para n ≥ 3 (la mitad de n² + ' + p.c + ' ya es menor que n²)',
      explicacion: `Primera vuelta: i = n² + ${p.c} ≥ n² ✓. Luego i = (n² + ${p.c})/2, que es < n² en cuanto n² > ${p.c} (n ≥ 3). Ejemplo n = 10: i = 105 ✓, luego 52 < 100 ✗. Es O(1): dividir entre 2 solo da logaritmo si hay que bajar MUCHO; aquí con una división ya se sale.`,
      trampa: 'Un "i = i / 2" no garantiza log n: depende de cuánto hay que recorrer entre el inicio y el límite. Aquí inicio y límite están a distancia constante.',
      pistas: ['Calcula i en la primera y en la segunda evaluación con n = 10.', '1 vuelta (n ≥ 3). M(n) es O(1).'],
      traza: (n) => trazaSimple('i', n * n + p.c, (i) => i >= n * n, (i) => idiv(i, 2), () => ({ 'n²': n * n }))
    })
  });

  /* ---------- Dos índices ---------- */
  reg({
    id: 'V16', titulo: 'while con dos índices: avanza i o j', fuente: 'Hoja 1 #3', variantes: [{}],
    def: () => ({
      cabecera: 'int i = 1, j = 1;\nwhile (i <= n && j <= n) {\n  if (a[i][j+1] < a[i+1][j]) j = j + 1; else i = i + 1;\n}',
      dependeDatos: true,
      casos: {
        mejor: { t: 'n', desc: 'siempre avanza el mismo índice (p. ej. siempre j): llega a n+1 en n pasos', datos: (n) => 'siempre-j' },
        peor: { t: '2n - 1', desc: 'alterna: cuando uno llega a n el otro también está en n; total (n−1) + (n−1) + 1 = 2n − 1', datos: (n) => 'alterna' }
      },
      tolerancia: 0,
      patron: 'dos índices', formula: 'cada vuelta suma 1 a i o a j: i + j va de 2 hasta como máximo 2n + 1 → entre n y 2n − 1 vueltas',
      explicacion: 'En cada vuelta exactamente uno de los dos índices sube en 1. Mejor caso: uno sube siempre y sale al llegar a n+1: n vueltas. Peor caso: los dos suben hasta n (2n − 2 vueltas) y una más para que uno pase a n+1: 2n − 1. En ambos casos O(n) = Ω(n).',
      trampa: 'Aunque haya dos variables no es n²: no están anidadas, se reparten las vueltas.',
      pistas: ['¿Cuánto vale i + j al principio? ¿Y cuánto como máximo al salir? Cada vuelta lo sube en 1.', 'Mejor: n. Peor: 2n − 1.'],
      traza: (n, datos) => {
        const pasos = []; let i = 1, j = 1, k = 0;
        for (;;) { const ok = i <= n && j <= n; pasos.push({ i, j, cond: ok }); if (!ok) break; if (datos === 'alterna' ? (k % 2 === 0) : true) j++; else i++; k++; }
        return pasos;
      }
    })
  });
  reg({
    id: 'V17', titulo: 'while (i < j): i *= 2 o j /= 2', fuente: 'Hoja 1 #7', variantes: [{}],
    def: () => ({
      cabecera: 'int i = 1, j = n;\nwhile (i < j) {\n  if (a[i] < a[j]) i = i * 2; else j = j / 2;\n}',
      dependeDatos: true,
      casos: {
        mejor: { t: 'log2(n)', desc: 'siempre j = j/2 (división entera): ⌊log₂ n⌋', datos: () => 'siempre-j' },
        peor: { t: 'log2(n)', desc: 'siempre i = i*2: ⌈log₂ n⌉', datos: () => 'siempre-i' }
      },
      tolerancia: 1,
      patron: 'log sin importar la rama', formula: 't ≈ log₂ n en cualquier caso',
      explicacion: 'Haga lo que haga el if, en cada vuelta la razón j/i se divide (al menos) entre 2: o i se duplica o j se parte. Empieza en n y termina cuando j/i ≤ 1 → ≈ log₂ n vueltas. Mejor y peor caso son del mismo orden: Θ(log n).',
      trampa: 'Cuando las dos ramas hacen "lo mismo" en términos de crecimiento, no hay diferencia de orden entre mejor y peor caso.',
      pistas: ['¿Qué le pasa a j/i en cada vuelta, sea cual sea la rama?', '≈ log₂ n en ambos casos.'],
      traza: (n, datos) => {
        const pasos = []; let i = 1, j = n;
        for (;;) { const ok = i < j; pasos.push({ i, j, cond: ok }); if (!ok) break; if (datos === 'siempre-i') i *= 2; else j = idiv(j, 2); }
        return pasos;
      }
    })
  });
  reg({
    id: 'V18', titulo: 'while (j < n && a[i] <= a[j])', fuente: 'Hoja 1 #12', variantes: [{}],
    def: () => ({
      cabecera: 'cont = 1; j = i + 1;\nwhile (j < n && a[i] <= a[j]) { j = j + 1; cont = cont + 1; }', contexto: 'para la primera vuelta del for externo: i = 0',
      dependeDatos: true,
      casos: {
        mejor: { t: '0', desc: 'a[0] > a[1] (arreglo descendente): la condición falla de una', datos: (n) => Array.from({ length: n }, (_, k) => n - k) },
        peor: { t: 'n - 1', desc: 'arreglo ascendente: a[0] ≤ a[j] para todo j → j recorre 1..n−1', datos: (n) => Array.from({ length: n }, (_, k) => k) }
      },
      tolerancia: 0,
      patron: 'depende de los datos', formula: 'mejor 0 vueltas, peor n − 1 (para i = 0); en general n − 1 − i',
      explicacion: 'La condición compara elementos del arreglo, así que el número de vueltas depende del contenido. Mejor caso: a[0] > a[1] → 0 vueltas. Peor caso: arreglo ordenado ascendente → j llega hasta n − 1 → n − 1 vueltas. (Con el for externo completo: mejor Ω(n), peor O(n²).)',
      trampa: 'El pseudocódigo original no tiene "j < n" y se saldría del arreglo; en Java hay que ponerlo. Solo hay mejor/peor caso cuando una condición depende de los DATOS, no de n.',
      pistas: ['¿Qué arreglo hace que a[0] <= a[1] sea falso de entrada? ¿Y cuál hace que nunca falle?', 'Mejor 0; peor n − 1.'],
      traza: (n, datos) => {
        const a = datos || Array.from({ length: n }, (_, k) => k); const i = 0; const pasos = []; let j = i + 1, cont = 1;
        for (;;) { const ok = j < n && a[i] <= a[j]; pasos.push({ j, 'a[0]': a[0], 'a[j]': j < n ? a[j] : '—', cont, cond: ok }); if (!ok) break; j++; cont++; }
        return pasos;
      }
    })
  });

  /* ---------- Anidados: interno depende de i (preparación Fase 3) ---------- */
  reg({
    id: 'V19', titulo: 'interno j = i + 1 hasta n − 1', fuente: 'Hoja 1 #19 selección', variantes: [{ op: '<', lim: 'n' }, { op: '<=', lim: 'n' }],
    def: (p) => ({
      cabecera: `for (int j = i + 1; j ${p.op} ${p.lim}; j++)`, contexto: 'con i fijo (0 ≤ i < n): la respuesta queda en función de n e i',
      t: p.op === '<' ? 'n - 1 - i' : 'n - i', tolerancia: 0, conI: true,
      patron: '+1 con inicio i+1', formula: p.op === '<' ? 't = (n − 1) − (i + 1) + 1 = n − 1 − i' : 't = n − (i + 1) + 1 = n − i',
      explicacion: p.op === '<' ? 'j = i+1, …, n−1: (n − 1) − (i + 1) + 1 = n − 1 − i valores. Para n = 10, i = 3: j = 4..9 → 6 = 10 − 1 − 3. Este t depende de i, y en la Fase 3 se suma sobre i: Σ (n − 1 − i) = n(n−1)/2.' : 'j = i+1, …, n: n − (i + 1) + 1 = n − i valores. Para n = 10, i = 3: j = 4..10 → 7 = 10 − 3.',
      pistas: ['Cuenta: desde i+1 hasta el último valor que entra, (último − primero + 1).', p.op === '<' ? 'n − 1 − i' : 'n − i'],
      traza: (n, datos) => { const i = datos != null ? datos : Math.floor(n / 3); return trazaSimple('j', i + 1, (j) => (p.op === '<' ? j < n : j <= n), (j) => j + 1, () => ({ i })); },
      datosI: (n) => [0, Math.floor(n / 3), Math.max(0, n - 1)]
    })
  });
  reg({
    id: 'V20', titulo: 'externo desde 2 hasta n − 1', fuente: 'Hoja 1 #18 burbuja', variantes: [{ ini: 2, fin: 'n - 1' }, { ini: 1, fin: 'n - 2' }],
    def: (p) => ({
      cabecera: `for (int i = ${p.ini}; i <= ${p.fin}; i++)`,
      t: p.fin === 'n - 1' ? `n - ${p.ini}` : `n - ${p.ini + 1}`, tolerancia: 0, nMin: p.fin === 'n - 1' ? p.ini : p.ini + 1,
      patron: '+1 con límites raros', formula: `t = (${p.fin}) − ${p.ini} + 1 = ${p.fin === 'n - 1' ? 'n − ' + p.ini : 'n − ' + (p.ini + 1)}`,
      explicacion: `i = ${p.ini}, …, ${p.fin}: son (${p.fin}) − ${p.ini} + 1 valores. Para n = 10: ${p.ini}..${p.fin === 'n - 1' ? 9 : 8} → ${p.fin === 'n - 1' ? 10 - p.ini : 9 - p.ini}. La regla es siempre la misma: último − primero + 1.`,
      pistas: ['último − primero + 1.', `${p.fin === 'n - 1' ? 'n − ' + p.ini : 'n − ' + (p.ini + 1)}`],
      traza: (n) => trazaSimple('i', p.ini, (i) => i <= (p.fin === 'n - 1' ? n - 1 : n - 2), (i) => i + 1)
    })
  });
})();
