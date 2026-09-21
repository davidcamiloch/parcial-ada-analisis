/* data/f1.js – Fase 1: Contador de OE (tipo A simple) y comparaciones (tipo C).
   Cada ejercicio: def(p) devuelve {lineas, Tn, bigO, invariante, ejecutar(n, C), pistas, ...}.
   ejecutar es la versión instrumentada: C.c('id') cuenta una ejecución de esa línea/parte.
   Formato de línea: L(id, texto, costoProfesor, costoHojas, veces, {porque, tag, alt:{prof:[...]}}) */
(function () {
  'use strict';
  const L = ADA.L;
  const idiv = (a, b) => Math.trunc(a / b);

  /* ======================= A01: plantilla Excel ======================= */
  ADA.registrar({
    id: 'A01', fase: 1, tipo: 'A', titulo: 'creating_Integer_Array (plantilla Excel)', fuente: 'Plantilla del profe (Excel)',
    variantes: [{}],
    def: () => ({
      enunciado: 'Es el ejemplo resuelto en la plantilla del profesor. Suponga n > 0. Calcule el costo de cada OE, cuántas veces se ejecuta cada línea, el T(n), la invariante y el Big-O. Deje k como constante para las llamadas de librería.',
      firma: 'private static Integer[] creating_Integer_Array(int n)',
      tamano: 'n = tamaño del arreglo a crear',
      lineas: [
        L('if', 'if (n <= 0)', 1, 1, 1, { porque: 'Es una comparación: 1.', tag: 'if' }),
        L('throw', '    throw new RuntimeException("illegal value creating a array");', 'k', 'k', 0, { porque: 'Costaría k (constante de librería), pero como n > 0 NO se ejecuta: 0 veces. No entra al T(n).', porqueVeces: 'Como n > 0, la condición del if es falsa y esta línea nunca corre.', tag: 'noejec', alt: { prof: ['1', '2'], hojas: ['1'] } }),
        L('new', 'Integer v[] = new Integer[n];', 'k', 'k', 1, { porque: 'Crear un arreglo con new es una llamada de librería: k. (El profe la cuenta como k, no como 2+k.)', tag: 'k', alt: { prof: ['1+k', '2+k'], hojas: ['1+k', '2+k'] } }),
        L('i', 'int i = 0;', 2, 1, 1, { porque: 'Declaración + asignación = 2 (convención del profe). En las hojas resumen vale 1.', tag: 'decl' }),
        {
          id: 'while', txt: 'while (i < n) {', cierre: '}',
          ciclo: { tipo: 'while', var: 'i', desde: '1', hasta: 'n', t: 'n', invariante: 'i == n', valores: 'i = 0, 1, 2, …, n−1 (dentro); sale con i = n' },
          partes: [L('while.cond', 'i < n', 1, 1, 'n+1', { rol: 'cond', porque: 'La comparación cuesta 1.', porqueVeces: 'El cuerpo corre n veces (i = 0..n−1) y la condición se evalúa una vez más para salir: n + 1.', tag: 'condveces' })],
          cuerpo: [
            L('cuerpo', 'v[i++] = new Random().nextInt(n);', '2+k', '3+k', 'n', { porque: 'El profe lo cuenta como 2 + k: acceso/asignación en v[…] (2) más la llamada de librería (k). El i++ va incluido en ese 2.', tag: 'k', alt: { prof: ['3+k', '4+k'], hojas: ['2+k', '4+k'] } })
          ]
        },
        L('ret', 'return v;', 1, 1, 1, { porque: 'return cuesta 1.', tag: 'ret' })
      ],
      invariante: 'i == n',
      invAlt: ['i = n', 'i==n', 'i>=n', 'i >= n'],
      Tn: { prof: '5 + k + n(3+k)', hojas: '4 + k + n(4+k)' },
      bigO: 'n',
      pistas: [
        'Solo cuentan las instrucciones que SÍ se ejecutan (n > 0 ⇒ el throw no corre). Lo que usa new o librería vale k.',
        'T(n) = 1 + k + 2 + 1 + Σ_{i=1}^{n}(2 + k + 1) + 1. El "+1" final es la evaluación falsa de i < n.'
      ],
      ejecutar(n, C) {
        C.c('if');
        if (n <= 0) { C.c('throw'); return; }
        C.c('new'); C.c('i');
        let i = 0;
        for (;;) { C.c('while.cond'); C.v({ i }); if (!(i < n)) break; C.c('cuerpo'); i++; }
        C.c('ret');
      }
    })
  });

  /* ======================= A02: sonIgualesD ======================= */
  ADA.registrar({
    id: 'A02', fase: 1, tipo: 'A', titulo: 'sonIgualesD (simulacro, solución oficial)', fuente: 'Simulacro P3',
    variantes: [{ salto: 1 }, { salto: 2 }],
    def: (p) => {
      const m = p.salto || 1;
      const t = m === 1 ? 'n' : 'ceil(n/' + m + ')';
      const upd = m === 1 ? 'i++' : 'i += ' + m;
      return {
        enunciado: (m === 1 ? 'Es la solución oficial del punto 3 del simulacro. ' : 'VARIANTE: el ciclo avanza de ' + m + ' en ' + m + ' (ya no compara todas las diagonales, pero el análisis es el mismo). ') + 'Halle el costo de cada OE, las veces, el T(n), la invariante y el Big-O.',
        firma: 'static boolean sonIgualesD(int A[][])',
        tamano: 'n = A.length (matriz n×n)',
        lineas: [
          L('n', 'int n = A.length;', 2, 2, 1, { porque: 'Obtener el tamaño + inicializar: 2.', tag: 'decl' }),
          L('sp', 'int sumaPrincipal = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
          L('ss', 'int sumaSecundaria = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
          {
            id: 'for', txt: 'for (int i = 0; i < n; ' + upd + ') {', cierre: '}',
            ciclo: { tipo: 'for', var: m === 1 ? 'i' : 'r', desde: m === 1 ? '0' : '1', hasta: m === 1 ? 'n-1' : t, t, invariante: m === 1 ? 'i == n' : 'i >= n', valores: m === 1 ? 'i = 0, 1, 2, …, n−1' : 'i = 0, ' + m + ', ' + 2 * m + ', … (< n)' },
            partes: [
              L('for.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación (int i = 0): 2. Solo una vez.', tag: 'decl' }),
              L('for.cond', 'i < n', 1, 1, t + '+1', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Se evalúa ' + t + ' veces verdadera + 1 vez falsa para salir: ' + t + ' + 1.', tag: 'condveces' }),
              L('for.upd', upd, 2, 1, t, { rol: 'upd', porque: 'Incremento = suma + asignación: 2 (el profe lo cuenta así). Corre tantas veces como el cuerpo.', tag: 'upd' })
            ],
            cuerpo: [
              L('c1', 'sumaPrincipal += A[i][i];', 3, 3, t, { porque: 'Acceso a A[i][i] (1) + suma (1) + asignación (1) = 3.', tag: 'acum' }),
              L('c2', 'sumaSecundaria += A[i][n - i - 1];', 4, 5, t, { porque: 'Acceso (1) + suma (1) + operación del índice n−i−1 (1, el profe la agrupa) + asignación (1) = 4. Contar n−i−1 como 2 operaciones (total 5) también es aceptable.', tag: 'indice', alt: { prof: ['5'], hojas: ['4'] } })
            ]
          },
          L('ret', 'return sumaPrincipal == sumaSecundaria;', 1, 1, 1, { porque: 'La comparación del return: 1.', tag: 'ret' })
        ],
        invariante: m === 1 ? 'i == n' : 'i >= n',
        invAlt: m === 1 ? ['i = n', 'i>=n', 'i >= n'] : ['i>=n', 'i == n'],
        Tn: m === 1 ? { prof: '10n + 10', hojas: '10n + 7' } : { prof: '10 + 10ceil(n/2)', hojas: '7 + 10ceil(n/2)' },
        bigO: 'n',
        pistas: [
          'Cada línea del cuerpo se ejecuta tantas veces como vueltas da el ciclo (' + t + '); la condición una vez más.',
          'T(n) = 9 + Σ_{i=0}^{n-1}(1 + 2 + 3 + 4) + 1. Aplica Σ c = c·(b − a + 1).'
        ],
        ejecutar(n, C) {
          const A = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r * 7 + c * 3) % 5));
          C.c('n'); C.c('sp'); C.c('ss');
          const N = A.length; let sP = 0, sS = 0;
          C.c('for.init');
          for (let i = 0; ; i += m) {
            C.c('for.cond'); C.v({ i, sumaPrincipal: sP, sumaSecundaria: sS });
            if (!(i < N)) break;
            C.c('c1'); sP += A[i][i];
            C.c('c2'); sS += A[i][N - i - 1];
            C.c('for.upd');
          }
          C.c('ret');
          return sP === sS;
        }
      };
    }
  });

  /* ======================= A03 / A04: aSaber ======================= */
  function aSaber(p) {
    const m = p.salto;
    const t = m === 1 ? 'n' : 'ceil(n/' + m + ')';
    const updTxt = p.forma === 'menos' ? 'i -= ' + m + ';' : 'i = i - ' + m + ';';
    return {
      enunciado: (m === 1 ? 'Hoja 1, punto 16, traducido a Java. ' : m === 2 ? 'Hoja 1, punto 17: igual que el 16 pero el índice baja de 2 en 2. ' : 'VARIANTE: el índice baja de ' + m + ' en ' + m + '. ') + 'n = tamaño del vector. Halle costo por línea, veces, T(n), invariante y Big-O.',
      firma: 'static int aSaber(int[] v, int n)',
      tamano: 'n = tamaño del vector',
      lineas: [
        L('r', 'int result = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        L('i', 'int i = n - 1;', 3, 2, 1, { porque: 'Declaración + asignación (2) + la resta n − 1 (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1'] } }),
        {
          id: 'while', txt: 'while (i >= 0) {', cierre: '}',
          ciclo: { tipo: 'while', var: 'i', desde: '1', hasta: t, t, invariante: 'i < 0', valores: m === 1 ? 'i = n−1, n−2, …, 0; sale con i = −1' : 'i = n−1, n−' + (1 + m) + ', … ≥ 0; sale con i < 0' },
          partes: [L('while.cond', 'i >= 0', 1, 1, t + '+1', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: 'Vueltas: ' + (m === 1 ? 'i toma n valores (n−1 … 0)' : 'i toma los valores n−1, n−' + (1 + m) + ', … mientras sea ≥ 0. Con la fórmula (decremento, >=): ⌊(inicio − límite)/m⌋ + 1 = ⌊(n−1)/' + m + '⌋ + 1, que es lo mismo que ⌈n/' + m + '⌉ (prueba n = 5 y n = 6). Cualquiera de las dos formas vale') + '. La condición se evalúa una vez más: ' + t + ' + 1.', tag: 'condveces' })],
          cuerpo: [
            L('acum', 'result = result + v[i];', 3, 3, t, { porque: 'Acceso v[i] (1) + suma (1) + asignación (1) = 3.', tag: 'acum' }),
            L('upd', updTxt, 2, 2, t, { porque: 'Resta + asignación: 2.', tag: 'upd' })
          ]
        },
        L('ret', 'return result;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i < 0',
      invAlt: ['i<0', 'i == -1', 'i = -1', 'i<=-1', '!(i>=0)'],
      Tn: m === 1 ? { prof: '7 + 6n', hojas: '5 + 6n' } : { prof: '7 + 6ceil(n/' + m + ')', hojas: '5 + 6ceil(n/' + m + ')' },
      bigO: 'n',
      pistas: [
        m === 1 ? 'i empieza en n−1 y baja de 1 en 1 hasta 0: son n valores.' : 'Escribe los valores de i para n = 5 y n = 6: cuenta cuántos son. Fórmula: ⌈(inicio − límite + 1)/m⌉ = ⌈n/' + m + '⌉.',
        'T(n) = 2 + 3 + Σ_{r=1}^{' + t + '}(1 + 3 + 2) + 1 + 1.'
      ],
      ejecutar(n, C) {
        const v = Array.from({ length: n }, (_, i) => i % 4);
        C.c('r'); C.c('i');
        let result = 0, i = n - 1;
        for (;;) { C.c('while.cond'); C.v({ i, result }); if (!(i >= 0)) break; C.c('acum'); result += v[i]; C.c('upd'); i -= m; }
        C.c('ret');
        return result;
      }
    };
  }
  ADA.registrar({ id: 'A03', fase: 1, tipo: 'A', titulo: 'aSaber con i = i − 1', fuente: 'Hoja 1 #16', variantes: [{ salto: 1 }, { salto: 3, forma: 'menos' }], def: aSaber });
  ADA.registrar({ id: 'A04', fase: 1, tipo: 'A', titulo: 'aSaber con i = i − 2', fuente: 'Hoja 1 #17', variantes: [{ salto: 2 }, { salto: 4, forma: 'menos' }], def: aSaber });

  /* ======================= A05: max ======================= */
  ADA.registrar({
    id: 'A05', fase: 1, tipo: 'A', titulo: 'max(x, y)', fuente: 'Hoja 1 #15',
    variantes: [{}],
    def: () => ({
      enunciado: 'Hoja 1, punto 15. No hay ciclos: el costo no depende de n. Cuente las OE (recuerde que en un if/else solo corre UNA rama) y dé T(n) y Big-O. ¿Hay mejor y peor caso?',
      firma: 'static int max(int x, int y)',
      tamano: 'no depende de n (entrada de tamaño fijo)',
      lineas: [
        L('decl', 'int result;', 1, 1, 1, { porque: 'Declaración sin asignación: 1.', tag: 'decl', alt: { prof: ['0'], hojas: ['0'] } }),
        { id: 'if', txt: 'if (x >= y) {', cierre: '} else {', costo: { prof: '1', hojas: '1' }, veces: '1', porque: 'Comparación: 1.', tag: 'if',
          cuerpo: [L('rx', 'result = x;', 1, 1, 1, { porque: 'Asignación: 1.', porqueVeces: 'Analizamos el caso x ≥ y: esta rama corre 1 vez.', tag: 'rama' })] },
        { id: 'else', txt: '', cierre: '}', cuerpo: [L('ry', 'result = y;', 1, 1, 0, { porque: 'Asignación: 1 (pero en el caso x ≥ y no corre).', porqueVeces: 'Solo corre UNA rama del if/else. Como contamos el caso x ≥ y, esta rama corre 0 veces. Si fuera el otro caso, el total es el mismo (1 + 1).', tag: 'rama' })] },
        L('ret', 'return result;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      sinCiclo: true,
      Tn: { prof: '4', hojas: '4' },
      bigO: '1',
      pistas: ['No hay ciclos. Suma las OE de la única ruta que se ejecuta.', 'Declaración (1) + if (1) + una asignación (1) + return (1).'],
      mejorPeor: 'No hay mejor ni peor caso: las dos ramas cuestan lo mismo (1). T = 4 siempre → O(1) = Ω(1) = Θ(1).',
      ejecutar(n, C) {
        const x = 5, y = 2; let result;
        C.c('decl'); C.c('if');
        if (x >= y) { C.c('rx'); result = x; } else { C.c('ry'); result = y; }
        C.c('ret'); return result;
      }
    })
  });

  /* ======================= A06: intercambia ======================= */
  ADA.registrar({
    id: 'A06', fase: 1, tipo: 'A', titulo: 'intercambia(v, i, j)', fuente: 'Hoja 1 #14 / #18',
    variantes: [{}],
    def: () => ({
      enunciado: 'Hoja 1, punto 14 (en Java no hay REF, así que se intercambian dos posiciones de un arreglo). Cuente las OE y dé T(n) y Big-O. La Hoja 1 (#18) lo usa como "función de costo O(1)".',
      firma: 'static void intercambia(int[] v, int i, int j)',
      tamano: 'no depende de n',
      lineas: [
        L('aux', 'int aux = v[i];', 3, 2, 1, { porque: 'Declaración + asignación (2) + acceso v[i] (1) = 3.', tag: 'decl', alt: { prof: ['2'], hojas: ['1', '3'] } }),
        L('a1', 'v[i] = v[j];', 2, 2, 1, { porque: 'Acceso v[j] (1) + asignación en v[i] (1) = 2.', tag: 'asig', alt: { prof: ['3'], hojas: ['1', '3'] } }),
        L('a2', 'v[j] = aux;', 2, 1, 1, { porque: 'Asignación en v[j]: acceso (1) + asignación (1) = 2.', tag: 'asig', alt: { prof: ['1'], hojas: ['2'] } })
      ],
      sinCiclo: true,
      Tn: { prof: '7', hojas: '5' },
      bigO: '1',
      pistas: ['Tres asignaciones con accesos a arreglo; nada depende de n.', '3 + 2 + 2 = 7 → constante → O(1).'],
      mejorPeor: 'No hay mejor ni peor caso: siempre se ejecutan las mismas 3 instrucciones. O(1) = Ω(1).',
      ejecutar(n, C) {
        const v = [4, 9, 1]; const i = 0, j = 2;
        C.c('aux'); const aux = v[i]; C.c('a1'); v[i] = v[j]; C.c('a2'); v[j] = aux;
      }
    })
  });

  /* ======================= C01: suma1 vs suma2 ======================= */
  function suma1(p) {
    return {
      titulo: 'suma1 (con if i % 2)',
      firma: 'public static int suma1(int[] v)',
      tamano: 'n = v.length',
      lineas: [
        L('s', 'int suma = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        {
          id: 'for', txt: 'for (int i = 0; i < v.length; i++) {', cierre: '}',
          ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'n-1', t: 'n', invariante: 'i == n', valores: 'i = 0, 1, 2, …, n−1' },
          partes: [
            L('for.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            L('for.cond', 'i < v.length', 1, 1, 'n+1', { rol: 'cond', porque: 'Comparación: 1 (v.length es un acceso a campo; el profe no lo cobra aparte).', porqueVeces: 'n vueltas + 1 evaluación falsa.', tag: 'condveces', alt: { prof: ['2'], hojas: ['2'] } }),
            L('for.upd', 'i++', 2, 1, 'n', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })
          ],
          cuerpo: [
            { id: 'if', txt: 'if (i % 2 == 0) {', cierre: '}', costo: { prof: '2', hojas: '2' }, veces: 'n', porque: 'Módulo (1) + comparación (1) = 2. Se evalúa en TODAS las vueltas.', tag: 'cond', alt: { prof: ['1'], hojas: ['1'] },
              cuerpo: [L('acum', 'suma += v[i];', 3, 3, 'ceil(n/2)', { porque: 'Acceso (1) + suma (1) + asignación (1) = 3.', porqueVeces: 'Solo entra cuando i es par: i = 0, 2, 4, … < n → ⌈n/2⌉ veces (n=5: 0,2,4 → 3; n=6: 0,2,4 → 3).', tag: 'vecesif' })] }
          ]
        },
        L('ret', 'return suma;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i == n', invAlt: ['i = n', 'i>=n', 'i >= n', 'i == v.length', 'i = v.length'],
      Tn: { prof: '6 + 5n + 3ceil(n/2)', hojas: '4 + 4n + 3ceil(n/2)' },
      bigO: 'n',
      iteraciones: 'n',
      pistas: ['El if se evalúa n veces, pero su cuerpo solo ⌈n/2⌉ (posiciones pares).', 'T(n) = 2 + 2 + 1 + 1 + Σ_{i=0}^{n-1}(1 + 2 + 2) + Σ_{r=1}^{⌈n/2⌉} 3.'],
      ejecutar(n, C) {
        const v = Array.from({ length: n }, (_, i) => i + 1);
        C.c('s'); let suma = 0; C.c('for.init');
        for (let i = 0; ; i++) {
          C.c('for.cond'); C.v({ i, suma }); if (!(i < v.length)) break;
          C.c('if'); if (i % 2 === 0) { C.c('acum'); suma += v[i]; }
          C.c('for.upd');
        }
        C.c('ret'); return suma;
      }
    };
  }
  function suma2(p) {
    return {
      titulo: 'suma2 (con i = i + 2)',
      firma: 'public static int suma2(int[] v)',
      tamano: 'n = v.length',
      lineas: [
        L('s', 'int suma = 0;', 2, 1, 1, { porque: 'Declaración + asignación: 2.', tag: 'decl' }),
        {
          id: 'for', txt: 'for (int i = 0; i < v.length; i = i + 2) {', cierre: '}',
          ciclo: { tipo: 'for', var: 'i', desde: '0', hasta: 'ceil(n/2)-1', t: 'ceil(n/2)', invariante: 'i >= n', valores: 'i = 0, 2, 4, … (< n)' },
          partes: [
            L('for.init', 'int i = 0', 2, 1, 1, { rol: 'init', porque: 'Declaración + asignación: 2.', tag: 'decl' }),
            L('for.cond', 'i < v.length', 1, 1, 'ceil(n/2)+1', { rol: 'cond', porque: 'Comparación: 1.', porqueVeces: '⌈n/2⌉ vueltas + 1 evaluación falsa.', tag: 'condveces', alt: { prof: ['2'], hojas: ['2'] } }),
            L('for.upd', 'i = i + 2', 2, 2, 'ceil(n/2)', { rol: 'upd', porque: 'Suma + asignación: 2.', tag: 'upd' })
          ],
          cuerpo: [L('acum', 'suma += v[i];', 3, 3, 'ceil(n/2)', { porque: 'Acceso (1) + suma (1) + asignación (1) = 3.', porqueVeces: 'Corre en cada vuelta: ⌈n/2⌉.', tag: 'acum' })]
        },
        L('ret', 'return suma;', 1, 1, 1, { porque: 'return: 1.', tag: 'ret' })
      ],
      invariante: 'i >= n', invAlt: ['i>=n', 'i >= v.length', 'i == n', 'i = n'],
      Tn: { prof: '6 + 6ceil(n/2)', hojas: '4 + 6ceil(n/2)' },
      bigO: 'n',
      iteraciones: 'ceil(n/2)',
      pistas: ['i toma 0, 2, 4, … mientras sea < n: ⌈n/2⌉ valores.', 'T(n) = 2 + 2 + 1 + 1 + Σ_{r=1}^{⌈n/2⌉}(1 + 3 + 2).'],
      ejecutar(n, C) {
        const v = Array.from({ length: n }, (_, i) => i + 1);
        C.c('s'); let suma = 0; C.c('for.init');
        for (let i = 0; ; i += 2) {
          C.c('for.cond'); C.v({ i, suma }); if (!(i < v.length)) break;
          C.c('acum'); suma += v[i];
          C.c('for.upd');
        }
        C.c('ret'); return suma;
      }
    };
  }
  ADA.registrar({
    id: 'C01', fase: 1, tipo: 'C', titulo: 'suma1 vs suma2 (posiciones pares)', fuente: 'Simulacro P2(b)',
    variantes: [{}],
    def: () => ({
      enunciado: 'Ambos métodos suman los elementos en posiciones pares. Analice el costo de cada uno (costos por línea, veces y T(n)) y determine cuál es más eficiente. Justifique con el número de iteraciones y de instrucciones ejecutadas; no basta con el Big-O.',
      metodos: [suma1({}), suma2({})],
      nTabla: [10, 100, 1000],
      masEficiente: 1,
      opciones: [
        { txt: 'Son igual de eficientes porque los dos son O(n).', ok: false, porque: 'El Big-O iguala constantes; el enunciado pide contar iteraciones e instrucciones. Con n = 100, suma1 ejecuta 656 OE y suma2 306.' },
        { txt: 'suma2 es más eficiente: da ⌈n/2⌉ vueltas en lugar de n y en cada vuelta no evalúa el if (6 OE por vuelta frente a 5 + 3 en las pares). Ambos son O(n).', ok: true, porque: 'Correcto: menos iteraciones y menos instrucciones por iteración; el orden asintótico sí es el mismo.' },
        { txt: 'suma1 es más eficiente porque revisa todas las posiciones y es más seguro.', ok: false, porque: 'Revisar posiciones impares es trabajo inútil: n vueltas + n evaluaciones de i % 2.' },
        { txt: 'suma2 es O(n/2) y suma1 es O(n), por eso suma2 es de menor orden.', ok: false, porque: 'O(n/2) = O(n): las constantes no cambian el orden. La ventaja de suma2 es en iteraciones e instrucciones, no en Big-O.' }
      ]
    })
  });

  /* ======================= C02: aSaber i-1 vs i-2 ======================= */
  ADA.registrar({
    id: 'C02', fase: 1, tipo: 'C', titulo: 'aSaber i−1 vs aSaber i−2', fuente: 'Hoja 1 #16 vs #17',
    variantes: [{}],
    def: () => ({
      enunciado: 'Compare las dos versiones de aSaber (Hoja 1, puntos 16 y 17). Ojo: no calculan lo mismo (la segunda solo suma una de cada dos posiciones), pero el ejercicio de conteo es idéntico al de suma1/suma2: iteraciones e instrucciones.',
      metodos: [Object.assign(aSaber({ salto: 1 }), { titulo: 'aSaber (i = i − 1)', iteraciones: 'n' }), Object.assign(aSaber({ salto: 2 }), { titulo: 'aSaber (i = i − 2)', iteraciones: 'ceil(n/2)' })],
      nTabla: [10, 100, 1000],
      masEficiente: 1,
      opciones: [
        { txt: 'La versión i − 2 hace ⌈n/2⌉ vueltas y la i − 1 hace n; el costo por vuelta es el mismo (6), así que la segunda ejecuta cerca de la mitad de las OE. Ambas O(n).', ok: true, porque: 'Correcto. T₁ = 7 + 6n y T₂ = 7 + 6⌈n/2⌉.' },
        { txt: 'Son iguales porque ambas son O(n).', ok: false, porque: 'Mismo orden, pero la segunda ejecuta aproximadamente la mitad de las instrucciones.' },
        { txt: 'La versión i − 2 es O(log n) porque salta posiciones.', ok: false, porque: 'Saltar de 2 en 2 divide las vueltas entre 2 (constante), no da logaritmo. Log aparece cuando la variable se multiplica o divide.' },
        { txt: 'La versión i − 1 es más eficiente porque su T(n) tiene el mismo 7 fijo y no usa techo.', ok: false, porque: 'El techo no añade costo; 6n > 6⌈n/2⌉ para todo n ≥ 2.' }
      ]
    })
  });
})();
