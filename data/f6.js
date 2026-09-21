/* data/f6.js – Fase 6: Jefe final. Dos exámenes NUEVOS con la estructura del simulacro:
   P1 tipo A con métodos anidados y log · P2 tipo A con trampa · P3 tipo B con cota O(n) · P4 tipo C.
   Cada punto se registra como ejercicio (fase 6, oculto en el menú) para que verificar.js lo compruebe. */
(function () {
  'use strict';
  const L = ADA.L;
  const idiv = (a, b) => Math.trunc(a / b);
  const reg = (o) => ADA.registrar(Object.assign({ fase: 6, variantes: [{}], oculto: true }, o));
  const asc = (n) => Array.from({ length: n }, (_, i) => i);

  /* =================== EXAMEN 1 =================== */
  // P1: calcular(n) con F(n): for n × for j/=3 × F con k*=2
  reg({
    id: 'X11', tipo: 'A', titulo: 'Examen 1 · P1: calcular(n) llama a F(n)', fuente: 'Nuevo (estilo simulacro P1/P2)',
    def: () => ({
      enunciado: 'Suponiendo que la compilación se realiza con éxito y n > 0, calcule el T(n) y Big-O de calcular. Especifique la invariante y desarrolle paso a paso el modelo de complejidad. Al frente de cada línea escriba el costo de la OE. Indique cuántas veces se ejecuta cada ciclo, escriba las sumatorias explícitas y justifique.',
      firma: 'public static int calcular(int n)  +  public static int F(int n)', tamano: 'n', nMin: 1, TnAprox: true,
      codigo: 'public static int calcular(int n) {\n  int s = 0;\n  for (int i = 1; i <= n; i++) {\n    for (int j = n; j >= 1; j = j / 3) {\n      s += F(n);\n    }\n  }\n  return s;\n}\n\npublic static int F(int n) {\n  int c = 0;\n  for (int k = 1; k < n; k *= 2) {\n    c += k;\n  }\n  return c;\n}',
      lineas: [
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 1; i <= n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '1', hasta: 'n', t: 'n', total: 'n', invariante: 'i == n + 1' },
          partes: [L('fi.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = n; j >= 1; j = j / 3) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(log3(n))+1', t: 'floor(log3(n))+1', tol: 1, total: 'n(floor(log3(n))+1)', valores: 'j = n, n/3, n/9, …, ≥ 1 → ⌊log₃ n⌋ + 1 vueltas' },
              partes: [L('fj.init', 'int j = n', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j >= 1', 1, 1, 'n(floor(log3(n))+2)', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fj.upd', 'j = j / 3', 2, 2, 'n(floor(log3(n))+1)', { rol: 'upd', porque: 'División + asignación: 2.', tag: 'upd' })],
              cuerpo: [
                { id: 'call', txt: 's += F(n);', cierre: '', costo: { prof: '2', hojas: '2' }, veces: 'n(floor(log3(n))+1)', porque: 'Suma + asignación: 2. Más todo lo que hace F(n) (desplegado).', tag: 'acum', llamada: 'F(n)',
                  cuerpo: [
                    L('c', 'int c = 0;', 2, 1, 'n(floor(log3(n))+1)', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
                    { id: 'fk', txt: 'for (int k = 1; k < n; k *= 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'q', desde: '1', hasta: 'ceil(log2(n))', t: 'ceil(log2(n))', tol: 1, total: 'n(floor(log3(n))+1)ceil(log2(n))', valores: 'k = 1, 2, 4, … < n → ⌈log₂ n⌉ vueltas' },
                      partes: [L('fk.init', 'int k = 1', 2, 1, 'n(floor(log3(n))+1)', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fk.cond', 'k < n', 1, 1, 'n(floor(log3(n))+1)(ceil(log2(n))+1)', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fk.upd', 'k *= 2', 2, 1, 'n(floor(log3(n))+1)ceil(log2(n))', { rol: 'upd', porque: 'Multiplicación + asignación: 2.', tag: 'upd' })],
                      cuerpo: [L('ck', 'c += k;', 2, 2, 'n(floor(log3(n))+1)ceil(log2(n))', { porque: 'Suma + asignación: 2.', tag: 'acum' })] },
                    L('rc', 'return c;', 1, 1, 'n(floor(log3(n))+1)', { porque: 'return: 1.', tag: 'ret' })
                  ] }
              ] }
          ] },
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n + 1', invAlt: ['i = n+1', 'i > n', 'i>n'],
      Tn: { prof: '6 + 6n + n(floor(log3(n))+1)(11 + 5ceil(log2(n)))', hojas: '4 + 4n + n(floor(log3(n))+1)(9 + 4ceil(log2(n)))' }, bigO: 'n log(n)^2',
      pasos: [
        { txt: 'Vueltas: i → n; j (divide entre 3) → L₃ = ⌊log₃ n⌋ + 1 ≈ log₃ n; F(n): k (multiplica por 2) → L₂ = ⌈log₂ n⌉ ≈ log₂ n. ¡Bases distintas!', tex: 'L_3 \\approx \\log_3 n,\\quad L_2 \\approx \\log_2 n' },
        { txt: 'F(n): c 2 + init 2 + Σ_{q=1}^{L₂}(cond 1 + c+=k 2 + k*=2 2) + cond final 1 + return 1:', tex: 'T_F(n) = 6 + 5L_2' },
        { txt: 'Por cada vuelta de j: cond 1 + s+=F 2 + T_F + j=j/3 2 = 11 + 5L₂. Por cada i: cond 1 + init j 2 + L₃(11 + 5L₂) + cond final 1 + i++ 2:', tex: 'T(n) = 2 + 2 + \\sum_{i=1}^{n}\\Big(6 + \\sum_{r=1}^{L_3}(11 + 5L_2)\\Big) + 1 + 1' },
        { txt: 'Sumatorias de constantes:', tex: 'T(n) = 6 + 6n + n\\,L_3\\,(11 + 5L_2) \\approx 6 + 6n + 11n\\log_3 n + 5n\\log_3 n\\log_2 n' },
        { txt: 'Dominante n·log₃ n·log₂ n; las bases solo cambian constantes:', tex: 'T(n) \\in O(n\\log^2 n)' }
      ],
      trampa: 'Dos logaritmos de bases distintas (3 y 2) se MULTIPLICAN (uno es vueltas, el otro costo por vuelta). En Big-O, log₃ n · log₂ n = Θ(log² n).',
      ejecutar(n, C) {
        C.c('s'); let s = 0; C.c('fi.init');
        for (let i = 1; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i <= n)) break; C.c('fj.init');
          for (let j = n; ; j = idiv(j, 3)) { C.c('fj.cond'); if (!(j >= 1)) break;
            C.c('call'); C.c('c'); let c = 0; C.c('fk.init');
            for (let k = 1; ; k *= 2) { C.c('fk.cond'); if (!(k < n)) break; C.c('ck'); c += k; C.c('fk.upd'); }
            C.c('rc'); s += c; C.c('fj.upd'); }
          C.c('fi.upd'); }
        C.c('ret'); return s;
      }
    })
  });

  // P2: trampa (while que no entra, for constante, for con <= y salto 2)
  reg({
    id: 'X12', tipo: 'A', titulo: 'Examen 1 · P2: trampa(v, n)', fuente: 'Nuevo (estilo simulacro P2)',
    def: () => ({
      enunciado: 'n = v.length > 0. Calcule T(n), la invariante de cada ciclo y el Big-O. Indique cuántas veces se ejecuta CADA ciclo (cuidado: no todos hacen lo que parece).',
      firma: 'public static int trampa(int[] v, int n)', tamano: 'n = v.length', nMin: 1,
      codigo: 'public static int trampa(int[] v, int n) {\n  int x = n + 3;\n  int c = 0;\n  while (x < n) {\n    c += v[x];\n    x++;\n  }\n  for (int i = n * n; i >= n * n - 2; i--) {\n    c += i;\n  }\n  for (int i = 0; i <= n; i += 2) {\n    c += v[i % n];\n  }\n  return c;\n}',
      lineas: [
        L('x', 'int x = n + 3;', 3, 2, 1, { porque: 'Declaración + asignación (2) + suma (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        L('c0', 'int c = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'w', txt: 'while (x < n) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: '0', t: '0', invariante: 'x >= n', valores: 'x = n + 3 > n desde el inicio: NO entra' },
          partes: [L('w.cond', 'x < n', 1, 1, 1, { rol: 'cond', porque: 'Comparación: 1 (una sola evaluación, falsa).', porqueVeces: 'x empieza en n + 3, que no es < n: 0 vueltas, 1 evaluación.', tag: 'nunca' })],
          cuerpo: [L('w1', 'c += v[x];', 3, 3, 0, { porque: 'No se ejecuta.', tag: 'noejec' }), L('w2', 'x++;', 2, 1, 0, { porque: 'No se ejecuta.', tag: 'noejec' })] },
        { id: 'f1', txt: 'for (int i = n * n; i >= n * n - 2; i--) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: '3', t: '3', invariante: 'i == n * n - 3', valores: 'i = n², n²−1, n²−2: 3 vueltas SIEMPRE (constante)' },
          partes: [L('f1.init', 'int i = n * n', 3, 2, 1, { rol: 'init', porque: 'Declaración + asignación (2) + multiplicación (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }), L('f1.cond', 'i >= n * n - 2', 3, 3, 4, { rol: 'cond', porque: 'Multiplicación + resta + comparación = 3.', porqueVeces: '3 + 1 = 4 evaluaciones.', tag: 'condveces', alt: { prof: ['1', '2'], hojas: ['1', '2'] } }), L('f1.upd', 'i--', 2, 1, 3, { rol: 'upd', porque: 'Resta + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('f1b', 'c += i;', 2, 2, 3, { porque: 'Suma + asignación: 2.', tag: 'acum' })] },
        { id: 'f2', txt: 'for (int i = 0; i <= n; i += 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(n/2)+1', t: 'floor(n/2)+1', invariante: 'i > n', valores: 'i = 0, 2, 4, …, ≤ n → ⌊n/2⌋ + 1 vueltas (el <= incluye a n si es par)' },
          partes: [L('f2.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f2.cond', 'i <= n', 1, 1, 'floor(n/2)+2', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: '⌊n/2⌋ + 1 verdaderas + 1 falsa.', tag: 'condveces' }), L('f2.upd', 'i += 2', 2, 1, 'floor(n/2)+1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('f2b', 'c += v[i % n];', 4, 4, 'floor(n/2)+1', { porque: 'Módulo (1) + acceso (1) + suma (1) + asignación (1) = 4.', tag: 'acum', alt: { prof: ['3'], hojas: ['3'] } })] },
        L('ret', 'return c;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i > n', invAlt: ['i>n', 'i >= n+1', 'i == n+1 || i == n+2'],
      Tn: { prof: '37 + 7(floor(n/2)+1)', hojas: '30 + 6(floor(n/2)+1)' }, bigO: 'n',
      pasos: [
        { txt: 'Ciclo 1 (while): x = n + 3 nunca es < n → 0 vueltas, cuesta solo la evaluación (1). Ciclo 2: i toma n², n²−1, n²−2 → 3 vueltas fijas (constante, no depende de n). Ciclo 3: i = 0, 2, …, ≤ n → ⌊n/2⌋ + 1 vueltas (con <= entra el propio n si es par).', tex: 't_1 = 0,\\quad t_2 = 3,\\quad t_3 = \\lfloor n/2 \\rfloor + 1' },
        { txt: 'Costos: fijos 3 + 2 + 1 (while) + [3 + Σ_{r=1}^{3}(3 + 2 + 2) + 3] + [2 + Σ_{r=1}^{⌊n/2⌋+1}(1 + 4 + 2) + 1] + 1:', tex: 'T(n) = 6 + (3 + 21 + 3) + 2 + 7\\left(\\lfloor n/2 \\rfloor + 1\\right) + 1 + 1 = 37 + 7\\left(\\lfloor n/2 \\rfloor + 1\\right)' },
        { txt: 'Solo el tercer ciclo depende de n:', tex: 'T(n) \\approx \\tfrac{7}{2}n + 39 \\in O(n)' }
      ],
      trampa: 'Tres trampas: (1) el while no entra (mira el valor inicial contra la condición); (2) el for desde n² parece cuadrático pero solo baja 2 unidades: 3 vueltas; (3) el <= con salto 2 da ⌊n/2⌋ + 1, no n/2.',
      ejecutar(n, C) {
        const v = asc(n); C.c('x'); let x = n + 3; C.c('c0'); let c = 0;
        for (;;) { C.c('w.cond'); C.v({ x }); if (!(x < n)) break; C.c('w1'); c += v[x]; C.c('w2'); x++; }
        C.c('f1.init');
        for (let i = n * n; ; i--) { C.c('f1.cond'); if (!(i >= n * n - 2)) break; C.c('f1b'); c += i; C.c('f1.upd'); }
        C.c('f2.init');
        for (let i = 0; ; i += 2) { C.c('f2.cond'); if (!(i <= n)) break; C.c('f2b'); c += v[i % n]; C.c('f2.upd'); }
        C.c('ret'); return c;
      }
    })
  });

  // P3: tipo B – palíndromo en O(n)
  reg({
    id: 'X13', tipo: 'B', titulo: 'Examen 1 · P3: ¿es palíndromo? (máximo O(n))', fuente: 'Nuevo (estilo simulacro P3)',
    def: () => ({
      enunciado: 'Se tiene un arreglo v de n enteros (n ≥ 1). Diseñe un algoritmo que determine si v es un palíndromo (se lee igual de izquierda a derecha que de derecha a izquierda). Debe retornar true o false. El costo de su solución debe ser como máximo O(n). Escríbalo en Java, calcule su T(n) para el peor caso, indique cuál es el peor y el mejor caso, y dé el Big-O y el Ω.',
      firma: 'static boolean esPalindromo(int[] v)', tamano: 'n = v.length', nMin: 1, casoTn: 'peor',
      estrategias: [
        { txt: 'Comparar v[i] con v[n−1−i] para i = 0 … n/2 − 1 y retornar false en cuanto un par difiera.', ok: true, porque: 'Correcto: ⌊n/2⌋ comparaciones como máximo → O(n), y sale temprano en el mejor caso.' },
        { txt: 'Construir un arreglo invertido con un for y luego compararlo con el original con otro for.', ok: false, porque: 'También es O(n), pero hace 2n pasos, usa memoria extra y no aprovecha la salida temprana. Válido pero peor.' },
        { txt: 'Para cada i, recorrer todo el arreglo buscando el simétrico.', ok: false, porque: 'Eso es O(n²): viola la cota.' }
      ],
      codigo: 'static boolean esPalindromo(int[] v) {\n  int n = v.length;\n  for (int i = 0; i < n / 2; i++) {\n    if (v[i] != v[n - 1 - i]) {\n      return false;\n    }\n  }\n  return true;\n}',
      datos: { peor: (n) => Array(n).fill(7), mejor: (n) => { const a = asc(n); if (n > 1) a[0] = -1; return a; } },
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: 'Obtener tamaño + inicialización: 2.', tag: 'decl' }),
        { id: 'f', txt: 'for (int i = 0; i < n / 2; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'floor(n/2)-1', t: 'floor(n/2)', invariante: 'i == n / 2', valores: 'peor caso: i = 0 … ⌊n/2⌋ − 1' },
          partes: [L('f.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < n / 2', 2, 2, 'floor(n/2)+1', { rol: 'cond', porque: 'División + comparación: 2.', porqueVeces: 'Peor caso: ⌊n/2⌋ + 1.', tag: 'condveces', vecesMejor: '1', alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'floor(n/2)', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })],
          cuerpo: [
            { id: 'if', txt: 'if (v[i] != v[n - 1 - i]) {', cierre: '}', costo: { prof: '4', hojas: '5' }, veces: 'floor(n/2)', porque: '2 accesos + índice (n−1−i, agrupado) + comparación = 4.', tag: 'cond', vecesMejor: 'min(1, floor(n/2))', alt: { prof: ['5', '3'], hojas: ['4'] },
              cuerpo: [L('rf', 'return false;', 1, 1, 0, { porque: 'return: 1. Peor caso: nunca (es palíndromo). Mejor caso: en la primera comparación.', tag: 'ret', vecesMejor: 'min(1, floor(n/2))' })] }
          ] },
        L('rt', 'return true;', 1, 1, 1, { porque: 'return: 1 (peor caso).', tag: 'ret', vecesMejor: '1 - min(1, floor(n/2))' })
      ],
      invariante: 'i == n / 2', invAlt: ['i = n/2', 'i >= n/2', 'i>=n/2'],
      Tn: { prof: '7 + 8floor(n/2)', hojas: '6 + 8floor(n/2)' }, bigO: 'n', omega: '1',
      mejorPeor: 'Peor caso: el arreglo SÍ es palíndromo (o difiere solo en el par central): se hacen todas las ⌊n/2⌋ comparaciones → T = 7 + 8⌊n/2⌋ → O(n). Mejor caso: v[0] ≠ v[n−1]: una comparación y return false → T = 11 → Ω(1).',
      pasos: [
        { txt: 'Peor caso (palíndromo): el for da ⌊n/2⌋ vueltas y nunca entra al if. Costos: n 2 + init 2 + Σ_{i=0}^{⌊n/2⌋−1}(cond 2 + if 4 + i++ 2) + cond final 2 + return 1:', tex: 'T_{peor}(n) = 7 + 8\\lfloor n/2 \\rfloor \\approx 4n + 7 \\in O(n)' },
        { txt: 'Mejor caso: v[0] ≠ v[n−1] → n 2 + init 2 + cond 2 + if 4 + return 1:', tex: 'T_{mejor}(n) = 11 \\in \\Omega(1)' }
      ],
      ejecutar(n, C, datos) {
        const v = datos || Array(n).fill(7); C.c('n'); const N = v.length; C.c('f.init');
        for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < idiv(N, 2))) break; C.c('if'); if (v[i] !== v[N - 1 - i]) { C.c('rf'); return false; } C.c('f.upd'); }
        C.c('rt'); return true;
      }
    })
  });

  // P4: tipo C – suma de la diagonal secundaria: doble for con if vs un for
  function diag1() {
    return {
      titulo: 'diag1 (doble for con if)', firma: 'public static int diag1(int[][] A)', tamano: 'n = A.length', iteraciones: 'n^2',
      lineas: [
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('n', 'int n = A.length;', 2, 2, 1, { porque: 'Tamaño + inicialización: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'fj', txt: 'for (int j = 0; j < n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'n-1', t: 'n', total: 'n^2' },
              partes: [L('fj.init', 'int j = 0', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j < n', 1, 1, 'n^2+n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n^2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [{ id: 'if', txt: 'if (i + j == n - 1) {', cierre: '}', costo: { prof: '3', hojas: '3' }, veces: 'n^2', porque: 'Suma + resta + comparación = 3. Se evalúa en las n² casillas.', tag: 'cond',
                cuerpo: [L('acum', 's += A[i][j];', 3, 3, 'n', { porque: 'Acceso + suma + asignación = 3.', porqueVeces: 'Solo en la diagonal secundaria: n veces.', tag: 'vecesif' })] }] }
          ] },
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n'],
      Tn: { prof: '8 + 9n + 6n^2', hojas: '6 + 7n + 5n^2' }, bigO: 'n^2',
      pasos: [{ txt: 'n² evaluaciones del if (3 cada una) para solo n sumas útiles:', tex: 'T_1(n) = 8 + 9n + 6n^2 \\in O(n^2)' }],
      ejecutar(n, C) { const A = Array.from({ length: n }, () => Array(n).fill(1)); C.c('s'); let s = 0; C.c('n'); const N = A.length; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i, s }); if (!(i < N)) break; C.c('fj.init'); for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j < N)) break; C.c('if'); if (i + j === N - 1) { C.c('acum'); s += A[i][j]; } C.c('fj.upd'); } C.c('fi.upd'); } C.c('ret'); return s; }
    };
  }
  function diag2() {
    return {
      titulo: 'diag2 (un for)', firma: 'public static int diag2(int[][] A)', tamano: 'n = A.length', iteraciones: 'n',
      lineas: [
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('n', 'int n = A.length;', 2, 2, 1, { porque: 'Tamaño + inicialización: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('acum', 's += A[i][n - 1 - i];', 4, 5, 'n', { porque: 'Acceso + suma + índice (n−1−i) + asignación = 4 (como en el simulacro).', tag: 'indice', alt: { prof: ['5'], hojas: ['4'] } })] },
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n'],
      Tn: { prof: '8 + 7n', hojas: '6 + 7n' }, bigO: 'n',
      pasos: [{ txt: 'Un solo ciclo de n vueltas:', tex: 'T_2(n) = 8 + 7n \\in O(n)' }],
      ejecutar(n, C) { const A = Array.from({ length: n }, () => Array(n).fill(1)); C.c('s'); let s = 0; C.c('n'); const N = A.length; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i, s }); if (!(i < N)) break; C.c('acum'); s += A[i][N - 1 - i]; C.c('fi.upd'); } C.c('ret'); return s; }
    };
  }
  reg({
    id: 'X14', tipo: 'C', titulo: 'Examen 1 · P4: diag1 vs diag2 (diagonal secundaria)', fuente: 'Nuevo (estilo simulacro P2b)',
    def: () => ({
      enunciado: 'Los dos métodos calculan la suma de la diagonal secundaria de una matriz n×n. Analice el costo de cada uno y determine cuál es más eficiente. Justifique a partir del número de iteraciones y de las instrucciones ejecutadas; no basta con el Big-O.',
      codigo: 'public static int diag1(int[][] A) {\n  int s = 0;\n  int n = A.length;\n  for (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n      if (i + j == n - 1) {\n        s += A[i][j];\n      }\n    }\n  }\n  return s;\n}\n\npublic static int diag2(int[][] A) {\n  int s = 0;\n  int n = A.length;\n  for (int i = 0; i < n; i++) {\n    s += A[i][n - 1 - i];\n  }\n  return s;\n}',
      metodos: [diag1(), diag2()], nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'diag2: n vueltas frente a n²; diag1 evalúa n² veces un if para hacer solo n sumas. T₁ = 6n² + 9n + 8 (O(n²)) frente a T₂ = 7n + 8 (O(n)). Para n = 100: 60 908 OE frente a 708.', ok: true, porque: 'Correcto: aquí sí cambia incluso el orden.' },
        { txt: 'Son iguales porque ambos suman los mismos n elementos.', ok: false, porque: 'Suman lo mismo, pero diag1 visita n² casillas para encontrarlas.' },
        { txt: 'diag1 es mejor porque comprueba cada posición y es más seguro.', ok: false, porque: 'Esa comprobación cuesta 3 OE por casilla × n² casillas y no aporta nada: la posición de la diagonal se conoce (n−1−i).' }
      ]
    })
  });

  /* =================== EXAMEN 2 =================== */
  // P1: metodo2 con H(n) cuadrático dentro de un for logarítmico
  reg({
    id: 'X21', tipo: 'A', titulo: 'Examen 2 · P1: metodo2(n) llama a H(n)', fuente: 'Nuevo (estilo simulacro P1)',
    def: () => ({
      enunciado: 'n > 0. Calcule el T(n) y el Big-O de metodo2. Indique cuántas veces se ejecuta cada ciclo (el de H depende de i: escriba la sumatoria y resuélvala), la invariante, y justifique.',
      firma: 'public static long metodo2(int n)  +  public static long H(int n)', tamano: 'n', nMin: 1, nMax: 200, TnAprox: true,
      codigo: 'public static long metodo2(int n) {\n  long r = 0;\n  for (int i = 1; i <= n; i *= 2) {\n    r += H(n);\n  }\n  return r;\n}\n\npublic static long H(int n) {\n  long a = 0;\n  for (int i = 0; i < n; i++) {\n    for (int j = 0; j < i; j++) {\n      a += i * j;\n    }\n  }\n  return a;\n}',
      lineas: [
        L('r', 'long r = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fi', txt: 'for (int i = 1; i <= n; i *= 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(log2(n))+1', t: 'floor(log2(n))+1', tol: 1, total: 'floor(log2(n))+1', invariante: 'i > n', valores: 'i = 1, 2, 4, …, ≤ n → ⌊log₂ n⌋ + 1 vueltas' },
          partes: [L('fi.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i <= n', 1, 1, 'floor(log2(n))+2', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i *= 2', 2, 1, 'floor(log2(n))+1', { rol: 'upd', porque: 'Multiplicación + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            { id: 'call', txt: 'r += H(n);', cierre: '', costo: { prof: '2', hojas: '2' }, veces: 'floor(log2(n))+1', porque: 'Suma + asignación: 2, más H(n) desplegado.', tag: 'acum', llamada: 'H(n)',
              cuerpo: [
                L('a', 'long a = 0;', 2, 1, 'floor(log2(n))+1', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
                { id: 'hi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n(floor(log2(n))+1)' },
                  partes: [L('hi.init', 'int i = 0', 2, 1, 'floor(log2(n))+1', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('hi.cond', 'i < n', 1, 1, '(n+1)(floor(log2(n))+1)', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('hi.upd', 'i++', 2, 1, 'n(floor(log2(n))+1)', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
                  cuerpo: [
                    { id: 'hj', txt: 'for (int j = 0; j < i; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'i-1', t: 'i', total: 'n(n-1)/2·(floor(log2(n))+1)', valores: 'j = 0 … i−1: i vueltas; en total Σ_{i=0}^{n-1} i = n(n−1)/2 por cada llamada' },
                      partes: [L('hj.init', 'int j = 0', 2, 1, 'n(floor(log2(n))+1)', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('hj.cond', 'j < i', 1, 1, '(n(n-1)/2 + n)(floor(log2(n))+1)', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('hj.upd', 'j++', 2, 1, 'n(n-1)/2·(floor(log2(n))+1)', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
                      cuerpo: [L('aa', 'a += i * j;', 3, 3, 'n(n-1)/2·(floor(log2(n))+1)', { porque: 'Multiplicación + suma + asignación = 3.', tag: 'acum' })] }
                  ] },
                L('ra', 'return a;', 1, 1, 'floor(log2(n))+1', { porque: 'return: 1.', tag: 'ret' })
              ] }
          ] },
        L('ret', 'return r;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i > n', invAlt: ['i>n', 'i >= n+1'],
      Tn: { prof: '6 + (floor(log2(n))+1)(11 + 6n + 3n(n-1))', hojas: '4 + (floor(log2(n))+1)(8 + 4n + 5n(n-1)/2)' }, bigO: 'n^2 log(n)',
      pasos: [
        { txt: 'H(n): el interno da i vueltas → Σ_{i=0}^{n-1} i = n(n−1)/2 vueltas internas (cada una cond 1 + a+= 3 + j++ 2 = 6). Por cada i: cond 1 + init j 2 + cond final j 1 + i++ 2 = 6 → 6n. Fijos: a 2 + init 2 + cond final 1 + return 1 = 6:', tex: 'T_H(n) = 6 + 6n + 6\\cdot\\frac{n(n-1)}{2} = 6 + 6n + 3n(n-1)' },
        { txt: 'metodo2: L = ⌊log₂ n⌋ + 1 vueltas (i se duplica). Por vuelta: cond 1 + r+= 2 + T_H + i*=2 2 = 5 + T_H. Fijos: r 2 + init 2 + cond final 1 + return 1 = 6... (con la llamada: 4 + L(9 + 6n + 3n(n−1))):', tex: 'T(n) = 4 + \\sum_{r=1}^{L}\\left(11 + 6n + 3n(n-1)\\right) - 2L = 4 + L\\,(9 + 6n + 3n(n-1))' },
        { txt: 'Con L ≈ log₂ n el dominante es 3n² log₂ n:', tex: 'T(n) \\in O(n^2 \\log n)' }
      ],
      trampa: 'El ciclo externo es logarítmico pero la llamada es cuadrática: se MULTIPLICAN (n² · log n). El interno de H depende de i: hay que sumar Σ i, no multiplicar n·n.',
      ejecutar(n, C) {
        C.c('r'); let r = 0; C.c('fi.init');
        for (let i = 1; ; i *= 2) { C.c('fi.cond'); C.v({ i }); if (!(i <= n)) break;
          C.c('call'); C.c('a'); let a = 0; C.c('hi.init');
          for (let ii = 0; ; ii++) { C.c('hi.cond'); if (!(ii < n)) break; C.c('hj.init');
            for (let j = 0; ; j++) { C.c('hj.cond'); if (!(j < ii)) break; C.c('aa'); a += ii * j; C.c('hj.upd'); }
            C.c('hi.upd'); }
          C.c('ra'); r += a; C.c('fi.upd'); }
        C.c('ret'); return r;
      }
    })
  });

  // P2: raro(n): while que no entra, √n, log
  reg({
    id: 'X22', tipo: 'A', titulo: 'Examen 2 · P2: raro(n)', fuente: 'Nuevo (estilo simulacro P2)',
    def: () => ({
      enunciado: 'n > 0. Calcule T(n), invariantes y Big-O de raro. Indique cuántas veces se ejecuta cada ciclo y cuál domina.',
      firma: 'public static int raro(int n)', tamano: 'el valor de n', nMin: 1, TnAprox: true,
      codigo: 'public static int raro(int n) {\n  int s = 0;\n  int m = n / 2;\n  while (m > n) {\n    s++;\n    m--;\n  }\n  for (int i = 1; i * i <= n; i++) {\n    s += i;\n  }\n  for (int k = n; k > 1; k = k / 2) {\n    s++;\n  }\n  return s;\n}',
      lineas: [
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('m', 'int m = n / 2;', 3, 2, 1, { porque: 'Declaración + asignación (2) + división (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        { id: 'w', txt: 'while (m > n) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: '0', t: '0', invariante: 'm <= n', valores: 'm = n/2 ≤ n desde el inicio: NO entra' },
          partes: [L('w.cond', 'm > n', 1, 1, 1, { rol: 'cond', porque: 'Comparación: 1 (una evaluación, falsa).', porqueVeces: 'm = n/2 nunca es > n.', tag: 'nunca' })],
          cuerpo: [L('w1', 's++;', 2, 1, 0, { porque: 'No se ejecuta.', tag: 'noejec' }), L('w2', 'm--;', 2, 1, 0, { porque: 'No se ejecuta.', tag: 'noejec' })] },
        { id: 'f1', txt: 'for (int i = 1; i * i <= n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(sqrt(n))', t: 'floor(sqrt(n))', tol: 1, invariante: 'i * i > n', valores: 'i = 1, 2, … mientras i² ≤ n → ⌊√n⌋ vueltas' },
          partes: [L('f1.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f1.cond', 'i * i <= n', 2, 2, 'floor(sqrt(n))+1', { rol: 'cond', porque: 'Multiplicación + comparación: 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('f1.upd', 'i++', 2, 1, 'floor(sqrt(n))', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('f1b', 's += i;', 2, 2, 'floor(sqrt(n))', { porque: 'Suma + asignación: 2.', tag: 'acum' })] },
        { id: 'f2', txt: 'for (int k = n; k > 1; k = k / 2) {', cierre: '}', ciclo: { tipo: 'for', var: 'r', desde: '1', hasta: 'floor(log2(n))', t: 'floor(log2(n))', tol: 1, invariante: 'k <= 1', valores: 'k = n, n/2, …, > 1 → ⌊log₂ n⌋ vueltas' },
          partes: [L('f2.init', 'int k = n', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f2.cond', 'k > 1', 1, 1, 'floor(log2(n))+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('f2.upd', 'k = k / 2', 2, 2, 'floor(log2(n))', { rol: 'upd', porque: 'División + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('f2b', 's++;', 2, 1, 'floor(log2(n))', { porque: 'Suma + asignación: 2.', tag: 'upd' })] },
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'k <= 1', invAlt: ['k<=1', 'k == 1 || k == 0', 'k <= 1'],
      Tn: { prof: '14 + 6floor(sqrt(n)) + 5floor(log2(n))', hojas: '10 + 5floor(sqrt(n)) + 4floor(log2(n))' }, bigO: 'sqrt(n)',
      pasos: [
        { txt: 'Ciclo 1: m = n/2 ≤ n → no entra (1 evaluación). Ciclo 2: i² ≤ n ⇔ i ≤ √n → ⌊√n⌋ vueltas. Ciclo 3: k se divide entre 2 mientras > 1 → ⌊log₂ n⌋ vueltas.', tex: 't_1 = 0,\\quad t_2 = \\lfloor\\sqrt n\\rfloor,\\quad t_3 = \\lfloor\\log_2 n\\rfloor' },
        { txt: 'Costos: 2 + 3 + 1 + [2 + Σ_{r=1}^{√n}(2 + 2 + 2) + 2] + [2 + Σ_{r=1}^{log₂ n}(1 + 2 + 2) + 1] + 1:', tex: 'T(n) = 14 + 6\\lfloor\\sqrt n\\rfloor + 5\\lfloor\\log_2 n\\rfloor' },
        { txt: '√n crece más rápido que log n (para n = 10⁶: 1000 frente a 20):', tex: 'T(n) \\in O(\\sqrt n)' }
      ],
      trampa: 'Entre √n y log n domina √n. Y el while no entra: mira el valor inicial antes de aplicar fórmulas.',
      ejecutar(n, C) {
        C.c('s'); let s = 0; C.c('m'); let m = idiv(n, 2);
        for (;;) { C.c('w.cond'); C.v({ m }); if (!(m > n)) break; C.c('w1'); s++; C.c('w2'); m--; }
        C.c('f1.init'); for (let i = 1; ; i++) { C.c('f1.cond'); if (!(i * i <= n)) break; C.c('f1b'); s += i; C.c('f1.upd'); }
        C.c('f2.init'); for (let k = n; ; k = idiv(k, 2)) { C.c('f2.cond'); if (!(k > 1)) break; C.c('f2b'); s++; C.c('f2.upd'); }
        C.c('ret'); return s;
      }
    })
  });

  // P3: tipo B – ¿hay dos consecutivos iguales? O(n)
  reg({
    id: 'X23', tipo: 'B', titulo: 'Examen 2 · P3: ¿hay dos consecutivos iguales? (máximo O(n))', fuente: 'Nuevo (estilo simulacro P3)',
    def: () => ({
      enunciado: 'Se tiene un arreglo v de n enteros (n ≥ 1). Diseñe un algoritmo que determine si existen dos posiciones consecutivas con el mismo valor (v[i] == v[i+1] para algún i). Debe retornar true o false. El costo debe ser como máximo O(n). Escríbalo en Java, calcule T(n) para el peor caso, determine el mejor y el peor caso, y dé el Big-O y el Ω.',
      firma: 'static boolean hayConsecutivosIguales(int[] v)', tamano: 'n = v.length', nMin: 1, casoTn: 'peor',
      estrategias: [
        { txt: 'Un for de i = 0 a n−2 comparando v[i] con v[i+1]; retornar true en cuanto se encuentre un par igual.', ok: true, porque: 'Correcto: n − 1 comparaciones como máximo → O(n), con salida temprana.' },
        { txt: 'Doble for comparando cada elemento con todos los demás.', ok: false, porque: 'O(n²) y además responde otra pregunta (repetidos en cualquier posición, no consecutivos).' },
        { txt: 'Ordenar el arreglo y buscar iguales adyacentes.', ok: false, porque: 'Ordenar destruye la adyacencia original y cuesta O(n log n).' }
      ],
      codigo: 'static boolean hayConsecutivosIguales(int[] v) {\n  int n = v.length;\n  for (int i = 0; i < n - 1; i++) {\n    if (v[i] == v[i + 1]) {\n      return true;\n    }\n  }\n  return false;\n}',
      datos: { peor: (n) => asc(n), mejor: (n) => Array(n).fill(3) },
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: 'Tamaño + inicialización: 2.', tag: 'decl' }),
        { id: 'f', txt: 'for (int i = 0; i < n - 1; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-2', t: 'n-1', invariante: 'i == n - 1', valores: 'peor caso: i = 0 … n−2' },
          partes: [L('f.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < n - 1', 2, 2, 'n', { rol: 'cond', porque: 'Resta + comparación: 2.', porqueVeces: 'Peor caso: (n − 1) + 1 = n.', tag: 'condveces', vecesMejor: '1', alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'n-1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })],
          cuerpo: [
            { id: 'if', txt: 'if (v[i] == v[i + 1]) {', cierre: '}', costo: { prof: '4', hojas: '4' }, veces: 'n-1', porque: '2 accesos + suma (i+1) + comparación = 4.', tag: 'cond', vecesMejor: 'min(1, n-1)', alt: { prof: ['3'], hojas: ['3'] },
              cuerpo: [L('rt', 'return true;', 1, 1, 0, { porque: 'return: 1. Peor caso: nunca (no hay iguales). Mejor caso: en la primera comparación.', tag: 'ret', vecesMejor: 'min(1, n-1)' })] }
          ] },
        L('rf', 'return false;', 1, 1, 1, { porque: 'return: 1 (peor caso).', tag: 'ret', vecesMejor: '1 - min(1, n-1)' })
      ],
      invariante: 'i == n - 1', invAlt: ['i = n-1', 'i >= n-1', 'i>=n-1'],
      Tn: { prof: '7 + 8(n-1)', hojas: '6 + 7(n-1)' }, bigO: 'n', omega: '1',
      mejorPeor: 'Peor caso: no hay dos consecutivos iguales (p. ej. 1, 2, 3, …): n − 1 comparaciones → T = 7 + 8(n−1) → O(n). Mejor caso: v[0] == v[1]: una comparación y return → T = 11 → Ω(1).',
      pasos: [
        { txt: 'Peor caso: el for da n − 1 vueltas y el if nunca es verdadero. n 2 + init 2 + Σ_{i=0}^{n-2}(cond 2 + if 4 + i++ 2) + cond final 2 + return 1:', tex: 'T_{peor}(n) = 7 + 8(n-1) = 8n - 1 \\in O(n)' },
        { txt: 'Mejor caso: v[0] == v[1] → 2 + 2 + 2 + 4 + 1:', tex: 'T_{mejor}(n) = 11 \\in \\Omega(1)' }
      ],
      ejecutar(n, C, datos) {
        const v = datos || asc(n); C.c('n'); const N = v.length; C.c('f.init');
        for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < N - 1)) break; C.c('if'); if (v[i] === v[i + 1]) { C.c('rt'); return true; } C.c('f.upd'); }
        C.c('rf'); return false;
      }
    })
  });

  // P4: tipo C – máximo de un arreglo: doble for vs un for
  function max1() {
    return {
      titulo: 'max1 (doble for)', firma: 'public static int max1(int[] v)', tamano: 'n = v.length', iteraciones: 'n^2', casoTn: 'peor',
      datos: { peor: (n) => asc(n) },
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: 'Tamaño + inicialización: 2.', tag: 'decl' }),
        L('mx', 'int mx = v[0];', 3, 2, 1, { porque: 'Declaración + asignación (2) + acceso (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        { id: 'fi', txt: 'for (int i = 0; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [
            L('es', 'boolean esMax = true;', 2, 1, 'n', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            { id: 'fj', txt: 'for (int j = 0; j < n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'n-1', t: 'n', total: 'n^2' },
              partes: [L('fj.init', 'int j = 0', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j < n', 1, 1, 'n^2+n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fj.upd', 'j++', 2, 1, 'n^2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
              cuerpo: [{ id: 'if', txt: 'if (v[j] > v[i]) {', cierre: '}', costo: { prof: '3', hojas: '3' }, veces: 'n^2', porque: '2 accesos + comparación = 3.', tag: 'cond',
                cuerpo: [L('f', 'esMax = false;', 1, 1, 'n(n-1)/2', { porque: 'Asignación: 1. Con el arreglo ascendente (peor caso) es verdadera para j > i: n(n−1)/2 veces.', tag: 'rama' })] }] },
            { id: 'if2', txt: 'if (esMax) {', cierre: '}', costo: { prof: '1', hojas: '1' }, veces: 'n', porque: 'Comparación: 1.', tag: 'if',
              cuerpo: [L('asig', 'mx = v[i];', 2, 1, '1', { porque: 'Acceso + asignación: 2. Solo para el máximo: 1 vez.', tag: 'rama' })] }
          ] },
        L('ret', 'return mx;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n'],
      Tn: { prof: '11 + 9n + 6n^2 + n(n-1)/2', hojas: '8 + 6n + 5n^2 + n(n-1)/2' }, bigO: 'n^2',
      pasos: [{ txt: 'n² comparaciones para decidir si cada elemento es el máximo:', tex: 'T_1(n) \\approx 6.5n^2 + 8.5n + 11 \\in O(n^2)' }],
      ejecutar(n, C, datos) { const v = datos || asc(n); C.c('n'); const N = v.length; C.c('mx'); let mx = v[0]; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i, mx }); if (!(i < N)) break; C.c('es'); let esMax = true; C.c('fj.init'); for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j < N)) break; C.c('if'); if (v[j] > v[i]) { C.c('f'); esMax = false; } C.c('fj.upd'); } C.c('if2'); if (esMax) { C.c('asig'); mx = v[i]; } C.c('fi.upd'); } C.c('ret'); return mx; }
    };
  }
  function max2() {
    return {
      titulo: 'max2 (un for)', firma: 'public static int max2(int[] v)', tamano: 'n = v.length', iteraciones: 'n-1', casoTn: 'peor',
      datos: { peor: (n) => asc(n) },
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: 'Tamaño + inicialización: 2.', tag: 'decl' }),
        L('mx', 'int mx = v[0];', 3, 2, 1, { porque: 'Declaración + asignación (2) + acceso (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        { id: 'fi', txt: 'for (int i = 1; i < n; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '1', hasta: 'n-1', t: 'n-1', invariante: 'i == n' },
          partes: [L('fi.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fi.cond', 'i < n', 1, 1, 'n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces' }), L('fi.upd', 'i++', 2, 1, 'n-1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [{ id: 'if', txt: 'if (v[i] > mx) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'n-1', porque: 'Acceso + comparación = 2.', tag: 'cond',
            cuerpo: [L('asig', 'mx = v[i];', 2, 1, 'n-1', { porque: 'Acceso + asignación: 2. Peor caso (ascendente): en todas las vueltas.', tag: 'rama' })] }] },
        L('ret', 'return mx;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n'],
      Tn: { prof: '9 + 7(n-1)', hojas: '7 + 5(n-1)' }, bigO: 'n',
      pasos: [{ txt: 'Un recorrido con n − 1 comparaciones:', tex: 'T_2(n) = 9 + 7(n-1) = 7n + 2 \\in O(n)' }],
      ejecutar(n, C, datos) { const v = datos || asc(n); C.c('n'); const N = v.length; C.c('mx'); let mx = v[0]; C.c('fi.init'); for (let i = 1; ; i++) { C.c('fi.cond'); C.v({ i, mx }); if (!(i < N)) break; C.c('if'); if (v[i] > mx) { C.c('asig'); mx = v[i]; } C.c('fi.upd'); } C.c('ret'); return mx; }
    };
  }
  reg({
    id: 'X24', tipo: 'C', titulo: 'Examen 2 · P4: max1 vs max2 (máximo del arreglo)', fuente: 'Nuevo (estilo simulacro P2b)',
    def: () => ({
      enunciado: 'Ambos métodos retornan el máximo de un arreglo de enteros. Analice el costo de cada uno (peor caso: arreglo ascendente) y determine cuál es más eficiente. Justifique con iteraciones e instrucciones, no solo con el Big-O.',
      codigo: 'public static int max1(int[] v) {\n  int n = v.length;\n  int mx = v[0];\n  for (int i = 0; i < n; i++) {\n    boolean esMax = true;\n    for (int j = 0; j < n; j++) {\n      if (v[j] > v[i]) {\n        esMax = false;\n      }\n    }\n    if (esMax) {\n      mx = v[i];\n    }\n  }\n  return mx;\n}\n\npublic static int max2(int[] v) {\n  int n = v.length;\n  int mx = v[0];\n  for (int i = 1; i < n; i++) {\n    if (v[i] > mx) {\n      mx = v[i];\n    }\n  }\n  return mx;\n}',
      metodos: [max1(), max2()], nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'max2: n − 1 comparaciones frente a n² de max1. T₁ ≈ 6.5n² + 8.5n + 11 (O(n²)) y T₂ = 7n + 2 (O(n)). Para n = 100: ~65 859 OE frente a 702.', ok: true, porque: 'Correcto: max1 vuelve a recorrer todo el arreglo por cada elemento.' },
        { txt: 'Son iguales porque los dos encuentran el máximo.', ok: false, porque: 'El resultado es el mismo, el costo no: n² frente a n.' },
        { txt: 'max1 es mejor porque verifica cada candidato contra todos y es más confiable.', ok: false, porque: 'Verificar contra todos es trabajo repetido: basta recordar el mayor visto hasta ahora.' }
      ]
    })
  });

  /* =================== Definición de los exámenes =================== */
  ADA.EXAMENES = [
    { id: 'E1', titulo: 'Examen 1', puntos: ['X11', 'X12', 'X13', 'X14'] },
    { id: 'E2', titulo: 'Examen 2', puntos: ['X21', 'X22', 'X23', 'X24'] }
  ];
})();
