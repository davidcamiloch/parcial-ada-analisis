/* data/f4.js – Fase 4: Diseña el algoritmo (tipo B) + comparaciones (tipo C).
   Cada tipo B: enunciado, cota, estrategias (elegir), codigo (ordenar líneas), lineas (modelo del PEOR caso, con vecesMejor
   para el mejor), datos {peor, mejor}, Tn (peor), TnMejor, bigO, omega, mejorPeor. Todo verificado por verificar.js. */
(function () {
  'use strict';
  const L = ADA.L;
  const idiv = (a, b) => Math.trunc(a / b);
  const reg = (o) => ADA.registrar(Object.assign({ fase: 4, variantes: [{}] }, o));
  const asc = (n) => Array.from({ length: n }, (_, i) => i);
  const FOR = (id, txt, initTxt, condTxt, updTxt, ciclo, cuerpo, veces) => ({
    id, txt, cierre: '}', ciclo,
    partes: [L(id + '.init', initTxt, 2, 1, veces.init || 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }),
      L(id + '.cond', condTxt, veces.condCosto || 1, veces.condCosto || 1, veces.cond, Object.assign({ rol: 'cond', porque: (veces.condCosto || 1) === 1 ? 'Comparación: 1.' : 'Operación + comparación: ' + veces.condCosto + '.', tag: 'condveces' }, veces.condExtra || {})),
      L(id + '.upd', updTxt, 2, 1, veces.upd, Object.assign({ rol: 'upd', porque: 'Operación + asignación: 2.', tag: 'upd' }, veces.updExtra || {}))],
    cuerpo
  });

  /* ---------- B01 sonIgualesD ---------- */
  reg({
    id: 'B01', tipo: 'B', titulo: 'Diagonal principal = diagonal secundaria (O(n))', fuente: 'Simulacro P3',
    def: () => ({
      enunciado: 'Matriz cuadrada A de n×n (n ≥ 1). Diseñe un algoritmo que retorne true si la suma de la diagonal principal es igual a la de la secundaria y false en caso contrario. Costo como máximo O(n).',
      firma: 'static boolean sonIgualesD(int[][] A)', tamano: 'n = A.length', cotaO: 'n',
      estrategias: [
        { txt: 'Un solo for de i = 0 a n−1 acumulando A[i][i] y A[i][n−1−i]; al final comparar las dos sumas.', ok: true, porque: 'Correcto: n vueltas → O(n). La posición de cada diagonal se calcula con i.' },
        { txt: 'Doble for sobre toda la matriz con if (i == j) y if (i + j == n − 1).', ok: false, porque: 'Recorre n² casillas para usar solo 2n: O(n²), viola la cota.' },
        { txt: 'Dos for separados: uno para cada diagonal.', ok: false, porque: 'Sirve (2n → O(n)) pero hace el doble de vueltas que un solo for; la mejor respuesta usa un ciclo.' }
      ],
      codigo: 'static boolean sonIgualesD(int[][] A) {\n  int n = A.length;\n  int sumaPrincipal = 0;\n  int sumaSecundaria = 0;\n  for (int i = 0; i < n; i++) {\n    sumaPrincipal += A[i][i];\n    sumaSecundaria += A[i][n - i - 1];\n  }\n  return sumaPrincipal == sumaSecundaria;\n}',
      lineas: ADA.instancia(ADA.porId.A02, 0).lineas,
      Tn: { prof: '10n + 10', hojas: '10n + 7' }, bigO: 'n', omega: 'n', sinCasos: true,
      mejorPeor: 'No hay mejor ni peor caso: no hay ningún if ni salida anticipada que dependa de los datos; siempre se hacen las n vueltas. O(n) = Ω(n) = Θ(n).',
      ejecutar: ADA.instancia(ADA.porId.A02, 0).ejecutar
    })
  });

  /* ---------- B02 faltante 1..n+1 ---------- */
  reg({
    id: 'B02', tipo: 'B', titulo: 'Número faltante en 1..n+1 (O(n))', fuente: 'Hoja 1 parte 1 #1',
    def: () => ({
      enunciado: 'Un arreglo de n elementos guarda los números de 1 a n+1 excepto uno. Encuentre cuál falta en un orden como máximo O(n).',
      firma: 'static int faltante(int[] v)', tamano: 'n = v.length', cotaO: 'n',
      estrategias: [
        { txt: 'Sumar todos los elementos y restar de la suma teórica 1 + 2 + … + (n+1) = (n+1)(n+2)/2.', ok: true, porque: 'Correcto: un recorrido → O(n), y la fórmula de Gauss evita buscar.' },
        { txt: 'Para cada k de 1 a n+1, recorrer el arreglo buscando k; el que no aparezca es el faltante.', ok: false, porque: 'n búsquedas de n pasos: O(n²).' },
        { txt: 'Ordenar el arreglo y buscar el primer salto.', ok: false, porque: 'Ordenar cuesta O(n log n): supera la cota.' }
      ],
      codigo: 'static int faltante(int[] v) {\n  int n = v.length;\n  int suma = 0;\n  for (int i = 0; i < n; i++) {\n    suma += v[i];\n  }\n  return (n + 1) * (n + 2) / 2 - suma;\n}',
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        L('s', 'int suma = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('f', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n' }, [L('a', 'suma += v[i];', 3, 3, 'n', { porque: 'Acceso + suma + asignación = 3.', tag: 'acum' })], { cond: 'n+1', upd: 'n' }),
        L('ret', 'return (n + 1) * (n + 2) / 2 - suma;', 5, 5, 1, { porque: '4 operaciones (+, +, ·, /, −: el profe agrupa) + return: acepto 4–6.', tag: 'ret', alt: { prof: ['4', '6', '1'], hojas: ['4', '6', '1'] } })
      ],
      Tn: { prof: '12 + 6n', hojas: '10 + 5n' }, bigO: 'n', omega: 'n', sinCasos: true,
      mejorPeor: 'No hay mejor ni peor caso: siempre se suman los n elementos (no hay condición que dependa de los datos). O(n) = Ω(n).',
      ejecutar(n, C) { const v = asc(n).map((x) => x + 1); C.c('n'); C.c('s'); let suma = 0; C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i, suma }); if (!(i < n)) break; C.c('a'); suma += v[i]; C.c('f.upd'); } C.c('ret'); return (n + 1) * (n + 2) / 2 - suma; }
    })
  });

  /* ---------- B03 triangular ---------- */
  reg({
    id: 'B03', tipo: 'B', titulo: '¿n es triangular?', fuente: 'Hoja 1 parte 1 #2',
    def: () => ({
      enunciado: 'Un número n es triangular si es la suma de los j primeros enteros (1, 3, 6, 10, …). Diseñe un algoritmo que determine si n es triangular. Calcule su costo en función de n.',
      firma: 'static boolean esTriangular(int n)', tamano: 'el valor de n', cotaO: 'sqrt(n)',
      estrategias: [
        { txt: 'Acumular s = 1 + 2 + 3 + … mientras s < n; al salir, n es triangular si s == n.', ok: true, porque: 'Correcto: s alcanza n tras ≈ √(2n) sumas → O(√n).' },
        { txt: 'Para j de 1 a n, calcular j(j+1)/2 y comparar con n.', ok: false, porque: 'Funciona pero da n vueltas cuando basta √(2n): O(n), peor.' },
        { txt: 'Verificar si 8n + 1 es un cuadrado perfecto (fórmula).', ok: false, porque: 'Es O(1) y válido, pero requiere raíz cuadrada (librería) y no muestra un ciclo que analizar; como diseño con ciclo, la acumulación es la esperada.' }
      ],
      codigo: 'static boolean esTriangular(int n) {\n  int s = 0;\n  int j = 1;\n  while (s < n) {\n    s += j;\n    j++;\n  }\n  return s == n;\n}',
      lineas: [
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('j', 'int j = 1;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'w', txt: 'while (s < n) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'ceil((sqrt(8n+1)-1)/2)', t: 'ceil((sqrt(8n+1)-1)/2)', tol: 1, invariante: 's >= n', valores: 's = 1, 3, 6, 10, … hasta ≥ n: el menor j con j(j+1)/2 ≥ n ≈ √(2n)' },
          partes: [L('w.cond', 's < n', 1, 1, 'ceil((sqrt(8n+1)-1)/2)+1', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces', tol: 1 })],
          cuerpo: [L('a', 's += j;', 2, 2, 'ceil((sqrt(8n+1)-1)/2)', { porque: 'Suma + asignación: 2.', tag: 'acum', tol: 1 }), L('u', 'j++;', 2, 1, 'ceil((sqrt(8n+1)-1)/2)', { porque: 'Suma + asignación: 2.', tag: 'upd', tol: 1 })] },
        L('ret', 'return s == n;', 1, 1, 1, { porque: 'Comparación + return: 1.', tag: 'ret' })
      ],
      Tn: { prof: '6 + 5ceil((sqrt(8n+1)-1)/2)', hojas: '4 + 4ceil((sqrt(8n+1)-1)/2)' }, TnAprox: true, bigO: 'sqrt(n)', omega: 'sqrt(n)', sinCasos: true, nMin: 1,
      mejorPeor: 'No hay mejor ni peor caso en el orden: sea o no triangular, el while corre hasta que s ≥ n, es decir el menor j con j(j+1)/2 ≥ n → j ≈ √(2n) (de j(j+1)/2 ≥ n ⇒ j² ≈ 2n). O(√n) = Ω(√n).',
      pasos: [{ txt: 'Vueltas: j(j+1)/2 ≥ n ⇔ j ≈ (√(8n+1) − 1)/2 ≈ √(2n):', tex: 'T(n) = 6 + 5\\left\\lceil\\tfrac{\\sqrt{8n+1}-1}{2}\\right\\rceil \\approx 5\\sqrt{2n} + 6 \\in O(\\sqrt n)' }],
      ejecutar(n, C) { C.c('s'); let s = 0; C.c('j'); let j = 1; for (;;) { C.c('w.cond'); C.v({ s, j }); if (!(s < n)) break; C.c('a'); s += j; C.c('u'); j++; } C.c('ret'); return s === n; }
    })
  });

  /* ---------- B04 dos cubos ---------- */
  reg({
    id: 'B04', tipo: 'B', titulo: 'n como suma de dos cubos de dos formas (1729)', fuente: 'Hoja 1 parte 2 #1',
    def: () => ({
      enunciado: 'Dado n, determine si existen dos pares distintos (a, b) y (c, d) con n = a³ + b³ = c³ + d³ (ej. 1729 = 1³ + 12³ = 9³ + 10³). Diseñe el algoritmo y calcule su costo (peor caso).',
      firma: 'static boolean dosCubos(int n)', tamano: 'el valor de n', cotaO: 'n^(2/3)',
      estrategias: [
        { txt: 'Doble for a = 1..∛n, b = a..∛n contando los pares con a³ + b³ == n; retornar true si hay ≥ 2.', ok: true, porque: 'Correcto: ∛n·∛n/2 pares → O(n^{2/3}). Los cubos solo llegan hasta ∛n.' },
        { txt: 'Doble for a = 1..n, b = 1..n.', ok: false, porque: 'O(n²): casi todos los pares se pasan de n (a³ > n en cuanto a > ∛n).' },
        { txt: 'Un for a = 1..∛n calculando b = ∛(n − a³) y comprobando si es entero.', ok: false, porque: 'Es aún mejor (O(∛n)) pero necesita raíz cúbica (librería) y cuidado con redondeos; el doble for acotado es la respuesta esperada.' }
      ],
      codigo: 'static boolean dosCubos(int n) {\n  int pares = 0;\n  for (int a = 1; a * a * a <= n; a++) {\n    for (int b = a; b * b * b <= n; b++) {\n      if (a * a * a + b * b * b == n) {\n        pares++;\n      }\n    }\n  }\n  return pares >= 2;\n}',
      lineas: [
        L('p', 'int pares = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'fa', txt: 'for (int a = 1; a * a * a <= n; a++) {', cierre: '}', ciclo: { tipo: 'for', var: 'a', desde: '1', hasta: 'floor(n^(1/3))', t: 'floor(n^(1/3))', tol: 1, total: 'floor(n^(1/3))', invariante: 'a * a * a > n', valores: 'a = 1 … ⌊∛n⌋' },
          partes: [L('fa.init', 'int a = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fa.cond', 'a * a * a <= n', 3, 3, 'floor(n^(1/3))+1', { rol: 'cond', porque: '2 multiplicaciones + comparación: 3.', tag: 'condveces', tol: 1, alt: { prof: ['1', '2'], hojas: ['1', '2'] } }), L('fa.upd', 'a++', 2, 1, 'floor(n^(1/3))', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', tol: 1 })],
          cuerpo: [
            { id: 'fb', txt: 'for (int b = a; b * b * b <= n; b++) {', cierre: '}', ciclo: { tipo: 'for', var: 'b', desde: 'a', hasta: 'floor(n^(1/3))', t: 'floor(n^(1/3)) - a + 1', total: 'floor(n^(1/3))(floor(n^(1/3))+1)/2', valores: 'b = a … ⌊∛n⌋: ⌊∛n⌋ − a + 1 vueltas' },
              partes: [L('fb.init', 'int b = a', 2, 1, 'floor(n^(1/3))', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl', tol: 1 }), L('fb.cond', 'b * b * b <= n', 3, 3, 'floor(n^(1/3))(floor(n^(1/3))+1)/2 + floor(n^(1/3))', { rol: 'cond', porque: '2 multiplicaciones + comparación: 3.', tag: 'condveces', tol: 3, alt: { prof: ['1', '2'], hojas: ['1', '2'] } }), L('fb.upd', 'b++', 2, 1, 'floor(n^(1/3))(floor(n^(1/3))+1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', tol: 3 })],
              cuerpo: [
                { id: 'if', txt: 'if (a * a * a + b * b * b == n) {', cierre: '}', costo: { prof: '6', hojas: '6' }, veces: 'floor(n^(1/3))(floor(n^(1/3))+1)/2', porque: '4 multiplicaciones + suma + comparación = 6.', tag: 'cond', tol: 3, alt: { prof: ['1', '2', '5'], hojas: ['1', '2', '5'] },
                  cuerpo: [L('pp', 'pares++;', 2, 1, 'floor(n^(1/3))', { porque: 'Suma + asignación: 2. Cota superior: a lo sumo un b por cada a (≤ ∛n veces).', tag: 'rama', cota: true })] }
              ] }
          ] },
        L('ret', 'return pares >= 2;', 1, 1, 1, { porque: 'Comparación + return: 1.', tag: 'ret' })
      ],
      cota: true,
      Tn: { prof: '8 + 12floor(n^(1/3)) + 11floor(n^(1/3))(floor(n^(1/3))+1)/2', hojas: '6 + 9floor(n^(1/3)) + 10floor(n^(1/3))(floor(n^(1/3))+1)/2' }, TnAprox: true, bigO: 'n^(2/3)', omega: 'n^(2/3)', sinCasos: true, nMax: 1000,
      mejorPeor: 'Como el algoritmo cuenta TODOS los pares (no se detiene al encontrar dos), no hay mejor ni peor caso en el orden: siempre recorre los ≈ (∛n)²/2 pares. O(n^{2/3}) = Ω(n^{2/3}). (Si se detuviera al encontrar 2 pares, habría mejor caso Ω(1)… pero aun así casi siempre recorre todo.)',
      pasos: [{ txt: 'Con c = ⌊∛n⌋: el externo da c vueltas y el interno c − a + 1 → Σ_{a=1}^{c}(c − a + 1) = c(c+1)/2:', tex: 'T(n) \\le 8 + 12c + 11\\frac{c(c+1)}{2},\\quad c = \\lfloor\\sqrt[3]{n}\\rfloor \\Rightarrow O(n^{2/3})' }],
      ejecutar(n, C) { C.c('p'); let pares = 0; C.c('fa.init'); for (let a = 1; ; a++) { C.c('fa.cond'); C.v({ a }); if (!(a * a * a <= n)) break; C.c('fb.init'); for (let b = a; ; b++) { C.c('fb.cond'); if (!(b * b * b <= n)) break; C.c('if'); if (a * a * a + b * b * b === n) { C.c('pp'); pares++; } C.c('fb.upd'); } C.c('fa.upd'); } C.c('ret'); return pares >= 2; }
    })
  });

  /* ---------- B05 cuadrados perfectos entre 1 y n ---------- */
  reg({
    id: 'B05', tipo: 'B', titulo: 'Cuadrados perfectos entre a y b', fuente: 'Hoja 1 parte 2 #2',
    def: () => ({
      enunciado: 'Dados a y b (1 ≤ a ≤ b), cuente los cuadrados perfectos en [a, b]. Para el análisis tome a = 1 y n = b. Diseñe el algoritmo y calcule su costo.',
      firma: 'static int cuadrados(int a, int b)', tamano: 'n = b (con a = 1)', cotaO: 'sqrt(n)',
      estrategias: [
        { txt: 'Recorrer i = 1, 2, 3, … mientras i·i ≤ b y contar los i con i·i ≥ a.', ok: true, porque: 'Correcto: solo ⌊√b⌋ candidatos → O(√n).' },
        { txt: 'Recorrer todos los números de a a b y comprobar si cada uno es cuadrado perfecto con sqrt.', ok: false, porque: 'b − a + 1 vueltas con una raíz cada una: O(n) y usa librería.' },
        { txt: 'Fórmula ⌊√b⌋ − ⌈√a⌉ + 1.', ok: false, porque: 'Es O(1) y correcta, pero depende de sqrt de librería; como ejercicio de diseño con ciclo se espera la primera.' }
      ],
      codigo: 'static int cuadrados(int a, int b) {\n  int c = 0;\n  for (int i = 1; i * i <= b; i++) {\n    if (i * i >= a) {\n      c++;\n    }\n  }\n  return c;\n}',
      lineas: [
        L('c', 'int c = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'f', txt: 'for (int i = 1; i * i <= b; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '1', hasta: 'floor(sqrt(n))', t: 'floor(sqrt(n))', tol: 1, invariante: 'i * i > b', valores: 'i = 1 … ⌊√b⌋' },
          partes: [L('f.init', 'int i = 1', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i * i <= b', 2, 2, 'floor(sqrt(n))+1', { rol: 'cond', porque: 'Multiplicación + comparación: 2.', tag: 'condveces', tol: 1, alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'floor(sqrt(n))', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', tol: 1 })],
          cuerpo: [{ id: 'if', txt: 'if (i * i >= a) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'floor(sqrt(n))', porque: 'Multiplicación + comparación: 2.', tag: 'cond', tol: 1, alt: { prof: ['1'], hojas: ['1'] },
            cuerpo: [L('cc', 'c++;', 2, 1, 'floor(sqrt(n))', { porque: 'Suma + asignación: 2. Con a = 1 siempre entra.', tag: 'rama', tol: 1 })] }] },
        L('ret', 'return c;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      Tn: { prof: '7 + 8floor(sqrt(n))', hojas: '5 + 6floor(sqrt(n))' }, TnAprox: true, bigO: 'sqrt(n)', omega: 'sqrt(n)', sinCasos: true, nMin: 1,
      mejorPeor: 'No hay mejor ni peor caso: el for siempre da ⌊√b⌋ vueltas; el if solo cambia si se cuenta o no (1 OE). O(√n) = Ω(√n).',
      pasos: [{ txt: 'i² ≤ b ⇔ i ≤ √b → ⌊√n⌋ vueltas de costo 2 + 2 + 2 + 2:', tex: 'T(n) = 6 + 8\\lfloor\\sqrt n\\rfloor \\in O(\\sqrt n)' }],
      ejecutar(n, C) { const a = 1, b = n; C.c('c'); let c = 0; C.c('f.init'); for (let i = 1; ; i++) { C.c('f.cond'); C.v({ i, c }); if (!(i * i <= b)) break; C.c('if'); if (i * i >= a) { C.c('cc'); c++; } C.c('f.upd'); } C.c('ret'); return c; }
    })
  });

  /* ---------- B06 tripleta pitagórica (O(1)) ---------- */
  reg({
    id: 'B06', tipo: 'B', titulo: 'Tripleta pitagórica con n como cateto', fuente: 'Hoja 1 parte 2 #3',
    def: () => ({
      enunciado: 'Dado n ≥ 3, genere una tripleta pitagórica (a, b, c) con a² + b² = c² que tenga a n como uno de sus catetos (ej. n = 22 → 22, 120, 122). Diseñe el algoritmo y calcule su costo.',
      firma: 'static int[] tripleta(int n)', tamano: 'el valor de n', cotaO: '1',
      estrategias: [
        { txt: 'Fórmula: si n es impar, (n, (n²−1)/2, (n²+1)/2); si n es par, (n, n²/4 − 1, n²/4 + 1).', ok: true, porque: 'Correcto y O(1): (n²+1)/2 − (n²−1)/2 = 1 y c² − b² = (c−b)(c+b) = 1·n². Compruébalo con 22: b = 121 − 1 = 120, c = 122.' },
        { txt: 'Doble for b, c hasta n² comprobando n² + b² == c².', ok: false, porque: 'O(n⁴) (los límites llegan a n²): absurdo cuando hay fórmula.' },
        { txt: 'Un for b = 1..n² comprobando si n² + b² es cuadrado perfecto con sqrt.', ok: false, porque: 'O(n²) y depende de la raíz de librería.' }
      ],
      codigo: 'static int[] tripleta(int n) {\n  int b;\n  int c;\n  if (n % 2 == 1) {\n    b = (n * n - 1) / 2;\n    c = (n * n + 1) / 2;\n  } else {\n    b = n * n / 4 - 1;\n    c = n * n / 4 + 1;\n  }\n  return new int[] {n, b, c};\n}',
      lineas: [
        L('b', 'int b;', 1, 1, 1, { porque: 'Declaración: 1.', tag: 'decl', alt: { prof: ['0'], hojas: ['0'] } }),
        L('c', 'int c;', 1, 1, 1, { porque: 'Declaración: 1.', tag: 'decl', alt: { prof: ['0'], hojas: ['0'] } }),
        { id: 'if', txt: 'if (n % 2 == 1) {', cierre: '} else {', costo: { prof: '2', hojas: '2' }, veces: '1', porque: 'Módulo + comparación: 2.', tag: 'if',
          cuerpo: [L('b1', 'b = (n * n - 1) / 2;', 4, 4, '1', { porque: '3 operaciones + asignación = 4 (rama impar; analizamos n impar; la par cuesta igual).', tag: 'asig', alt: { prof: ['3', '5'], hojas: ['3', '5'] } }), L('c1', 'c = (n * n + 1) / 2;', 4, 4, '1', { porque: '3 operaciones + asignación = 4.', tag: 'asig', alt: { prof: ['3', '5'], hojas: ['3', '5'] } })] },
        { id: 'else', txt: '', cierre: '}', cuerpo: [L('b2', 'b = n * n / 4 - 1;', 4, 4, '0', { porque: 'Rama par (no se ejecuta en el caso analizado).', tag: 'rama' }), L('c2', 'c = n * n / 4 + 1;', 4, 4, '0', { porque: 'Rama par.', tag: 'rama' })] },
        L('ret', 'return new int[] {n, b, c};', 'k', 'k', 1, { porque: 'new + return: k.', tag: 'k', alt: { prof: ['1+k', '1'], hojas: ['1+k', '1'] } })
      ],
      Tn: { prof: '12 + k', hojas: '12 + k' }, bigO: '1', omega: '1', sinCiclo: true, sinCasos: true, nMin: 3,
      mejorPeor: 'No hay ciclos: el costo es constante en cualquier rama (las dos ramas cuestan lo mismo). O(1) = Ω(1). No hay mejor ni peor caso.',
      pasos: [{ txt: 'Sin ciclos: se suman las OE de la única ruta (rama impar o par, mismo costo):', tex: 'T(n) = 1 + 1 + 2 + 4 + 4 + k = 12 + k \\in O(1)' }],
      ejecutar(n, C) { const m = n % 2 === 1 ? n : n + 1; let b, c; C.c('b'); C.c('c'); C.c('if'); if (m % 2 === 1) { C.c('b1'); b = (m * m - 1) / 2; C.c('c1'); c = (m * m + 1) / 2; } else { C.c('b2'); C.c('c2'); } C.c('ret'); return [m, b, c]; }
    })
  });

  /* ---------- B07 x^n ---------- */
  function potIter() {
    return {
      titulo: 'potencia iterativa', firma: 'static long potencia(int x, int n)', tamano: 'el exponente n', iteraciones: 'n',
      lineas: [
        L('r', 'long r = 1;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('f', 'for (int i = 1; i <= n; i++) {', 'int i = 1', 'i <= n', 'i++', { tipo: 'for', var: 'i', desde: '1', hasta: 'n', t: 'n', invariante: 'i == n + 1' }, [L('m', 'r = r * x;', 2, 2, 'n', { porque: 'Multiplicación + asignación: 2.', tag: 'acum' })], { cond: 'n+1', upd: 'n' }),
        L('ret', 'return r;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      Tn: { prof: '6 + 5n', hojas: '4 + 4n' }, bigO: 'n', omega: 'n', invariante: 'i == n + 1', invAlt: ['i = n+1', 'i > n'],
      pasos: [{ txt: 'n multiplicaciones:', tex: 'T(n) = 2 + 2 + \\sum_{i=1}^{n}(1 + 2 + 2) + 1 + 1 = 6 + 5n \\in O(n)' }],
      ejecutar(n, C) { const x = 2; C.c('r'); let r = 1; C.c('f.init'); for (let i = 1; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i <= n)) break; C.c('m'); r = r * x; C.c('f.upd'); } C.c('ret'); return r; }
    };
  }
  function potBin() {
    return {
      titulo: 'potencia binaria (rápida)', firma: 'static long potenciaRapida(int x, int n)', tamano: 'el exponente n', iteraciones: 'floor(log2(n))+1',
      lineas: [
        L('r', 'long r = 1;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('b', 'long base = x;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('e', 'int e = n;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        { id: 'w', txt: 'while (e > 0) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'floor(log2(n))+1', t: 'floor(log2(n))+1', tol: 1, invariante: 'e == 0', valores: 'e = n, n/2, n/4, …, 1 → ⌊log₂ n⌋ + 1 vueltas' },
          partes: [L('w.cond', 'e > 0', 1, 1, 'floor(log2(n))+2', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces', tol: 1 })],
          cuerpo: [
            { id: 'if', txt: 'if (e % 2 == 1) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'floor(log2(n))+1', porque: 'Módulo + comparación: 2.', tag: 'cond', tol: 1,
              cuerpo: [L('rm', 'r = r * base;', 2, 2, 'floor(log2(n))+1', { porque: 'Multiplicación + asignación: 2. Peor caso (n = 2^k − 1, todos los bits en 1): en todas las vueltas.', tag: 'rama', tol: 1, cota: true })] },
            L('bb', 'base = base * base;', 2, 2, 'floor(log2(n))+1', { porque: 'Multiplicación + asignación: 2.', tag: 'acum', tol: 1 }),
            L('ee', 'e /= 2;', 2, 1, 'floor(log2(n))+1', { porque: 'División + asignación: 2.', tag: 'upd', tol: 1 })
          ] },
        L('ret', 'return r;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      cota: true, nMin: 1,
      Tn: { prof: '8 + 9(floor(log2(n))+1)', hojas: '5 + 8(floor(log2(n))+1)' }, TnAprox: true, bigO: 'log(n)', omega: 'log(n)', invariante: 'e == 0', invAlt: ['e = 0', 'e <= 0'],
      pasos: [{ txt: 'e se divide entre 2 cada vuelta: ⌊log₂ n⌋ + 1 vueltas; cota superior contando r = r·base en todas:', tex: 'T(n) \\le 8 + 9(\\lfloor\\log_2 n\\rfloor + 1) \\in O(\\log n)' }],
      ejecutar(n, C) { const x = 3; C.c('r'); let r = 1; C.c('b'); let base = x; C.c('e'); let e = n; for (;;) { C.c('w.cond'); C.v({ e }); if (!(e > 0)) break; C.c('if'); if (e % 2 === 1) { C.c('rm'); r = r * base; } C.c('bb'); base = base * base; C.c('ee'); e = idiv(e, 2); } C.c('ret'); return r; }
    };
  }
  reg({
    id: 'B07', tipo: 'B', titulo: 'x elevado a la n', fuente: 'Hoja 1 parte 2 #4',
    def: () => Object.assign(potIter(), {
      enunciado: 'Dados x y n enteros positivos, calcule xⁿ. Diseñe el algoritmo (sin usar Math.pow) y calcule su costo en función de n.',
      cotaO: 'n',
      estrategias: [
        { txt: 'Un for de n vueltas multiplicando r = r · x.', ok: true, porque: 'Correcto: n multiplicaciones → O(n). Es la respuesta esperada.' },
        { txt: 'Exponenciación binaria: elevar al cuadrado y dividir el exponente entre 2 → O(log n).', ok: false, porque: 'Es MEJOR (O(log n)) y válida; se compara en C05. Aquí se pide la versión directa.' },
        { txt: 'Sumar x consigo mismo n veces.', ok: false, porque: 'Eso calcula x·n, no xⁿ.' }
      ],
      codigo: 'static long potencia(int x, int n) {\n  long r = 1;\n  for (int i = 1; i <= n; i++) {\n    r = r * x;\n  }\n  return r;\n}',
      sinCasos: true, mejorPeor: 'No hay mejor ni peor caso: siempre n multiplicaciones. O(n) = Ω(n).'
    })
  });

  /* ---------- B08 residuo con sumas y restas ---------- */
  reg({
    id: 'B08', tipo: 'B', titulo: 'Residuo de m entre d solo con restas', fuente: 'Hoja 1 parte 2 #5',
    def: () => ({
      enunciado: 'Una ALU limitada solo suma y resta. Dados m y d (d ≥ 1), calcule el residuo de m entre d. Diseñe el algoritmo y analice su costo en función de m y d (para el juego, n = m).',
      firma: 'static int residuo(int m, int d)', tamano: 'n = m (y el divisor d)', cotaO: 'n',
      estrategias: [
        { txt: 'Restar d de m mientras m ≥ d; lo que queda es el residuo.', ok: true, porque: 'Correcto: ⌊m/d⌋ restas. El costo depende de las DOS variables: T(m, d) ≈ c·⌊m/d⌋.' },
        { txt: 'Multiplicar d por 1, 2, 3, … hasta pasar a m.', ok: false, porque: 'Multiplicar no está permitido (solo sumas y restas), aunque se podría simular sumando.' },
        { txt: 'Usar m % d.', ok: false, porque: 'La ALU no tiene división ni módulo: es lo que hay que construir.' }
      ],
      codigo: 'static int residuo(int m, int d) {\n  while (m >= d) {\n    m = m - d;\n  }\n  return m;\n}',
      lineas: [
        { id: 'w', txt: 'while (m >= d) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'n', t: 'n', invariante: 'm < d', valores: 'peor caso d = 1: m, m−1, …, 0 → m vueltas; en general ⌊m/d⌋' },
          partes: [L('w.cond', 'm >= d', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Peor caso (d = 1): m + 1. Mejor caso (m < d): 1.', tag: 'condveces', vecesMejor: '1' })],
          cuerpo: [L('a', 'm = m - d;', 2, 2, 'n', { porque: 'Resta + asignación: 2.', tag: 'upd', vecesMejor: '0' })] },
        L('ret', 'return m;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      datos: { peor: (n) => 1, mejor: (n) => n + 1 }, casoTn: 'peor',
      Tn: { prof: '2 + 3n', hojas: '2 + 3n' }, TnMejor: { prof: '2', hojas: '2' }, bigO: 'n', omega: '1',
      mejorPeor: 'En general T(m, d) = 2 + 3⌊m/d⌋. Peor caso: d = 1 → m vueltas → O(m). Mejor caso: m < d → 0 vueltas → Ω(1). La complejidad es función de las dos variables.',
      pasos: [{ txt: 'Vueltas = ⌊m/d⌋; con d = 1 son m:', tex: 'T(m,d) = 1 + \\sum_{r=1}^{\\lfloor m/d\\rfloor}(1+2) + 1 = 2 + 3\\lfloor m/d \\rfloor \\;\\Rightarrow\\; O(m),\\ \\Omega(1)' }],
      ejecutar(n, C, datos) { const d = datos || 1; let m = n; for (;;) { C.c('w.cond'); C.v({ m }); if (!(m >= d)) break; C.c('a'); m = m - d; } C.c('ret'); return m; }
    })
  });

  /* ---------- B09 contar x ---------- */
  reg({
    id: 'B09', tipo: 'B', titulo: 'Cuántas veces aparece x', fuente: 'Hoja 1 parte 2 #6',
    def: () => ({
      enunciado: 'Dado un arreglo de n enteros y un valor x, determine cuántas veces aparece x. Diseñe y analice (¿hay mejor y peor caso?).',
      firma: 'static int contar(int[] v, int x)', tamano: 'n = v.length', cotaO: 'n',
      estrategias: [
        { txt: 'Un for sobre todo el arreglo incrementando un contador cuando v[i] == x.', ok: true, porque: 'Correcto: hay que mirar TODOS los elementos (no se puede parar antes): O(n) y Ω(n).' },
        { txt: 'Parar en cuanto se encuentre x.', ok: false, porque: 'Eso responde "¿está x?", no "cuántas veces".' },
        { txt: 'Ordenar y buscar el bloque de x.', ok: false, porque: 'Ordenar cuesta O(n log n): peor que el recorrido simple.' }
      ],
      codigo: 'static int contar(int[] v, int x) {\n  int c = 0;\n  for (int i = 0; i < v.length; i++) {\n    if (v[i] == x) {\n      c++;\n    }\n  }\n  return c;\n}',
      lineas: [
        L('c', 'int c = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('f', 'for (int i = 0; i < v.length; i++) {', 'int i = 0', 'i < v.length', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n' },
          [{ id: 'if', txt: 'if (v[i] == x) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'n', porque: 'Acceso + comparación: 2.', tag: 'cond', cuerpo: [L('cc', 'c++;', 2, 1, 'n', { porque: 'Suma + asignación: 2. Peor caso: todos son x.', tag: 'rama', vecesMejor: '0' })] }], { cond: 'n+1', upd: 'n', condCosto: 2, condExtra: { porque: 'v.length (1) + comparación (1) = 2. El .length se paga en cada evaluación.', alt: { prof: ['1'], hojas: ['1'] } } }),
        L('ret', 'return c;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      datos: { peor: (n) => Array(n).fill(5), mejor: (n) => Array(n).fill(0) }, casoTn: 'peor',
      Tn: { prof: '7 + 8n', hojas: '5 + 6n' }, TnMejor: { prof: '7 + 6n', hojas: '5 + 5n' }, bigO: 'n', omega: 'n',
      mejorPeor: 'El if depende de los datos, pero solo cambia 2 OE por vuelta (c++): peor caso (todos iguales a x) T = 7 + 8n, mejor caso (ninguno) T = 7 + 6n. El ORDEN no cambia: hay que recorrer siempre todo → O(n) = Ω(n).',
      pasos: [{ txt: 'Siempre n vueltas; el if solo añade c++ cuando v[i] == x:', tex: 'T_{peor} = 7 + 8n,\\quad T_{mejor} = 7 + 6n \\;\\Rightarrow\\; \\Theta(n)' }],
      ejecutar(n, C, datos) { const v = datos || Array(n).fill(5), x = 5; C.c('c'); let c = 0; C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i, c }); if (!(i < v.length)) break; C.c('if'); if (v[i] === x) { C.c('cc'); c++; } C.c('f.upd'); } C.c('ret'); return c; }
    })
  });

  /* ---------- B10 suma posiciones pares ---------- */
  reg({
    id: 'B10', tipo: 'B', titulo: 'Suma de las posiciones pares', fuente: 'Hoja 1 parte 2 #7',
    def: () => Object.assign(ADA.instancia(ADA.porId.C01, 0).metodos[1], {
      titulo: 'Suma de las posiciones pares',
      enunciado: 'Dado un arreglo de n enteros, calcule la suma de los elementos en las posiciones pares (0, 2, 4, …). Diseñe y analice.',
      cotaO: 'n',
      estrategias: [
        { txt: 'Un for que avance de 2 en 2 (i = 0, 2, 4, …) sumando v[i].', ok: true, porque: 'Correcto: ⌈n/2⌉ vueltas sin if → la versión suma2 del simulacro.' },
        { txt: 'Un for de 1 en 1 con if (i % 2 == 0).', ok: false, porque: 'Funciona y es O(n), pero da n vueltas y evalúa un if en cada una: es suma1, la menos eficiente.' },
        { txt: 'Sumar todo y dividir entre 2.', ok: false, porque: 'No tiene sentido: no da la suma de las posiciones pares.' }
      ],
      codigo: 'static int sumaPares(int[] v) {\n  int suma = 0;\n  for (int i = 0; i < v.length; i = i + 2) {\n    suma += v[i];\n  }\n  return suma;\n}',
      omega: 'n', sinCasos: true, mejorPeor: 'No hay mejor ni peor caso: siempre ⌈n/2⌉ vueltas. O(n) = Ω(n).'
    })
  });

  /* ---------- B11 suma matriz ---------- */
  reg({
    id: 'B11', tipo: 'B', titulo: 'Suma de todos los elementos de una matriz', fuente: 'Hoja 1 parte 2 #8',
    def: () => ({
      enunciado: 'Matriz n×n de enteros: calcule la suma de todos sus elementos. Diseñe y analice.',
      firma: 'static int sumaMatriz(int[][] A)', tamano: 'n = A.length', cotaO: 'n^2',
      estrategias: [
        { txt: 'Doble for (filas y columnas) acumulando A[i][j].', ok: true, porque: 'Correcto: hay n² elementos y todos hay que leerlos: O(n²) = Ω(n²).' },
        { txt: 'Un solo for de n vueltas sumando A[i][i].', ok: false, porque: 'Eso suma solo la diagonal.' },
        { txt: 'Sumar la primera fila y multiplicar por n.', ok: false, porque: 'Solo vale si todas las filas son iguales, que no se garantiza.' }
      ],
      codigo: 'static int sumaMatriz(int[][] A) {\n  int n = A.length;\n  int s = 0;\n  for (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n      s += A[i][j];\n    }\n  }\n  return s;\n}',
      lineas: [
        L('n', 'int n = A.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('fi', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          [FOR('fj', 'for (int j = 0; j < n; j++) {', 'int j = 0', 'j < n', 'j++', { tipo: 'for', var: 'j', desde: '0', hasta: 'n-1', t: 'n', total: 'n^2' }, [L('a', 's += A[i][j];', 3, 3, 'n^2', { porque: 'Acceso + suma + asignación = 3.', tag: 'acum' })], { init: 'n', cond: 'n^2+n', upd: 'n^2' })], { cond: 'n+1', upd: 'n' }),
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      Tn: { prof: '8 + 6n + 6n^2', hojas: '6 + 4n + 5n^2' }, bigO: 'n^2', omega: 'n^2', sinCasos: true,
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas totales del ciclo interno: $\\sum_{i=0}^{n-1}\\sum_{j=0}^{n-1} 1 = ?$', respuesta: 'n^2', ayuda: 'n vueltas del interno por cada una de las n del externo: n·n.' }
      ],
      mejorPeor: 'No hay mejor ni peor caso: siempre se leen las n² casillas. O(n²) = Ω(n²).',
      pasos: [{ txt: 'Interno n vueltas de costo 6; externo n vueltas de costo 1 + 2 + 6n + 1 + 2:', tex: 'T(n) = 4 + 1 + \\sum_{i=0}^{n-1}\\Big(6 + \\sum_{j=0}^{n-1} 6\\Big) = 8 + 6n + 6n^2 \\in O(n^2)' }],
      ejecutar(n, C) { const A = Array.from({ length: n }, () => Array(n).fill(1)); C.c('n'); C.c('s'); let s = 0; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i < n)) break; C.c('fj.init'); for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j < n)) break; C.c('a'); s += A[i][j]; C.c('fj.upd'); } C.c('fi.upd'); } C.c('ret'); return s; }
    })
  });

  /* ---------- B12 simétrica ---------- */
  reg({
    id: 'B12', tipo: 'B', titulo: '¿La matriz es simétrica?', fuente: 'Hoja 1 parte 2 #9',
    def: () => ({
      enunciado: 'Matriz n×n: determine si es simétrica (A[i][j] == A[j][i] para todo i, j). Diseñe y analice: peor caso, mejor caso, O y Ω.',
      firma: 'static boolean esSimetrica(int[][] A)', tamano: 'n = A.length', cotaO: 'n^2',
      estrategias: [
        { txt: 'Doble for con j > i comparando A[i][j] con A[j][i]; retornar false en cuanto difieran.', ok: true, porque: 'Correcto: solo la mitad superior (n(n−1)/2 pares) y salida temprana → O(n²), Ω(1).' },
        { txt: 'Doble for completo (todos los i, j) comparando A[i][j] con A[j][i].', ok: false, porque: 'Compara cada par dos veces y la diagonal consigo misma: el doble de trabajo (sigue siendo O(n²)).' },
        { txt: 'Comparar la primera fila con la primera columna.', ok: false, porque: 'Solo verifica una parte: puede dar true en matrices no simétricas.' }
      ],
      codigo: 'static boolean esSimetrica(int[][] A) {\n  int n = A.length;\n  for (int i = 0; i < n; i++) {\n    for (int j = i + 1; j < n; j++) {\n      if (A[i][j] != A[j][i]) {\n        return false;\n      }\n    }\n  }\n  return true;\n}',
      lineas: [
        L('n', 'int n = A.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        FOR('fi', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          [{ id: 'fj', txt: 'for (int j = i + 1; j < n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: 'i+1', hasta: 'n-1', t: 'n-1-i', total: 'n(n-1)/2', valores: 'j = i+1 … n−1 → n − 1 − i; total Σ = n(n−1)/2' },
            partes: [L('fj.init', 'int j = i + 1', 3, 2, 'n', { rol: 'init', porque: 'Declaración + asignación (2) + suma (1) = 3.', tag: 'decl', vecesMejor: '1', alt: { prof: ['2'], hojas: ['1'] } }), L('fj.cond', 'j < n', 1, 1, 'n(n-1)/2 + n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces', vecesMejor: '1' }), L('fj.upd', 'j++', 2, 1, 'n(n-1)/2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })],
            cuerpo: [{ id: 'if', txt: 'if (A[i][j] != A[j][i]) {', cierre: '}', costo: { prof: '3', hojas: '3' }, veces: 'n(n-1)/2', porque: '2 accesos + comparación = 3.', tag: 'cond', vecesMejor: 'min(1, n-1)',
              cuerpo: [L('rf', 'return false;', 1, 1, '0', { porque: 'return: 1. Peor caso (simétrica): nunca. Mejor caso: A[0][1] ≠ A[1][0] → en la primera comparación.', tag: 'ret', vecesMejor: 'min(1, n-1)' })] }] }],
          { cond: 'n+1', upd: 'n', condExtra: { vecesMejor: '1 + (1 - min(1, n-1))' }, updExtra: { vecesMejor: '1 - min(1, n-1)' } }),
        L('rt', 'return true;', 1, 1, 1, { porque: 'return: 1 (peor caso).', tag: 'ret', vecesMejor: '1 - min(1, n-1)' })
      ],
      datos: { peor: (n) => Array.from({ length: n }, () => Array(n).fill(1)), mejor: (n) => { const A = Array.from({ length: n }, () => Array(n).fill(1)); if (n > 1) A[0][1] = 9; return A; } }, casoTn: 'peor',
      Tn: { prof: '6 + 7n + 3n(n-1)', hojas: '5 + 5n + 5n(n-1)/2' }, TnMejor: { prof: '13', hojas: '11' }, bigO: 'n^2', omega: '1', nMin: 2,
      guia: [
        { tipo: 'expr', pregunta: 'Vueltas del interno para un i fijo: $t_i = ?$', respuesta: 'n-1-i', vars: ['i'], ayuda: '(n−1) − (i+1) + 1 = n − 1 − i.' },
        { tipo: 'expr', pregunta: 'Comparaciones totales en el peor caso: $\\sum_{i=0}^{n-1}(n-1-i) = ?$', respuesta: 'n(n-1)/2', ayuda: 'm = n−1−i → Σ_{m=0}^{n-1} m = n(n−1)/2.' }
      ],
      mejorPeor: 'Peor caso: la matriz ES simétrica → todas las n(n−1)/2 comparaciones → T = 5 + 7n + 3n(n−1) → O(n²). Mejor caso: A[0][1] ≠ A[1][0] → una comparación y return false → T = 13 → Ω(1).',
      pasos: [{ txt: 'Peor caso: interno n−1−i vueltas de costo 1 + 3 + 2 = 6; total Σ(n−1−i) = n(n−1)/2:', tex: 'T_{peor}(n) = 6 + 7n + 6\\cdot\\frac{n(n-1)}{2} = 6 + 7n + 3n(n-1) \\in O(n^2)' }, { txt: 'Mejor caso: A[0][1] ≠ A[1][0]:', tex: 'T_{mejor}(n) = 13 \\in \\Omega(1)' }],
      ejecutar(n, C, datos) { const A = datos || Array.from({ length: n }, () => Array(n).fill(1)); C.c('n'); C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i }); if (!(i < n)) break; C.c('fj.init'); for (let j = i + 1; ; j++) { C.c('fj.cond'); if (!(j < n)) break; C.c('if'); if (A[i][j] !== A[j][i]) { C.c('rf'); return false; } C.c('fj.upd'); } C.c('fi.upd'); } C.c('rt'); return true; }
    })
  });

  /* ---------- B13 / B14 diagonales ---------- */
  function diagonal(sec) {
    return {
      enunciado: sec ? 'Matriz n×n: calcule la suma de los elementos de la diagonal secundaria. Diseñe y analice.' : 'Matriz n×n: calcule la suma de los elementos de la diagonal principal. Diseñe y analice.',
      firma: sec ? 'static int diagSecundaria(int[][] A)' : 'static int diagPrincipal(int[][] A)', tamano: 'n = A.length', cotaO: 'n',
      estrategias: [
        { txt: sec ? 'Un for de i = 0 a n−1 sumando A[i][n−1−i].' : 'Un for de i = 0 a n−1 sumando A[i][i].', ok: true, porque: 'Correcto: la diagonal tiene n elementos y su posición se calcula con i → O(n).' },
        { txt: sec ? 'Doble for con if (i + j == n − 1).' : 'Doble for con if (i == j).', ok: false, porque: 'Recorre n² casillas para sumar n: O(n²).' },
        { txt: 'Sumar toda la matriz y dividir entre n.', ok: false, porque: 'No tiene relación con la diagonal.' }
      ],
      codigo: sec ? 'static int diagSecundaria(int[][] A) {\n  int n = A.length;\n  int s = 0;\n  for (int i = 0; i < n; i++) {\n    s += A[i][n - 1 - i];\n  }\n  return s;\n}' : 'static int diagPrincipal(int[][] A) {\n  int n = A.length;\n  int s = 0;\n  for (int i = 0; i < n; i++) {\n    s += A[i][i];\n  }\n  return s;\n}',
      lineas: [
        L('n', 'int n = A.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        L('s', 'int s = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('f', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n' },
          [sec ? L('a', 's += A[i][n - 1 - i];', 4, 5, 'n', { porque: 'Acceso + suma + índice + asignación = 4.', tag: 'indice', alt: { prof: ['5'], hojas: ['4'] } }) : L('a', 's += A[i][i];', 3, 3, 'n', { porque: 'Acceso + suma + asignación = 3.', tag: 'acum' })], { cond: 'n+1', upd: 'n' }),
        L('ret', 'return s;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      Tn: sec ? { prof: '8 + 7n', hojas: '6 + 7n' } : { prof: '8 + 6n', hojas: '6 + 5n' }, bigO: 'n', omega: 'n', sinCasos: true,
      mejorPeor: 'No hay mejor ni peor caso: siempre n vueltas sin condiciones. O(n) = Ω(n).',
      ejecutar(n, C) { const A = Array.from({ length: n }, () => Array(n).fill(1)); C.c('n'); C.c('s'); let s = 0; C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i, s }); if (!(i < n)) break; C.c('a'); s += sec ? A[i][n - 1 - i] : A[i][i]; C.c('f.upd'); } C.c('ret'); return s; }
    };
  }
  reg({ id: 'B13', tipo: 'B', titulo: 'Suma de la diagonal principal', fuente: 'Hoja 1 parte 2 #10', def: () => diagonal(false) });
  reg({ id: 'B14', tipo: 'B', titulo: 'Suma de la diagonal secundaria', fuente: 'Hoja 1 parte 2 #11', def: () => diagonal(true) });

  /* ---------- B15 invertir ---------- */
  reg({
    id: 'B15', tipo: 'B', titulo: 'Invertir un arreglo sobre sí mismo', fuente: 'Hoja 1 parte 2 #12',
    def: () => ({
      enunciado: 'Dado un arreglo de n enteros, inviértalo sobre sí mismo (sin arreglo auxiliar). Diseñe y analice.',
      firma: 'static void invertir(int[] v)', tamano: 'n = v.length', cotaO: 'n',
      estrategias: [
        { txt: 'Un for de i = 0 a n/2 − 1 intercambiando v[i] con v[n−1−i].', ok: true, porque: 'Correcto: ⌊n/2⌋ intercambios → O(n). Si se llegara hasta n−1 se volvería a des-invertir.' },
        { txt: 'Un for de i = 0 a n−1 intercambiando v[i] con v[n−1−i].', ok: false, porque: '¡Trampa! Al pasar de la mitad se vuelven a intercambiar y el arreglo queda igual que al principio.' },
        { txt: 'Copiar a un arreglo auxiliar al revés y volver a copiar.', ok: false, porque: 'Es O(n) pero usa memoria extra y 2n pasos; el enunciado pide "sobre sí mismo".' }
      ],
      codigo: 'static void invertir(int[] v) {\n  int n = v.length;\n  for (int i = 0; i < n / 2; i++) {\n    int aux = v[i];\n    v[i] = v[n - 1 - i];\n    v[n - 1 - i] = aux;\n  }\n}',
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        { id: 'f', txt: 'for (int i = 0; i < n / 2; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'floor(n/2)-1', t: 'floor(n/2)', invariante: 'i == n / 2', valores: 'i = 0 … ⌊n/2⌋ − 1' },
          partes: [L('f.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < n / 2', 2, 2, 'floor(n/2)+1', { rol: 'cond', porque: 'División + comparación: 2.', tag: 'condveces', alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'floor(n/2)', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })],
          cuerpo: [L('a1', 'int aux = v[i];', 3, 2, 'floor(n/2)', { porque: 'Declaración + asignación (2) + acceso (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }), L('a2', 'v[i] = v[n - 1 - i];', 4, 3, 'floor(n/2)', { porque: 'Acceso v[i] de escritura (1) + asignación (1) + acceso v[n−1−i] de lectura (1) + índice n−1−i (1) = 4. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo.', tag: 'indice', alt: { prof: ['3', '5'], hojas: ['2', '4'] } }), L('a3', 'v[n - 1 - i] = aux;', 3, 2, 'floor(n/2)', { porque: 'Acceso de escritura v[n−1−i] (1) + índice n−1−i (1) + asignación (1) = 3.', tag: 'asig', alt: { prof: ['2', '4'], hojas: ['1', '3'] } })] }
      ],
      Tn: { prof: '6 + 14floor(n/2)', hojas: '5 + 10floor(n/2)' }, bigO: 'n', omega: 'n', sinCasos: true,
      mejorPeor: 'No hay mejor ni peor caso: siempre ⌊n/2⌋ intercambios. O(n) = Ω(n).',
      pasos: [{ txt: '⌊n/2⌋ vueltas de costo 2 + 3 + 4 + 3 + 2 = 14:', tex: 'T(n) = 2 + 2 + 14\\lfloor n/2 \\rfloor + 2 = 6 + 14\\lfloor n/2\\rfloor \\approx 7n + 6 \\in O(n)' }],
      ejecutar(n, C) { const v = asc(n); C.c('n'); C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < idiv(n, 2))) break; C.c('a1'); const aux = v[i]; C.c('a2'); v[i] = v[n - 1 - i]; C.c('a3'); v[n - 1 - i] = aux; C.c('f.upd'); } }
    })
  });

  /* ---------- B16 ordenado ---------- */
  reg({
    id: 'B16', tipo: 'B', titulo: '¿Está ordenado ascendentemente?', fuente: 'Hoja 1 parte 2 #13',
    def: () => ({
      enunciado: 'Dado un arreglo de n enteros, determine si está ordenado ascendentemente. Diseñe y analice: peor caso, mejor caso, O y Ω.',
      firma: 'static boolean ordenado(int[] v)', tamano: 'n = v.length', cotaO: 'n',
      estrategias: [
        { txt: 'Un for comparando v[i] con v[i+1]; retornar false en cuanto v[i] > v[i+1].', ok: true, porque: 'Correcto: n − 1 comparaciones como máximo, salida temprana → O(n), Ω(1).' },
        { txt: 'Ordenar una copia y compararla con el original.', ok: false, porque: 'O(n log n) + memoria extra: mucho peor.' },
        { txt: 'Comparar el primero con el último.', ok: false, porque: 'No basta: 1, 9, 2, 10 no está ordenado y pasaría.' }
      ],
      codigo: 'static boolean ordenado(int[] v) {\n  int n = v.length;\n  for (int i = 0; i < n - 1; i++) {\n    if (v[i] > v[i + 1]) {\n      return false;\n    }\n  }\n  return true;\n}',
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        { id: 'f', txt: 'for (int i = 0; i < n - 1; i++) {', cierre: '}', ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-2', t: 'n-1', invariante: 'i == n - 1', valores: 'peor caso: i = 0 … n−2' },
          partes: [L('f.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('f.cond', 'i < n - 1', 2, 2, 'n', { rol: 'cond', porque: 'Resta + comparación: 2.', tag: 'condveces', vecesMejor: '1', alt: { prof: ['1'], hojas: ['1'] } }), L('f.upd', 'i++', 2, 1, 'n-1', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })],
          cuerpo: [{ id: 'if', txt: 'if (v[i] > v[i + 1]) {', cierre: '}', costo: { prof: '4', hojas: '4' }, veces: 'n-1', porque: '2 accesos + suma + comparación = 4.', tag: 'cond', vecesMejor: 'min(1, n-1)', alt: { prof: ['3'], hojas: ['3'] },
            cuerpo: [L('rf', 'return false;', 1, 1, '0', { porque: 'return: 1. Peor caso (ordenado): nunca. Mejor caso: v[0] > v[1].', tag: 'ret', vecesMejor: 'min(1, n-1)' })] }] },
        L('rt', 'return true;', 1, 1, 1, { porque: 'return: 1 (peor caso).', tag: 'ret', vecesMejor: '1 - min(1, n-1)' })
      ],
      datos: { peor: (n) => asc(n), mejor: (n) => { const v = asc(n); if (n > 1) v[0] = 99; return v; } }, casoTn: 'peor',
      Tn: { prof: '7 + 8(n-1)', hojas: '6 + 7(n-1)' }, TnMejor: { prof: '11', hojas: '10' }, bigO: 'n', omega: '1', nMin: 2,
      mejorPeor: 'Peor caso: el arreglo SÍ está ordenado → n − 1 comparaciones → T = 7 + 8(n−1) → O(n). Mejor caso: v[0] > v[1] → 1 comparación y return → T = 11 → Ω(1).',
      pasos: [{ txt: 'Peor caso: n − 1 vueltas de costo 2 + 4 + 2 = 8:', tex: 'T_{peor}(n) = 2 + 2 + 8(n-1) + 2 + 1 = 7 + 8(n-1) \\in O(n)' }, { txt: 'Mejor caso: falla en la primera comparación:', tex: 'T_{mejor}(n) = 2 + 2 + 2 + 4 + 1 = 11 \\in \\Omega(1)' }],
      ejecutar(n, C, datos) { const v = datos || asc(n); C.c('n'); C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < n - 1)) break; C.c('if'); if (v[i] > v[i + 1]) { C.c('rf'); return false; } C.c('f.upd'); } C.c('rt'); return true; }
    })
  });

  /* ---------- B17 faltante 0..n ---------- */
  reg({
    id: 'B17', tipo: 'B', titulo: 'Valor faltante en 0..n', fuente: 'Hoja 1 parte 2 #14',
    def: () => ({
      enunciado: 'Un arreglo de n posiciones contiene los enteros de 0 a n excepto uno, sin orden. Encuentre el faltante. Diseñe y analice.',
      firma: 'static int faltante0(int[] v)', tamano: 'n = v.length', cotaO: 'n',
      estrategias: [
        { txt: 'Sumar los elementos y restar de 0 + 1 + … + n = n(n+1)/2.', ok: true, porque: 'Correcto: un recorrido → O(n) = Ω(n).' },
        { txt: 'Para cada k de 0 a n buscarlo en el arreglo.', ok: false, porque: 'O(n²).' },
        { txt: 'Ordenar y buscar el hueco.', ok: false, porque: 'O(n log n).' }
      ],
      codigo: 'static int faltante0(int[] v) {\n  int n = v.length;\n  int suma = 0;\n  for (int i = 0; i < n; i++) {\n    suma += v[i];\n  }\n  return n * (n + 1) / 2 - suma;\n}',
      lineas: [
        L('n', 'int n = v.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        L('s', 'int suma = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('f', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n' }, [L('a', 'suma += v[i];', 3, 3, 'n', { porque: 'Acceso + suma + asignación = 3.', tag: 'acum' })], { cond: 'n+1', upd: 'n' }),
        L('ret', 'return n * (n + 1) / 2 - suma;', 4, 4, 1, { porque: '3 operaciones + resta + return (agrupado): 4. Acepto 3–5.', tag: 'ret', alt: { prof: ['3', '5', '1'], hojas: ['3', '5', '1'] } })
      ],
      Tn: { prof: '11 + 6n', hojas: '9 + 5n' }, bigO: 'n', omega: 'n', sinCasos: true,
      mejorPeor: 'No hay mejor ni peor caso: siempre se recorren los n elementos. O(n) = Ω(n).',
      ejecutar(n, C) { const v = asc(n).map((x) => x + 1); C.c('n'); C.c('s'); let suma = 0; C.c('f.init'); for (let i = 0; ; i++) { C.c('f.cond'); C.v({ i }); if (!(i < n)) break; C.c('a'); suma += v[i]; C.c('f.upd'); } C.c('ret'); return n * (n + 1) / 2 - suma; }
    })
  });

  /* ---------- B18 intersección ---------- */
  reg({
    id: 'B18', tipo: 'B', titulo: 'Intersección de dos arreglos', fuente: 'Hoja 1 parte 2 #15',
    def: () => ({
      enunciado: 'Dados dos arreglos A y B de n posiciones sin repetidos, construya un tercero con los valores comunes. Diseñe y analice: peor caso, mejor caso, O y Ω.',
      firma: 'static int[] interseccion(int[] A, int[] B)', tamano: 'n = A.length = B.length', cotaO: 'n^2',
      estrategias: [
        { txt: 'Para cada A[i], recorrer B buscándolo; si aparece, copiarlo al resultado y cortar la búsqueda (break).', ok: true, porque: 'Correcto para el parcial: O(n²) en el peor caso (sin comunes) y Ω(n) en el mejor (cada A[i] está en B[0]).' },
        { txt: 'Ordenar ambos y recorrerlos en paralelo.', ok: false, porque: 'Mejor (O(n log n)) pero requiere un algoritmo de ordenamiento; no es lo esperado aquí.' },
        { txt: 'Meter B en un conjunto (HashSet) y consultar cada A[i].', ok: false, porque: 'O(n) en promedio con librería; el curso pide analizar ciclos explícitos.' }
      ],
      codigo: 'static int[] interseccion(int[] A, int[] B) {\n  int n = A.length;\n  int[] C = new int[n];\n  int k = 0;\n  for (int i = 0; i < n; i++) {\n    for (int j = 0; j < n; j++) {\n      if (A[i] == B[j]) {\n        C[k] = A[i];\n        k++;\n        break;\n      }\n    }\n  }\n  return C;\n}',
      lineas: [
        L('n', 'int n = A.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
        L('C', 'int[] C = new int[n];', 'k', 'k', 1, { porque: 'new: k.', tag: 'k', alt: { prof: ['1+k', '2+k'], hojas: ['1+k'] } }),
        L('k', 'int k = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        FOR('fi', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n', invariante: 'i == n' },
          [{ id: 'fj', txt: 'for (int j = 0; j < n; j++) {', cierre: '}', ciclo: { tipo: 'for', var: 'j', desde: '0', hasta: 'n-1', t: 'n', total: 'n^2', valores: 'peor caso (sin comunes): n vueltas por cada i; mejor caso: 1 (break)' },
            partes: [L('fj.init', 'int j = 0', 2, 1, 'n', { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }), L('fj.cond', 'j < n', 1, 1, 'n^2+n', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces', vecesMejor: 'n' }), L('fj.upd', 'j++', 2, 1, 'n^2', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: '0' })],
            cuerpo: [{ id: 'if', txt: 'if (A[i] == B[j]) {', cierre: '}', costo: { prof: '3', hojas: '3' }, veces: 'n^2', porque: '2 accesos + comparación = 3.', tag: 'cond', vecesMejor: 'n',
              cuerpo: [L('c1', 'C[k] = A[i];', 3, 2, '0', { porque: 'Acceso C[k] de escritura (1) + asignación (1) + acceso A[i] de lectura (1) = 3. Peor caso (sin comunes): nunca. Cada acceso a un arreglo cuenta 1, también el del lado izquierdo.', tag: 'rama', vecesMejor: 'n' }), L('c2', 'k++;', 2, 1, '0', { porque: 'Suma + asignación: 2.', tag: 'upd', vecesMejor: 'n' }), L('br', 'break;', 1, 1, '0', { porque: 'break: 1 (salta al siguiente i).', tag: 'ret', vecesMejor: 'n' })] }] }],
          { cond: 'n+1', upd: 'n' }),
        L('ret', 'return C;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      datos: { peor: (n) => ({ A: asc(n), B: asc(n).map((x) => x + 1000) }), mejor: (n) => ({ A: Array(n).fill(7), B: Array(n).fill(7) }) }, casoTn: 'peor',
      Tn: { prof: '8 + k + 6n + 6n^2', hojas: '6 + k + 4n + 5n^2' }, TnMejor: { prof: '8 + k + 15n', hojas: '6 + k + 11n' }, bigO: 'n^2', omega: 'n',
      guia: [{ tipo: 'opcion', pregunta: '¿Cuál es el mejor caso y por qué el break importa?', opciones: [{ txt: 'Todos los A[i] coinciden con B[0]: el interno da 1 vuelta por cada i gracias al break → n comparaciones → Ω(n).', ok: true, porque: 'Correcto.' }, { txt: 'Arreglos vacíos.', ok: false, porque: 'n es el tamaño de la entrada; el mejor caso se define para un n dado.' }, { txt: 'No hay mejor caso porque siempre hay dos for.', ok: false, porque: 'El break corta el interno: sí depende de los datos.' }] }],
      mejorPeor: 'Peor caso: sin elementos comunes → el interno recorre todo B para cada A[i]: n² comparaciones → O(n²). Mejor caso: cada A[i] está en B[0] → el break corta tras 1 comparación: n comparaciones → Ω(n).',
      pasos: [{ txt: 'Peor caso: n² vueltas internas de costo 1 + 3 + 2 = 6; por cada i: 1 + 2 + 6n + 1 + 2:', tex: 'T_{peor}(n) = 8 + k + 6n + 6n^2 \\in O(n^2)' }, { txt: 'Mejor caso: interno 1 vuelta (cond 1 + if 3 + copia 3 + k++ 2 + break 1) por cada i:', tex: 'T_{mejor}(n) = 8 + k + 15n \\in \\Omega(n)' }],
      ejecutar(n, C, datos) { const d = datos || { A: asc(n), B: asc(n).map((x) => x + 1000) }; const A = d.A, B = d.B; C.c('n'); C.c('C'); const R = new Array(n); C.c('k'); let k = 0; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); C.v({ i, k }); if (!(i < n)) break; C.c('fj.init'); for (let j = 0; ; j++) { C.c('fj.cond'); if (!(j < n)) break; C.c('if'); if (A[i] === B[j]) { C.c('c1'); R[k] = A[i]; C.c('c2'); k++; C.c('br'); break; } C.c('fj.upd'); } C.c('fi.upd'); } C.c('ret'); return R; }
    })
  });

  /* ---------- B19 PoliDivisible ---------- */
  function poliDivisible(n) { let d = String(n).length; let x = n; while (x > 0) { if (x % d !== 0) return false; x = idiv(x, 10); d--; } return true; }
  function buscarPoli(d) { const ini = Math.pow(10, d - 1); for (let x = ini; x < ini * 10; x++) if (poliDivisible(x)) return x; return ini; }
  reg({
    id: 'B19', tipo: 'B', titulo: '¿Es PoliDivisible?', fuente: 'Hoja 1 parte 2 #16',
    def: () => ({
      enunciado: 'Un número es PoliDivisible si es divisible por su longitud y, al quitarle el último dígito, el que queda sigue siendo PoliDivisible (9816: 9816%4 = 0, 981%3 = 0, 98%2 = 0, 9%1 = 0). Diseñe el algoritmo (entrada long, salida boolean) y analice: peor caso, mejor caso, O y Ω en función del valor n.',
      firma: 'static boolean poliDivisible(long n)', tamano: 'el valor de n (d = número de dígitos ≈ log₁₀ n)', cotaO: 'log(n)',
      estrategias: [
        { txt: 'Calcular d = cantidad de dígitos; mientras n > 0: si n % d ≠ 0 retornar false; n /= 10; d−−. Al final true.', ok: true, porque: 'Correcto: d = ⌊log₁₀ n⌋ + 1 vueltas como máximo → O(log n), Ω(1).' },
        { txt: 'Convertir a String y probar todos los prefijos con Long.parseLong.', ok: false, porque: 'Funciona pero cada parseLong recorre el prefijo: O(d²) y depende de librería.' },
        { txt: 'Probar si n es divisible por 1, 2, 3, … d.', ok: false, porque: 'No es la definición: cada prefijo debe ser divisible por SU longitud.' }
      ],
      codigo: 'static boolean poliDivisible(long n) {\n  int d = String.valueOf(n).length();\n  while (n > 0) {\n    if (n % d != 0) {\n      return false;\n    }\n    n = n / 10;\n    d--;\n  }\n  return true;\n}',
      lineas: [
        L('d', 'int d = String.valueOf(n).length();', '1+k', '1+k', 1, { porque: 'Librería String.valueOf (k) + .length() (1) = k+1. (El .length SÍ se cuenta.)', tag: 'k', alt: { prof: ['2+k', 'k'], hojas: ['2+k', 'k'] } }),
        { id: 'w', txt: 'while (n > 0) {', cierre: '}', ciclo: { tipo: 'while', var: 'r', desde: '1', hasta: 'floor(log10(n))+1', t: 'floor(log10(n))+1', tol: 1, invariante: 'n == 0', valores: 'peor caso: d vueltas (una por dígito); mejor: 1' },
          partes: [L('w.cond', 'n > 0', 1, 1, 'floor(log10(n))+2', { rol: 'cond', porque: 'Comparación: 1.', tag: 'condveces', vecesMejor: '2 - min(1, floor(log10(n)))', tol: 1 })],
          cuerpo: [
            { id: 'if', txt: 'if (n % d != 0) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'floor(log10(n))+1', porque: 'Módulo + comparación: 2.', tag: 'cond', vecesMejor: '1', tol: 1,
              cuerpo: [L('rf', 'return false;', 1, 1, '0', { porque: 'return: 1. Peor caso (es PoliDivisible): nunca. Mejor caso: el primer residuo no es 0.', tag: 'ret', vecesMejor: 'min(1, floor(log10(n)))' })] },
            L('n10', 'n = n / 10;', 2, 2, 'floor(log10(n))+1', { porque: 'División + asignación: 2.', tag: 'upd', vecesMejor: '1 - min(1, floor(log10(n)))', tol: 1 }),
            L('dd', 'd--;', 2, 1, 'floor(log10(n))+1', { porque: 'Resta + asignación: 2.', tag: 'upd', vecesMejor: '1 - min(1, floor(log10(n)))', tol: 1 })
          ] },
        L('rt', 'return true;', 1, 1, 1, { porque: 'return: 1 (peor caso).', tag: 'ret', vecesMejor: '1 - min(1, floor(log10(n)))' })
      ],
      datos: { peor: (n) => buscarPoli(String(n).length), mejor: (n) => { const d = String(n).length; return d === 1 ? n : Math.pow(10, d - 1) + 1; } }, casoTn: 'peor', nMin: 10,
      Tn: { prof: '3 + k + 7(floor(log10(n))+1)', hojas: '3 + k + 6(floor(log10(n))+1)' }, TnMejor: { prof: '5 + k', hojas: '5 + k' }, TnAprox: true, bigO: 'log(n)', omega: '1',
      mejorPeor: 'Peor caso: el número ES PoliDivisible → una vuelta por dígito: d = ⌊log₁₀ n⌋ + 1 → T = 3 + k + 7d → O(log n). Mejor caso: n % d ≠ 0 en la primera vuelta → T = 5 + k → Ω(1). (Con d = 1 siempre pasa: el mejor caso real necesita d ≥ 2.)',
      pasos: [{ txt: 'Peor caso: d = ⌊log₁₀ n⌋ + 1 vueltas de costo 1 + 2 + 2 + 2 = 7:', tex: 'T_{peor}(n) = (k+1) + 1 + 7d + 1 = 3 + k + 7(\\lfloor\\log_{10} n\\rfloor + 1) \\in O(\\log n)' }, { txt: 'Mejor caso: el primer residuo no es 0:', tex: 'T_{mejor}(n) = (k+1) + 1 + 2 + 1 = 5 + k \\in \\Omega(1)' }],
      ejecutar(n, C, datos) { let x = datos != null ? datos : buscarPoli(String(n).length); C.c('d'); let d = String(x).length; for (;;) { C.c('w.cond'); C.v({ n: x, d }); if (!(x > 0)) break; C.c('if'); if (x % d !== 0) { C.c('rf'); return false; } C.c('n10'); x = idiv(x, 10); C.c('dd'); d--; } C.c('rt'); return true; }
    })
  });

  /* ---------- Tipo C ---------- */
  reg({
    id: 'C05', tipo: 'C', titulo: 'x^n iterativo vs exponenciación binaria', fuente: 'Hoja 1 parte 2 #4',
    def: () => ({
      enunciado: 'Ambos calculan xⁿ. Analice los dos (peor caso para la binaria: n = 2^k − 1, todos los bits en 1) y argumente cuál es más eficiente contando multiplicaciones e iteraciones.',
      metodos: [potIter(), potBin()], nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'La binaria hace ⌊log₂ n⌋ + 1 vueltas (≈ 2 multiplicaciones cada una) frente a n multiplicaciones: para n = 1000, 10 vueltas frente a 1000. O(log n) frente a O(n).', ok: true, porque: 'Correcto: dividir el exponente entre 2 en cada paso da logaritmo.' },
        { txt: 'Son iguales: ambas multiplican.', ok: false, porque: 'La iterativa multiplica n veces; la binaria ≈ 2 log₂ n.' },
        { txt: 'La iterativa es mejor porque no usa if.', ok: false, porque: 'El if cuesta 2 OE por vuelta, pero hay 100 veces menos vueltas para n = 1000.' }
      ]
    })
  });
  reg({
    id: 'C06', tipo: 'C', titulo: 'Faltante: búsqueda (n²) vs suma (n)', fuente: 'Hoja 1 parte 2 #14',
    def: () => ({
      enunciado: 'Dos formas de hallar el faltante en 0..n: buscar cada valor k en el arreglo, o usar la suma de Gauss. Analice ambas (peor caso de la búsqueda: el faltante es n, el último) y argumente.',
      metodos: [
        {
          titulo: 'faltanteBusqueda (doble for)', firma: 'static int faltanteBusqueda(int[] v)', tamano: 'n = v.length', iteraciones: 'n(n+1)', casoTn: 'peor',
          datos: { peor: (n) => asc(n) },
          lineas: [
            L('n', 'int n = v.length;', 2, 2, 1, { porque: '.length (1) + inicializar n (1) = 2. El profe SÍ cuenta el .length.', tag: 'decl' }),
            FOR('fk', 'for (int k = 0; k <= n; k++) {', 'int k = 0', 'k <= n', 'k++', { tipo: 'for', var: 'k', desde: '0', hasta: 'n', t: 'n+1', total: 'n+1', invariante: 'k == n + 1' },
              [L('e', 'boolean esta = false;', 2, 1, 'n+1', { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
                FOR('fi', 'for (int i = 0; i < n; i++) {', 'int i = 0', 'i < n', 'i++', { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', total: 'n(n+1)' }, [{ id: 'if', txt: 'if (v[i] == k) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'n(n+1)', porque: 'Acceso + comparación: 2.', tag: 'cond', cuerpo: [L('t', 'esta = true;', 1, 1, 'n', { porque: 'Asignación: 1. Una vez por cada k que sí está: n.', tag: 'rama' })] }], { init: 'n+1', cond: 'n(n+1) + n + 1', upd: 'n(n+1)' }),
                { id: 'if2', txt: 'if (!esta) {', cierre: '}', costo: { prof: '1', hojas: '1' }, veces: 'n+1', porque: 'Negación/comparación: 1.', tag: 'if', cuerpo: [L('r', 'return k;', 1, 1, '1', { porque: 'return: 1 (cuando k es el faltante).', tag: 'ret' })] }],
              { cond: 'n+1', upd: 'n', condExtra: { porqueVeces: 'Peor caso: el faltante es n; k recorre 0..n (n + 1 vueltas) y en la última retorna: n + 1 evaluaciones.' } }),
            L('ret', 'return -1;', 1, 1, 0, { porque: 'No se llega (siempre falta uno).', tag: 'noejec' })
          ],
          invariante: 'k == n + 1', invAlt: ['k = n+1'],
          Tn: { prof: '12 + 10n + 5n(n+1)', hojas: '9 + 7n + 4n(n+1)' }, bigO: 'n^2',
          pasos: [{ txt: 'n + 1 valores de k, cada uno con n comparaciones:', tex: 'T_1(n) = 12 + 10n + 5n(n+1) \\in O(n^2)' }],
          ejecutar(n, C, datos) { const v = datos || asc(n); C.c('n'); C.c('fk.init'); for (let k = 0; ; k++) { C.c('fk.cond'); C.v({ k }); if (!(k <= n)) break; C.c('e'); let esta = false; C.c('fi.init'); for (let i = 0; ; i++) { C.c('fi.cond'); if (!(i < n)) break; C.c('if'); if (v[i] === k) { C.c('t'); esta = true; } C.c('fi.upd'); } C.c('if2'); if (!esta) { C.c('r'); return k; } C.c('fk.upd'); } C.c('ret'); return -1; }
        },
        Object.assign(ADA.instancia(ADA.porId.B17, 0), { titulo: 'faltanteSuma (Gauss)', iteraciones: 'n' })
      ],
      nTabla: [10, 100, 1000], masEficiente: 1,
      opciones: [
        { txt: 'La suma hace n vueltas (una lectura por elemento) frente a las n(n+1) comparaciones de la búsqueda: O(n) frente a O(n²). Para n = 100: 610 OE frente a ~51 500.', ok: true, porque: 'Correcto: la fórmula de Gauss ahorra las búsquedas.' },
        { txt: 'La búsqueda es mejor porque puede terminar antes si el faltante es pequeño.', ok: false, porque: 'En el mejor caso sí (k = 0 → n comparaciones), pero el análisis pedido es el peor caso, y aun en promedio es O(n²).' },
        { txt: 'Son iguales porque ambas recorren el arreglo.', ok: false, porque: 'La búsqueda lo recorre n + 1 veces; la suma, una.' }
      ]
    })
  });
})();
