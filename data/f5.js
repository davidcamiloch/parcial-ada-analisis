/* data/f5.js – Fase 5: Teoría rápida. Preguntas conceptuales (opción), escalamiento (numérico con variantes) y ordenar funciones. */
(function () {
  'use strict';
  const reg = (o) => ADA.registrar(Object.assign({ fase: 5, tipo: 'Q', variantes: [{}] }, o));
  const Q = (id, titulo, pregunta, opciones, explicacion, tema) => reg({ id, titulo, fuente: tema || 'Teoría', def: () => ({ tipoQ: 'opcion', pregunta, opciones, explicacion }) });

  Q('Q01', '¿Qué es una operación elemental?', '¿Qué es una operación elemental (OE)?', [
    { txt: 'Una instrucción básica que el computador ejecuta en tiempo constante: asignación, aritmética, comparación, acceso a un arreglo, return, llamada.', ok: true },
    { txt: 'Cualquier línea de código, sin importar lo que haga.', ok: false, porque: 'Una línea puede contener varias OE (int x = a[i] + 1 → acceso + suma + declaración + asignación) o un ciclo entero.' },
    { txt: 'Solo las operaciones aritméticas.', ok: false, porque: 'También cuentan asignaciones, comparaciones, accesos y llamadas.' }
  ], 'La OE es la unidad de tiempo: se cuenta 1 (o k para librería) cada vez que se ejecuta. El profe agrupa "declaración + asignación" = 2, "i++" = 2, "suma += A[i][i]" = 3.', 'Conceptos');
  Q('Q02', '¿Qué mide T(n)?', '¿Qué representa T(n)?', [
    { txt: 'El número total de operaciones elementales que ejecuta el algoritmo en función del tamaño n de la entrada (en el peor caso, salvo que se indique otro).', ok: true },
    { txt: 'El tiempo en segundos que tarda el programa en mi computador.', ok: false, porque: 'Los segundos dependen de la máquina; T(n) es independiente: cuenta OE.' },
    { txt: 'La cantidad de memoria usada.', ok: false, porque: 'Eso sería la complejidad espacial.' }
  ], 'T(n) = costos fijos + Σ (costo por vuelta) + condiciones falsas finales. De T(n) se obtiene el Big-O quedándose con el término dominante.', 'Conceptos');
  Q('Q03', 'Evaluaciones de la condición', 'Un ciclo da t vueltas. ¿Cuántas veces se evalúa su condición y por qué?', [
    { txt: 't + 1: t veces verdadera (una por vuelta) y 1 vez falsa, que es la que hace salir.', ok: true },
    { txt: 't: una por vuelta.', ok: false, porque: 'Falta la última evaluación, la que da falso y termina el ciclo.' },
    { txt: 't − 1: la primera no cuenta.', ok: false, porque: 'La primera evaluación también se ejecuta (y puede ser la única, si el ciclo no entra).' }
  ], 'Por eso en el modelo del profe la condición va dentro de la sumatoria (t veces) y se suma 1 aparte al final. Un ciclo que NO entra igual cuesta 1 (la evaluación falsa).', 'Ciclos');
  Q('Q04', 'Invariante (en este curso)', '¿Qué es la "invariante" que pide el profe en el parcial?', [
    { txt: 'La condición que se cumple al SALIR del ciclo: la negación de la guarda (para while (i < n), al salir i == n).', ok: true },
    { txt: 'La variable que no cambia dentro del ciclo.', ok: false, porque: 'Aunque el nombre lo sugiera, en este curso la invariante es la condición de salida.' },
    { txt: 'El número de vueltas.', ok: false, porque: 'Eso es t, no la invariante.' }
  ], 'Se escribe junto al análisis: "Invariante: i == n" (plantilla Excel del profe).', 'Ciclos');
  Q('Q05', 'Definición de O', 'T(n) ∈ O(g(n)) significa que…', [
    { txt: 'Existen constantes c > 0 y n₀ tales que T(n) ≤ c·g(n) para todo n ≥ n₀: g es una cota SUPERIOR del crecimiento.', ok: true },
    { txt: 'T(n) = g(n) para todo n.', ok: false, porque: 'Big-O no es igualdad: 3n² + 10n ∈ O(n²) aunque no sean iguales.' },
    { txt: 'T(n) ≥ g(n) para n grande.', ok: false, porque: 'Eso es Ω (cota inferior).' }
  ], 'O = cota superior (peor caso), Ω = cota inferior (mejor caso), Θ = las dos coinciden. Las constantes c y n₀ absorben los términos menores.', 'Notación');
  Q('Q06', 'Término dominante', '¿Por qué 3n² + 10n + 7 es O(n²) y no O(n² + n)?', [
    { txt: 'Porque para n grande el término n² domina: 3n² + 10n + 7 ≤ c·n² con c = 20 desde n₀ = 1. Las constantes y los términos menores no cambian el orden.', ok: true },
    { txt: 'Porque se redondea.', ok: false, porque: 'No es redondeo: es que existe c con T(n) ≤ c·n².' },
    { txt: 'Porque 10n + 7 es negativo para n grande.', ok: false, porque: 'Es positivo, pero crece más despacio que n².' }
  ], 'Regla práctica: quédate con el término que más crece y quítale la constante. n² + n log n → n²; 5·2ⁿ + n³ → 2ⁿ.', 'Notación');
  Q('Q07', 'Bases de logaritmo', '¿Por qué log₂ n y log₃ n son del mismo orden?', [
    { txt: 'Por el cambio de base: log₃ n = log₂ n / log₂ 3, y log₂ 3 es una constante (≈ 1.58).', ok: true },
    { txt: 'Porque los logaritmos crecen tan despacio que da igual.', ok: false, porque: 'La razón formal es el cambio de base: difieren en una constante multiplicativa.' },
    { txt: 'No son del mismo orden: log₂ n es mayor.', ok: false, porque: 'Es mayor por un factor constante, y las constantes no cuentan en Big-O.' }
  ], 'En T(n) escribe la base correcta (divide entre 2 → log₂; multiplica por 3 → log₃); en Big-O basta O(log n). Ojo: log₉ n = (log₃ n)/2, por eso log₉ n · log₃ n = Θ(log² n) (simulacro P2).', 'Logaritmos');
  Q('Q08', 'Cuándo hay mejor y peor caso', '¿Cuándo tiene sentido hablar de mejor y peor caso?', [
    { txt: 'Cuando el número de OE depende del CONTENIDO de los datos (un if o while que compara datos, un return anticipado). Si el algoritmo siempre hace lo mismo, no existen y O = Ω.', ok: true },
    { txt: 'Siempre: el mejor caso es n pequeño y el peor n grande.', ok: false, porque: 'El tamaño n es fijo al analizar; mejor/peor se refiere a distintos DATOS del mismo tamaño.' },
    { txt: 'Solo en algoritmos recursivos.', ok: false, porque: 'Cualquier if que dependa de los datos puede crearlos (búsqueda, ordenado, simétrica).' }
  ], 'En la Hoja 1 piden justificar cuando NO existen: "siempre se ejecutan las mismas OE porque no hay condiciones que dependan de los datos ni salidas anticipadas".', 'Casos');
  Q('Q09', 'T(n) vs Big-O', '¿Qué diferencia hay entre T(n) y Big-O?', [
    { txt: 'T(n) es el conteo exacto de OE (10n + 10); Big-O es el orden de crecimiento asintótico (O(n)) que ignora constantes y términos menores.', ok: true },
    { txt: 'Son lo mismo escrito de dos formas.', ok: false, porque: 'Muchos T(n) distintos comparten el mismo Big-O.' },
    { txt: 'Big-O es más preciso que T(n).', ok: false, porque: 'Al contrario: Big-O pierde información (constantes).' }
  ], 'Por eso en el tipo C no basta con decir "ambos son O(n)": hay que comparar los T(n) y las iteraciones.', 'Notación');
  Q('Q10', 'Dos algoritmos O(n)', 'Dos algoritmos son O(n). ¿Son igual de eficientes?', [
    { txt: 'No necesariamente: uno puede hacer n vueltas con 8 OE y otro n/2 vueltas con 6 OE. Hay que comparar iteraciones e instrucciones (T(n)), como en suma1 vs suma2.', ok: true },
    { txt: 'Sí, el Big-O lo dice todo.', ok: false, porque: 'El Big-O iguala 5n con 500n.' },
    { txt: 'Sí, si tienen el mismo número de líneas.', ok: false, porque: 'Las líneas no miden nada; las OE ejecutadas sí.' }
  ], 'Argumento tipo C del simulacro: iteraciones (n vs ⌈n/2⌉), OE por vuelta, tabla con n = 10 y 100, y aclarar que el orden es el mismo.', 'Comparar');
  Q('Q11', 'Patrones de vueltas', 'Empareja: i *= 2 · i /= 2 · guess*guess < n · i += 2 · i-- → ¿qué orden de vueltas dan?', [
    { txt: 'log n · log n · √n · n/2 (lineal) · n', ok: true },
    { txt: 'n · n · n · n · n', ok: false, porque: 'Multiplicar/dividir la variable da logaritmo; guess² < n da √n.' },
    { txt: 'log n · n · n² · n/2 · n', ok: false, porque: 'i /= 2 también es log n (se parte a la mitad), y guess² < n ⇔ guess < √n.' }
  ], 'Sumar/restar una constante → lineal; multiplicar/dividir → log; comparar el cuadrado → raíz.', 'Ciclos');
  Q('Q12', 'Llamada dentro de un ciclo', 'Un ciclo de n vueltas llama en cada vuelta a un método M que cuesta T_M(n). ¿Cuánto cuesta el ciclo?', [
    { txt: 'Aproximadamente n · T_M(n): el costo de la llamada se multiplica por el número de veces que se ejecuta.', ok: true },
    { txt: 'T_M(n): el método se analiza una sola vez.', ok: false, porque: 'Se ejecuta n veces; cada ejecución cuesta T_M.' },
    { txt: 'n + T_M(n).', ok: false, porque: 'Se suma solo si la llamada estuviera FUERA del ciclo.' }
  ], 'Simulacro P1: n² log n vueltas × M(n) constante → O(n² log n). Simulacro P2: log₉ n vueltas × algunValor O(log₃ n) → Θ(log² n).', 'Llamadas');
  Q('Q13', 'Ciclo interno con límite 8 + i', 'Un ciclo interno corre siempre 8 veces (for (j = i; j < 8 + i; j++)). ¿Cambia el orden del algoritmo?', [
    { txt: 'No: multiplica por una constante (8), y las constantes no cambian el Big-O.', ok: true },
    { txt: 'Sí: dos ciclos anidados siempre dan n².', ok: false, porque: 'Solo si el interno depende de n. Aquí da 8 vueltas fijas.' },
    { txt: 'Sí: lo vuelve O(8n).', ok: false, porque: 'O(8n) = O(n).' }
  ], 'Hoja 1 #17b: (√n/2)·8·8 = 32√n → O(√n). Igual que M(n) del simulacro, que da 1 vuelta.', 'Ciclos');
  Q('Q14', 'Tamaño de la entrada', '¿Cuál es el "n" en sumDigits(int n) (while (n != 0) n /= 10)?', [
    { txt: 'El VALOR del número; el ciclo da tantas vueltas como dígitos: ⌊log₁₀ n⌋ + 1 → O(log n).', ok: true },
    { txt: 'La cantidad de dígitos, así que es O(n).', ok: false, porque: 'Si defines n como el valor (como pide el ejercicio), las vueltas son log₁₀ n. Si definieras d = dígitos, sería O(d): hay que decir cuál es el tamaño.' },
    { txt: 'No tiene tamaño porque no hay arreglo.', ok: false, porque: 'El tamaño puede ser un valor numérico (n) o los dígitos; hay que fijarlo antes de analizar.' }
  ], 'Siempre declara el tamaño de la entrada: "n = v.length", "n = valor", "n × n matriz".', 'Conceptos');
  Q('Q15', 'Costo de librería', '¿Cuánto cuesta new int[n], System.out.println(x) o Math.sqrt(n) en este curso?', [
    { txt: 'Una constante k (se deja como letra en el T(n) y no afecta el Big-O).', ok: true },
    { txt: 'n, porque new int[n] reserva n posiciones.', ok: false, porque: 'El profe lo cuenta como k (plantilla Excel: "Integer v[] = new Integer[n]" → k).' },
    { txt: '0, no se cuentan.', ok: false, porque: 'Se cuentan como k; si están dentro de un ciclo, k se multiplica por las vueltas.' }
  ], 'Plantilla del profe: T(n) = 5 + k + n(3 + k) → O(n).', 'Conceptos');
  Q('Q16', 'for sin cuerpo', 'T(n) de "for (int i = 0; i < n; i++) { }" (sin cuerpo) con la convención del profe:', [
    { txt: '2 + (n + 1)·1 + n·2 = 3n + 3 → O(n)', ok: true },
    { txt: '0: no hace nada.', ok: false, porque: 'La cabecera se ejecuta: inicialización, n + 1 comparaciones y n incrementos.' },
    { txt: 'n', ok: false, porque: 'Cada vuelta cuesta 1 (condición) + 2 (i++); más la inicialización y la última condición.' }
  ], 'Plantilla: init 2 · cond 1 × (n+1) · i++ 2 × n. Hojas resumen: 1 + (n+1) + n = 2n + 2.', 'Ciclos');
  Q('Q17', 'Ω y mejor caso', 'Un algoritmo de búsqueda retorna en cuanto encuentra el elemento. ¿Cuál es su Ω?', [
    { txt: 'Ω(1): en el mejor caso lo encuentra en la primera posición con un número constante de OE.', ok: true },
    { txt: 'Ω(n): siempre hay que recorrer el arreglo.', ok: false, porque: 'Con return anticipado el mejor caso es constante; Ω se calcula con el mejor caso.' },
    { txt: 'Ω(n²).', ok: false, porque: 'Una búsqueda lineal nunca pasa de n comparaciones.' }
  ], 'O con el peor caso, Ω con el mejor. Si no hay salida anticipada ni condición de datos: O = Ω.', 'Casos');
  Q('Q18', 'Recurrencia T(n) = c + T(n/2)', '¿Qué orden tiene T(n) = c + T(n/2), T(1) = c₀?', [
    { txt: 'O(log n): al desenrollar, T(n) = k·c + T(n/2^k) y se para cuando n/2^k = 1, es decir k = log₂ n.', ok: true },
    { txt: 'O(n): cada llamada cuesta c y hay n llamadas.', ok: false, porque: 'Hay log₂ n llamadas, no n: el tamaño se parte a la mitad cada vez.' },
    { txt: 'O(n²).', ok: false, porque: 'Eso sería 4T(n/2) + n (Primero/Segundo), no una sola llamada.' }
  ], 'Desenrollar = sustituir k veces y encontrar cuándo se llega al caso base. Con 4T(n/2) + 2n (recursión mutua) sale n².', 'Recursión');
  Q('Q19', 'while (n2 < j) con n2 = j + 10', 'int n2 = j + 10; while (n2 < j) { … }  ¿Cuánto aporta al T(n)?', [
    { txt: '1: solo la evaluación (falsa) de la condición. 0 vueltas.', ok: true },
    { txt: 'Nada: si no entra no cuesta.', ok: false, porque: 'Preguntar cuesta: la condición se evalúa una vez.' },
    { txt: 'j vueltas.', ok: false, porque: 'n2 empieza por encima de j: la condición es falsa desde el principio.' }
  ], 'Antes de aplicar fórmulas compara el valor inicial con la condición.', 'Trampas');
  Q('Q20', 'for con i = i / 2 desde n² + 5', 'for (i = n*n + 5; i >= n*n; i = i/2): ¿cuántas vueltas para n ≥ 3?', [
    { txt: '1: tras una división (n²+5)/2 ya es menor que n². Parece log pero es constante.', ok: true },
    { txt: 'log₂ n: divide entre 2.', ok: false, porque: 'Solo da log si hay que bajar mucho; aquí el límite está a distancia constante del inicio.' },
    { txt: 'n²', ok: false, porque: 'Se divide entre 2, no se resta 1.' }
  ], 'M(n) del simulacro P1: O(1). Por eso el total es n² log n y no n² log² n.', 'Trampas');

  /* ---------- Ordenar funciones por crecimiento ---------- */
  reg({
    id: 'Q21', titulo: 'Ordena funciones por crecimiento', fuente: 'Notación', variantes: [{ set: 0 }, { set: 1 }, { set: 2 }],
    def: (p) => {
      const sets = [
        ['1', 'log n', '√n', 'n', 'n log n', 'n²', 'n³', '2ⁿ'],
        ['log n', 'log² n', '√n', 'n', 'n²', 'n² log n', 'n³', 'n!'],
        ['5', 'log₃ n', 'n/2', 'n log n', 'n^1.5', 'n²', '2ⁿ', 'n·2ⁿ']
      ];
      return { tipoQ: 'orden', pregunta: 'Ordena de MENOR a MAYOR crecimiento (haz clic en orden):', orden: sets[p.set], explicacion: 'Regla: constante < log < polilog < raíz < lineal < n log n < polinomios (por grado) < exponenciales < factorial. log² n < √n para n grande (crece más despacio), y n·2ⁿ > 2ⁿ.' };
    }
  });

  /* ---------- Escalamiento (numérico, con variantes) ---------- */
  const CLASES = [
    { nombre: 'O(n)', g: (n) => n, inv: (r) => r, txt: 'lineal: el tiempo crece igual que n' },
    { nombre: 'O(n²)', g: (n) => n * n, inv: (r) => Math.sqrt(r), txt: 'cuadrático: si n se multiplica por 4, el tiempo por 16' },
    { nombre: 'O(n³)', g: (n) => n ** 3, inv: (r) => Math.cbrt(r), txt: 'cúbico: (n₂/n₁)³' },
    { nombre: 'O(√n)', g: (n) => Math.sqrt(n), inv: (r) => r * r, txt: 'raíz: si n se multiplica por 4, el tiempo por 2' },
    { nombre: 'O(log n)', g: (n) => Math.log2(n), inv: null, txt: 'logarítmico: log₂(n₂)/log₂(n₁)' },
    { nombre: 'O(n log n)', g: (n) => n * Math.log2(n), inv: null, txt: 'n log n: (n₂ log n₂)/(n₁ log n₁)' }
  ];
  const varsE = [];
  [[0, 100, 400, 10], [1, 100, 400, 10], [3, 100, 400, 10], [4, 100, 10000, 10], [2, 10, 30, 2], [5, 100, 1000, 5], [1, 50, 200, 8], [0, 1000, 3500, 20]].forEach((v) => varsE.push({ c: v[0], n1: v[1], n2: v[2], t1: v[3] }));
  reg({
    id: 'E01', titulo: 'Escalamiento: ¿cuánto tardará?', fuente: 'Hoja 1 #17', variantes: varsE,
    def: (p) => {
      const c = CLASES[p.c]; const t2 = p.t1 * c.g(p.n2) / c.g(p.n1);
      return { tipoQ: 'num', pregunta: `Un algoritmo ${c.nombre} tarda ${p.t1} ms para n = ${p.n1}. ¿Cuánto tardará (en ms) para n = ${p.n2}?`, respuesta: t2, tolRel: 0.03,
        explicacion: `Se plantea la proporción con la función de orden: t₂ = t₁ · g(n₂)/g(n₁) = ${p.t1} · ${c.g(p.n2).toFixed(2)}/${c.g(p.n1).toFixed(2)} = ${t2.toFixed(2)} ms (${c.txt}).` };
    }
  });
  const varsI = [];
  [[0, 100, 10, 40], [1, 100, 10, 40], [3, 100, 10, 40], [2, 10, 2, 54], [1, 200, 8, 72], [3, 400, 20, 30]].forEach((v) => varsI.push({ c: v[0], n1: v[1], t1: v[2], t2: v[3] }));
  reg({
    id: 'E02', titulo: 'Escalamiento: ¿qué tamaño alcanza?', fuente: 'Hoja 1 #17', variantes: varsI,
    def: (p) => {
      const c = CLASES[p.c]; const n2 = p.n1 * c.inv(p.t2 / p.t1);
      return { tipoQ: 'num', pregunta: `Un algoritmo ${c.nombre} tarda ${p.t1} ms para n = ${p.n1}. ¿Qué tamaño de problema n se puede resolver en ${p.t2} ms?`, respuesta: n2, tolRel: 0.03,
        explicacion: `t₂/t₁ = g(n₂)/g(n₁) ⇒ g(n₂) = g(n₁) · ${p.t2}/${p.t1}; despejando n₂ = ${n2.toFixed(1)} (${c.txt}).` };
    }
  });
  reg({
    id: 'E03', titulo: 'Escalamiento: duplicar n', fuente: 'Teoría', variantes: [{ c: 1 }, { c: 2 }, { c: 4 }, { c: 5 }],
    def: (p) => {
      const c = CLASES[p.c]; const n1 = 1000; const f = c.g(2 * n1) / c.g(n1);
      return { tipoQ: 'num', pregunta: `Si un algoritmo es ${c.nombre} y n pasa de 1000 a 2000, ¿por qué factor se multiplica el tiempo? (dos decimales)`, respuesta: f, tolRel: 0.03,
        explicacion: `Factor = g(2000)/g(1000) = ${f.toFixed(2)} (${c.txt}). Para n² es 4, n³ es 8, √n es 1.41, log n ≈ 1.10, n log n ≈ 2.2.` };
    }
  });
})();
