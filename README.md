# 🎓 Parcial ADA · Entrenador para el Primer Parcial de Análisis de Algoritmos

> Minijuego web **100 % offline** para practicar el cálculo de **T(n)**, **Big-O**, **Ω** y el diseño de algoritmos con la **convención de conteo del profesor** (UFPS · Ingeniería de Sistemas), basado en el *Simulacro Previo 1* y la *Hoja 1 de ejercicios*.
>
> Todo se aprende **haciendo**: cada pantalla te pide una respuesta, la evalúa al instante y, si fallas, te muestra la solución **paso a paso sin saltarse nada**.

---

## 🚀 Cómo empezar

1. Haz **doble clic en `index.html`**. No necesita internet, servidor ni instalación (KaTeX viene incluido en `lib/`).
2. Elige una fase en el menú. Tu progreso (puntajes, errores frecuentes, racha) se guarda solo en tu navegador (`localStorage`).
3. Sigue el orden recomendado: **1 → 2 → 3 → 6 → 4 → 5 → 7**.

Para imprimir la chuleta de una página: abre **`chuleta.html`** y pulsa *Imprimir*.

---

## 🧭 Las 7 fases

| Fase | Módulo | Qué practicas | Ejercicios |
|:---:|---|---|:---:|
| 1 | 🧮 **Contador de OE** | Código línea por línea: costo de cada operación elemental, cuántas veces corre, armar T(n), invariante y Big-O. Incluye comparaciones tipo C (*suma1 vs suma2*). | 8 |
| 2 | 🔁 **¿Cuántas vueltas?** | Cabeceras de ciclos con **traza animada**: `i++`, `i += 2`, `i--`, `i *= 2`, `k *= 3`, `i /= 2`, `n /= 9`, `n /= 10`, `guess*guess < n`, `<` vs `<=`, ciclos que **no entran**, ciclos que corren **1 vez**, dos índices, `while` que depende de los datos (mejor/peor caso). | 20 (+18 variantes) |
| 3 | 🧩 **Anidados, llamadas y recursión** | Tipo A completo: sumatorias anidadas construidas **paso a paso** (Σc, Σi, Σi², cambio de variable), métodos que llaman a otros (simulacro P1 y P2, copyArray/appendToNew, selección con posMinimo), Hoja 1 #17 a–d, recurrencias desenrolladas. | 22 |
| 4 | ✏️ **Diseña el algoritmo** | Tipo B: eliges la **estrategia** que cumple la cota, **armas el código Java** ordenando líneas, y analizas peor/mejor caso, O y Ω. Hoja 1 segunda parte completa (1–16) + sonIgualesD + faltante. | 21 |
| 5 | 📚 **Teoría rápida** | Preguntas conceptuales cortas (OE, T(n), O/Ω/Θ, logaritmos, casos, trampas), ordenar funciones por crecimiento y **escalamiento** ("10 ms para n = 100, ¿y para n = 400?"). Modo **Ronda de 10**. | 24 (+variantes) |
| 6 | 🏁 **Jefe final** | **Dos exámenes nuevos** con la estructura del simulacro, con **cronómetro** (2 h por defecto). Resuelves en papel; el juego revela las soluciones completas y te autocalificas con la **rúbrica del profe**. Nota sobre 5.0 y lista de "qué repasar". | 2 exámenes × 4 puntos |
| 7 | 📄 **Chuleta y repaso** | Chuleta imprimible de 1 página y **Repaso rápido de 20 min** armado automáticamente con tus errores más frecuentes. | — |

**Total: 141 ejercicios/variantes**, todos verificados ejecutando el código real (ver más abajo).

---

## 🎮 Cómo se juega

### Una pantalla típica (tipo A)

```
1 · Costo y vueltas por línea  →  2 · Sumatorias / T(n), invariante y Big-O  →  3 · Resultado
```

- Frente a cada línea escribes el **costo** (`2`, `3`, `2+k`) y, en la Fase 1, las **veces** que se ejecuta (`n`, `n+1`, `(n/2)`). En los ciclos, la cabecera se separa en *inicialización / condición / actualización* como en la tabla del profesor.
- Luego armas el **T(n)** (`10n+10`, `6+6(n/2)`, `5+k+n(3+k)`), la **invariante** (`i == n`) y el **Big-O** (`O(n)`, `n^2`, `n log n`).
- Botón **"Ver tabla de valores"**: ejecuta el código de verdad con n = 5 y te muestra el valor de las variables en cada evaluación de la condición y el conteo real por línea.

### Reglas pedagógicas
- ✅ **Evaluación en tiempo real**: verde = correcto, rojo = error con explicación justo debajo, naranja = aceptable (p. ej. otra forma de contar que el profe también admite).
- 🔁 **Al segundo error** aparece una **analogía** de la vida real (el portero que revisa boletas = la condición se evalúa t + 1 veces).
- 💡 **Pistas escalonadas**: pista 1 → pista 2 → solución; usarlas resta puntos.
- 🎲 **Variantes**: muchos ejercicios cambian el salto, la condición o el límite para que no memorices respuestas.
- 🧠 **Repetición espaciada**: lo que sacas por debajo de 70 vuelve a la cola de repaso con otra variante.
- 📈 **Gráfica de crecimiento**: en la Fase 3 puedes ver T(n) frente a c·g(n).

### Cómo escribir las respuestas

| Quieres escribir | Escribe |
|---|---|
| 10n + 10 | `10n+10` o `10 + 10n` (se acepta cualquier forma equivalente) |
| ⌈n/2⌉ o ⌊n/2⌋ + 1 | **`(n/2)`** — no hace falta techo ni piso |
| log₂ n, log₃ n | `log2(n)`, `log3(n)`, `log(n)` (= base 2) |
| log² n | `log^2 n` o `log(n)^2` |
| √n | `sqrt(n)` o `raiz(n)` |
| n(n+1)/2 | `n(n+1)/2` |
| Σ | `sum(i=1..n, i)` |
| Big-O | `O(n)`, `n^2`, `n log n`, `O(1)` |
| Constante de librería | `k`, `2+k` |

Las respuestas **no se comparan como texto**: se evalúan en varios valores de n (1, 2, 5, 10, 100…). Para los ciclos logarítmicos o de raíz se admite ±1 vuelta, como en el parcial.

---

## 📐 La convención del profesor (resumen)

Calibrada con la solución oficial del simulacro y la plantilla Excel del curso:

| Instrucción | Costo |
|---|:---:|
| `int x = 0;` | 2 |
| `int n = A.length;` | 2 (`.length` 1 + asignación 1) |
| **`.length` donde aparezca** | **+1 cada vez que se evalúa** |
| `x = y;` | 1 |
| `i++` · `i--` · `i += 2` · `i = i / 2` · `k *= 3` | 2 |
| **cada acceso a arreglo** (lectura o escritura, `A[i][j]` cuenta 1) | **1** |
| `suma += A[i][i];` | 3 |
| `v[i] = v[j];` | 3 (acceso izq + asignación + acceso der) |
| `v[i] = v[i] + v[j];` | **5** |
| `suma += A[i][n-i-1];` | 4 |
| Condición del ciclo / `if` | 1 (+1 por operador) |
| `i < v.length` · `i < v.length - c` | 2 · 3 |
| `return x;` | 1 |
| `new`, `println`, `Math.sqrt` | k |

**Modelo:** `T(n) = fijos + Σ(condición + cuerpo + actualización) + 1 (condición falsa) + fijos finales`.
Ejemplo del simulacro: `T(n) = 9 + Σ_{i=0}^{n-1}(1+2+3+4) + 1 = 10 + 10n → O(n)`.

Hay un **interruptor "Convención: Profesor / Hojas resumen"** para ver cómo cambia el T(n) con la convención de las hojas PNG (todo vale 1). El Big-O nunca cambia.

---

## ⚠️ Trampas que el juego te enseña a ver

- El **acceso del lado izquierdo también cuenta**: `v[i] = v[i] + v[j]` son 5 OE (acceso izq + igualación + 2 accesos + suma), no 4.
- El **`.length` sí se cuenta** (confirmado en asesoría): `i < v.length` cuesta 2, no 1. Guardar `int n = v.length;` antes del ciclo ahorra una OE por vuelta.
- El ciclo que **nunca entra** (`n2 = j + 10; while (n2 < j)`): 0 vueltas, cuesta 1.
- El ciclo que **parece logarítmico y corre 1 vez** (`i = n²+5; i >= n²; i /= 2`).
- La **base del logaritmo**: `k = k/2` es log₂ (la hoja de respuestas del simulacro dice log₃; mismo Big-O).
- La **llamada dentro de un ciclo** se multiplica (getUFPS: log₉ n · log₃ n = Θ(log² n)).
- El **ciclo oculto** en un método (`appendToNew` → O(n²)).
- El `sqrt` cuyo `return` interno nunca se cumple; el `swapCount` que nadie lee.
- `<` vs `<=`; `i -= 2` desde n−1 da (n/2) redondeado arriba.
- Solo hay **mejor y peor caso** cuando una condición depende de los datos; si no, hay que decir que no existen (O = Ω).

---

## 🔍 Verificación obligatoria (`verificar.js`)

Ningún ejercicio entra al juego sin pasar por esto:

```bash
node verificar.js
```

Cada ejercicio tiene una **versión instrumentada** en JavaScript que ejecuta el algoritmo real y cuenta las ejecuciones de cada línea. El script comprueba, para n = 1 … 1000:

1. Las **veces** declaradas para cada línea coinciden con el conteo real.
2. El **T(n)** canónico coincide con las OE reales (o es una cota superior válida cuando así se indica).
3. La **forma cerrada** del T(n) y del mejor caso coinciden con el conteo.
4. El **Big-O** declarado coincide con el crecimiento medido.
5. Las **trazas** de la Fase 2 terminan con una evaluación falsa y dan t vueltas.
6. En recursión, el **número de llamadas**; en teoría, que haya exactamente una opción correcta y que el orden de crecimiento sea real.

Si algo no cuadra, el script falla e indica ejercicio, línea y n. Si todo pasa, escribe `data/_verificado.js`, que es el sello **"✔ verificado"** que ves en cada ejercicio. (Durante la construcción este script cazó varios errores de conteo, incluido uno sutil: en selección, `min = j` no se ejecuta en todas las comparaciones con arreglo descendente; por eso se analiza como cota superior.)

---

## 🗂️ Estructura del proyecto

```
parcial-ada/
├── index.html          ← abre esto
├── chuleta.html        ← chuleta imprimible (1 página)
├── contenido.md        ← mapa del parcial: convención, fórmulas, trampas, banco clasificado
├── verificar.js        ← verificación obligatoria (node)
├── css/estilo.css
├── lib/katex/          ← fórmulas bonitas, local
├── js/
│   ├── formulas.js     ← parser/evaluador de expresiones (valida por equivalencia numérica)
│   ├── nucleo.js       ← estado, modelo de líneas, T(n) estilo profe, router
│   ├── contador.js     ← Fase 1 (tipo A simple y tipo C)
│   ├── vueltas.js      ← Fase 2 (traza animada)
│   ├── anidados.js     ← Fase 3 (guía de sumatorias, recursión, gráfica)
│   ├── diseno.js       ← Fase 4 (tipo B)
│   ├── teoria.js       ← Fase 5 (ronda de preguntas)
│   ├── examen.js       ← Fase 6 (cronómetro, soluciones, rúbrica)
│   ├── repaso.js       ← Fase 7 (plan de 20 min por errores)
│   └── app.js          ← menú y cabecera
├── data/
│   ├── f1.js … f6.js   ← ejercicios (con su código instrumentado)
│   └── _verificado.js  ← sello generado por verificar.js
└── material/           ← simulacro, Hoja 1, plantilla Excel, hojas resumen
```

> Los ejercicios están en archivos `.js` en lugar de `.json` porque al abrir con doble clic el navegador bloquea la lectura de JSON, y porque cada ejercicio incluye su función instrumentada (código, no solo datos).

---

## 📅 Plan sugerido para la víspera

1. **Tarde:** Fases 1 → 2 → 3 completas (la 3 es la que más pesa en el parcial). Luego Fase 4 y una ronda de la Fase 5.
2. **Noche:** Examen 1 del Jefe final, en papel, 2 horas, sin mirar. Califícate con dureza y lee "qué repasar".
3. **Mañana del parcial:** Ronda de teoría (5 min) → Repaso rápido de 20 min → leer la chuleta una vez.

Las cuatro cosas que más puntos dan en la rúbrica del profesor: **costo al frente de cada línea**, **vueltas de cada ciclo con la sumatoria explícita**, el **+1 de la condición falsa** y el **Big-O justificado en una frase**. Suerte con el 5.0. 🍀
