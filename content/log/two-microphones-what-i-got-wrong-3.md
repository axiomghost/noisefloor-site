---
title: "Two microphones and a delay: questions and corrections (part 3)"
slug: two-microphones-what-i-got-wrong-3
summary: Searching for the correlation peak only where a real delay can be. How wide the delay window is, why 4.67 samples becomes 5, why whole samples give a coarse bearing, and the slicing rules behind a silent wrong answer, as questions, the answers given, and the corrections.
type: post
project: acoustic-localization
series: learning-in-the-open
series_order: 3
tags: [statistical-signal-processing]
links: []
published: true
published_at: 2026-11-27T00:00:00.000Z
media: []
---

Part 2 built the cross-correlation: one sum per lag, with lag $+k$ meaning that channel 0 is
channel 1 delayed by $k$ samples. This part covers the third function of the toy, `peak_lag`. It
finds the peak, but only inside the delay window, where a real delay can be. Turning the lag into
an angle, and the run end to end, follow in part 4.

Code below uses two-space indents and some extra line breaks, so it fits a phone screen. Nothing
else in the submitted code is changed.

## 1. The delay window in whole samples

**Question** (open from part 2): the rig only trusts a peak inside $|L| \le d/c$. With
$d = 3.34$ cm at 48 kHz, how many whole samples is that?

**Answer:** 4.67 samples, rounded to 5, with the formula written as "delay × sample period". The
number is right. The formula as written is wrong, and the rounding came with no reason.

**Correction:** the largest delay is the spacing divided by the speed of sound, and a time becomes
samples by multiplying by the sample rate:

$$
\begin{aligned}
L_{\max} &= \frac{d}{c}\, f_s \\
&= \frac{0.0334}{343.2} \times 48\,000 \\
&= 4.67 \text{ samples}
\end{aligned}
$$

That is 97.3 µs. "Delay × sample period" multiplies two times, 97.3 µs × 20.8 µs, which gives
seconds squared, not samples. The number came out right because the calculation used
delay ÷ period; the line on the page said something else.

**The check that catches it:** read the formula as written and check its units, not only the
number. One sample at 48 kHz is about 20 µs, so 97 µs is about 5 samples.

## 2. Four or five

**Question:** 4.67 is not a whole number. Should the search window be $\pm 4$ (round down) or
$\pm 5$ (round up)?

**Answer:** rounding up seemed right, without a reason why.

**Correction:** $\pm 5$. A source at bearing $\theta$ has a true delay of
$4.67 \sin\theta$ samples, usually a fraction. The correlation exists only at whole lags, and its
peak lands on the whole lag **nearest** the true delay. A simulation (a 960-sample noise burst
given a band-limited fractional delay, then correlated) shows where. Delay is the true delay in
samples; $c(4)$ and $c(5)$ are the correlation values at lags 4 and 5:

| Source | Delay | $c(4)$ | $c(5)$ | Peak |
|---|---|---|---|---|
| 60° | 4.05 | 972 | 42 | 4 |
| 80° | 4.60 | 491 | 739 | 5 |
| 90° | 4.67 | 396 | 811 | 5 |

Every source beyond 74.4° peaks at lag 5: there the true delay passes 4.5 samples, and
$\arcsin(4.5 / 4.67) = 74.4°$. With a $\pm 4$ window, lag 5 is outside, so the search returns the
shoulder at lag 4, and every source from 74° to 90° reads as 58.9°. That is up to 31° off, with
no warning. With $\pm 5$, lag 5 counts; its ratio $5 / 4.67 = 1.07$ is clipped to 1, which
reads as end-fire, 90°.

**Remember:** rounding down answers "which whole delays can a direct path produce exactly". The
window must answer a different question: "where can the sampled peak land". That is 4.67 rounded
up. The rig's own code takes the same view: `engine/gcc.py` searches "baseline / c plus a
margin".

## 3. Why whole samples give a coarse bearing

**Question:** even with the right window, the bearing jumps from 58.9° straight to 90°. That error
is too large for any practical use. Is a higher sample rate the fix?

**Answer:** it does not seem the right fix. Right.

**Correction:** three things handle it in practice.

1. **Interpolate the peak.** The whole-lag values are samples of a smooth, band-limited curve, so
   by Nyquist the values between them are already fixed by the samples. `engine/gcc.py` zero-pads
   4× in the lag domain, then fits a parabola through the three values around the peak for a
   sub-sample delay. This is the same as estimating a tone between DFT bins: the bin grid is not
   the resolution limit.
2. **Then noise sets the limit, not the sample rate.** After interpolation the delay error follows
   the Cramér-Rao bound for time delay: it shrinks with more SNR, more bandwidth and a longer
   observation. The sample rate only has to meet Nyquist.
3. **Geometry.** One sample of delay is worth this many degrees for 3.34 cm at 48 kHz:

   | Bearing | Degrees per sample |
   |---|---|
   | 0° | 12.3 |
   | 30° | 14.2 |
   | 60° | 24.5 |
   | 80° | 70.6 |

   Since $d\theta = c\, d\tau / (d \cos\theta)$, the bearing gets less sensitive to the delay
   towards end-fire. A wider spacing helps: at 0.5 m the window is ±70 samples instead of ±4.67.
   So do more microphone pairs, so that every direction sits near broadside for one of them.

## 4. In code: `peak_lag`

**Context:** the third function of the toy, `peak_lag(c, lags, max_lag)`. It takes the
correlation and its lag axis from `xcorr_lags` and returns the lag of the largest value with
$|L| \le$ `max_lag`.

**The idea:** cut out the part of the correlation inside the window, find the largest value
there, and turn its position back into a lag. The steps, in plain words: find the position of
lag $-$`max_lag`; count the lags in the window, $2 \cdot$ `max_lag` $+ 1$; take the maximum
inside that piece; add the start position back; look up the lag. That plan is right.

**The first code:**

```python
def peak_lag(c, lags, max_lag):
  start = -max_lag - lags[0]
  count = max_lag - start + 1
  window = c[start:start+count]
  i_win = np.argmax(window)
  i_full = i_win + start
  return lags[i_full]
```

```text
ValueError: attempt to get
argmax of an empty sequence
```

**What was missed:**

1. **A lag and a position in one subtraction.** `start` is a position; `max_lag` is a lag. On
   lags $-10 \dots 10$ with `max_lag` 4: `start` = 6, `count` = 4 − 6 + 1 = −1, and `c[6:5]` is
   empty. The count must come from two of the same kind: two lags ($4 - (-4) + 1$) or two
   positions.

**The corrected code**, both ends as positions:

```python
def peak_lag(c, lags, max_lag):
  start = -max_lag - lags[0]
  hi = max_lag - lags[0]
  count = hi - start + 1
  window = c[start:start+count]
  i_win = np.argmax(window)
  i_full = i_win + start
  return lags[i_full]
```

All checks pass: a larger echo at lag 8 is ignored when `max_lag` is 4 and found when it is 10;
a negative lag can win; and every delay from −4 to 4 is recovered from a 960-sample noise burst.

## 5. A window wider than the lag axis

**Question:** call the corrected `peak_lag` with `max_lag` 12 on lags $-10 \dots 10$. What are
`start` and the slice, which lags does the window hold, and does it crash or return a wrong
answer?

**Answer:** `start` = −2, which is right. The count was given as 24, the slice as `c[-2:22]`, and
the behaviour past the end was guessed as wrapping around, modulo 21.

**Correction:** the count is 22 − (−2) + 1 = 25, and the slice is `c[-2:23]`, since its stop is
start + count, one past the last position. Then three rules decide what happens:

| Written | Python does |
|---|---|
| `c[22]` | raises `IndexError` |
| `c[3:100]` | clips the stop: 18 values |
| `c[-2]` | counts from the end once: `c[19]` |

There is no modulo wrap anywhere. So `c[-2:23]` is `c[19:21]`: positions 19 and 20, which are
lags 9 and 10. Both are 0 in the test data, a tie, so `argmax` returns 0. Then
`i_full` = 0 + (−2) = −2, and `lags[-2]` is lag 9. The true peak is at lag 8. The function returns
a wrong answer, and nothing reports it.

**Remember:** a slice never raises an error. A wrong start or stop gives a wrong piece without
complaint, so a slice built from positions needs the positions checked first.

## 6. Positions against labels: the mask

The slice version works with positions, so it relies on two assumptions: the lags step by 1, and
both $\pm$`max_lag` are on the axis. A boolean mask works with the labels themselves:

```python
def peak_lag(c, lags, max_lag):
  inside = np.abs(lags) <= max_lag
  i = np.argmax(c[inside])
  return int(lags[inside][i])
```

`inside` is True where the lag is in the window. The same mask goes on both arrays, so position
`i` in the cut-down `c` matches position `i` in the cut-down `lags`. `engine/gcc.py` finds its
peak this way.

| Case | Slice | Mask | True |
|---|---|---|---|
| `max_lag` 4 | 2 | 2 | 2 |
| `max_lag` 10 | 8 | 8 | 8 |
| `max_lag` 12 | 9 | 8 | 8 |
| lags −3…7, `max_lag` 5 | crash | −2 | −2 |

The last row is an uneven lag axis, which `xcorr_lags` returns whenever the two inputs have
different lengths (here 8 and 4). Then lag $-5$ is not on the axis, `start` is −2, and `c[-2:9]`
is empty. The toy's two channels have equal lengths, so its checks never reach this case.

## 7. Patterns behind the slips

**A formula on the page that differs from the one used.** The number was right and the written
formula was not. A unit check on the line as written catches it; a check of the number does not.

**The window comes from the physics, not from the data.** The window is fixed by $d$, $c$ and
$f_s$ before any sound arrives. A window set from the peak found could not keep an echo out.

**The position and the meaning mixed up, again.** Part 2 stored values at the lag instead of the
position. Here the count subtracted a position from a lag. The rule: never add or subtract a lag
and a position in one expression. Convert both to the same kind first, with
position = lag − `lags[0]` and lag = `lags[position]`.

**A stop that stops before.** Part 2's `np.arange(-9, 8)` ends at 7. Here the slice stop was
written as the last position instead of one past it. Writing the stop as start + count avoids
both.

**Negative numbers that fail silently.** A negative start in a slice and a negative index both
count from the end, with no error. Both turned up in one call, and the result was a plausible
wrong lag. Prefer code that reads the labels themselves (a mask) over position arithmetic, and
test one case where the window runs past the axis.

## Still open

- **The quantisation error.** A source at 70°, window $\pm 5$: what bearing does the search
  report, how large is the error, and what kind of error is it?
- **A wider spacing.** With $d = 4.0$ cm at 48 kHz: the largest delay in samples, and the
  `max_lag` to search.
- **One mask on both arrays.** On lags −3…7 with `max_lag` 5: what does `lags[inside]` hold? What
  goes wrong if `c` is cut with the mask but the full `lags` is indexed with `i`?
- **The sharp peak.** Why does GCC-PHAT give a much sharper peak than this plain correlation?

Part 4: `lag_to_bearing`, and the toy run end to end.
