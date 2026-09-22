# FASE 0 – Mapa del parcial 1 de Análisis de Algoritmos (UFPS)

Fuentes leídas: `SIMULACRO PREVIO1-ADA.pdf` (modelo del parcial + solución oficial de sonIgualesD), `Hoja 1` (banco), `Template for calculating Tn and bigO.xlsx` (plantilla del profe, con su LaTeX), `formulas sumatorias y logaritmo.pdf`, 4 hojas PNG (ciclos / OE / for), texto de los Andes (solo para confirmar definiciones de O, Ω, Θ).

> Nota de numeración: el PDF de la Hoja 1 salta el punto 13 y su numeración real es: 20 = sqrt, **21 = copyArray/appendToNew, 22 = sumDigits, 23 = sortByValue**. En este mapa uso la numeración del PDF.

---

## 1. Convención de conteo DEL PROFESOR (la que usa el juego por defecto)

Calibrada con dos fuentes oficiales:

**(a) Solución del simulacro, `sonIgualesD`:**

| Línea | Operación según el profe | Costo |
|---|---|---|
| `int n = A.length;` | `.length` (1) + inicialización (1) — **el `.length` SÍ se cuenta** | 2 |
| `int sumaPrincipal = 0;` | declaración + asignación | 2 |
| `int sumaSecundaria = 0;` | declaración + asignación | 2 |
| `for (int i = 0; …)` | declaración + asignación | 2 (1 vez) |
| `i < n` | comparación, **se evalúa n+1 veces** | 1 |
| `i++` | incremento (suma + asignación), n veces | 2 |
| `sumaPrincipal += A[i][i];` | acceso + suma + asignación | 3 |
| `sumaSecundaria += A[i][n-i-1];` | acceso + suma + operación(n-i-1) + asignación | 4 |
| `return sumaPrincipal == sumaSecundaria;` | comparación | 1 |

`T(n) = 9 + Σ_{i=0}^{n-1}(1+2+3+4) + 1 = 10 + Σ_{i=0}^{n-1} 10 = 10 + 10n → O(n)`
(9 = 2+2+2+2+1: las tres declaraciones, el `int i=0` y el `return`; el `+1` suelto es la evaluación final falsa de `i<n`.)

**(b) Plantilla Excel, `creating_Integer_Array(n)`:**

| Línea | Costo |
|---|---|
| `if (n <= 0)` | 1 |
| `throw new RuntimeException(...)` | k (no se ejecuta en el caso normal → no entra al T(n)) |
| `Integer v[] = new Integer[n];` | k |
| `int i = 0;` | 2 |
| `while (i < n)` | 1, se evalúa n+1 veces |
| `v[i++] = new Random().nextInt(n);` | 2 + k |
| `return v;` | 1 |
| Invariante | `i == n` |

`T(n) = 1 + k + 2 + 1 + Σ_{i=1}^{n}(2 + k + 1) + 1 = 5 + k + Σ_{i=1}^{n}(3+k) = 5 + k + n(3+k) = 3n + kn + k + 5 → O(n)`

### 1.1 Tabla resumen (regla general del juego, modo "Profesor")

| Instrucción | Costo | Comentario |
|---|---|---|
| `int x = 0;` | 2 | declaración + asignación |
| `int n = A.length;` | 2 | `.length` (1) + asignación (1) |
| **Cada acceso a un arreglo** | **1** | lectura Y escritura; `A[i][j]` cuenta 1 (no 2). `v[i] = v[i] + v[j]` → 1 (acceso izq) + 1 (igualación) + 1 + 1 (accesos der) + 1 (suma) = **5** (confirmado en asesoría) |
| **`.length` en cualquier parte** | **+1 cada vez que se evalúa** | `i < v.length` → 2 ; `i < v.length - c` → 3 ; `new int[v.length]` → k+1 (confirmado en asesoría) |
| `int x = expr;` | 2 + ops(expr) | ej. `int x = n*n+5;` → 4 ; `int n2 = j+10;` → 3 |
| `x = y;` | 1 | asignación simple |
| `i++` `i--` `i += 2` `i = i + 2` `i *= 3` `i = i / 2` `n /= 10` | 2 | operación + asignación |
| `x += expr` | 2 + ops(expr) | `suma += v[i]` → 3 ; `c += k*n*j` → 4 ; `sum += n % 10` → 3 |
| `x = expr` | 1 + ops(expr) | `p = p + i*i` → 3 ; `suma = suma + a[i][k]*b[k][j]` → 5 |
| Condición de ciclo / `if` | 1 (+1 por operador aritmético dentro, +1 por `.length`) | `i < n` → 1 ; `k < n*j` → 2 ; `guess*guess < n` → 2 ; `i % 2 == 0` → 2 ; `i < v.length` → 2 |
| Condición de ciclo: veces | **t + 1** | t dentro de la sumatoria, +1 suelto al salir |
| `return x;` `return a == b;` | 1 | |
| `else` | 0 | |
| `new …`, `System.out.println`, `Math.sqrt`, `random()` | k (constante) | se deja como letra |
| Llamada a método propio `M(n)` | T_M(n) completo | dentro de un ciclo: × número de veces que corre |
| Llaves, comentarios | 0 | |

`ops(expr)` = cada acceso a arreglo (1) + cada operador aritmético (1). **Peculiaridad del profe:** la aritmética dentro de un índice (`A[i][n-i-1]`) la contó como **1 sola "operación"**, no 2. El juego usa el valor del profe como "exacto" y acepta el conteo operador-por-operador como "válido (el profe lo agrupa)". El Big-O nunca cambia.

### 1.2 Modelo T(n) que el profe quiere ver escrito

```
T(n) = [costos fijos antes] + Σ_{i=a}^{b} ( cond + cuerpo + actualización ) + 1 (cond. falsa) + [costos después]
```
Pasos que califica: (1) costo de cada OE encima/al frente de cada línea, (2) cuántas veces corre cada ciclo, (3) sumatoria explícita, (4) invariante (condición al salir: `i == n`, `k == 0`, `n <= 1`), (5) simplificación con las identidades, (6) Big-O y justificación.

### 1.3 Convención "Hojas resumen" (interruptor secundario del juego)

Todo vale 1: `int i=0` → 1, `i++` → 1, `suma = suma + A[i]` → 3 (acceso, suma, asignación), `suma += A[i]` → 3. Ciclo for con cuerpo c: `T = 1 + (t+1) + t + t·c = (2+c)t + 2` (con c=1: `3t+2`). Diferencias con el profe: inicialización 1 vs 2, actualización 1 vs 2. El juego avisará "con la convención X el T(n) sería …; el Big-O es el mismo".

---

## 2. Fórmulas de iteraciones (t = número de veces que corre el cuerpo)

Ciclo `for (i = inicio; condición; salto)`. `⌈x⌉` = techo, `⌊x⌋` = piso.

| Salto | Condición | t | Ejemplo (n=10) |
|---|---|---|---|
| `i += m` | `i < n` | `⌈(n − inicio)/m⌉` | `i=0; i<n; i++` → n ; `i=0; i<n; i+=2` → ⌈n/2⌉ = 5 |
| `i += m` | `i <= n` | `⌊(n − inicio)/m⌋ + 1` | `i=1; i<=n; i++` → n ; `i=1; i<=n; i+=3` → ⌊9/3⌋+1 = 4 |
| `i -= m` | `i > n` | `⌈(inicio − n)/m⌉` | `i=n; i>0; i--` → n |
| `i -= m` | `i >= n` | `⌊(inicio − n)/m⌋ + 1` | `i=n-1; i>=0; i--` → n ; `i=n-1; i>=0; i-=2` → ⌈n/2⌉ |
| `i *= m` | `i < n` | `⌈log_m(n / inicio)⌉` | `k=1; k<n; k*=3` → ⌈log₃ n⌉ |
| `i *= m` | `i <= n` | `⌊log_m(n / inicio)⌋ + 1` | `i=1; i<=n; i*=2` → ⌊log₂ n⌋+1 |
| `i /= m` (división entera) | `i > n` | `⌊log_m(inicio / (n+1))⌋ + 1` | `k=n; k>0; k/=2` → ⌊log₂ n⌋+1 ; `n=n/9` con `n>1` → ⌊log₉(n/2)⌋+1 |
| `i /= m` (división entera) | `i >= n` | `⌊log_m(inicio / n)⌋ + 1` | `i=n; i>=1; i/=2` → ⌊log₂ n⌋+1 |

Reglas prácticas:
- `<` vs `<=`: con `<=` el límite **sí entra** → suele dar una vuelta más.
- Verificar siempre que el salto **acerque** al límite; si no, el ciclo no termina o no entra.
- **En el examen** basta escribir `log_m(n)` para los ciclos multiplicativos/divisivos (el profe lo hace así). El juego acepta como correcta cualquier fórmula que esté a ±1 vuelta del conteo exacto para todo n (`⌈log₃ n⌉`, `⌊log₃ n⌋+1`, `log₃ n`), y muestra la exacta.
- Ciclos anidados dependientes: primero t del externo, luego t_interno(i) para cada i, luego `Σ_i t_interno(i)`.
- **Traza para n pequeño** es la mejor forma de destrabar: escribe los valores que toma la variable y cuéntalos.

Casos especiales (todos entran a la Fase 2):
| Caso | Fuente | t |
|---|---|---|
| `int n2 = j+10; while (n2 < j)` | simulacro P2 | **0** (nunca entra; solo cuesta 1 evaluación) |
| `for (i = n*n+5; i >= n*n; i /= 2)` | simulacro P1, `M(n)` | **1** para n ≥ 3 (3 si n=1, 2 si n=2) → O(1), parece log pero no lo es |
| `guess*guess < n` con `guess++` | Hoja 1 #20 | `⌈√n⌉ − 1` → O(√n) |
| `while (n != 0) n /= 10` | Hoja 1 #22 sumDigits | `⌊log₁₀ n⌋ + 1` = número de dígitos |
| `while (i <= n && j <= n)` avanzando i **o** j | Hoja 1 #3 | entre n y **2n − 1** → O(n) |
| `while (i < j)` con `i *= 2` **o** `j /= 2` | Hoja 1 #7 | ≈ `⌈log₂ n⌉` sin importar la rama (la razón j/i se parte a la mitad en cada vuelta) |
| `while (a[i] <= a[j])` | Hoja 1 #12 | depende de los datos: mejor 0, peor n − i |

---

## 3. Identidades de sumatorias y logaritmos (las que se usan en el parcial)

Sumatorias:
- `Σ_{i=a}^{b} c = c·(b − a + 1)` (la más usada; con a=0, b=n−1 → `c·n`; con a=1, b=n → `c·n`)
- `Σ_{i=1}^{n} i = n(n+1)/2` ; `Σ_{i=0}^{n-1} i = n(n−1)/2`
- `Σ_{i=m}^{n} i = n(n+1)/2 − m(m−1)/2` (para `j` desde `i+1`)
- `Σ_{i=1}^{n} i² = n(n+1)(2n+1)/6`
- `Σ_{i=1}^{n} i³ = (n(n+1)/2)²`
- `Σ_{i=k}^{n} f(i) = Σ_{i=1}^{n} f(i) − Σ_{i=1}^{k-1} f(i)` (partir en dos)
- `Σ_{i=0}^{n} 2^i = 2^{n+1} − 1` ; `Σ_{i=0}^{n} a^i = (a^{n+1} − 1)/(a − 1)` (para desenrollar recurrencias)
- Sacar constantes: `Σ c·f(i) = c·Σ f(i)` ; separar sumas: `Σ (f+g) = Σf + Σg`
- Anidadas independientes: `Σ_{i} Σ_{j} c = c · t_i · t_j`
- Anidadas dependientes (`j` desde `i+1` hasta `n−1`): `Σ_{i=0}^{n-2} (n − 1 − i) = Σ_{m=1}^{n-1} m = n(n−1)/2` (cambio de variable `m = n−1−i`)

Logaritmos:
- Cambio de base: `log_b a = log_c a / log_c b` → `log₉ n = log₃ n / log₃ 9 = (log₃ n)/2` ; `log₃ n = log₂ n / log₂ 3` (constante) → **la base no cambia el Big-O**.
- `log(a·b) = log a + log b` ; `log(a/b) = log a − log b` ; `log(a^k) = k·log a`
- `log_b(b^a) = a` ; `b^{log_b a} = a` ; `(a^b)^c = a^{bc}`
- Vueltas de `k /= 2` hasta 1: `log₂ n`; de `k *= 3` hasta n: `log₃ n`; de `n /= 10`: `log₁₀ n`.

Simplificación a Big-O: quedarse con el término dominante y quitar constantes. Orden: `1 < log n < √n < n < n log n < n² < n³ < 2^n`.

---

## 4. Lista de trampas (cada una tendrá su tarjeta "trampa/aclaración" en el juego)

1. **`log₃` vs `log₂` en el simulacro P1.** La respuesta del profe dice `n²·log₃(n)` pero el ciclo hace `k = k/2` → son `⌊log₂ n⌋+1` vueltas. En Big-O da igual (`log₃ n = log₂ n / log₂ 3`), pero al escribir la sumatoria pon la base correcta: `log₂`. Si en el parcial pones `log₂` con la justificación "divide entre 2", estás bien.
2. **Ciclo que parece logarítmico y es constante:** `M(n)`: `for (i = n²+5; i >= n²; i /= 2)` corre 1 vez para n ≥ 3 (`(n²+5)/2 < n²` si n ≥ 3). `M(n)` es O(1) → no aporta al orden.
3. **Ciclo que nunca entra:** `n2 = j + 10; while (n2 < j)` → 0 vueltas, cuesta 1 (la evaluación). No contribuye al orden pero SÍ va en el T(n).
4. **Método llamado dentro de un ciclo:** su T se multiplica por las vueltas. `getUFPS` llama a `algunValor` (log₃ n) dentro de un while de log₉ n vueltas → `log₉ n · log₃ n = (log₃ n)²/2` → Θ(log² n).
5. **Argumento que cambia entre llamadas:** en `getUFPS`, `n` se divide entre 9 en cada vuelta, así que `algunValor(n)`, `algunValor(n/9)`, … . Para el parcial se usa la **cota superior** (`algunValor(n)` en todas) y se aclara "≤".
6. **Ciclo oculto en un método (Hoja 1 #21 copyArray):** un solo `for` visible, pero `appendToNew` copia i elementos → `Σ_{i=0}^{n-1} i = n(n−1)/2` → O(n²), no O(n).
7. **Bug de `sqrt` (Hoja 1 #20):** la condición `guess*guess < n` hace que `guess*guess == n` nunca sea verdadera dentro del ciclo → siempre retorna −1. Complejidad `⌈√n⌉−1` → O(√n). Mejor caso = peor caso.
8. **Variable que no se usa (Hoja 1 #23 sortByValue):** `swapCount` no controla nada → no hay mejor caso; siempre `n(n−1)/2` comparaciones → Θ(n²).
9. **`i % 2` (suma1 vs suma2):** `suma1` hace n vueltas con `if` en cada una y solo suma en ⌈n/2⌉; `suma2` hace ⌈n/2⌉ vueltas sin `if`. Ambos O(n); `suma2` es más eficiente por número de iteraciones (n vs ⌈n/2⌉) y por instrucciones por iteración (5 + 3·[par] vs 6). Decir solo "ambos O(n)" NO vale.
10. **`<` vs `<=`**: `for (j = i+1; j <= n; …)` da `n − i` vueltas; `j < n` da `n − i − 1`.
11. **`i -= 2` desde `n−1`:** `⌈n/2⌉` vueltas (para n impar se incluye el 0).
12. **Recursión que no termina:** `Contar(izq*2, der)` con `izq = 0` se queda en 0 → infinito; `dos(a, x, y/2)` con y → 0. Se analiza "suponiendo que termina" y se dice.
13. **Índices fuera de rango en pseudocódigo** (`a[i][j+1]`, `a[j]` con j = n+1 en #12). En Java hay que agregar guardas (`j < n &&`); cambia el mejor/peor caso.
14. **Mejor y peor caso solo existen si hay `if`/`while` dependiente de datos o salida anticipada.** Si el algoritmo siempre recorre todo (`suma de matriz`, `contar x`), no hay mejor/peor → O = Ω = Θ y hay que **escribir por qué**.
15. **Big-O ≠ eficiencia real.** El tipo C se responde contando iteraciones y OE, no con la O.
16. **Condición del ciclo se evalúa t+1 veces.** Olvidar el `+1` suelto es el error más común de forma.
17. **Escalamiento:** si T es O(n²) y n se duplica, el tiempo se multiplica por 4; si es O(√n) y n se cuadruplica, por 2; si es O(log n), casi no cambia. (Amdahl queda fuera del parcial según el estudiante; fórmula por si acaso: `S = 1/((1−f) + f/k)`.)

---

## 5. Banco de ejercicios clasificado

Leyenda de fase: F1 contador de OE, F2 vueltas, F3 anidados/llamadas/recursión, F4 diseño, F5 teoría rápida + escalamiento, F6 jefe final (variantes nuevas). `t` = vueltas, `T` = T(n) canónico con convención Profesor (se recalcula en el JSON; aquí la forma), `O` = Big-O.

### 5.1 TIPO A – Dado código, hallar T(n) paso a paso

| # | Nombre | Fuente | Fase | Qué practica | Resultado esperado |
|---|---|---|---|---|---|
| A01 | `creating_Integer_Array` | Plantilla Excel | F1 | while, `k`, invariante `i==n` | `T = 5 + k + Σ_{i=1}^{n}(3+k) = 3n + kn + k + 5` → O(n) |
| A02 | `sonIgualesD` | Simulacro P3 (solución) | F1 | for, accesos a matriz, `+=` | `T = 9 + Σ_{i=0}^{n-1} 10 + 1 = 10n + 10` → O(n) |
| A03 | `aSaber` con `i--` | Hoja 1 #16 | F1, F2 | while decreciente `i >= 0`, t = n | `T = 7 + Σ_{i=0}^{n-1}(1+3+2) = 6n + 7` → O(n) |
| A04 | `aSaber` con `i -= 2` | Hoja 1 #17 | F1, F2 | `⌈n/2⌉` vueltas | `T = 7 + 6⌈n/2⌉` → O(n) |
| A05 | `max(x, y)` | Hoja 1 #15 | F1 | if/else, O(1), mejor = peor | `T = 4` → O(1) |
| A06 | `intercambia` | Hoja 1 #14 | F1 | secuencia, O(1) | `T = 4` (aux decl+asig 2, dos asignaciones) → O(1) |
| A07 | `sumDigits` | Hoja 1 #22 | F2, F3 | `n /= 10`, `%` | `t = ⌊log₁₀ n⌋+1`; `T = 4 + Σ(1+3+2)` → O(log n) |
| A08 | `sqrt(n)` | Hoja 1 #20 | F2, F3 | `guess*guess < n`, trampa del `==` | `t = ⌈√n⌉−1` → O(√n) |
| A09 | Triple for producto de matrices | Hoja 1 #4 | F3 | anidados independientes n³ | `Σ_i Σ_j (… + Σ_k 5 …)` → O(n³) |
| A10 | `p = p + i*i` con `for j=1..p` | Hoja 1 #5 | F3 | interno depende del acumulado; Σi², Σi³ | `t_total = Σ_{i=1}^{n} i(i+1)(2i+1)/6` → O(n⁴) |
| A11 | `while i≤n and j≤n` (i o j) | Hoja 1 #3 | F2 | dos índices, mejor n / peor 2n−1 | O(n), Ω(n) |
| A12 | `while i<j` (`i*=2` o `j/=2`) | Hoja 1 #7 | F2 | razón j/i se parte en 2 | `t ≈ ⌈log₂ n⌉` → Θ(log n) |
| A13 | `inserción` + `posMinimo` | Hoja 1 #10 | F3 | llamada dentro de for, `Σ(n−1−i)` | `n(n−1)/2` comparaciones → O(n²) |
| A14 | `inserción` inline (selección) | Hoja 1 #19 | F3 | j desde i+1, `Σ_{m=1}^{n-1} m` | O(n²), mejor = peor en orden |
| A15 | `invierte` (j desde i+1 hasta n) | Hoja 1 #11 | F3 | `Σ_{i=0}^{n-1}(n−i) = n(n+1)/2` | O(n²) |
| A16 | `max cont` con `while a[i]≤a[j]` | Hoja 1 #12 | F2, F3 | while dependiente de datos | mejor Ω(n) (descendente), peor O(n²) (ascendente) |
| A17 | `burbuja` (i desde 2, j hasta n−i) | Hoja 1 #18 | F3 | límites raros, `Σ_{m=2}^{n-1} m = n(n−1)/2 − 1` | O(n²) |
| A18 | `sortByValue` + `swap` | Hoja 1 #23 | F3 | while+for, `Σ_{c=1}^{n-1}(n−c)`, trampa swapCount | Θ(n²) |
| A19 | `copyArray` + `appendToNew` | Hoja 1 #21 | F3 | ciclo oculto en método, `new` = k | `Σ_{i=0}^{n-1}(k + 3i + …)` → O(n²) |
| A20 | 17(a) tres for secuenciales con √n | Hoja 1 #17a | F3, F5 | sqrt(n)/2 + sqrt(n)/4 + (8 + j) | sum++ = √n + 8 → O(√n) |
| A21 | 17(b) anidado √n·8·8 | Hoja 1 #17b | F3, F5 | internos constantes (8 vueltas) | 32√n → O(√n) |
| A22 | 17(c) `j < i*i`, `k < j`, `if j%i==1` | Hoja 1 #17c | F3 | solo cuenta sum++ | sum++ ≈ 2n⁴ → O(n⁴) (¡el ciclo corre n⁵ veces, pero sum++ n⁴!) |
| A23 | 17(d) igual con `if (j % i)` | Hoja 1 #17d | F3 | | sum++ ≈ 3.2n⁵ → O(n⁵) |
| A24 | Simulacro P1: `metodo` + `M(n)` | Simulacro P1 | F3 | for-for-for `k/2`, llamada a M, trampa log₃/log₂ y M=O(1) | `T = 5 + k + 6n + 6n² + n²(⌊log₂n⌋+1)(7 + T_M)`, `T_M = 12 + k` → O(n² log n) |
| A25 | Simulacro P2: `getUFPS` + `algunValor` | Simulacro P2 | F3 | `n/9`, `k*=3`, while que no entra, cota superior | `T_aV = 7 + 8⌈log₃ n⌉`; `T ≤ 3 + log₉n·(3 + T_aV(n))` → Θ(log² n) |
| A26 | `Contar(izq*2, der)` | Hoja 1 #6 | F3 (recursivo) | recurrencia `T(d) = c + T(d/2)` desenrollada | `⌈log₂(der/izq)⌉` llamadas → O(log n) |
| A27 | `Primero` / `Segundo` (mutua) | Hoja 1 #8 | F3 (recursivo) | `T_P(n) = 2·T_S(n) + c`, `T_S(x) = x + 2·T_P(x/2)` → `T(n) = 4T(n/2) + 2n` | desenrollar: `4^k T(n/2^k) + 2n(2^k − 1)` → Θ(n²) |
| A28 | `dos(a, x, y)` | Hoja 1 #9 | F3 (recursivo) | y/2 o 2x, misma idea que A12 | `⌈log₂(y/x)⌉` llamadas → O(log n) |

### 5.2 TIPO B – Diseñar con cota, escribir Java, hallar T(n), mejor/peor, O y Ω

| # | Problema | Fuente | Estrategias que el juego ofrece (elegir la correcta) | Peor / Mejor | O / Ω |
|---|---|---|---|---|---|
| B01 | Diagonal principal == secundaria (`sonIgualesD`) | Simulacro P3 | (a) dos for n² sumando con if `i==j` ✗ (b) un for con `A[i][i]` y `A[i][n-1-i]` ✓ | no hay (siempre n) | O(n) = Ω(n) |
| B02 | Faltante en 1..n+1 en O(n) | Hoja 1 parte 1 #1 | (a) buscar cada k en el arreglo n² ✗ (b) `(n+1)(n+2)/2 − Σ` ✓ | no hay | O(n) = Ω(n) |
| B03 | ¿n es triangular? | Hoja 1 parte 1 #2 | (a) acumular 1+2+… hasta ≥ n → O(√n) ✓ (b) fórmula `8n+1` cuadrado perfecto O(1) | peor: no es triangular | O(√n) / Ω(1) |
| B04 | Dos pares de cubos (1729) | Hoja 1 p2 #1 | (a) a,b hasta n → O(n²) ✗ (b) a,b hasta ∛n → O(n^{2/3}) ✓ (c) a hasta ∛n, b = ∛(n−a³) → O(∛n) | peor: sin pares (recorre todo) ; mejor: los dos pares aparecen al inicio | O(n^{2/3}) / Ω(1) |
| B05 | Cuadrados perfectos entre a y b | Hoja 1 p2 #2 | (a) recorrer a..b probando √ → O(b−a) (b) i desde ⌈√a⌉ mientras i² ≤ b → O(√b − √a) ✓ (c) `⌊√b⌋ − ⌈√a⌉ + 1` O(1) | no hay | según estrategia |
| B06 | Tripleta pitagórica con n | Hoja 1 p2 #3 | (a) doble for a,b ≤ n → O(n²) ✗ (b) un for a=1..n probando `n²±a²` cuadrado perfecto → O(n) ✓ (c) fórmula par/impar O(1) | peor: no existe ; mejor: a=1 sirve | O(n) / Ω(1) |
| B07 | x^n | Hoja 1 p2 #4 | (a) for n multiplicaciones → O(n) ✓ (b) exponenciación binaria → O(log n) | no hay | O(n) = Ω(n) |
| B08 | Residuo m mod n solo con sumas/restas | Hoja 1 p2 #5 | (a) `while (m >= n) m -= n` → `⌊m/n⌋` vueltas ✓ | peor: n = 1 → m vueltas ; mejor: m < n → 0 | O(m/n) ⊆ O(m) / Ω(1) |
| B09 | Contar x en arreglo | Hoja 1 p2 #6 | un for → O(n) | no hay (hay que decirlo) | O(n) = Ω(n) |
| B10 | Suma posiciones pares | Hoja 1 p2 #7 (= suma2) | (a) for con if `i%2` (b) for `i += 2` ✓ | no hay | O(n) = Ω(n) |
| B11 | Suma de matriz n×n | Hoja 1 p2 #8 | doble for → n² | no hay | O(n²) = Ω(n²) |
| B12 | ¿Matriz simétrica? | Hoja 1 p2 #9 | (a) comparar todo n² (b) solo j > i con salida temprana ✓ | peor: simétrica `n(n−1)/2` ; mejor: `A[0][1] ≠ A[1][0]` | O(n²) / Ω(1) |
| B13 | Suma diagonal principal | Hoja 1 p2 #10 | (a) doble for con if ✗ (b) un for `A[i][i]` ✓ | no hay | O(n) |
| B14 | Suma diagonal secundaria | Hoja 1 p2 #11 | un for `A[i][n-1-i]` ✓ | no hay | O(n) |
| B15 | Invertir arreglo en sitio | Hoja 1 p2 #12 | for `i < n/2` intercambiando `v[i]` y `v[n-1-i]` → ⌊n/2⌋ | no hay | O(n) |
| B16 | ¿Está ordenado? | Hoja 1 p2 #13 | for con `if (v[i] > v[i+1]) return false` | peor: ordenado n−1 ; mejor: `v[0] > v[1]` | O(n) / Ω(1) |
| B17 | Faltante 0..n | Hoja 1 p2 #14 | (a) buscar cada valor n² ✗ (b) `n(n+1)/2 − Σ` ✓ | no hay | O(n) |
| B18 | Intersección de A y B (sin repetidos) | Hoja 1 p2 #15 | (a) doble for con break al encontrar → O(n²) ✓ (b) ordenar+merge O(n log n) (c) HashSet O(n) | peor: sin comunes n² ; mejor: cada A[i] == B[0] → n | O(n²) / Ω(n) |
| B19 | PoliDivisible | Hoja 1 p2 #16 | calcular d = dígitos; `while (n > 0) { if (n % d != 0) return false; n /= 10; d--; }` | peor: es polidivisible → d vueltas ; mejor: falla en la primera | O(log n) / Ω(1) |

### 5.3 TIPO C – Comparar dos métodos (iteraciones + instrucciones, no solo Big-O)

| # | Métodos | Fuente | Fase | Argumento esperado |
|---|---|---|---|---|
| C01 | `suma1` (if `i%2`) vs `suma2` (`i+=2`) | Simulacro P2(b) | F1 | suma1: n vueltas, `T₁ = 6 + 5n + 3⌈n/2⌉`; suma2: ⌈n/2⌉ vueltas, `T₂ = 6 + 6⌈n/2⌉`. Para n=10: 41 vs 36; n=100: 656 vs 306 → suma2 gana; ambos O(n) |
| C02 | `aSaber i--` vs `aSaber i-=2` | Hoja 1 #16 vs #17 | F1 | n vs ⌈n/2⌉ vueltas; mismo costo por vuelta; ambos O(n) (¡hacen cosas distintas! sirve para el argumento de conteo) |
| C03 | `posMinimo` (llamada) vs `inserción` inline | Hoja 1 #10 vs #19 | F3 | mismas n(n−1)/2 comparaciones; la versión con llamada suma el costo fijo de la llamada n−1 veces |
| C04 | `copyArray` con `appendToNew` vs copia directa `new int[n]` + un for | Hoja 1 #21 vs variante | F3 | O(n²) vs O(n); contar `Σ i` vs n |
| C05 | x^n iterativo vs binario | B07 | F4 | n vs ⌊log₂ n⌋+1 multiplicaciones |
| C06 | Faltante por búsqueda (n²) vs por suma (n) | B02/B17 | F4 | n(n+1)/2 comparaciones vs n sumas |

### 5.4 Teoría rápida (Fase 5) – preguntas conceptuales cortas

Según el estudiante, el parcial trae **preguntas teóricas normales de complejidad y costo** (no Amdahl). Banco de preguntas de opción múltiple / respuesta corta, cada una con explicación de 2 líneas:

| # | Pregunta tipo | Respuesta esperada |
|---|---|---|
| Q01 | ¿Qué es una operación elemental (OE)? | Instrucción básica de tiempo constante: asignación, aritmética, comparación, acceso a arreglo, return, llamada |
| Q02 | ¿Qué mide T(n)? | Número total de OE en función del tamaño de la entrada n (peor caso salvo que se diga otra cosa) |
| Q03 | ¿Cuántas veces se evalúa la condición de un ciclo que da t vueltas? ¿Por qué? | t + 1: t verdaderas y 1 falsa que hace salir |
| Q04 | ¿Qué es la invariante en este curso? | La condición que se cumple al salir del ciclo (ej. `i == n`) |
| Q05 | Definición de O(g(n)) / Ω(g(n)) / Θ(g(n)) | O: existen c, n₀ con T(n) ≤ c·g(n) para n ≥ n₀ (cota superior); Ω: cota inferior; Θ: ambas |
| Q06 | ¿Por qué `3n² + 10n + 7` es O(n²)? | Término dominante; las constantes y términos menores no afectan para n grande |
| Q07 | Ordenar de menor a mayor: n log n, 2ⁿ, log n, n², √n, n, 1, n³ | 1 < log n < √n < n < n log n < n² < n³ < 2ⁿ |
| Q08 | ¿Por qué log₂ n y log₃ n son el mismo orden? | Cambio de base: log₃ n = log₂ n / log₂ 3, constante |
| Q09 | ¿Cuándo tiene sentido hablar de mejor y peor caso? | Cuando hay `if`/`while` que dependen de los datos o salida anticipada; si no, no existen y O = Ω = Θ |
| Q10 | ¿Qué diferencia hay entre T(n) y Big-O? | T(n) es el conteo exacto; Big-O es el orden de crecimiento asintótico |
| Q11 | Dos algoritmos O(n): ¿son igual de eficientes? | No necesariamente: se comparan iteraciones e instrucciones (tipo C) |
| Q12 | ¿Cuál es la complejidad de un ciclo `i *= 2` / `i /= 2` / `guess*guess < n`? | log n / log n / √n |
| Q13 | ¿Cuánto cuesta una llamada a un método dentro de un ciclo? | T_método × vueltas del ciclo |
| Q14 | ¿Qué pasa con el orden si un ciclo interno corre un número constante de veces? | No cambia el orden (constante) |
| Q15 | Si T(n) = 10 ms para n = 100 y el algoritmo es O(n²), ¿cuánto para n = 200? | 4× → 40 ms (escalamiento; también O(n), O(log n), O(√n) como en Hoja 1 #17) |
| Q16 | ¿Qué es el tamaño de la entrada n en un arreglo / matriz n×n / número n? | longitud / n (o n² celdas) / el valor (ciclos log dependen del valor, no de dígitos) |
| Q17 | ¿Qué cuesta `new`, `println`, `Math.sqrt`? | Constante k |
| Q18 | Un `for` sin cuerpo que corre n veces, ¿qué T(n) tiene? | 2 + (n+1)·1 + 2n = 3n + 3 (convención profe) → O(n) |

Los ejercicios de escalamiento de la Hoja 1 #17 (10 ms → n=400, 40 ms → tamaño) se mantienen como E01–E03 en esta fase porque son "de complejidad y su costo". Amdahl (#18–23) queda **fuera** del juego (solo se deja una tarjeta opcional con la fórmula por si acaso).

### 5.5 Variantes generadas (para no memorizar)

Cada ejercicio de código tendrá un generador que cambia, entre otros: salto (`i++`→`i+=3`, `k/=2`→`k/=4`, `k*=3`→`k*=2`), condición (`<`↔`<=`, `>0`↔`>=1`), inicio (`0`↔`1`, `n`↔`n-1`), límite (`n`↔`n/2`↔`n*n`), método llamado (M(n) constante ↔ M(n) lineal ↔ M(n) log), y qué ciclo "no entra". Toda variante pasa por `verificar` antes de aparecer.

### 5.6 Jefe final (Fase 6) – 4 ejercicios nuevos con la estructura del simulacro

1. Tipo A con métodos anidados y log: for-for con `k *= 2` llamando a un método con `i /= 3` (Θ(n² · log n · log n) o similar).
2. Tipo A con trampa: un ciclo que no entra + un ciclo de ~1 vuelta + `<=`.
3. Tipo B con cota O(n): p. ej. "¿la suma de la fila i es igual a la de la columna i para algún i?" o "número que más se repite en arreglo ordenado".
4. Tipo C: dos métodos que cuentan pares en una matriz (uno con `%`, otro con `j += 2`).
Rúbrica de autocalificación (sobre 5.0): OE por línea (0.8), vueltas de cada ciclo (0.8), sumatorias explícitas (0.8), invariante (0.4), T(n) simplificado (0.8), Big-O + justificación (0.8), diseño correcto / argumento de eficiencia (0.6).

---

## 6. Cómo funcionará `verificar` (VERIFICACIÓN OBLIGATORIA)

- Cada ejercicio de `/data/*.json` trae: código Java mostrado, costos canónicos por línea (Profesor y Hojas), fórmula de `t` por ciclo, `T(n)` canónico, Big-O, y una **versión instrumentada en JS** que ejecuta el algoritmo contando vueltas de cada ciclo y OE reales con la misma tabla de costos.
- `node verificar.js` ejecuta cada instrumentado para n = 1, 2, 3, 5, 8, 10, 17, 50, 100, 1000 (y datos mejor/peor caso donde aplique) y comprueba:
  1. `t(n)` de cada ciclo == vueltas contadas (exacto; para fórmulas "de examen" tipo `log₃ n` se exige |dif| ≤ 1).
  2. `T(n)` canónico == OE contadas (exacto) — o, para ejercicios marcados `cota: true` (getUFPS), `T(n) ≥ OE` y `T(n)/OE` acotado.
  3. Big-O declarado coincide con el crecimiento medido (razón `OE(2n)/OE(n)` dentro del rango esperado).
- Sale con código ≠ 0 y lista qué ejercicio y qué n fallaron. El juego solo carga `data/` si `verificar` pasó (el script escribe un sello `data/_verificado.json` con hash).
- Discrepancias encontradas en el material y cómo se muestran: `log₃` del simulacro P1 (trampa 1), bug de `sqrt` (trampa 7), `swapCount` (trampa 8), índices fuera de rango en #3 y #12 (trampa 13).

---

## 7. Plan de fases (confirmado)

| Fase | Entrega | Ejercicios |
|---|---|---|
| 1 | Motor (router, localStorage, KaTeX local, resaltado, validador algebraico) + "Contador de OE" | A01, A02, A03, A04, A05, A06, C01, C02 |
| 2 | "¿Cuántas vueltas?" con traza animada y tabla de valores | todas las cabeceras de §2 + casos especiales + A11, A12, A16 |
| 3 | "Anidados, llamadas y recursión" con constructor de sumatorias | A07–A10, A13–A15, A17–A28 |
| 4 | "Diseña el algoritmo" | B01–B19, C03–C06 |
| 5 | "Teoría rápida" (preguntas conceptuales + escalamiento) | Q01–Q18, E01–E03 |
| 6 | "Jefe final" (examen cronometrado, rúbrica) | 4 nuevos |
| 7 | Chuleta imprimible + Repaso rápido 20 min | — |

Prioridad si aprieta el tiempo: 0 → 1 → 2 → 3 → 6 → 4 → 5 → 7.
