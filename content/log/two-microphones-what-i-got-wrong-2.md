---
title: "Two microphones and a delay: questions and corrections (part 2)"
slug: two-microphones-what-i-got-wrong-2
summary: Cross-correlation in code. Which index holds which lag, the sign of a lag, the edges of a shift, and the habits from another language that break Python, as questions, the answers given, and the corrections.
type: post
project: acoustic-localization
series: learning-in-the-open
series_order: 2
tags: [statistical-signal-processing]
links: []
published: true
published_at: 2026-11-26T00:00:00.000Z
media: []
---

Part 1 set up the rig: two microphones $d = 3.34$ cm apart, sampled at 48 kHz, and a numpy toy
in four functions that finds the delay between them. This part covers the second function, the
cross-correlation, and closes a question left open in part 1.

Code below uses two-space indents and some extra line breaks, so it fits a phone screen. Nothing
else in the submitted code is changed.

## 1. A shift to the left, past the end

**Question** (open from part 1): the corrected `delay_copy` handles $k = 7$ on a 5-sample array.
What does it do for $k = -7$?

**Answer:** none given before the fix was shown.

**Correction:** it crashes. The `k < 0` branch runs and asks for

```python
y[:len(x)+k] = x[-k:len(x)]
# y[:-2]  -> 3 slots
# x[7:5]  -> 0 values
```

Three slots, no values: the same `ValueError` as $k = 7$ in part 1, from the other side. The
right shift was guarded by `k < len(x)`; the left shift had no such guard. The rule both sides
share: a shift leaves something in the window only while $|k| < n$. Past that, the output is all
zeros.

```python
def delay_copy(x, k):
  y = np.zeros_like(x)
  n = len(x)
  if 0 <= k < n:
    y[k:] = x[:n - k]
  elif -n < k < 0:
    y[:n + k] = x[-k:]
  # |k| >= n: y stays zeros
  return y
```

The `y[:k] = 0` line from the first version is gone too: `y` starts as zeros already.

## 2. Cross-correlation: the idea

**Context:** the second function of the toy, `xcorr_lags(a, b)`, returns the full
cross-correlation of two channels and, next to each value, the lag it belongs to.

**The idea:** hold `a` still. Write `b` underneath, shifted $L$ samples to the right. Multiply the
samples that sit on top of each other and add them up. That sum is the correlation at lag $L$:

$$
c(L) = \sum_n a[n + L]\, b[n]
$$

Repeat for every $L$ where the two still overlap. If `a` is `b` delayed by $k$, then at $L = k$
every sample of `b` sits on its own copy: each product is a square, nothing cancels, and the sum
peaks. At any other lag the samples meet strangers and partly cancel.

**From radio:** this is frame synchronisation. Slide the known preamble along the received
samples, multiply and add at each offset; the offset of the peak is the timing. Here `b` plays the
preamble and the peak offset is the delay between the microphones.

**A small case**, `a = [1, 2, 3]`, `b = [1, 10]`:

```text
L = -1: a[0]b[1]          = 10
L =  0: a[0]b[0]+a[1]b[1] = 21
L = +1: a[1]b[0]+a[2]b[1] = 32
L = +2: a[2]b[0]          =  3
```

`np.correlate([1,2,3], [1,10], "full")` returns `[10 21 32 3]`: the same four numbers, in order of
lag, from the most negative.

## 3. Which sign is which lag

**Question:** with `a` and `b` both 3 samples long, at which lag does the last sample of `a` meet
the first sample of `b`?

**Answer:** $-2$, picturing `a` moved 2 places to the left. Wrong sign.

**Correction:** $+2$. Moving `a` left by 2 and moving `b` right by 2 are the same picture; only
the relative position counts. Which of the two gets the plus sign is set by the physics, not by
which array is drawn moving. Here lag $+k$ means **`a` is `b` delayed by $k$**: microphone 0
hears the sound $k$ samples later, so the source is on the right. If `a` is late, `b` must move
right to sit under its own copy, so that picture is $+L$.

**The check that catches it:** symmetric test data, such as `a = b = [1, 2, 3]`, gives symmetric
sums (3, 8, 14, 8, 3), and a flipped sign passes. A delayed pair does not: with `a` equal to `b`
delayed by 1, the peak must come out at $+1$. With the sign flipped, every bearing points to the
wrong side.

## 4. In code: `xcorr_lags`

**Question:** write `xcorr_lags(a, b)`, returning the correlation values and an integer array of
their lags.

**Answer:** a loop that shifts `b` with `delay_copy`, multiplies by `a` and sums. The idea is
right, and its sums match `np.correlate`. The first version:

```python
def xcorr_lags(a, b):
  len_a = len(a)
  len_b = len(b)
  lag_range = len_a + len_b - 1
  slag = -(len_a - 1)
  corr_array = np.ndarray(
    lag_range)
  if (len_a == len_b):
    for lag in range(lag_range):
      corr_array(slag) = sum(
        delay_copy(b, slag) * a)
      slag += 1
  return corr_array
```

```text
SyntaxError: cannot assign to
function call here
```

**What was missed:**

1. **Round brackets call, square brackets index.** `corr_array(slag)` calls the array as a
   function. Storing into it is `corr_array[...]`.
2. **Storing at the lag instead of the position.** The lag runs $-2 \dots 2$; the positions in the
   array run $0 \dots 4$. A negative index is legal in Python: it counts from the end. With the
   brackets fixed and nothing else, the output comes out scrambled, with no error:

   ```text
   at the lag:   14 8 3 3 8
   at position:   3 8 14 8 3
   ```

3. **The first lag from the wrong length.** The first lag is $-(\text{len}(b) - 1)$: `b` slides
   left until only its last sample touches the start of `a`. Using `len_a` is right only when the
   lengths are equal, which is what the `if` was protecting. With 8 and 10 samples it computes two
   lags with no overlap at one end and misses two real lags at the other.
4. **The guard fails silently.** For unequal lengths the `if` skips the loop and returns the
   array uninitialised: whatever was in memory. `np.ndarray(n)` does not clear its memory;
   `np.zeros(n)` does.
5. **Only half the answer returned.** The function promises a pair, `(c, lags)`. The lags were
   never built.

**Second attempt:**

```python
  slag = -(len_b - 1)
  corr_array = np.ndarray(
    lag_range)
  lag_array = np.ndarray(
    lag_range)
  for lag in range(lag_range):
    corr_array(lag) = sum(
      delay_copy(b, slag) * a)
    lag_array(lag) = slag
    slag += 1
  return corr_array, lag_array
```

Points 2, 3 and 5 fixed: stored by position, first lag from `len_b`, the `if` gone, the pair
returned. Still failing:

1. **Round brackets**, twice: the same `SyntaxError`.
2. **Float lags.** `np.ndarray` makes a float array; the lags must be integers.
3. **Two counters kept by hand.** `lag` and `slag` both step by one per pass. They agree only as
   long as nobody edits one without the other.

**Correction:**

```python
def xcorr_lags(a, b):
  assert len(a) == len(b)
  len_a, len_b = len(a), len(b)
  n = len_a + len_b - 1
  first = -(len_b - 1)
  lags = np.arange(first, len_a)
  c = np.zeros(n)
  for i in range(n):
    c[i] = np.sum(
      delay_copy(b, lags[i]) * a)
  return c, lags
```

- `np.arange(first, len_a)` builds every label in one line, as integers. It stops *before*
  `len_a`, so the last lag is `len_a - 1`.
- `i` says where a sum is stored, `lags[i]` says what it means. One table, no second counter.
- The `assert`: `delay_copy(b, ...)` keeps the length of `b`, so `* a` needs equal lengths. Two
  channels of one recording always have them. The `assert` fails loudly where the old `if` failed
  silently.

The same function in numpy, any lengths, same lag axis:

```python
def xcorr_lags(a, b):
  c = np.correlate(a, b, "full")
  first = -(len(b) - 1)
  lags = np.arange(first, len(a))
  return c, lags
```

**Third attempt**, written from recall:

```python
def xcorr_lags(a, b):
  len_a = len(a)
  len_b = len(b)
  lag_range = len_a + len_b - 1
  lags = np.arange(
    -(len_b-1), len_a)
  corr_array = np.zeros(
    lag_range)
  for lag in range(lag_range):
    corr_array[lag] = sum(
      delay_copy(b, lags[lag]) * a)
  return corr_array, lags
```

All checks pass, and on two 960-sample channels it matches `np.correlate`: 1919 values, lags
$-959$ to $959$. What is left is polish, not correctness:

1. **The name `lag` holds a position.** It runs $0 \dots n-1$, while `lags[lag]` is the lag. A
   name like `i` keeps the two meanings apart when the code is read again later.
2. **No `assert` for equal lengths.** With 8 and 10 samples it stops with a numpy broadcast error
   (`shapes (10,) (8,)`), which is loud, but it names the symptom, not the cause.

`delay_copy`, from recall too, now has `-n < k < 0` and gives all zeros for $k = -7$. It still
carries the `y[:k] = 0` line, which does nothing on an array of zeros.

## 5. The lag axis for unequal lengths

**Question:** with `len(a) = 8` and `len(b) = 10`, what are the first lag, the last lag and the
number of lags?

**Answer:** $-9$ to $8$, 17 lags. First lag and count right, last lag wrong.

**Correction:** $-9$ to $7$. The last lag is $\text{len}(a) - 1 = 7$. The 8 is the `stop` of
`np.arange(-9, 8)`, and `arange` stops one short of its `stop`.

**The check that catches it:** the ends and the count must agree, since count = last − first + 1.
$8 - (-9) + 1 = 18$, not 17. Two answers to one question that contradict each other mean one of
them is wrong.

## 6. Unequal lengths: pad at the end

**Question:** the loop version needs equal lengths. Is padding the shorter array with zeros a
correct fix, and where do the zeros go?

**Answer:** pad the shorter one with zeros. Right, with the place of the zeros left open.

**Correction:** the zeros go at the **end**. A zero adds nothing to any sum, so the real lags keep
their values and their labels; only a few extra lags appear at the edge, holding zeros. Zeros at
the front move every real sample later, which is a delay that is not in the data. Tested with
8 and 10 samples:

```text
zeros at the end of a:
  lags -9..7 = np.correlate
  lags 8, 9  = 0
zeros at the front of a:
  every value 2 lags late
```

```python
x = np.array([1., 2., 3.])
np.pad(x, (0, 2))  # 1 2 3 0 0
np.pad(x, (2, 0))  # 0 0 1 2 3
```

The pair `(before, after)` counts the zeros on each side. To even out two arrays:

```python
n = max(len(a), len(b))
a = np.pad(a, (0, n - len(a)))
b = np.pad(b, (0, n - len(b)))
```

**Remember:** padding at the end is free; padding at the front is a delay.

**When lengths really differ:** never for two channels of one recording, since one clock writes
both. They differ by design when a short known template is searched for in a long recording, as a
receiver searches for a preamble. `np.correlate(a, b, "full")` takes any lengths with no padding.

**Fourth version**, with the padding, any lengths:

```python
def xcorr_lags(a, b):
  len_a = len(a)
  len_b = len(b)
  n = max(len_a, len_b)
  a = np.pad(a, (0, n-len_a))
  b = np.pad(b, (0, n-len_b))
  lag_range = 2*n - 1
  lags = np.arange(-(n-1), n)
  corr_array = np.zeros(lag_range)
  for lag_idx in range(lag_range):
    corr_array[lag_idx] = np.sum(
      delay_copy(b, lags[lag_idx])
      * a)
  return corr_array, lags
```

Tested on 8 against 10, 10 against 8, 3 against 1 and 960 against 960: at every real lag the
value equals `np.correlate`'s, and the extra edge lags hold zeros. The position now has its own
name, `lag_idx`.

**What was missed:** the padding set the lag axis. For unequal lengths the output is longer than
`np.correlate`'s (5 values against 4 for `a = [1, 2, 3]`, `b = [1, 10]`), so the same position
means a different lag in the two:

```text
pos:     0   1   2   3   4
here:    0  10  21  32   3
lags:   -2  -1   0   1   2
numpy:  10  21  32   3
lags:   -1   0   1   2
```

`here[1]` is 10 at lag $-1$; `numpy[1]` is 21 at lag 0. By position they disagree; by lag (32 at
lag $+1$ in both) they agree. Two jobs were mixed: the padding only makes `delay_copy(b, ...) * a`
work, while the lag axis belongs to the original signals.

**Fifth version:** the lags from the original lengths, the padding kept for the loop.

```python
def xcorr_lags(a, b):
  len_a = len(a)
  len_b = len(b)
  n = max(len_a, len_b)
  a = np.pad(a, (0, n-len_a))
  b = np.pad(b, (0, n-len_b))
  lags = np.arange(
    -(len_b-1), len_a)
  corr_array = np.zeros(len(lags))
  for lag_idx in range(len(lags)):
    corr_array[lag_idx] = np.sum(
      delay_copy(b, lags[lag_idx])
      * a)
  return corr_array, lags
```

Identical to `np.correlate`, position by position, on all five length pairs tested.

**Remember:** fix the output axis from the inputs first. Padding, copying and reshaping serve the
computation and never change what the output means.

## 7. The method that works for any shift or window

The same five questions, asked on paper before any code, would have caught every slip above:

1. **Draw** the smallest case that is not symmetric (unequal lengths, distinct values) and work
   out its answer by hand. That is the first test.
2. **Ends:** the first and last value of what the loop runs over, as formulas in the lengths.
   Check them on unequal lengths.
3. **Count** = last − first + 1. It must match any formula already known.
4. **Map:** a position `i` (where a value is stored, $0 \dots n-1$) and a label (what it means,
   here the lag). `label = first + i`. Store at `[i]`, never at the label.
5. **Edges:** zero, negative, a shift of the whole length or more, no overlap. Trace each on the
   small case.

Then **check:** the loop against the hand answer, then numpy against the loop.

## 8. Patterns behind the slips

**Another language's spelling.** Three slips across the two functions are correct MATLAB:

| Written | In MATLAB | In Python |
|---|---|---|
| `x(i) = v` | indexes | calls `x` |
| `k >= 0 & k < n` | logical AND | bitwise, binds first |
| ends `-9` to `8` | `-9:8` includes 8 | `arange` stops before |

The habit to build: square brackets for indexing, `and` between conditions, ranges that stop one
short. In numpy, `&` is right only between bracketed array conditions, `(a > 0) & (b > 0)`.

**The position and the meaning mixed up.** The lag was used as the array index, and two counters
were kept in step by hand. Keep one table of labels, built whole, and look the meaning up from the
position.

**Edges found by the checker, one side at a time.** The right shift past the end crashed first,
then the left shift past the end. Both come from the same rule, $|k| < n$. Write the condition
from what must hold (here: something still overlaps), not by splitting on the sign.

**Guards that fail silently.** The `if len_a == len_b` skipped the work and returned uninitialised
memory. An `assert` or an error says what went wrong at the place it went wrong.

**Arrays filled one slot at a time.** `np.ndarray(n)` plus a fill loop gives floats and garbage
in any slot the loop misses. `np.arange`, `np.zeros` and `np.correlate` build the whole array in
one line, with the right type. A loop stays useful as the reference the numpy version is checked
against.

**Tests that cannot see a sign.** Symmetric data passes a flipped sign. Every small hand case
needs one asymmetric example: unequal lengths, distinct values, or a known delay.

## Still open

- **The window.** The rig only trusts a peak inside $|L| \le d/c$. With $d = 3.34$ cm at 48 kHz,
  how many whole samples is that?
- **The sharp peak.** Why does GCC-PHAT give a much sharper peak than this plain correlation?

Part 3: `peak_lag`, the delay window, and why whole samples give a coarse bearing.
