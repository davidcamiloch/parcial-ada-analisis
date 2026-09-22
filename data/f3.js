/* data/f3.js – Fase 3: anidados, llamadas y recursión (tipo A completo + tipo R + tipo C).
   Novedades del modelo respecto a f1.js:
   - ciclo.t puede depender de la variable externa ('n-1-i'); ciclo.total = ejecuciones totales del cuerpo.
   - veces de cada línea = TOTAL de ejecuciones (lo que verifica el instrumentado).
   - una línea con `llamada: true` y `cuerpo` es una llamada a un método propio con sus líneas "desplegadas" debajo.
   - guia: pasos guiados (expr | opcion) para construir y simplificar las sumatorias.
   - pasos: desarrollo manual (LaTeX) de la solución.  Todo en sintaxis del parser ($…$ se renderiza con KaTeX). */
(function () {
  'use strict';
  const L = ADA.L;
  const idiv = (a, b) => Math.trunc(a / b);
  const reg = (o) => ADA.registrar(Object.assign({ fase: 3, variantes: [{}] }, o));
  const asc = (n) => Array.from({ length: n }, (_, i) => i);
  const desc = (n) => Array.from({ length: n }, (_, i) => n - i);

  /* =============== A07 sumDigits =============== */
  reg({
    id: 'A07', tipo: 'A', titulo: 'sumDigits (n /= 10)', fuente: 'Hoja 1 #22',
    def: () => ({
      enunciado: 'n es un entero positivo. El tamaño de la entrada es el VALOR de n. Halle costos, vueltas (en función de n), T(n), invariante y Big-O. Para el ciclo se acepta ±1 vuelta (escribe por ejemplo log10(n)).',
      firma: 'static int sumDigits(int n)', tamano: 'el valor de n', nMin: 1, TnAprox: true,
      lineas: [
        L('s', 'int sum = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'w', txt: 'while (n != 0) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'floor(log10(n))+1', t: 'floor(log10(n))+1', tol: 1, invariante: 'n == 0', valores: 'n, n/10, n/100, … hasta 0: tantas vueltas como dígitos' },
          partes: [L('w.cond', 'n != 0', 1, 1, 'floor(log10(n))+2', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'D + 1 evaluaciones, con D = ⌊log₁₀ n⌋ + 1 dígitos.', tag: 'condveces', tol: 1 })],
          cuerpo: [
            L('a', 'sum += n % 10;', 3, 3, 'floor(log10(n))+1', { porque: 'Módulo (1) + suma (1) + asignación (1) = 3.', tag: 'acum', tol: 1 }),
            L('d', 'n /= 10;', 2, 1, 'floor(log10(n))+1', { porque: 'División + asignación: 2.', tag: 'upd', tol: 1 })
          ] },
        L('ret', 'return sum;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'n == 0', invAlt: ['n = 0', 'n==0'],
      Tn: { prof: '4 + 6(floor(log10(n))+1)', hojas: '3 + 5(floor(log10(n))+1)' }, bigO: 'log(n)',
      guia: [
        { tipo: 'opcion', pregunta: '¿Qué le pasa a n en cada vuelta y cuándo termina?', opciones: [
          { txt: 'Pierde su último dígito (división entera entre 10); termina cuando ya no quedan dígitos.', ok: true, porque: 'Correcto: 12345 → 1234 → 123 → 12 → 1 → 0.' },
          { txt: 'Se resta 10; termina cuando n < 10.', ok: false, porque: 'Es n /= 10, no n -= 10. Dividir ⇒ logaritmo.' },
          { txt: 'Se divide entre 10 con decimales; nunca llega a 0.', ok: false, porque: 'Es división entera: 1/10 = 0.' }] },
        { tipo: 'expr', pregunta: 'Vueltas del while en función de n (se acepta ±1): $t = ?$', respuesta: 'floor(log10(n))+1', tol: 1, ayuda: 'Cada vuelta quita un dígito, así que t = número de dígitos de n = ⌊log₁₀ n⌋ + 1 ≈ log₁₀ n. Ejemplo: n = 999 → 3 vueltas; log₁₀ 999 = 2.99.' }
      ],
      pistas: ['Cada vuelta le quita un dígito a n.', 'T(n) = 2 + Σ_{r=1}^{D}(1 + 3 + 2) + 1 + 1, con D = ⌊log₁₀ n⌋ + 1.'],
      pasos: [
        { txt: 'Vueltas: D = ⌊log₁₀ n⌋ + 1 (dígitos). Reemplazo la sumatoria de constante:', tex: 'T(n) = 2 + \\sum_{r=1}^{D}(1+3+2) + 1 + 1 = 4 + 6D' },
        { txt: 'Sustituyo D:', tex: 'T(n) = 4 + 6(\\lfloor \\log_{10} n \\rfloor + 1) \\approx 6\\log_{10} n + 10' },
        { txt: 'Orden: el término dominante es log₁₀ n; la base no importa en Big-O.', tex: 'T(n) \\in O(\\log n)' }
      ],
      ejecutar(n, C) {
        C.c('s'); let sum = 0;
        for (;;) { C.c('w.cond'); C.v({ n, sum }); if (!(n !== 0)) break; C.c('a'); sum += n % 10; C.c('d'); n = idiv(n, 10); }
        C.c('ret'); return sum;
      }
    })
  });

  /* =============== A08 sqrt =============== */
  reg({
    id: 'A08', tipo: 'A', titulo: 'sqrt(n) con guess * guess < n', fuente: 'Hoja 1 #20',
    def: () => ({
      enunciado: 'Halle costos, vueltas, T(n), invariante y Big-O. Piense también si existen mejor y peor caso (¡y si el return de adentro se ejecuta alguna vez!). Se acepta ±1 vuelta.',
      firma: 'static int sqrt(int n)', tamano: 'el valor de n', nMin: 1, TnAprox: true,
      lineas: [
        { id: 'f', txt: 'for (int guess = 1; guess * guess < n; guess++) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'ceil(sqrt(n))-1', t: 'ceil(sqrt(n))-1', tol: 1, invariante: 'guess * guess >= n', valores: 'guess = 1, 2, 3, … mientras guess² < n' },
          partes: [
            L('f.init', 'int guess = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            L('f.cond', 'guess * guess < n', 2, 2, 'ceil(sqrt(n))', { rol: 'cond', porque: 'Multiplicación (1) + comparación (1) = 2.', porqueVeces: 't + 1 con t = ⌈√n⌉ − 1: es decir ⌈√n⌉ evaluaciones.', tag: 'condveces', tol: 1, alt: { prof: ['1'], hojas: ['1'] } }),
            L('f.upd', 'guess++', 2, 1, 'ceil(sqrt(n))-1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', tol: 1 })],
          cuerpo: [
            { id: 'if', txt: 'if (guess * guess == n) return guess;', costo: { prof: '2', hojas: '2' }, veces: 'ceil(sqrt(n))-1', porque: 'Multiplicación + comparación = 2. El return NUNCA se ejecuta: dentro del ciclo guess² < n, así que guess² == n es imposible.', tag: 'cond', tol: 1, alt: { prof: ['1', '3'], hojas: ['1', '3'] } }
          ] },
        L('ret', 'return -1;', 1, 1, 1, { porque: 'return: 1 (siempre se llega aquí).', tag: 'ret' })
      ],
      invariante: 'guess * guess >= n', invAlt: ['guess*guess>=n', 'guess^2 >= n', 'guess² >= n', 'guess >= sqrt(n)', 'guess >= √n'],
      Tn: { prof: '5 + 6(ceil(sqrt(n))-1)', hojas: '4 + 5(ceil(sqrt(n))-1)' }, bigO: 'sqrt(n)',
      mejorPeor: 'No hay mejor ni peor caso: como el return interno nunca se cumple (guess² < n dentro del ciclo), siempre se recorren ⌈√n⌉ − 1 vueltas. O(√n) = Ω(√n). Trampa del ejercicio: la función siempre devuelve −1.',
      guia: [
        { tipo: 'opcion', pregunta: '¿Cuándo puede ser verdadera la condición $guess \\cdot guess == n$ dentro del ciclo?', opciones: [
          { txt: 'Nunca: para estar dentro del ciclo se necesita guess² < n.', ok: true, porque: 'Correcto. Es el bug del ejercicio: siempre retorna −1 y no hay mejor caso.' },
          { txt: 'Cuando n es cuadrado perfecto.', ok: false, porque: 'Si n = 16, guess llega a 4 pero 16 < 16 es falso y el ciclo termina ANTES de evaluar el if.' },
          { txt: 'En la última vuelta.', ok: false, porque: 'En la última vuelta guess² sigue siendo < n.' }] },
        { tipo: 'expr', pregunta: 'Vueltas del for (±1): $t = ?$', respuesta: 'ceil(sqrt(n))-1', tol: 1, ayuda: 'guess² < n ⇔ guess < √n. Los enteros positivos menores que √n son ⌈√n⌉ − 1 (≈ √n). n = 10: 1, 2, 3 → 3; ⌈3.16⌉ − 1 = 3.' }
      ],
      pistas: ['guess² < n ⇔ guess < √n.', 'T(n) = 2 + Σ_{r=1}^{⌈√n⌉−1}(2 + 2 + 2) + 2 + 1.'],
      pasos: [
        { txt: 'Vueltas: t = ⌈√n⌉ − 1. Sumatoria de constante:', tex: 'T(n) = 2 + \\sum_{r=1}^{\\lceil\\sqrt n\\rceil - 1}(2+2+2) + 2 + 1 = 5 + 6(\\lceil\\sqrt n\\rceil - 1)' },
        { txt: 'Aproximo para el orden:', tex: 'T(n) \\approx 6\\sqrt n - 1 \\in O(\\sqrt n)' }
      ],
      ejecutar(n, C) {
        C.c('f.init');
        for (let g = 1; ; g++) { C.c('f.cond'); C.v({ guess: g, 'guess²': g * g }); if (!(g * g < n)) break; C.c('if'); if (g * g === n) return g; C.c('f.upd'); }
        C.c('ret'); return -1;
      }
    })
  });

  /* =============== A09 triple for (producto de matrices) =============== */
  reg({
    id: 'A09', tipo: 'A', titulo: 'Triple for: producto de matrices', fuente: 'Hoja 1 #4',
    def: () => ({
      enunciado: 'Índices 1..n (los arreglos son de tamaño n+1). Tres ciclos anidados INDEPENDIENTES. Halle el costo de cada línea, las vueltas de cada ciclo, construya las sumatorias anidadas y simplifique hasta el T(n) y el Big-O.',
      firma: 'static void producto(int[][] a, int[][] b, int[][] c, int n)', tamano: 'n (matrices n×n)', nMax: 100,
      lineas: [
        { id: 'fi', txt: 'for (int i = 1; i <= n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '1', hasta: 'n', t: 'n', total: 'n', invariante: 'i == n + 1', valores: 'i = 1..n' },
          partes: [L('fi.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = 1; j <= n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '1', hasta: 'n', t: 'n', total: 'n^2', valores: 'j = 1..n por cada i' },
              partes: [L('fj.init', 'int j = 1', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2. Una vez por cada i.', tag: 'decl' }), L('fj.cond', 'j <= n', 1, 1, 'n^2+n', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: '(n + 1) evaluaciones por cada i: n(n+1) = n² + n.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n^2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [
                L('s0', 'int suma = 0;', 2, 1, 'n^2', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
                { id: 'fk', txt: 'for (int k = 1; k <= n; k++) {', cierre: '}', ciclo: { tipo: 'for', var: 'k', desde: '1', hasta: 'n', t: 'n', total: 'n^3', valores: 'k = 1..n por cada (i, j)' },
                  partes: [L('fk.init', 'int k = 1', 2, 1, 'n^2', { rol: 'init', porque: 'Declaración + asignación: 2. Una vez por cada (i, j).', tag: 'decl' }), L('fk.cond', 'k <= n', 1, 1, 'n^3+n^2', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'n + 1 por cada (i, j): n²(n + 1).', tag: 'condveces' }), L('fk.upd', 'k++', 2, 1, 'n^3', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
                  cuerpo: [L('acum', 'suma = suma + a[i][k] * b[k][j];', 5, 5, 'n^3', { porque: '2 accesos (a[i][k], b[k][j]) + multiplicación + suma + asignación = 5.', tag: 'acum' })] },
                L('c', 'c[i][j] = suma;', 2, 1, 'n^2', { porque: 'Acceso a c[i][j] + asignación = 2.', tag: 'asig', alt: { prof: ['1'], hojas: ['2'] } })
              ] }
          ] }
      ],
      invariante: 'i == n + 1', invAlt: ['i = n+1', 'i > n', 'i>n', 'i==n+1'],
      Tn: { prof: '8n^3 + 10n^2 + 6n + 3', hojas: '7n^3 + 6n^2 + 4n + 2' }, bigO: 'n^3',
      guia: [
        { tipo: 'expr', pregunta: '¿Cuántas veces en total se ejecuta $suma = suma + a[i][k] \\cdot b[k][j]$?', respuesta: 'n^3', ayuda: 'Está dentro de tres ciclos independientes de n vueltas cada uno: n · n · n = n³.' },
        { tipo: 'expr', pregunta: 'Resuelve la sumatoria más interna (costo por vuelta de k: condición 1 + cuerpo 5 + k++ 2): $\\sum_{k=1}^{n} 8 = ?$', respuesta: '8n', ayuda: 'Σ_{k=1}^{n} c = c · (n − 1 + 1) = c · n → 8n.' },
        { tipo: 'expr', pregunta: 'Ahora la de j. Por cada j: cond 1 + suma=0 2 + init k 2 + [8n] + cond final k 1 + c[i][j] 2 + j++ 2 = 10 + 8n. $\\sum_{j=1}^{n}(10 + 8n) = ?$', respuesta: '10n + 8n^2', ayuda: '(10 + 8n) no depende de j: es una constante respecto a j → (10 + 8n) · n = 10n + 8n².' },
        { tipo: 'expr', pregunta: 'Y la de i. Por cada i: cond 1 + init j 2 + [10n + 8n²] + cond final j 1 + i++ 2 = 6 + 10n + 8n². $\\sum_{i=1}^{n}(6 + 10n + 8n^2) = ?$', respuesta: '6n + 10n^2 + 8n^3', ayuda: 'Constante respecto a i: (6 + 10n + 8n²) · n = 6n + 10n² + 8n³.' }
      ],
      pistas: ['Los tres ciclos son independientes: el interno corre n³ veces.', 'Resuelve de adentro hacia afuera: Σ_k 8 = 8n; luego Σ_j (10 + 8n); luego Σ_i (…).'],
      pasos: [
        { txt: 'Interna (k): constante 8 por vuelta, n vueltas:', tex: '\\sum_{k=1}^{n} 8 = 8n' },
        { txt: 'Media (j): por cada j se paga cond 1 + suma=0 (2) + init k (2) + 8n + cond final k (1) + c[i][j] (2) + j++ (2):', tex: '\\sum_{j=1}^{n}(10 + 8n) = 10n + 8n^2' },
        { txt: 'Externa (i): cond 1 + init j (2) + (10n + 8n²) + cond final j (1) + i++ (2):', tex: '\\sum_{i=1}^{n}(6 + 10n + 8n^2) = 6n + 10n^2 + 8n^3' },
        { txt: 'Fijos: init i (2) + cond final i (1) = 3:', tex: 'T(n) = 8n^3 + 10n^2 + 6n + 3' },
        { txt: 'Término dominante:', tex: 'T(n) \\in O(n^3)' }
      ],
      ejecutar(n, C) {
        const a = Array.from({ length: n + 1 }, () => Array(n + 1).fill(1)), b = a, c = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
        C.c('fi.init');
        for (let i = 1; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i <= n)) break;
          C.c('fj.init');
          for (let j = 1; ; j++) { C.c('fj.cond'); if (!(j <= n)) break;
            C.c('s0'); let suma = 0; C.c('fk.init');
            for (let k = 1; ; k++) { C.c('fk.cond'); if (!(k <= n)) break; C.c('acum'); suma = suma + a[i][k] * b[k][j]; C.c('fk.upd'); }
            C.c('c'); c[i][j] = suma; C.c('fj.upd'); }
          C.c('fi.upd'); }
      }
    })
  });

  /* =============== A10 p = p + i*i =============== */
  reg({
    id: 'A10', tipo: 'A', titulo: 'for interno hasta p (p = p + i·i)', fuente: 'Hoja 1 #5',
    def: () => ({
      enunciado: 'El ciclo interno corre hasta p, y p ACUMULA los cuadrados. Halle costos, las vueltas del interno en función de i, la sumatoria total (necesita Σi² y Σi³) y el Big-O. write(…) cuesta k.',
      firma: 'static void punto5(int[][] a, int n)', tamano: 'n', nMax: 32,
      lineas: [
        L('p', 'int p = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 1; i <= n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '1', hasta: 'n', t: 'n', total: 'n', invariante: 'i == n + 1' },
          partes: [L('fi.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            L('pp', 'p = p + i * i;', 3, 3, 'n', { porque: 'Multiplicación + suma + asignación = 3.', tag: 'acum' }),
            { id: 'fj', txt: 'for (int j = 1; j <= p; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '1', hasta: 'p', t: 'i(i+1)(2i+1)/6', total: 'n(n+1)^2(n+2)/12', valores: 'j = 1..p, con p = 1² + 2² + … + i²' },
              partes: [L('fj.init', 'int j = 1', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j <= p', 1, 1, 'n(n+1)^2(n+2)/12 + n', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Total de vueltas internas + 1 por cada i.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n(n+1)^2(n+2)/12', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [L('w', 'System.out.println(a[p][j]);', 'k+1', 'k+1', 'n(n+1)^2(n+2)/12', { porque: 'Acceso al arreglo (1) + llamada de librería (k).', tag: 'k', alt: { prof: ['k'], hojas: ['k', '2'] } })] }
          ] }
      ],
      invariante: 'i == n + 1', invAlt: ['i = n+1', 'i > n', 'i>n'],
      Tn: { prof: '5 + 9n + (4+k)·n(n+1)^2(n+2)/12', hojas: '3 + 7n + (3+k)·n(n+1)^2(n+2)/12' }, bigO: 'n^4',
      guia: [
        { tipo: 'opcion', pregunta: 'En la vuelta i del ciclo externo, ¿cuánto vale p justo antes del for interno?', opciones: [
          { txt: 'p = 1² + 2² + … + i² = Σ_{r=1}^{i} r² = i(i+1)(2i+1)/6', ok: true, porque: 'Correcto: p acumula, no se reinicia.' },
          { txt: 'p = i²', ok: false, porque: 'p no se reinicia en cada vuelta: acumula todos los cuadrados anteriores.' },
          { txt: 'p = i(i+1)/2', ok: false, porque: 'Esa es la suma de los primeros i enteros, no de sus cuadrados.' }] },
        { tipo: 'expr', pregunta: 'Vueltas del for interno en la vuelta i (en función de i): $t_i = ?$', respuesta: 'i(i+1)(2i+1)/6', vars: ['i'], ayuda: 'j va de 1 a p, así que t_i = p = Σ_{r=1}^{i} r² = i(i+1)(2i+1)/6 (identidad 1.5.4).' },
        { tipo: 'opcion', pregunta: 'Para sumar $\\sum_{i=1}^{n} \\frac{i(i+1)(2i+1)}{6}$ hay que expandir el producto. ¿Qué queda?', opciones: [
          { txt: '(2i³ + 3i² + i)/6 → se usan Σi³, Σi² y Σi', ok: true, porque: 'Correcto: i(i+1)(2i+1) = 2i³ + 3i² + i.' },
          { txt: '(i³ + i)/6 → solo Σi³ y Σi', ok: false, porque: 'Multiplica bien: i(i+1) = i² + i; (i² + i)(2i + 1) = 2i³ + i² + 2i² + i = 2i³ + 3i² + i.' },
          { txt: 'No hace falta expandir: es n·p', ok: false, porque: 'p cambia con i; no es constante respecto a i.' }] },
        { tipo: 'expr', pregunta: 'Vueltas totales del interno: $\\sum_{i=1}^{n}\\frac{i(i+1)(2i+1)}{6} = ?$ (puedes escribirlo con sum(i=1..n, …) o en forma cerrada)', respuesta: 'n(n+1)^2(n+2)/12', ayuda: 'Σ(2i³ + 3i² + i)/6 = [2·(n(n+1)/2)² + 3·n(n+1)(2n+1)/6 + n(n+1)/2]/6. Sacando factor n(n+1)/12: n(n+1)[n(n+1) + (2n+1) + 1]/12 = n(n+1)(n² + 3n + 2)/12 = n(n+1)²(n+2)/12. Comprueba n = 2: 2·9·4/12 = 6 = 1 + 5 ✓.' }
      ],
      pistas: ['p vale Σ_{r=1}^{i} r² en la vuelta i.', 'Σ_{i=1}^{n} i(i+1)(2i+1)/6: expande y usa Σi³ = (n(n+1)/2)², Σi² = n(n+1)(2n+1)/6, Σi = n(n+1)/2.'],
      pasos: [
        { txt: 'Vueltas del interno en la vuelta i:', tex: 't_i = p = \\sum_{r=1}^{i} r^2 = \\frac{i(i+1)(2i+1)}{6}' },
        { txt: 'Total de vueltas internas:', tex: 'S = \\sum_{i=1}^{n} \\frac{2i^3 + 3i^2 + i}{6} = \\frac{1}{6}\\left[2\\left(\\frac{n(n+1)}{2}\\right)^2 + 3\\frac{n(n+1)(2n+1)}{6} + \\frac{n(n+1)}{2}\\right] = \\frac{n(n+1)^2(n+2)}{12}' },
        { txt: 'Costo: fijos 2 (p) + 2 (init i) + 1 (cond final i); por cada i: cond 1 + p=p+i·i 3 + init j 2 + cond final j 1 + i++ 2 = 9; por cada vuelta interna: cond 1 + (k+1) + j++ 2 = 4 + k:', tex: 'T(n) = 5 + 9n + (4+k)\\,S = 5 + 9n + (4+k)\\frac{n(n+1)^2(n+2)}{12}' },
        { txt: 'El término dominante es n⁴/12:', tex: 'T(n) \\in O(n^4)' }
      ],
      ejecutar(n, C) {
        C.c('p'); let p = 0; C.c('fi.init');
        for (let i = 1; ; i++) { C.c('fi.cond'); C.v({ i, p }); if (!(i <= n)) break; C.c('pp'); p = p + i * i; C.c('fj.init');
          for (let j = 1; ; j++) { C.c('fj.cond'); if (!(j <= p)) break; C.c('w'); C.c('fj.upd'); }
          C.c('fi.upd'); }
      }
    })
  });

  /* =============== A13 / A14 selección (con llamada y en línea) =============== */
  function seleccion(conLlamada) {
    const interno = [
      { id: 'if', txt: 'if (v[r] < v[result]) {', cierre: '}', costo: { prof: '3', hojas: '3' }, veces: 'n(n-1)/2', porque: '2 accesos + comparación = 3.', tag: 'cond',
        cuerpo: [L('asig', 'result = r;', 1, 1, 'n(n-1)/2', { porque: 'Asignación: 1. Peor caso = cota superior: como mucho se ejecuta una vez por comparación. (En la práctica, tras el primer intercambio el arreglo ya no es descendente y se ejecuta menos: el juego lo verificó y da ⌊n²/4⌋; para el parcial se usa la cota.)', porqueVeces: 'Peor caso (cota superior): a lo sumo n(n−1)/2 veces, una por comparación.', tag: 'rama', vecesMejor: '0', cota: true })] }
    ];
    const ciclo = { id: 'fr', txt: conLlamada ? 'for (int r = inicio + 1; r <= fin; r++) {' : 'for (int r = i + 1; r <= n - 1; r++) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: 'i+1', hasta: 'n-1', t: 'n-1-i', total: 'n(n-1)/2', valores: 'r = i+1 … n−1: n − 1 − i valores' },
      partes: [L('fr.init', conLlamada ? 'int r = inicio + 1' : 'int r = i + 1', 3, 2, 'n-1', { rol: 'init', porque: 'Declaración + asignación (2) + suma (1) = 3. Una vez por cada i.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        L('fr.cond', conLlamada ? 'r <= fin' : 'r <= n - 1', conLlamada ? 1 : 2, conLlamada ? 1 : 2, 'n(n-1)/2 + n - 1', { rol: 'cond', porque: conLlamada ? 'Comparación: 1.' : 'Resta + comparación: 2.', porqueVeces: 'Σ_{i=0}^{n-2}(n − 1 − i) vueltas en total, más una evaluación falsa por cada i (n − 1).', tag: 'condveces', alt: { prof: ['1', '2'], hojas: ['1', '2'] } }),
        L('fr.upd', 'r++', 2, 1, 'n(n-1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
      cuerpo: interno };
    const cuerpoExt = conLlamada
      ? [{ id: 'call', txt: 'intercambia(v, i, posMinimo(v, i, n - 1));', cierre: '', costo: { prof: 'k', hojas: 'k' }, veces: 'n-1', porque: 'intercambia es O(1): constante k (3 asignaciones). Además hay que sumar TODO lo que hace posMinimo (líneas de abajo).', tag: 'k', llamada: 'posMinimo(v, inicio = i, fin = n − 1)', alt: { prof: ['7', '8', '1+k'], hojas: ['5', '1+k'] },
          cuerpo: [
            L('res', 'int result = inicio;', 2, 1, 'n-1', { porque: 'Declaración + asignación: 2. Una vez por llamada (n − 1 llamadas).', tag: 'decl' }),
            ciclo,
            L('ret', 'return result;', 1, 1, 'n-1', { porque: 'return: 1 por llamada.', tag: 'ret' })
          ] }]
      : [L('min', 'int result = i;', 2, 1, 'n-1', { porque: 'Declaración + asignación: 2.', tag: 'decl' }), ciclo, L('call', 'intercambia(v, i, result);', 'k', 'k', 'n-1', { porque: 'intercambia es O(1): k.', tag: 'k', alt: { prof: ['7', '8', '1+k'], hojas: ['5', '1+k'] } })];
    return {
      enunciado: conLlamada ? 'Hoja 1 #10: ordenamiento por selección que LLAMA a posMinimo dentro del ciclo. Las líneas de posMinimo aparecen desplegadas bajo la llamada: cuentan tantas veces como se llama. intercambia cuesta k. Analice el PEOR caso como cota superior: result = r se cuenta una vez por comparación.' : 'Hoja 1 #19: selección con la búsqueda del mínimo en línea. intercambia cuesta k. Analice el PEOR caso como cota superior: ¿cuántas veces PUEDE correr result = r como máximo?',
      firma: conLlamada ? 'static void insercion(int[] v, int n)  +  static int posMinimo(int[] v, int inicio, int fin)' : 'static void insercion(int[] v, int n)', tamano: 'n = tamaño del vector', nMin: 1,
      casoTn: 'peor', cota: true,
      datos: { peor: (n) => desc(n), mejor: (n) => asc(n) },
      lineas: [
        { id: 'fi', txt: 'for (int i = 0; i <= n - 2; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-2', t: 'n-1', total: 'n-1', invariante: 'i == n - 1', valores: 'i = 0 … n−2: n − 1 valores' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n - 2', 2, 2, 'n', { rol: 'cond', porque: 'Resta + comparación: 2.', porqueVeces: '(n − 1) + 1 = n.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('fi.upd', 'i++', 2, 1, 'n-1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: cuerpoExt }
      ],
      invariante: 'i == n - 1', invAlt: ['i = n-1', 'i > n-2', 'i>n-2', 'i >= n-1'],
      Tn: conLlamada ? { prof: '4 + (11+k)(n-1) + 7n(n-1)/2', hojas: '3 + (8+k)(n-1) + 3n(n-1)' } : { prof: '4 + (11+k)(n-1) + 4n(n-1)', hojas: '3 + (8+k)(n-1) + 7n(n-1)/2' },
      bigO: 'n^2',
      mejorPeor: 'Peor caso: arreglo descendente → result = r en todas las comparaciones (n(n−1)/2 veces). Mejor caso: ascendente → 0 veces. Pero las comparaciones son SIEMPRE n(n−1)/2: el orden no cambia. O(n²) = Ω(n²).',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del ciclo interno para un i fijo (r desde i+1 hasta n−1): $t_i = ?$', respuesta: 'n-1-i', vars: ['i'], ayuda: '(último − primero + 1) = (n−1) − (i+1) + 1 = n − 1 − i. Para n = 10, i = 3: r = 4..9 → 6.' },
        { tipo: 'expr', pregunta: 'Total de vueltas internas: $\\sum_{i=0}^{n-2}(n-1-i) = ?$', respuesta: 'n(n-1)/2', ayuda: 'Cambio de variable m = n−1−i: i = 0 → m = n−1; i = n−2 → m = 1. Σ_{m=1}^{n-1} m = (n−1)·n/2. Comprueba n = 4: 3 + 2 + 1 = 6 = 4·3/2 ✓.' },
        { tipo: 'opcion', pregunta: '¿Cuál es el mejor caso y qué orden tiene?', opciones: [
          { txt: 'Arreglo ascendente: result = r no se ejecuta nunca, pero las n(n−1)/2 comparaciones se hacen igual → Ω(n²).', ok: true, porque: 'Correcto: el if solo ahorra la asignación (1 OE), no las comparaciones.' },
          { txt: 'Arreglo ascendente: el ciclo interno no corre → Ω(n).', ok: false, porque: 'El ciclo interno no depende de los datos: siempre recorre r = i+1..n−1.' },
          { txt: 'No hay mejor caso porque no hay if.', ok: false, porque: 'Sí hay un if, pero solo afecta 1 OE por comparación; el orden no cambia.' }] }
      ],
      pistas: ['El interno da n−1−i vueltas; súmalas sobre i con el cambio m = n−1−i.', 'T(n) = 2 + Σ_{i=0}^{n-2}[ … + Σ_{r=i+1}^{n-1}(costo interno) + … ] + 2.'],
      pasos: [
        { txt: 'Vueltas internas por i y total (cambio de variable m = n − 1 − i):', tex: 't_i = n-1-i,\\qquad \\sum_{i=0}^{n-2}(n-1-i) = \\sum_{m=1}^{n-1} m = \\frac{n(n-1)}{2}' },
        { txt: 'Costo interno por vuelta (peor caso): cond ' + (conLlamada ? '1' : '2') + ' + if 3 + result = r 1 + r++ 2 = ' + (conLlamada ? '7' : '8') + ':', tex: conLlamada ? '\\sum_{i=0}^{n-2}\\sum_{r=i+1}^{n-1} 7 = 7\\cdot\\frac{n(n-1)}{2}' : '\\sum_{i=0}^{n-2}\\sum_{r=i+1}^{n-1} 8 = 8\\cdot\\frac{n(n-1)}{2} = 4n(n-1)' },
        { txt: 'Por cada i (n − 1 veces): ' + (conLlamada ? 'cond 2 + intercambia k + result 2 + init r 3 + cond final r 1 + return 1 + i++ 2 = 11 + k; más 7·n(n−1)/2 del interno' : 'cond 2 + result 2 + init r 3 + cond final r 2 + intercambia k + i++ 2 = 11 + k') + '. Fijos: init i 2 + cond final i 2 = 4:', tex: conLlamada ? 'T(n) = 4 + (11+k)(n-1) + \\tfrac{7}{2}n(n-1)' : 'T(n) = 4 + (11+k)(n-1) + 4n(n-1)' },
        { txt: 'Término dominante 4n²:', tex: 'T(n) \\in O(n^2)' }
      ],
      ejecutar(n, C, datos) {
        const v = (datos || desc(n)).slice();
        C.c('fi.init');
        for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i <= n - 2)) break;
          let result;
          if (conLlamada) { C.c('call'); C.c('res'); result = i; } else { C.c('min'); result = i; }
          C.c('fr.init');
          for (let r = i + 1; ; r++) { C.c('fr.cond'); if (!(r <= n - 1)) break; C.c('if'); if (v[r] < v[result]) { C.c('asig'); result = r; } C.c('fr.upd'); }
          if (conLlamada) { C.c('ret'); } else { C.c('call'); }
          const t = v[i]; v[i] = v[result]; v[result] = t;
          C.c('fi.upd'); }
      }
    };
  }
  reg({ id: 'A13', tipo: 'A', titulo: 'Selección con llamada a posMinimo', fuente: 'Hoja 1 #10', def: () => seleccion(true) });
  reg({ id: 'A14', tipo: 'A', titulo: 'Selección en línea (j desde i+1)', fuente: 'Hoja 1 #19', def: () => seleccion(false) });

  /* =============== A15 invierte =============== */
  reg({
    id: 'A15', tipo: 'A', titulo: 'invierte: j desde i+1 hasta n', fuente: 'Hoja 1 #11',
    def: () => ({
      enunciado: 'A es de (n+1)×(n+1) (índices 0..n). El ciclo interno empieza en i+1 y llega HASTA n inclusive. Halle costos, vueltas, la sumatoria dependiente y el Big-O.',
      firma: 'static void invierte(int[][] A, int n)', tamano: 'n',
      lineas: [
        { id: 'fi', txt: 'for (int i = 0; i <= n - 1; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n - 1', 2, 2, 'n+1', { rol: 'cond', porque: 'Resta + comparación: 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = i + 1; j <= n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: 'i+1', hasta: 'n', t: 'n-i', total: 'n(n+1)/2', valores: 'j = i+1 … n: n − i valores' },
              partes: [L('fj.init', 'int j = i + 1', 3, 2, 'n', { rol: 'init', porque: 'Declaración + asignación (2) + suma (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }), L('fj.cond', 'j <= n', 1, 1, 'n(n+1)/2 + n', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Total de vueltas internas + una evaluación falsa por cada i.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n(n+1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [L('a', 'A[i][j] = 2 * A[j][i] + A[i][j];', 6, 5, 'n(n+1)/2', { porque: '3 accesos (A[i][j] de escritura + A[j][i] y A[i][j] de lectura) + multiplicación + suma + asignación = 6. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo.', tag: 'acum', alt: { prof: ['5'], hojas: ['4', '6'] } })] }
          ] }
      ],
      invariante: 'i == n', invAlt: ['i = n', 'i > n-1', 'i>n-1'],
      Tn: { prof: '4 + 8n + 9n(n+1)/2', hojas: '3 + 6n + 7n(n+1)/2' }, bigO: 'n^2',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del interno para un i fijo (j desde i+1 hasta n, con <=): $t_i = ?$', respuesta: 'n-i', vars: ['i'], ayuda: 'n − (i+1) + 1 = n − i. Ojo: con <= el n sí entra.' },
        { tipo: 'expr', pregunta: 'Total: $\\sum_{i=0}^{n-1}(n-i) = ?$', respuesta: 'n(n+1)/2', ayuda: 'Cambio m = n − i: i = 0 → m = n; i = n−1 → m = 1: Σ_{m=1}^{n} m = n(n+1)/2. Comprueba n = 3: 3 + 2 + 1 = 6 ✓.' }
      ],
      pistas: ['El interno da n − i vueltas (el límite n incluido).', 'Σ_{i=0}^{n-1}(n − i) = n + (n−1) + … + 1.'],
      pasos: [
        { txt: 'Vueltas internas y total (m = n − i):', tex: 't_i = n - i, \\qquad \\sum_{i=0}^{n-1}(n-i) = \\sum_{m=1}^{n} m = \\frac{n(n+1)}{2}' },
        { txt: 'Costo interno por vuelta: cond 1 + cuerpo 6 (3 accesos + × + + + =) + j++ 2 = 9:', tex: '\\sum_{i=0}^{n-1}\\sum_{j=i+1}^{n} 9 = 9\\cdot\\frac{n(n+1)}{2}' },
        { txt: 'Por cada i: cond 2 + init j 3 + cond final j 1 + i++ 2 = 8 → 8n. Fijos: 2 + 2 = 4:', tex: 'T(n) = 4 + 8n + \\frac{9n(n+1)}{2} = \\frac{9n^2 + 25n + 8}{2}' },
        { txt: 'Dominante 4,5n²:', tex: 'T(n) \\in O(n^2)' }
      ],
      ejecutar(n, C) {
        const A = Array.from({ length: n + 1 }, () => Array(n + 1).fill(1));
        C.c('fi.init');
        for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i <= n - 1)) break; C.c('fj.init');
          for (let j = i + 1; ; j++) { C.c('fj.cond'); if (!(j <= n)) break; C.c('a'); A[i][j] = 2 * A[j][i] + A[i][j]; C.c('fj.upd'); }
          C.c('fi.upd'); }
      }
    })
  });

  /* =============== A16 Hoja 12 completo (mejor y peor) =============== */
  reg({
    id: 'A16', tipo: 'A', titulo: 'Racha más larga: while que depende de los datos', fuente: 'Hoja 1 #12',
    def: () => ({
      enunciado: 'El while interno compara elementos del arreglo: su número de vueltas depende de los DATOS. Analice el PEOR caso (arreglo ascendente) y diga cuál es el mejor. En Java se agrega j < n para no salirse del arreglo.',
      firma: 'static int rachaMax(int[] a, int n)', tamano: 'n', casoTn: 'peor',
      datos: { peor: (n) => asc(n), mejor: (n) => desc(n) },
      lineas: [
        L('mx', 'int max = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            L('c1', 'int cont = 1;', 2, 1, 'n', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            L('j', 'int j = i + 1;', 3, 2, 'n', { porque: 'Declaración + asignación (2) + suma (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
            { id: 'w', txt: 'while (j < n && a[i] <= a[j]) {', cierre: '}', ciclo: { tipo: 'while', var: 'j', desde: 'i+1', hasta: 'n-1', t: 'n-1-i', total: 'n(n-1)/2', valores: 'peor caso: j = i+1 … n−1 (n − 1 − i vueltas); mejor caso: 0' },
              partes: [L('w.cond', 'j < n && a[i] <= a[j]', 5, 4, 'n(n-1)/2 + n', { rol: 'cond', porque: 'j < n (1) + && (1) + acceso a[i] (1) + acceso a[j] (1) + comparación <= (1) = 5. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo. (Si el profe agrupa, acepta 4.)', porqueVeces: 'Peor caso: n(n−1)/2 vueltas + una evaluación falsa por cada i.', tag: 'condveces', vecesMejor: 'n', alt: { prof: ['4', '3'], hojas: ['3', '5'] } })],
              cuerpo: [L('jj', 'j = j + 1;', 2, 2, 'n(n-1)/2', { porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' }), L('cc', 'cont = cont + 1;', 2, 2, 'n(n-1)/2', { porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })] },
            { id: 'if', txt: 'if (cont > max) {', cierre: '}', costo: { prof: '1', hojas: '1' }, veces: 'n', porque: 'Comparación: 1.', tag: 'if',
              cuerpo: [L('mm', 'max = cont;', 1, 1, '1', { porque: 'Asignación: 1. Solo entra la primera vez (después cont nunca supera a max en estos datos).', porqueVeces: 'Con el arreglo ascendente cont = n − i baja con i: solo i = 0 supera a max. 1 vez.', tag: 'rama' })] }
          ] },
        L('ret', 'return max;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n', 'i>=n', 'i >= n'],
      Tn: { prof: '7 + 14n + 9n(n-1)/2', hojas: '5 + 10n + 4n(n-1)' }, bigO: 'n^2',
      mejorPeor: 'Peor caso: arreglo ascendente → a[i] ≤ a[j] siempre → el while recorre j = i+1..n−1 → Σ(n−1−i) = n(n−1)/2 → O(n²). Mejor caso: arreglo descendente → a[i] ≤ a[i+1] falla de inmediato → 0 vueltas → T = 7 + 14n → Ω(n).',
      guia: [
        { tipo: 'opcion', pregunta: '¿Qué arreglo hace que el while dé el MÁXIMO de vueltas?', opciones: [
          { txt: 'Ascendente (1, 2, 3, …): a[i] ≤ a[j] siempre, j llega hasta n.', ok: true, porque: 'Correcto: peor caso.' },
          { txt: 'Descendente: los grandes primero.', ok: false, porque: 'Con descendente a[i] > a[i+1] y el while no entra: es el MEJOR caso.' },
          { txt: 'Da igual, siempre son n vueltas.', ok: false, porque: 'La condición compara datos: cambia con el arreglo.' }] },
        { tipo: 'expr', pregunta: 'Peor caso: vueltas del while para un i fijo: $t_i = ?$', respuesta: 'n-1-i', vars: ['i'], ayuda: 'j = i+1, …, n−1 (para en j = n por el j < n): (n−1) − (i+1) + 1 = n − 1 − i.' },
        { tipo: 'expr', pregunta: 'Total peor caso: $\\sum_{i=0}^{n-1}(n-1-i) = ?$', respuesta: 'n(n-1)/2', ayuda: 'm = n−1−i: Σ_{m=0}^{n-1} m = n(n−1)/2 (el término m = 0 no suma).' },
        { tipo: 'expr', pregunta: 'Mejor caso (descendente): vueltas totales del while = ?', respuesta: '0', ayuda: 'a[i] ≤ a[i+1] es falso de entrada para todo i: 0 vueltas (pero n evaluaciones de la condición).' }
      ],
      pistas: ['El peor caso es el arreglo ascendente; el interno da n−1−i vueltas.', 'Mejor caso: descendente, 0 vueltas → T lineal.'],
      pasos: [
        { txt: 'Peor caso (ascendente): vueltas del while por i y total:', tex: 't_i = n-1-i, \\qquad \\sum_{i=0}^{n-1}(n-1-i) = \\frac{n(n-1)}{2}' },
        { txt: 'Costo por vuelta del while: cond 5 (j<n + && + 2 accesos + <=) + j=j+1 2 + cont 2 = 9:', tex: '9\\cdot\\frac{n(n-1)}{2}' },
        { txt: 'Por cada i: cond 1 + cont 2 + j 3 + cond final while 5 + if 1 + i++ 2 = 14. Fijos: max 2 + init 2 + cond final 1 + return 1 = 6, más max=cont (1 vez):', tex: 'T_{peor}(n) = 7 + 14n + \\frac{9n(n-1)}{2} \\in O(n^2)' },
        { txt: 'Mejor caso (descendente): el while no entra (pero su condición se evalúa n veces, a 5 cada una):', tex: 'T_{mejor}(n) = 7 + 14n \\in \\Omega(n)' }
      ],
      ejecutar(n, C, datos) {
        const a = datos || asc(n); C.c('mx'); let max = 0; C.c('fi.init');
        for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i, max }); if (!(i < n)) break; C.c('c1'); let cont = 1; C.c('j'); let j = i + 1;
          for (;;) { C.c('w.cond'); if (!(j < n && a[i] <= a[j])) break; C.c('jj'); j++; C.c('cc'); cont++; }
          C.c('if'); if (cont > max) { C.c('mm'); max = cont; }
          C.c('fi.upd'); }
        C.c('ret'); return max;
      }
    })
  });

  /* =============== A17 burbuja (Hoja 18) =============== */
  reg({
    id: 'A17', tipo: 'A', titulo: 'Burbuja con límites raros (i desde 2, j hasta n−i)', fuente: 'Hoja 1 #18',
    def: () => ({
      enunciado: 'Los límites vienen tal cual de la Hoja: i desde 2 hasta n−1, j desde 0 hasta n−i (inclusive). intercambia cuesta k. Analice el PEOR caso (descendente: siempre intercambia). n ≥ 2.',
      firma: 'static void burbuja(int[] v, int n)', tamano: 'n', nMin: 2, casoTn: 'peor',
      datos: { peor: (n) => desc(n), mejor: (n) => asc(n) },
      lineas: [
        { id: 'fi', txt: 'for (int i = 2; i <= n - 1; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '2', hasta: 'n-1', t: 'n-2', total: 'n-2', invariante: 'i == n', valores: 'i = 2 … n−1: n − 2 valores' },
          partes: [L('fi.init', 'int i = 2', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n - 1', 2, 2, 'n-1', { rol: 'cond', porque: 'Resta + comparación: 2.', porqueVeces: '(n − 2) + 1.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('fi.upd', 'i++', 2, 1, 'n-2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = 0; j <= n - i; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'n-i', t: 'n-i+1', total: 'n(n-1)/2 - 1', valores: 'j = 0 … n−i: n − i + 1 valores' },
              partes: [L('fj.init', 'int j = 0', 2, 1, 'n-2', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j <= n - i', 2, 2, 'n(n-1)/2 - 1 + n - 2', { rol: 'cond', porque: 'Resta + comparación: 2.', porqueVeces: 'Total de vueltas + una falsa por cada i.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('fj.upd', 'j++', 2, 1, 'n(n-1)/2 - 1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [
                { id: 'if', txt: 'if (v[j] > v[j + 1]) {', cierre: '}', costo: { prof: '4', hojas: '4' }, veces: 'n(n-1)/2 - 1', porque: '2 accesos + suma (j+1) + comparación = 4.', tag: 'cond', alt: { prof: ['3'], hojas: ['3'] },
                  cuerpo: [L('sw', 'intercambia(v, j, j + 1);', 'k+1', 'k+1', 'n(n-1)/2 - 1', { porque: 'Suma j+1 (1) + llamada O(1) (k). Peor caso: en todas las comparaciones; mejor caso: nunca.', tag: 'k', vecesMejor: '0', alt: { prof: ['k'], hojas: ['k'] } })] }
              ] }
          ] }
      ],
      invariante: 'i == n', invAlt: ['i = n', 'i > n-1', 'i>n-1'],
      Tn: { prof: '4 + 8(n-2) + (9+k)(n(n-1)/2 - 1)', hojas: '3 + 6(n-2) + (8+k)(n(n-1)/2 - 1)' }, bigO: 'n^2',
      mejorPeor: 'Peor caso (descendente): intercambia en todas las comparaciones. Mejor caso (ascendente): nunca intercambia, pero las comparaciones son las mismas → también Θ(n²). Solo cambia la constante.',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del externo (i = 2 … n−1): $t = ?$', respuesta: 'n-2', ayuda: '(n−1) − 2 + 1 = n − 2.' },
        { tipo: 'expr', pregunta: 'Vueltas del interno para un i fijo (j = 0 … n−i): $t_i = ?$', respuesta: 'n-i+1', vars: ['i'], ayuda: '(n − i) − 0 + 1 = n − i + 1.' },
        { tipo: 'expr', pregunta: 'Total: $\\sum_{i=2}^{n-1}(n-i+1) = ?$', respuesta: 'n(n-1)/2 - 1', ayuda: 'm = n − i + 1: i = 2 → m = n−1; i = n−1 → m = 2. Σ_{m=2}^{n-1} m = Σ_{m=1}^{n-1} m − 1 = n(n−1)/2 − 1 (identidad Σ_{i=m}^{n} = total − lo que falta). Comprueba n = 4: i=2 → 3, i=3 → 2: 5 = 6 − 1 ✓.' }
      ],
      pistas: ['Cuenta el interno con último − primero + 1 = (n−i) − 0 + 1.', 'Σ_{i=2}^{n-1}(n−i+1) = (n−1) + (n−2) + … + 2 = n(n−1)/2 − 1.'],
      pasos: [
        { txt: 'Vueltas: externo n − 2; interno n − i + 1; total con m = n − i + 1:', tex: '\\sum_{i=2}^{n-1}(n-i+1) = \\sum_{m=2}^{n-1} m = \\frac{n(n-1)}{2} - 1' },
        { txt: 'Costo interno por vuelta (peor): cond 2 + if 4 + intercambia (k+1) + j++ 2 = 9 + k:', tex: '(9+k)\\left(\\frac{n(n-1)}{2} - 1\\right)' },
        { txt: 'Por cada i: cond 2 + init j 2 + cond final j 2 + i++ 2 = 8 → 8(n−2). Fijos 2 + 2 = 4:', tex: 'T(n) = 4 + 8(n-2) + (9+k)\\left(\\frac{n(n-1)}{2} - 1\\right) \\in O(n^2)' }
      ],
      ejecutar(n, C, datos) {
        const v = (datos || desc(n)).slice(); C.c('fi.init');
        for (let i = 2; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i <= n - 1)) break; C.c('fj.init');
          for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j <= n - i)) break; C.c('if'); if (v[j] > v[j + 1]) { C.c('sw'); const t = v[j]; v[j] = v[j + 1]; v[j + 1] = t; } C.c('fj.upd'); }
          C.c('fi.upd'); }
      }
    })
  });

  /* =============== A18 sortByValue (Hoja 23) =============== */
  reg({
    id: 'A18', tipo: 'A', titulo: 'sortByValue: while + for (swapCount no se usa)', fuente: 'Hoja 1 #23',
    def: () => ({
      enunciado: 'Burbuja con while externo. swap cuesta k. Analice el PEOR caso (descendente) y luego piense: ¿swapCount cambia algo? n ≥ 1.',
      firma: 'public static void sortByValue(int[] array)', tamano: 'n = array.length', casoTn: 'peor',
      datos: { peor: (n) => desc(n), mejor: (n) => asc(n) },
      lineas: [
        L('c0', 'int count = 1;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'w', txt: 'while (count < array.length) {', cierre: '}', ciclo: { tipo: 'while', var: 'c', desde: '1', hasta: 'n-1', t: 'n-1', total: 'n-1', invariante: 'count == n', valores: 'count = 1 … n−1' },
          partes: [L('w.cond', 'count < array.length', 2, 2, 'n', { rol: 'cond', porque: 'array.length (1) + comparación (1) = 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } })],
          cuerpo: [
            L('sc', 'int swapCount = 0;', 2, 1, 'n-1', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            { id: 'f', txt: 'for (int i = 0; i < array.length - count; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-c-1', t: 'n-c', total: 'n(n-1)/2', valores: 'i = 0 … n−count−1: n − count valores' },
              partes: [L('f.init', 'int i = 0', 2, 1, 'n-1', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < array.length - count', 3, 3, 'n(n-1)/2 + n - 1', { rol: 'cond', porque: 'array.length (1) + resta (1) + comparación (1) = 3.', tag: 'condveces', alt: { prof: ['2'], hojas: ['2'] } }), L('f.upd', 'i++', 2, 1, 'n(n-1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [
                { id: 'if', txt: 'if (array[i] > array[i + 1]) {', cierre: '}', costo: { prof: '4', hojas: '4' }, veces: 'n(n-1)/2', porque: '2 accesos + suma + comparación = 4.', tag: 'cond', alt: { prof: ['3'], hojas: ['3'] },
                  cuerpo: [L('sw', 'swap(array, i, i + 1);', 'k+1', 'k+1', 'n(n-1)/2', { porque: 'Suma (1) + llamada O(1) (k).', tag: 'k', vecesMejor: '0', alt: { prof: ['k'], hojas: ['k'] } }), L('sc2', 'swapCount++;', 2, 1, 'n(n-1)/2', { porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })] }
              ] },
            L('cu', 'count++;', 2, 1, 'n-1', { porque: 'Suma + asignación: 2.', tag: 'upd' })
          ] }
      ],
      invariante: 'count == n', invAlt: ['count = n', 'count >= n', 'count>=n', 'count == array.length'],
      Tn: { prof: '4 + 11(n-1) + (12+k)n(n-1)/2', hojas: '3 + 8(n-1) + (10+k)n(n-1)/2' }, bigO: 'n^2',
      mejorPeor: 'swapCount se calcula pero NUNCA se consulta: el algoritmo no termina antes aunque el arreglo ya esté ordenado. Mejor caso (ascendente) solo se ahorra el swap: las n(n−1)/2 comparaciones se hacen igual → Θ(n²) en todos los casos.',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del for para un valor fijo de count (llámalo c): $t_c = ?$', respuesta: 'n-c', vars: ['c'], ayuda: 'i < n − c con i desde 0: ⌈(n − c − 0)/1⌉ = n − c.' },
        { tipo: 'expr', pregunta: 'Total: $\\sum_{c=1}^{n-1}(n-c) = ?$', respuesta: 'n(n-1)/2', ayuda: 'm = n − c: c = 1 → m = n−1; c = n−1 → m = 1: Σ_{m=1}^{n-1} m = n(n−1)/2.' },
        { tipo: 'opcion', pregunta: '¿Para qué sirve swapCount en este código?', opciones: [
          { txt: 'Para nada: se incrementa pero nunca se lee. No hay salida anticipada → no mejora el mejor caso.', ok: true, porque: 'Correcto. Es la trampa del ejercicio: Θ(n²) siempre.' },
          { txt: 'Para terminar cuando no hubo intercambios → mejor caso O(n).', ok: false, porque: 'Eso sería si hubiera "if (swapCount == 0) break;", pero no está.' },
          { txt: 'Para contar las vueltas del while.', ok: false, porque: 'Eso lo hace count.' }] }
      ],
      pistas: ['El for da n − count vueltas; count va de 1 a n−1.', 'Busca dónde se LEE swapCount… no se lee.'],
      pasos: [
        { txt: 'Vueltas del for por cada count y total:', tex: 't_c = n-c, \\qquad \\sum_{c=1}^{n-1}(n-c) = \\frac{n(n-1)}{2}' },
        { txt: 'Costo por vuelta del for (peor): cond 3 (array.length + resta + comparación) + if 4 + swap (k+1) + swapCount++ 2 + i++ 2 = 12 + k:', tex: '(12+k)\\frac{n(n-1)}{2}' },
        { txt: 'Por cada count (n − 1): cond del while 2 + swapCount 2 + init i 2 + cond final del for 3 + count++ 2 = 11. Fijos: count 2 + cond final del while 2 = 4:', tex: 'T(n) = 4 + 11(n-1) + (12+k)\\frac{n(n-1)}{2} \\in \\Theta(n^2)' }
      ],
      ejecutar(n, C, datos) {
        const a = (datos || desc(n)).slice(); C.c('c0'); let count = 1;
        for (;;) { C.c('w.cond'); C.v({ count }); if (!(count < a.length)) break; C.c('sc'); C.c('f.init');
          for (let i = 0; ; i++) { C.c('f.cond'); if (!(i < a.length - count)) break; C.c('if'); if (a[i] > a[i + 1]) { C.c('sw'); const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; C.c('sc2'); } C.c('f.upd'); }
          C.c('cu'); count++; }
      }
    })
  });

  /* =============== A19 copyArray + appendToNew =============== */
  reg({
    id: 'A19', tipo: 'A', titulo: 'copyArray: un for visible, otro escondido en appendToNew', fuente: 'Hoja 1 #21',
    def: () => ({
      enunciado: 'copyArray parece O(n) porque solo se ve un for, pero llama a appendToNew, que copia todo el arreglo cada vez. El for-each se cuenta como un for normal (r = 0..n−1). new cuesta k.',
      firma: 'static int[] copyArray(int[] array)  +  static int[] appendToNew(int[] array, int value)', tamano: 'n = array.length',
      lineas: [
        L('c0', 'int[] copy = new int[0];', 'k', 'k', 1, { porque: 'new: k.', tag: 'k', alt: { prof: ['1+k', '2+k'], hojas: ['1+k'] } }),
        { id: 'f', txt: 'for (int value : array) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'r == n', valores: 'r = 0 … n−1 (una vuelta por elemento)' },
          partes: [L('f.init', '(r = 0)', 2, 1, 1, { rol: 'init', porque: 'El for-each equivale a int r = 0: 2.', tag: 'decl' }), L('f.cond', '(r < n)', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('f.upd', '(r++, value = array[r])', 4, 1, 'n', { rol: 'upd', porque: 'r++ (2) + acceso array[r] (1) + asignación a value (1) = 4. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo. (Si el profe lo agrupa, acepta 2 o 3.)', tag: 'upd', alt: { prof: ['2', '3'], hojas: ['2'] } })],
          cuerpo: [
            { id: 'call', txt: 'copy = appendToNew(copy, value);', cierre: '', costo: { prof: '1', hojas: '1' }, veces: 'n', porque: 'La asignación del resultado: 1. Lo que cuesta appendToNew va desplegado debajo.', tag: 'asig', llamada: 'appendToNew(array = copy (tamaño r), value)',
              cuerpo: [
                L('nw', 'int[] bigger = new int[array.length + 1];', 'k+2', 'k+2', 'n', { porque: 'array.length (1) + suma (1) + new (k) = k+2.', tag: 'k', alt: { prof: ['k+1'], hojas: ['k+1'] } }),
                { id: 'fi', txt: 'for (int I = 0; I < array.length; I++) {', cierre: '}', ciclo: { tipo: 'for', var: 'I', desde: '0', hasta: 'r-1', t: 'r', total: 'n(n-1)/2', valores: 'en la llamada r el arreglo tiene r elementos: I = 0 … r−1' },
                  partes: [L('fi.init', 'int I = 0', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'I < array.length', 2, 2, 'n(n-1)/2 + n', { rol: 'cond', porque: 'array.length (1) + comparación (1) = 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('fi.upd', 'I++', 2, 1, 'n(n-1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
                  cuerpo: [L('cp', 'bigger[I] = array[I];', 3, 1, 'n(n-1)/2', { porque: 'Acceso bigger[I] de escritura (1) + asignación (1) + acceso array[I] de lectura (1) = 3. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo.', tag: 'asig', alt: { prof: ['2'], hojas: ['2'] } })] },
                L('last', 'bigger[bigger.length - 1] = value;', 4, 3, 'n', { porque: 'Acceso de escritura bigger[…] (1) + bigger.length (1) + resta (1) + asignación (1) = 4.', tag: 'asig', alt: { prof: ['3'], hojas: ['2', '4'] } }),
                L('rb', 'return bigger;', 1, 1, 'n', { porque: 'return: 1.', tag: 'ret' })
              ] }
          ] },
        L('ret', 'return copy;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'r == n', invAlt: ['r = n', 'value == null', 'se recorrieron los n elementos'],
      Tn: { prof: '4 + k + (17+k)n + 7n(n-1)/2', hojas: '3 + k + (12+k)n + 4n(n-1)/2' }, bigO: 'n^2',
      guia: [
        { tipo: 'opcion', pregunta: 'En la llamada número r (r = 0, 1, …, n−1), ¿cuántos elementos tiene copy y cuántas vueltas da el for de appendToNew?', opciones: [
          { txt: 'copy tiene r elementos → r vueltas.', ok: true, porque: 'Correcto: empieza vacío y crece de a 1.' },
          { txt: 'copy tiene n elementos → n vueltas.', ok: false, porque: 'copy empieza en tamaño 0 y crece en cada llamada.' },
          { txt: '1 vuelta: solo agrega el nuevo.', ok: false, porque: 'appendToNew copia TODO el arreglo anterior a uno nuevo.' }] },
        { tipo: 'expr', pregunta: 'Total de copias: $\\sum_{r=0}^{n-1} r = ?$', respuesta: 'n(n-1)/2', ayuda: '0 + 1 + 2 + … + (n−1) = n(n−1)/2.' },
        { tipo: 'opcion', pregunta: '¿Cuál es el orden de copyArray y por qué?', opciones: [
          { txt: 'O(n²): el ciclo escondido en appendToNew se ejecuta n(n−1)/2 veces en total.', ok: true, porque: 'Correcto: trampa del "ciclo oculto".' },
          { txt: 'O(n): solo hay un for.', ok: false, porque: 'La llamada dentro del for tiene su propio ciclo.' },
          { txt: 'O(n log n).', ok: false, porque: 'No hay nada que se divida ni multiplique.' }] }
      ],
      pistas: ['¿Cuántos elementos copia appendToNew en la llamada r?', 'Σ_{r=0}^{n-1} r = n(n−1)/2 → cuadrático.'],
      pasos: [
        { txt: 'Vueltas del for interno en la llamada r y total:', tex: 't_r = r, \\qquad \\sum_{r=0}^{n-1} r = \\frac{n(n-1)}{2}' },
        { txt: 'Costo interno por vuelta: cond 2 (array.length + comparación) + copia 3 (2 accesos + asignación) + I++ 2 = 7:', tex: '7\\cdot\\frac{n(n-1)}{2}' },
        { txt: 'Por cada llamada (n): cond 1 + upd 4 + asignación 1 + new (k+2) + init I 2 + cond final I 2 + último 4 + return 1 = 17 + k. Fijos: new k + init 2 + cond final 1 + return 1 = 4 + k:', tex: 'T(n) = 4 + k + (17+k)n + \\frac{7n(n-1)}{2} \\in O(n^2)' }
      ],
      ejecutar(n, C) {
        const array = asc(n); C.c('c0'); let copy = []; C.c('f.init');
        for (let r = 0; ; r++) { C.c('f.cond'); C.v({ r, 'copy.length': copy.length }); if (!(r < n)) break;
          C.c('call'); const value = array[r];
          C.c('nw'); const bigger = new Array(copy.length + 1); C.c('fi.init');
          for (let I = 0; ; I++) { C.c('fi.cond'); if (!(I < copy.length)) break; C.c('cp'); bigger[I] = copy[I]; C.c('fi.upd'); }
          C.c('last'); bigger[bigger.length - 1] = value; C.c('rb'); copy = bigger;
          C.c('f.upd'); }
        C.c('ret'); return copy;
      }
    })
  });

  /* =============== A20–A23: Hoja 17 a–d (solo cuenta sum++) =============== */
  function h17(letra) {
    const defs = {
      a: {
        titulo: '17(a): tres for seguidos con √n', codigo: 'sum = 0;\nfor (i = 0; i < sqrt(n) / 2; i++)\n  sum++;\nfor (j = 0; j < sqrt(n) / 4; j++)\n  sum++;\nfor (k = 0; k < 8 + j; k++)\n  sum++;',
        veces: 'ceil(sqrt(n)/2) + 2ceil(sqrt(n)/4) + 8', tol: 2, bigO: 'sqrt(n)',
        guia: [
          { tipo: 'opcion', pregunta: '¿Los tres ciclos están anidados o en secuencia?', opciones: [{ txt: 'En secuencia: se SUMAN sus vueltas.', ok: true, porque: 'Correcto: cada for termina antes de que empiece el siguiente.' }, { txt: 'Anidados: se multiplican.', ok: false, porque: 'Mira las llaves/indentación: son tres for independientes uno tras otro.' }] },
          { tipo: 'expr', pregunta: 'Vueltas del tercer for (j vale √n/4 al salir del segundo): $t_3 = ?$ (±2)', respuesta: '8 + sqrt(n)/4', tol: 2, ayuda: 'k = 0 … 8 + j − 1 con j = ⌈√n/4⌉: 8 + √n/4 vueltas.' },
          { tipo: 'expr', pregunta: 'Total de sum++ (±2): ?', respuesta: 'sqrt(n)/2 + sqrt(n)/4 + 8 + sqrt(n)/4', tol: 2, ayuda: '√n/2 + √n/4 + (8 + √n/4) = √n + 8.' }
        ],
        explic: 'Secuencia ⇒ se suman: √n/2 + √n/4 + (8 + √n/4) = √n + 8 → O(√n).',
        ejecutar(n, C) { let s = 0, i, j, k; for (i = 0; i < Math.sqrt(n) / 2; i++) { C.c('sum'); s++; } for (j = 0; j < Math.sqrt(n) / 4; j++) { C.c('sum'); s++; } for (k = 0; k < 8 + j; k++) { C.c('sum'); s++; } return s; }
      },
      b: {
        titulo: '17(b): anidados, los internos de 8 vueltas', codigo: 'sum = 0;\nfor (i = 0; i < sqrt(n) / 2; i++)\n  for (j = i; j < 8 + i; j++)\n    for (k = j; k < 8 + j; k++)\n      sum++;',
        veces: '64ceil(sqrt(n)/2)', tol: 64, bigO: 'sqrt(n)',
        guia: [
          { tipo: 'expr', pregunta: 'Vueltas del for de j para un i fijo (j = i … 8+i−1): $t_j = ?$', respuesta: '8', ayuda: '(8 + i − 1) − i + 1 = 8: constante, no depende de i ni de n.' },
          { tipo: 'expr', pregunta: 'Vueltas del for de k para un j fijo: $t_k = ?$', respuesta: '8', ayuda: 'Igual: (8 + j − 1) − j + 1 = 8.' },
          { tipo: 'expr', pregunta: 'Total de sum++ (±64): ?', respuesta: '64sqrt(n)/2', tol: 64, ayuda: '⌈√n/2⌉ · 8 · 8 = 32√n → O(√n). Los ciclos internos son constantes: no cambian el orden.' }
        ],
        explic: 'Anidados ⇒ se multiplican: (√n/2) · 8 · 8 = 32√n → O(√n). Ciclos de un número constante de vueltas no cambian el orden.',
        ejecutar(n, C) { let s = 0; for (let i = 0; i < Math.sqrt(n) / 2; i++) for (let j = i; j < 8 + i; j++) for (let k = j; k < 8 + j; k++) { C.c('sum'); s++; } return s; }
      },
      c: {
        titulo: '17(c): j < i·i, k < j, if (j % i == 1)', codigo: 'sum = 0;\nfor (i = 1; i < 2 * n; i++)\n  for (j = 1; j < i * i; j++)\n    for (k = 1; k < j; k++)\n      if (j % i == 1)\n        sum++;',
        veces: 'sum(i=1..2n-1, i^2(i-1)/2)', tol: 0, bigO: 'n^4',
        guia: [
          { tipo: 'opcion', pregunta: 'El enunciado dice que el tiempo es el número de veces que corre sum++. ¿Cuántos j entre 1 e i²−1 cumplen j % i == 1?', opciones: [{ txt: 'Unos i (j = 1, i+1, 2i+1, …): uno de cada i.', ok: true, porque: 'Correcto: j ≡ 1 (mod i) → j = 1 + m·i con m = 0 … i−1.' }, { txt: 'Todos (i² − 1).', ok: false, porque: 'Solo los que dejan residuo 1 al dividir entre i.' }, { txt: 'Solo j = 1.', ok: false, porque: 'También i+1, 2i+1, … hasta i² − i + 1.' }] },
          { tipo: 'expr', pregunta: 'Para un i fijo, sum++ corre Σ sobre esos j de (j − 1) = Σ_{m=0}^{i-1} m·i = ?', respuesta: 'i^2(i-1)/2', vars: ['i'], ayuda: 'i · Σ_{m=0}^{i-1} m = i · i(i−1)/2 = i²(i−1)/2.' },
          { tipo: 'opcion', pregunta: 'Total = Σ_{i=1}^{2n-1} i²(i−1)/2 = Σ (i³ − i²)/2. ¿Orden?', opciones: [{ txt: 'O(n⁴): Σi³ hasta 2n es ≈ (2n)⁴/4.', ok: true, porque: 'Correcto. Aunque los ciclos recorren ~n⁵ combinaciones, sum++ solo corre ~2n⁴ veces.' }, { txt: 'O(n⁵): tres ciclos de hasta n, n², n².', ok: false, porque: 'Eso mide el trabajo de los ciclos, pero el enunciado cuenta sum++, que solo corre cuando j % i == 1.' }, { txt: 'O(n³).', ok: false, porque: 'Σ i³ con i hasta 2n es de orden n⁴.' }] }
        ],
        explic: 'Solo cuentan los j ≡ 1 (mod i): j = 1 + m·i, m = 0..i−1, y para cada uno k corre j − 1 = m·i veces. Por i: i·i(i−1)/2 = i²(i−1)/2. Total Σ_{i=1}^{2n-1}(i³ − i²)/2 = [(N(N+1)/2)² − N(N+1)(2N+1)/6]/2 con N = 2n−1 → O(n⁴). (Los ciclos hacen ~n⁵ pasos, pero se cuenta sum++.)',
        ejecutar(n, C) { let s = 0; for (let i = 1; i < 2 * n; i++) for (let j = 1; j < i * i; j++) for (let k = 1; k < j; k++) if (j % i === 1) { C.c('sum'); s++; } return s; }
      },
      d: {
        titulo: '17(d): igual pero if (j % i)', codigo: 'sum = 0;\nfor (i = 1; i < 2 * n; i++)\n  for (j = 1; j < i * i; j++)\n    for (k = 1; k < j; k++)\n      if (j % i)\n        sum++;',
        veces: 'sum(i=1..2n-1, (i^2-1)(i^2-2)/2 - (i^2(i-1)/2 - (i-1)))', tol: 0, bigO: 'n^5',
        guia: [
          { tipo: 'opcion', pregunta: '¿Para cuántos j entre 1 e i²−1 es verdadero (j % i) (residuo distinto de 0)?', opciones: [{ txt: 'Casi todos: todos menos los i − 1 múltiplos de i.', ok: true, porque: 'Correcto: la condición se cumple "casi siempre".' }, { txt: 'Uno de cada i.', ok: false, porque: 'Eso era (c). Aquí basta que el residuo NO sea 0.' }] },
          { tipo: 'opcion', pregunta: 'Entonces sum++ corre casi tantas veces como el ciclo de k: Σ_i Σ_{j<i²} (j−1) ≈ Σ_i i⁴/2 con i hasta 2n. ¿Orden?', opciones: [{ txt: 'O(n⁵)', ok: true, porque: 'Correcto: Σ_{i=1}^{2n} i⁴ ≈ (2n)⁵/5.' }, { txt: 'O(n⁴)', ok: false, porque: 'Σ i⁴ es de orden n⁵; en (c) era n⁴ porque el if filtraba casi todo.' }] }
        ],
        explic: 'El if se cumple para todos los j no múltiplos de i (casi todos): sum++ ≈ Σ_i Σ_{j=1}^{i²−1}(j − 1) ≈ Σ_{i=1}^{2n} i⁴/2 ≈ (2n)⁵/10 → O(n⁵).',
        ejecutar(n, C) { let s = 0; for (let i = 1; i < 2 * n; i++) for (let j = 1; j < i * i; j++) for (let k = 1; k < j; k++) if (j % i) { C.c('sum'); s++; } return s; }
      }
    };
    const d = defs[letra];
    return {
      titulo: d.titulo,
      enunciado: 'Hoja 1 #17' + letra + ': el tiempo de ejecución es el NÚMERO DE VECES que corre sum++ (no las OE). Determine ese número (o su forma) y el Big-O. sqrt(n) es la raíz cuadrada.',
      firma: 'fragmento (a) … (d)', tamano: 'n', soloVeces: true, nMin: 1, nMax: letra === 'c' || letra === 'd' ? 11 : 1000, TnAprox: true,
      codigo: d.codigo,
      lineas: [L('sum', 'sum++', 1, 1, d.veces, { porque: 'Cuenta 1 cada vez que corre.', tag: 'veces', tol: d.tol })],
      Tn: { prof: d.veces, hojas: d.veces }, bigO: d.bigO,
      guia: d.guia, explic: d.explic,
      pistas: ['Primero decide si los ciclos están en secuencia (se suman) o anidados (se multiplican).', d.explic],
      pasos: [{ txt: d.explic, tex: '\\#\\,sum{+}{+} = ' + window.Formulas.aLatex(d.veces) + ' \\in O(' + window.Formulas.aLatex(d.bigO) + ')' }],
      ejecutar: d.ejecutar
    };
  }
  ['a', 'b', 'c', 'd'].forEach((l, i) => reg({ id: 'A2' + i, tipo: 'A', titulo: 'Hoja 17(' + l + ')', fuente: 'Hoja 1 #17' + l, def: () => h17(l) }));

  /* =============== A24 simulacro P1 =============== */
  reg({
    id: 'A24', tipo: 'A', titulo: 'Simulacro P1: for-for-for con k/2 llamando a M(n)', fuente: 'Simulacro P1',
    def: () => ({
      enunciado: 'Es el punto 1 del simulacro. Suponga n ≥ 3. M(n) se llama dentro del ciclo más interno: sus líneas van desplegadas bajo la llamada y cuentan tantas veces como se llama. println cuesta k. Indique cuántas veces se ejecuta cada ciclo y justifique el Big-O. (Ojo con la base del logaritmo y con cuántas vueltas da M.)',
      firma: 'public static void metodo(int n)  +  public static void M(int n)', tamano: 'n', nMin: 3, nMax: 100, TnAprox: true,
      lineas: [
        L('a', 'int a = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = 0; j < n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'n-1', t: 'n', total: 'n^2' },
              partes: [L('fj.init', 'int j = 0', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j < n', 1, 1, 'n^2+n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n^2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [
                { id: 'fk', txt: 'for (int k = n; k > 0; k = k / 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(log2(n))+1', t: 'floor(log2(n))+1', tol: 1, total: 'n^2(floor(log2(n))+1)', valores: 'k = n, n/2, n/4, …, 1 → ⌊log₂ n⌋ + 1 vueltas (≈ log₂ n)' },
                  partes: [L('fk.init', 'int k = n', 2, 1, 'n^2', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fk.cond', 'k > 0', 1, 1, 'n^2(floor(log2(n))+2)', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Por cada (i, j): ⌊log₂ n⌋ + 1 verdaderas + 1 falsa.', tag: 'condveces', tol: 1 }), L('fk.upd', 'k = k / 2', 2, 2, 'n^2(floor(log2(n))+1)', { rol: 'upd', porque: 'División + asignación: 2.', tag: 'upd', tol: 1 })],
                  cuerpo: [
                    L('acum', 'a += i + k + n;', 4, 4, 'n^2(floor(log2(n))+1)', { porque: '2 sumas (i+k+n) + suma del += + asignación = 4.', tag: 'acum', tol: 1, alt: { prof: ['3'], hojas: ['3'] } }),
                    { id: 'M', txt: 'M(n);', cierre: '', costo: { prof: '0', hojas: '0' }, veces: 'n^2(floor(log2(n))+1)', porque: 'La llamada en sí no se cobra aparte (el profe cuenta lo que hace M, desplegado debajo). Acepto 1.', tag: 'k', llamada: 'M(n)', tol: 1, alt: { prof: ['1', 'k'], hojas: ['1', 'k'] },
                      cuerpo: [
                        L('x', 'int x = n * n + 5;', 4, 3, 'n^2(floor(log2(n))+1)', { porque: 'Declaración + asignación (2) + multiplicación + suma (2) = 4.', tag: 'decl', tol: 1, alt: { prof: ['2', '3'], hojas: ['1', '2'] } }),
                        { id: 'fm', txt: 'for (int i2 = x; i2 >= n * n; i2 = i2 / 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'q', desde: '1', hasta: '1', t: '1', total: 'n^2(floor(log2(n))+1)', valores: 'i2 = n²+5 (≥ n² ✓), luego (n²+5)/2 < n² para n ≥ 3 → 1 sola vuelta' },
                          partes: [L('fm.init', 'int i2 = x', 2, 1, 'n^2(floor(log2(n))+1)', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl', tol: 1 }), L('fm.cond', 'i2 >= n * n', 2, 2, '2n^2(floor(log2(n))+1)', { rol: 'cond', porque: 'Multiplicación + comparación: 2.', porqueVeces: '2 por llamada: 1 verdadera + 1 falsa.', tag: 'condveces', tol: 1, alt: { prof: ['1'], hojas: ['1'] } }), L('fm.upd', 'i2 = i2 / 2', 2, 2, 'n^2(floor(log2(n))+1)', { rol: 'upd', porque: 'División + asignación: 2.', tag: 'upd', tol: 1 })],
                          cuerpo: [L('pr', 'System.out.println(i2);', 'k', 'k', 'n^2(floor(log2(n))+1)', { porque: 'Librería: k.', tag: 'k', tol: 1 })] }
                      ] }
                  ] }
              ] }
          ] },
        L('pa', 'System.out.println(a);', 'k', 'k', 1, { porque: 'Librería: k.', tag: 'k' })
      ],
      invariante: 'i == n', invAlt: ['i = n', 'i>=n', 'i >= n'],
      Tn: { prof: '5 + k + 6n + 6n^2 + (19+k)n^2(floor(log2(n))+1)', hojas: '3 + k + 4n + 4n^2 + (17+k)n^2(floor(log2(n))+1)' }, bigO: 'n^2 log(n)',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del for de k (k = n, n/2, …, 1) (±1): $t_k = ?$', respuesta: 'floor(log2(n))+1', tol: 1, ayuda: 'k se divide entre 2 hasta llegar a 0: ⌊log₂ n⌋ + 1 vueltas. La BASE es 2 porque divide entre 2 (la respuesta del profe dice log₃: es un error de la hoja de respuestas; en Big-O da igual).' },
        { tipo: 'expr', pregunta: 'Vueltas del for de M(n) (i2 = n²+5, mientras i2 ≥ n², i2 /= 2), con n ≥ 3: $t_M = ?$', respuesta: '1', ayuda: 'Primera vuelta: n² + 5 ≥ n² ✓. Segunda: (n² + 5)/2 ≥ n² ⇔ n² ≤ 5 → falso para n ≥ 3. Una sola vuelta: M(n) es O(1).' },
        { tipo: 'expr', pregunta: '¿Cuántas veces se llama M(n) en total? (±n²)', respuesta: 'n^2(floor(log2(n))+1)', tol: 0, ayuda: 'Una vez por cada vuelta del ciclo de k: n · n · (⌊log₂ n⌋ + 1) = n² log₂ n aprox.' },
        { tipo: 'opcion', pregunta: '¿Big-O de metodo(n)?', opciones: [
          { txt: 'O(n² log n): n² por los dos for externos, log₂ n por el de k, y M(n) constante.', ok: true, porque: 'Correcto. El profe escribe n² log₃ n; como log₃ n = log₂ n / log₂ 3, es el mismo orden.' },
          { txt: 'O(n² log² n): el for de M también es logarítmico.', ok: false, porque: 'El for de M da 1 vuelta (para n ≥ 3): es constante.' },
          { txt: 'O(n³).', ok: false, porque: 'El tercer ciclo divide entre 2: es log n, no n.' }] }
      ],
      pistas: ['Cuenta cada ciclo por separado: n, n, ⌊log₂ n⌋+1, y M(n) 1 vuelta.', 'T(n) = fijos + Σ_i Σ_j [ … + Σ_k ( … + T_M ) … ] con T_M constante.'],
      pasos: [
        { txt: 'Vueltas: i → n; j → n; k → L = ⌊log₂ n⌋ + 1 (divide entre 2); M(n): 1 vuelta (n ≥ 3) → T_M = 4 + 2 + (2 + k + 2) + 2 = 12 + k, constante.', tex: 'T_M(n) = 12 + k' },
        { txt: 'Interno (k): cond 1 + a+= 4 + T_M + k=k/2 2 = 19 + k por vuelta:', tex: '\\sum_{r=1}^{L}(19+k) = (19+k)L' },
        { txt: 'Por cada (i, j): cond 1 + init k 2 + (19+k)L + cond final k 1 + j++ 2 = 6 + (19+k)L; por cada i: cond 1 + init j 2 + n(6 + (19+k)L) + 1 + i++ 2:', tex: 'T(n) = 5 + k + 6n + 6n^2 + (17+k)\\,n^2 L' },
        { txt: 'Con L ≈ log₂ n:', tex: 'T(n) \\in O(n^2 \\log n)' }
      ],
      ejecutar(n, C) {
        C.c('a'); let a = 0; C.c('fi.init');
        for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i < n)) break; C.c('fj.init');
          for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j < n)) break; C.c('fk.init');
            for (let k = n; ; k = idiv(k, 2)) { C.c('fk.cond'); if (!(k > 0)) break; C.c('acum'); a += i + k + n;
              C.c('M'); C.c('x'); const x = n * n + 5; C.c('fm.init');
              for (let i2 = x; ; i2 = idiv(i2, 2)) { C.c('fm.cond'); if (!(i2 >= n * n)) break; C.c('pr'); C.c('fm.upd'); }
              C.c('fk.upd'); }
            C.c('fj.upd'); }
          C.c('fi.upd'); }
        C.c('pa');
      }
    })
  });

  /* =============== A25 simulacro P2 getUFPS (cota superior) =============== */
  reg({
    id: 'A25', tipo: 'A', titulo: 'Simulacro P2: getUFPS (n/9) llama a algunValor (k*=3)', fuente: 'Simulacro P2',
    def: () => ({
      enunciado: 'Punto 2 del simulacro con j = 1. algunValor se llama dentro del while; sus líneas van desplegadas. Como n se divide entre 9 en cada vuelta, cada llamada es MÁS BARATA que la anterior: para el T(n) se usa la COTA SUPERIOR (todas cuestan como la primera, con n). Ojo con el while (n2 < j): ¿entra?',
      firma: 'int getUFPS(int n, int j)  +  int algunValor(int n, int j)', tamano: 'el valor de n (j = 1)', nMin: 2, cota: true, TnAprox: true,
      lineas: [
        { id: 'w', txt: 'while (n > 1) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'log9(n)', t: 'log9(n)', tol: 1, total: 'floor(log9(n/2))+1', invariante: 'n <= 1', valores: 'n, n/9, n/81, … mientras > 1 → ≈ log₉ n vueltas' },
          partes: [L('w.cond', 'n > 1', 1, 1, 'floor(log9(n/2))+2', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'log₉ n verdaderas + 1 falsa.', tag: 'condveces', tol: 1 })],
          cuerpo: [
            { id: 'call', txt: 'algunValor(n, j);', cierre: '', costo: { prof: '0', hojas: '0' }, veces: 'floor(log9(n/2))+1', porque: 'La llamada se cobra por lo que hace (abajo). Acepto 1.', tag: 'k', llamada: 'algunValor(n, j) — cota superior: se analiza con el n de la primera llamada', tol: 1, alt: { prof: ['1', 'k'], hojas: ['1', 'k'] },
              cuerpo: [
                L('c', 'int c = 0;', 2, 1, 'floor(log9(n/2))+1', { porque: 'Declaración + asignación: 2.', tag: 'decl', tol: 1 }),
                { id: 'fk', txt: 'for (int k = 1; k < (n * j); k *= 3) {', cierre: '}', ciclo: { tipo: 'for', var: 's', desde: '1', hasta: 'log3(n)', t: 'log3(n)', tol: 1, total: '(floor(log9(n/2))+1)ceil(log3(n))', cota: true, valores: 'k = 1, 3, 9, … < n → ⌈log₃ n⌉ vueltas (cota: con el n inicial)' },
                  partes: [L('fk.init', 'int k = 1', 2, 1, 'floor(log9(n/2))+1', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl', tol: 1 }), L('fk.cond', 'k < (n * j)', 2, 2, '(floor(log9(n/2))+1)(ceil(log3(n))+1)', { rol: 'cond', porque: 'Multiplicación + comparación: 2.', tag: 'condveces', cota: true, alt: { prof: ['1'], hojas: ['1'] } }), L('fk.upd', 'k *= 3', 2, 1, '(floor(log9(n/2))+1)ceil(log3(n))', { rol: 'upd', porque: 'Multiplicación + asignación: 2.', tag: 'upd', cota: true })],
                  cuerpo: [
                    L('n2', 'int n2 = j + 10;', 3, 2, '(floor(log9(n/2))+1)ceil(log3(n))', { porque: 'Declaración + asignación (2) + suma (1) = 3.', tag: 'decl', cota: true, alt: { prof: ['2'], hojas: ['1'] } }),
                    { id: 'w2', txt: 'while (n2 < j) {', cierre: '}', ciclo: { tipo: 'while', var: 'u', desde: '1', hasta: '0', t: '0', total: '0', valores: 'n2 = j + 10 > j desde el inicio: NO entra' },
                      partes: [L('w2.cond', 'n2 < j', 1, 1, '(floor(log9(n/2))+1)ceil(log3(n))', { rol: 'cond', porque: 'Comparación: 1 (se evalúa una vez, da falso).', porqueVeces: 'Una evaluación (falsa) por cada vuelta del for de k.', tag: 'nunca', cota: true })],
                      cuerpo: [L('cc', 'c += k * n * j;', 4, 4, '0', { porque: 'No se ejecuta nunca: 0 veces.', porqueVeces: 'El while no entra.', tag: 'noejec' }), L('n2i', 'n2++;', 2, 1, '0', { porque: 'No se ejecuta nunca.', porqueVeces: 'El while no entra.', tag: 'noejec' })] }
                  ] },
                L('rc', 'return c;', 1, 1, 'floor(log9(n/2))+1', { porque: 'return: 1.', tag: 'ret', tol: 1 })
              ] },
            L('n9', 'n = n / 9;', 2, 2, 'floor(log9(n/2))+1', { porque: 'División + asignación: 2.', tag: 'upd', tol: 1 })
          ] },
        L('ret', 'return n;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'n <= 1', invAlt: ['n<=1', 'n == 1', 'n = 1', 'n <= 1', 'n == 0 || n == 1'],
      Tn: { prof: '2 + (floor(log9(n/2))+1)(10 + 8ceil(log3(n)))', hojas: '2 + (floor(log9(n/2))+1)(8 + 6ceil(log3(n)))' }, bigO: 'log(n)^2',
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del while externo (n, n/9, n/81, … > 1) (±1): $t = ?$', respuesta: 'log9(n)', tol: 1, ayuda: 'Divide entre 9 hasta bajar de 2: ≈ log₉ n (exacto ⌊log₉(n/2)⌋ + 1).' },
        { tipo: 'expr', pregunta: 'Vueltas del for de k en la PRIMERA llamada (k = 1, 3, 9, … < n) (±1): $t_k = ?$', respuesta: 'log3(n)', tol: 1, ayuda: 'k = 3^s < n ⇔ s < log₃ n → ⌈log₃ n⌉.' },
        { tipo: 'expr', pregunta: 'Vueltas del while (n2 < j) con n2 = j + 10: ?', respuesta: '0', ayuda: 'n2 empieza por encima de j: la condición es falsa de entrada. 0 vueltas, 1 evaluación.' },
        { tipo: 'opcion', pregunta: 'Cada llamada usa un n distinto (n, n/9, …). ¿Cómo se maneja en el parcial?', opciones: [
          { txt: 'Cota superior: se toma el costo de la primera llamada (con n) para todas → T(n) ≤ log₉ n · (10 + 8 log₃ n).', ok: true, porque: 'Correcto. Se escribe con ≤ y se aclara. La cota es del mismo orden que el valor exacto.' },
          { txt: 'Se ignora la llamada porque cuesta lo mismo siempre.', ok: false, porque: 'No cuesta lo mismo, y ignorarla quita el factor log₃ n.' },
          { txt: 'Se toma la última llamada (n = 1) → cada llamada cuesta O(1).', ok: false, porque: 'Eso sería una cota INFERIOR; para Big-O se necesita la superior.' }] },
        { tipo: 'opcion', pregunta: 'log₉ n · log₃ n, ¿de qué orden es?', opciones: [
          { txt: 'Θ(log² n): log₉ n = log₃ n / log₃ 9 = (log₃ n)/2, así que es (log₃ n)²/2.', ok: true, porque: 'Correcto: respuesta del profe log₃²(n).' },
          { txt: 'Θ(log n): los logs se suman.', ok: false, porque: 'Se MULTIPLICAN: uno es el número de vueltas y el otro el costo de cada una.' },
          { txt: 'Θ(n): log₉ n · log₃ n = log₂₇ n.', ok: false, porque: 'Eso no es una identidad válida.' }] }
      ],
      pistas: ['while externo: log₉ n; for de k: log₃ n; while interno: 0 (no entra).', 'T(n) ≤ 1 + Σ_{r=1}^{log₉ n}(1 + T_aV(n) + 2) + 1, con T_aV(n) = 7 + 8 log₃ n.'],
      pasos: [
        { txt: 'algunValor(n): c 2 + init 2 + Σ_{s=1}^{L₃}(cond 2 + n2 3 + while 1 + k*=3 2) + cond final 2 + return 1, con L₃ = ⌈log₃ n⌉ (el while interno nunca entra):', tex: 'T_{aV}(n) = 7 + 8\\,L_3 = 7 + 8\\lceil\\log_3 n\\rceil' },
        { txt: 'getUFPS: vueltas L₉ ≈ log₉ n; por vuelta cond 1 + T_aV + n/9 2; cota superior usando T_aV(n) en todas:', tex: 'T(n) \\le 2 + \\sum_{r=1}^{L_9}\\left(3 + 7 + 8\\log_3 n\\right) = 2 + L_9(10 + 8\\log_3 n)' },
        { txt: 'Cambio de base: log₉ n = log₃ n / log₃ 9 = (log₃ n)/2:', tex: 'T(n) \\le 2 + 10\\log_9 n + 8\\log_9 n\\cdot\\log_3 n = 2 + 5\\log_3 n + 4(\\log_3 n)^2' },
        { txt: 'Dominante:', tex: 'T(n) \\in \\Theta(\\log^2 n)' }
      ],
      ejecutar(n, C) {
        const j = 1;
        for (;;) { C.c('w.cond'); C.v({ n }); if (!(n > 1)) break;
          C.c('call'); C.c('c'); let c = 0; C.c('fk.init');
          for (let k = 1; ; k *= 3) { C.c('fk.cond'); if (!(k < n * j)) break; C.c('n2'); let n2 = j + 10;
            for (;;) { C.c('w2.cond'); if (!(n2 < j)) break; C.c('cc'); c += k * n * j; C.c('n2i'); n2++; }
            C.c('fk.upd'); }
          C.c('rc'); C.c('n9'); n = idiv(n, 9); }
        C.c('ret'); return n;
      }
    })
  });

  /* =============== Recursivos: A26 Contar, A27 Primero/Segundo, A28 dos =============== */
  reg({
    id: 'A26', tipo: 'R', titulo: 'Contar(izq, der) con izq * 2', fuente: 'Hoja 1 #6',
    def: () => ({
      enunciado: 'Llamada inicial Contar(1, n). Cada llamada duplica izq. Plantee la recurrencia, desenróllela y dé el número de llamadas y el Big-O. (Suponga a ascendente: siempre toma la rama a[izq] < a[der].)',
      codigo: 'static int Contar(int[] a, int izq, int der) {\n  if (izq >= der)\n    return 0;\n  else if (a[izq] < a[der])\n    return Contar(a, izq * 2, der) + 1;\n  else\n    return Contar(a, izq * 2, der);\n}',
      tamano: 'n = der (con izq = 1)', llamadas: 'ceil(log2(n)) + 1', tolerancia: 0, tolLlamadas: 1,
      Tn: { prof: '7ceil(log2(n)) + 2', hojas: '7ceil(log2(n)) + 2' }, bigO: 'log(n)',
      guia: [
        { tipo: 'opcion', pregunta: '¿Qué cambia entre una llamada y la siguiente?', opciones: [
          { txt: 'izq se duplica; der queda igual. La "distancia" der/izq se divide entre 2.', ok: true, porque: 'Correcto: 1, 2, 4, 8, … hasta alcanzar der.' },
          { txt: 'der se divide entre 2.', ok: false, porque: 'der no cambia; el que se mueve es izq.' },
          { txt: 'izq aumenta en 2.', ok: false, porque: 'Es izq * 2, no izq + 2: multiplicar ⇒ log.' }] },
        { tipo: 'opcion', pregunta: 'Sea m = der/izq el tamaño del problema. ¿Cuál es la recurrencia (c = OE constantes por llamada)?', opciones: [
          { txt: 'T(m) = c + T(m/2), T(1) = c₀', ok: true, porque: 'Correcto: una sola llamada recursiva sobre la mitad del "tamaño".' },
          { txt: 'T(m) = c + 2T(m/2)', ok: false, porque: 'Solo se hace UNA llamada recursiva (o una rama o la otra, no ambas).' },
          { txt: 'T(m) = c + T(m − 1)', ok: false, porque: 'izq se duplica, no se incrementa: el tamaño se parte a la mitad.' }] },
        { tipo: 'opcion', pregunta: 'Desenrollando: T(m) = c + T(m/2) = c + c + T(m/4) = … = k·c + T(m/2^k). ¿Cuándo para?', opciones: [
          { txt: 'Cuando m/2^k ≤ 1, es decir k = log₂ m → T(m) = c·log₂ m + c₀', ok: true, porque: 'Correcto: log₂ m llamadas recursivas + la base.' },
          { txt: 'Cuando k = m → T(m) = c·m', ok: false, porque: 'El tamaño se divide entre 2 cada vez: llega a 1 en log₂ m pasos, no en m.' }] },
        { tipo: 'expr', pregunta: 'Número total de llamadas con izq = 1, der = n (±1): ?', respuesta: 'log2(n) + 1', tol: 1, ayuda: 'izq = 1, 2, 4, …, hasta ≥ n: ⌈log₂ n⌉ llamadas recursivas + la inicial = ⌈log₂ n⌉ + 1. n = 5: izq = 1, 2, 4, 8 → 4 llamadas.' }
      ],
      pasos: [
        { txt: 'Costo por llamada (peor rama): if 1 + else-if 3 + izq*2 1 + suma 1 + return 1 = 7; llamada base: if 1 + return 1 = 2.', tex: 'T(m) = 7 + T(m/2),\\quad T(1) = 2' },
        { txt: 'Desenrollo:', tex: 'T(m) = 7 + 7 + T(m/4) = \\cdots = 7k + T(m/2^k)' },
        { txt: 'Paro cuando m/2^k = 1 → k = log₂ m:', tex: 'T(n) = 7\\lceil\\log_2 n\\rceil + 2 \\in O(\\log n)' }
      ],
      trampa: 'Si izq = 0, izq * 2 = 0 y la recursión NUNCA termina. El análisis supone izq ≥ 1.',
      ejecutar(n, C) {
        const a = asc(n + 1); let oe = 0;
        function Contar(izq, der) { C.c('llamada'); oe += 1; if (izq >= der) { oe += 1; return 0; } oe += 3; if (a[izq] < a[der]) { oe += 3; return Contar(izq * 2, der) + 1; } oe += 2; return Contar(izq * 2, der); }
        Contar(1, n); return { oe };
      }
    })
  });

  reg({
    id: 'A27', tipo: 'R', titulo: 'Primero / Segundo (recursión mutua)', fuente: 'Hoja 1 #8',
    def: () => ({
      enunciado: 'Primero(n) llama 2 veces a Segundo(n); Segundo(x) hace un for de x vueltas y llama 2 veces a Primero(x/2). Plantee la recurrencia combinada y desenróllela.',
      codigo: 'static void Primero(int n) {\n  if (n > 0) {\n    double acum = 0;\n    for (int i = 1; i <= 2; i++)\n      acum = acum + Segundo(n);\n    System.out.println(acum);\n  }\n}\nstatic double Segundo(int x) {\n  int k = 0;\n  for (int i = 1; i <= x; i++)\n    k = k + random(100);\n  Primero(x / 2);\n  Primero(x / 2);\n  return k / x;\n}',
      tamano: 'n', llamadas: '(4^(floor(log2(n))+2) - 1)/3', tolerancia: 0, bigO: 'n^2', nMax: 300,
      guia: [
        { tipo: 'opcion', pregunta: 'Costo de Segundo(x) en función de Primero:', opciones: [
          { txt: 'T_S(x) = c·x + 2·T_P(x/2)  (el for de x vueltas + dos llamadas)', ok: true, porque: 'Correcto.' },
          { txt: 'T_S(x) = c + 2·T_P(x/2)', ok: false, porque: 'Falta el for de x vueltas: cuesta lineal en x.' },
          { txt: 'T_S(x) = c·x + T_P(x/2)', ok: false, porque: 'Primero(x/2) se llama DOS veces.' }] },
        { tipo: 'opcion', pregunta: 'Costo de Primero(n):', opciones: [
          { txt: 'T_P(n) = c + 2·T_S(n)', ok: true, porque: 'Correcto: el for de 2 vueltas llama 2 veces a Segundo(n).' },
          { txt: 'T_P(n) = c + T_S(n)', ok: false, porque: 'El for va de 1 a 2: dos llamadas.' }] },
        { tipo: 'opcion', pregunta: 'Sustituyendo T_S en T_P: T_P(n) = c + 2(c·n + 2·T_P(n/2)). ¿Recurrencia resultante?', opciones: [
          { txt: 'T(n) = 4·T(n/2) + 2c·n + c', ok: true, porque: 'Correcto: 4 subproblemas de tamaño n/2 y trabajo lineal.' },
          { txt: 'T(n) = 2·T(n/2) + c·n', ok: false, porque: '2 llamadas a Segundo × 2 llamadas a Primero = 4.' },
          { txt: 'T(n) = 4·T(n/2) + c', ok: false, porque: 'Falta el for lineal de Segundo (2c·n).' }] },
        { tipo: 'opcion', pregunta: 'Desenrollando T(n) = 4T(n/2) + 2n: T(n) = 4[4T(n/4) + n] + 2n = 16T(n/4) + 4n + 2n = … Tras k pasos:', opciones: [
          { txt: '4^k · T(n/2^k) + 2n(1 + 2 + 4 + … + 2^{k−1}) = 4^k T(n/2^k) + 2n(2^k − 1)', ok: true, porque: 'Correcto: cada nivel aporta el doble del anterior (4^i · 2n/2^i = 2n·2^i); Σ_{i=0}^{k-1} 2^i = 2^k − 1.' },
          { txt: '4^k · T(n/2^k) + 2nk', ok: false, porque: 'El trabajo por nivel no es constante: en el nivel i hay 4^i llamadas de tamaño n/2^i → 4^i · 2n/2^i = 2n·2^i.' }] },
        { tipo: 'opcion', pregunta: 'Con k = log₂ n (n/2^k = 1, 4^k = n², 2^k = n): T(n) = n²·T(1) + 2n(n − 1). ¿Orden?', opciones: [
          { txt: 'Θ(n²)', ok: true, porque: 'Correcto: n² llamadas base + 2n² del trabajo lineal.' },
          { txt: 'Θ(n log n)', ok: false, porque: 'Eso sería con 2T(n/2) + n. Aquí hay 4 subllamadas: 4^{log₂ n} = n².' },
          { txt: 'Θ(n)', ok: false, porque: 'Solo el número de llamadas ya es n².' }] }
      ],
      pasos: [
        { txt: 'Recurrencias:', tex: 'T_P(n) = c + 2T_S(n),\\qquad T_S(x) = c\\,x + 2T_P(x/2)' },
        { txt: 'Sustituyendo:', tex: 'T(n) = 4T(n/2) + 2cn + c' },
        { txt: 'Desenrollando k veces (Σ_{i=0}^{k-1} 2^i = 2^k − 1):', tex: 'T(n) = 4^k T(n/2^k) + 2cn(2^k - 1)' },
        { txt: 'k = log₂ n → 4^k = n², 2^k = n:', tex: 'T(n) = n^2 T(1) + 2cn(n-1) \\in \\Theta(n^2)' }
      ],
      trampa: 'Cuatro llamadas de tamaño mitad ⇒ 4^{log₂ n} = n^{log₂ 4} = n² llamadas: el árbol de recursión tiene n² hojas.',
      ejecutar(n, C) {
        let oe = 0;
        function P(x) { C.c('llamada'); oe += 1; if (x > 0) { oe += 2; for (let i = 1; i <= 2; i++) { oe += 3; S(x); } oe += 1; } }
        function S(x) { oe += 2; for (let i = 1; i <= x; i++) { oe += 4; C.c('iter'); } P(idiv(x, 2)); P(idiv(x, 2)); oe += 2; return 0; }
        P(n); return { oe };
      }
    })
  });

  reg({
    id: 'A28', tipo: 'R', titulo: 'dos(a, x, y): y/2 o 2x', fuente: 'Hoja 1 #9',
    def: () => ({
      enunciado: 'Llamada inicial dos(a, 1, n) con a ordenado ascendentemente (aquí a[i] = i). Cada llamada divide y entre 2 o duplica x. Dé la recurrencia, el número de llamadas y el Big-O.',
      codigo: 'static void dos(int[] a, int x, int y) {\n  if (x != y) {\n    if (2 * a[x] < a[y])\n      dos(a, x, y / 2);\n    else\n      dos(a, 2 * x, y);\n  }\n}',
      tamano: 'n = y (con x = 1)', llamadas: 'log2(n) + 1', tolerancia: 1, bigO: 'log(n)',
      guia: [
        { tipo: 'opcion', pregunta: 'Sea m = y/x. ¿Qué le pasa a m en cada llamada, sea cual sea la rama?', opciones: [
          { txt: 'Se divide entre 2 (o y baja a la mitad o x sube al doble).', ok: true, porque: 'Correcto: igual que el while de la Hoja #7.' },
          { txt: 'Depende: en una rama se divide y en la otra se duplica.', ok: false, porque: 'Duplicar x también divide y/x entre 2.' }] },
        { tipo: 'opcion', pregunta: 'Recurrencia:', opciones: [
          { txt: 'T(m) = c + T(m/2) → T(m) = c·log₂ m + c₀', ok: true, porque: 'Correcto: una llamada recursiva, tamaño mitad, trabajo constante.' },
          { txt: 'T(m) = c + 2T(m/2)', ok: false, porque: 'Se ejecuta solo UNA de las dos llamadas (if/else).' }] },
        { tipo: 'expr', pregunta: 'Llamadas totales con x = 1, y = n (±1): ?', respuesta: 'log2(n) + 1', tol: 1, ayuda: 'y/x va de n a 1 dividiéndose entre 2: ≈ log₂ n llamadas recursivas + la inicial.' }
      ],
      pasos: [
        { txt: 'Con m = y/x, cada llamada parte m a la mitad:', tex: 'T(m) = c + T(m/2) = 2c + T(m/4) = \\cdots = kc + T(m/2^k)' },
        { txt: 'Para cuando m = 1 → k = log₂ m:', tex: 'T(n) = c\\log_2 n + c_0 \\in O(\\log n)' }
      ],
      trampa: 'Con otros datos puede NO terminar (y llega a 0 y se queda en 0, o x se pasa de y). El análisis supone que termina cuando x == y.',
      ejecutar(n, C) {
        const a = asc(2 * n + 2); let oe = 0;
        function dos(x, y) { C.c('llamada'); oe += 1; if (x !== y) { oe += 4; if (2 * a[x] < a[y]) { oe += 1; dos(x, idiv(y, 2)); } else { oe += 1; dos(2 * x, y); } } }
        dos(1, n); return { oe };
      }
    })
  });

  /* =============== Tipo C de la fase 3 =============== */
  reg({
    id: 'C03', tipo: 'C', titulo: 'Selección con llamada vs en línea', fuente: 'Hoja 1 #10 vs #19',
    def: () => ({
      enunciado: 'Los dos ordenan por selección. Uno llama a posMinimo en cada vuelta; el otro busca el mínimo en línea. Analice ambos (peor caso, arreglo descendente) y argumente cuál ejecuta menos OE. Pista: cuente comparaciones y luego el costo fijo por llamada.',
      metodos: [Object.assign(seleccion(true), { titulo: 'con posMinimo', iteraciones: 'n(n-1)/2' }), Object.assign(seleccion(false), { titulo: 'en línea', iteraciones: 'n(n-1)/2' })],
      nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'Hacen las mismas n(n−1)/2 comparaciones; la versión con llamada suma un costo fijo extra por cada una de las n−1 llamadas (parámetros, return). Ambas O(n²): la diferencia es una constante lineal.', ok: true, porque: 'Correcto: T_llamada − T_línea = (n − 1) por el return extra (y algo más según cómo se cuenten los parámetros).' },
        { txt: 'La versión con llamada es O(n³) porque posMinimo es O(n) y se llama n veces dentro de un ciclo O(n²).', ok: false, porque: 'posMinimo se llama n − 1 veces (una por vuelta del externo), no n² veces. Total Σ(n−1−i) = n(n−1)/2.' },
        { txt: 'Son idénticas en OE.', ok: false, porque: 'La llamada tiene un return y el paso de parámetros: unas pocas OE más por vuelta externa.' }
      ]
    })
  });
  reg({
    id: 'C04', tipo: 'C', titulo: 'copyArray con appendToNew vs copia directa', fuente: 'Hoja 1 #21 vs variante',
    def: () => ({
      enunciado: 'Ambos copian un arreglo de n elementos. Uno agrega de a uno con appendToNew (que copia todo cada vez); el otro crea el arreglo de tamaño n una sola vez y copia con un for. Analice y argumente.',
      metodos: [
        Object.assign(ADA.instancia(ADA.porId.A19, 0), { titulo: 'con appendToNew', iteraciones: 'n(n-1)/2' }),
        {
          titulo: 'copia directa', firma: 'static int[] copiaDirecta(int[] array)', tamano: 'n', iteraciones: 'n',
          lineas: [
            L('nw', 'int[] copy = new int[array.length];', 'k+1', 'k+1', 1, { porque: 'array.length (1) + new (k) = k+1.', tag: 'k', alt: { prof: ['k', '2+k'], hojas: ['k'] } }),
            { id: 'f', txt: 'for (int i = 0; i < array.length; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
              partes: [L('f.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < array.length', 2, 2, 'n+1', { rol: 'cond', porque: 'array.length (1) + comparación (1) = 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [L('cp', 'copy[i] = array[i];', 3, 1, 'n', { porque: 'Acceso copy[i] de escritura (1) + asignación (1) + acceso array[i] de lectura (1) = 3. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo.', tag: 'asig', alt: { prof: ['2'], hojas: ['2'] } })] },
            L('ret', 'return copy;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
          ],
          invariante: 'i == n', invAlt: ['i = n', 'i>=n'],
          Tn: { prof: '6 + k + 7n', hojas: '5 + k + 4n' }, bigO: 'n',
          pistas: ['Un solo for de n vueltas.', 'T(n) = (k+1) + 2 + Σ_{i=0}^{n-1}(2 + 3 + 2) + 2 + 1.'],
          ejecutar(n, C) { const a = asc(n); C.c('nw'); const copy = new Array(n); C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < a.length)) break; C.c('cp'); copy[i] = a[i]; C.c('f.upd'); } C.c('ret'); return copy; }
        }
      ],
      nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'La copia directa hace n copias y una sola reserva; appendToNew hace n reservas y n(n−1)/2 copias. O(n) frente a O(n²).', ok: true, porque: 'Correcto: para n = 1000, unas 6·10³ OE frente a 3·10⁶.' },
        { txt: 'Son iguales: las dos copian n elementos.', ok: false, porque: 'appendToNew vuelve a copiar TODO lo anterior en cada llamada: 0 + 1 + … + (n−1) copias.' },
        { txt: 'appendToNew es mejor porque no necesita saber n de antemano.', ok: false, porque: 'Eso es una ventaja de diseño, no de eficiencia: cuesta n(n−1)/2 copias extra.' }
      ]
    })
  });
})();
