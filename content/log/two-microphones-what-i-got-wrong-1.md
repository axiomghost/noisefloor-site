---
title: "Two microphones and a delay: questions and corrections (part 1)"
slug: two-microphones-what-i-got-wrong-1
summary: How two microphones find the direction of a sound, as ten questions, the answers given, and the corrections. Units, trigonometry, clocks, phase, and the first numpy function.
type: post
project: acoustic-localization
series: learning-in-the-open
series_order: 1
tags: [statistical-signal-processing]
links: []
published: true
published_at: 2026-11-24T00:00:00.000Z
media: []
---

Two microphones in a laptop, a clap somewhere on the desk, and code that reports which direction
the clap came from. Each entry below gives a question on that subject, the main point of the answer
given, and the correction.

The setup: two microphones $d = 3.34$ cm apart, each recorded at 48,000 samples per second, sound
at $c = 343$ m/s. The rig measures the delay $\tau$ between the two microphones and turns it into
an angle $\theta$, measured from straight ahead:

$$
\theta = \arcsin\!\left(\frac{c\,\tau}{d}\right)
$$

## 1. The speed of sound

**Question:** Roughly how fast does sound travel in room air?

**Answer:** 353 m/s. Wrong.

**Correction:** 343 m/s at 20 °C. 353 m/s is the speed at about 37 °C. Sound moves about a third
of a metre per millisecond, and 0.343 mm per microsecond.

## 2. One sample period

**Question:** At 48,000 samples per second, how much time passes between two samples, and how far
does sound travel in that time?

**Answer:** $1/48000 = 2.08\times10^{-5}$ s, read as about 0.2 µs. Wrong by a factor of 100.

**Correction:** $2.08\times10^{-5}\ \mathrm{s} = 20.8\times10^{-6}\ \mathrm{s} = 20.8\ \mu\mathrm{s}$.
In that time sound moves 7.15 mm, not 0.07 mm.

**The check that catches it:** 48 kHz is about 50 kHz, so one period is about
$1/50000\ \mathrm{s} = 20\ \mu\mathrm{s}$. A period of 0.2 µs would mean sampling at 5 MHz.

**Why it matters here:** the biggest delay this rig can ever see is 97 µs, under 5 samples. With
the wrong period it would look like 500 samples.

**A related slip:** asked for a delay of 3.5 samples at 48 kHz, the answer gave the length of one
sample. The delay is $3.5 \times 20.83 = 72.9$ µs. A quick estimate, $3.5 \times 20 \approx 70$,
catches it. Read the question's last line again before boxing the answer.

## 3. The sine of 30 degrees

**Question:** Give $\sin 30^\circ$ without a calculator. What is $\arcsin 0.5$ in degrees?

**Answer:** $\sin 30^\circ = 2/\sqrt{5}$, from a right triangle with sides 1 and 2, and
$\arcsin 0.5 = 45^\circ$. Both wrong.

**Correction:** $\sin 30^\circ = 0.5$, so $\arcsin 0.5 = 30^\circ$. The triangle with sides 1 and
2 is real, but its angle is $\arctan(1/2) = 26.57^\circ$, not $30^\circ$. The triangle for
$30^\circ$ is half of an equilateral triangle with side 2: hypotenuse 2, opposite side 1.

**Remember:** the sines of 0, 30, 45, 60 and 90 degrees follow one pattern:

$$
\sin\theta = \frac{\sqrt{n}}{2}, \quad n = 0, 1, 2, 3, 4
$$

$$
0,\ 0.5,\ 0.707,\ 0.866,\ 1
$$

**Why it matters here:** on the rig, the sine is the delay as a fraction of the biggest possible
delay:

$$
\sin\theta = \frac{\tau}{\tau_{\max}}
$$

Half the biggest delay means $30^\circ$, not $45^\circ$. The whole rig is this one pair, angle and
sine.

## 4. What the rig solves for

**Question:** From the sound in the air to an angle on the screen, the rig runs three steps. Name
them in order.

**Answer:** the last step named as "inter-microphone distance estimation". Wrong.

**Correction:** the chain is record, correlate, then geometry: $\theta = \arcsin(c\tau/d)$. In
normal use the spacing $d$ is known and the angle $\theta$ is what the rig solves for. Solving for
$d$ is a different job: calibration, done once with claps from known directions,
$d = c\tau/\sin\theta$.

**Remember:** one equation, two modes. Operating: $d$ known, solve $\theta$. Calibrating: $\theta$
known, solve $d$. From radio: with known pilots you estimate the channel, with a known channel you
estimate the data.

## 5. Why both microphones need one clock

**Question:** Why must both microphones be sampled by one clock?

**Answer:** it is needed for an accurate delay. True, but no reason given.

**Correction:** the delay is the difference between two arrival times. With one clock, both
channels share one timeline, and any start time cancels. With two separate recorders, two extra
errors appear that look exactly like a real delay: a start offset $s$ (one recorder started later)
and a drift $\varepsilon$ (one clock ticks slightly faster):

$$
\tau_{\text{read}} = \tau_{\text{true}} + s + \varepsilon\, t
$$

**The size:** a 20 ppm rate difference drifts 20 µs every second, so a clap from straight ahead
drifts out of the ±97 µs delay window in under 5 seconds. A constant offset can be measured once
and subtracted; a drift cannot.

## 6. The biggest possible delay

**Question:** Why is the largest delay this pair can see about 0.1 ms?

**Answer:** none given.

**Correction:** the biggest delay happens when the clap is on the line through both microphones.
The sound passes the near one and then travels the whole spacing $d$ to the far one. So

$$
\begin{aligned}
\tau_{\max} &= \frac{d}{c} = \frac{3.34\ \mathrm{cm}}{343\ \mathrm{m/s}} \\
&= 97.3\ \mu\mathrm{s} = 4.67\ \text{samples}
\end{aligned}
$$

**Why nothing can be bigger, even close up:** one side of a triangle is never longer than the
other two together. So the difference between the two paths is never more than $d$.

**Words to keep apart:** range is the distance to the source. The set of delays geometry allows,
$-d/c \le \tau \le +d/c$, is the delay window. The scatter of repeated claps is the spread. The
answer called the delay window the "range".

## 7. The phase of a delayed tone

**Question:** For a pure tone of frequency $f$, a delay $\tau$ shows up as a phase difference.
Write the formula, and give its value for $f = 1$ kHz and $\tau = 50$ µs.

**Answer:** the tone written as $\sin(2\pi t/f)$ and the delay as $e^{-j\tau}$, with no value.
Wrong.

**Correction:** a tone is $\sin(2\pi f t)$. Delay it by $\tau$ and multiply $f$ into the bracket:

$$
\sin\big(2\pi f(t-\tau)\big) = \sin(2\pi f t - 2\pi f\tau)
$$

The delay becomes a phase:

$$
\varphi = 2\pi f\tau \ \text{rad} = 360^\circ \times f\tau
$$

For 1 kHz and 50 µs: $360^\circ \times 1000 \times 50\times10^{-6} = 18^\circ$.

**The check that catches it:** an exponent cannot have a unit. $\tau$ is in seconds, so
$e^{-j\tau}$ is wrong. $f\tau$ has no unit, so $e^{-j2\pi f\tau}$ is fine.

## 8. Why the rig measures a delay and not a phase

**Question:** A base station's antenna pair finds the angle from the phase difference of the
carrier. Why does a time difference suit a clap better?

**Answer:** each frequency in a clap gets its own phase, $2\pi f\tau$, so the rig measures the one
delay they all share. Right, but incomplete.

**Correction:** the missing part is why the antenna pair gets away with one phase. A radio signal
is narrowband: 20 MHz wide around 2 GHz, about 1%. Across that band the phase barely moves, so one
phase describes the whole signal. A clap runs from about 300 Hz to 12 kHz. Across that band the
phase sweeps more than a full turn. There is no one phase to quote, only the slope of phase
against frequency, and that slope is the delay: $\varphi(f) = 2\pi\tau \cdot f$.

**One number to remember:** bandwidth times the biggest delay, $B\,\tau_{\max}$. For the antenna
pair it is 0.005. For these microphones it is 1.14. Much less than 1 means narrowband.

## 9. Rounding too early

**Question:** Take $c = 343$ m/s, $\tau = 50$ µs, $d = 4$ cm. Compute $\theta$.

**Answer:** the right method, but $c\tau/d = 0.42875$ rounded to 0.42 before the arcsine.

**Correction:** that one rounding gives $24.83^\circ$ instead of $25.39^\circ$, an error of
$0.56^\circ$. Keep three significant figures until the last step.

## 10. In code: a delay is a shift

**Context:** the rig's core, as a small numpy toy, finds the delay between two channels by
cross-correlation. It has four functions:

| Function | What it does |
|---|---|
| `delay_copy` | delay a signal by $k$ samples |
| `xcorr_lags` | cross-correlate two channels, with the lag of each value |
| `peak_lag` | find the peak, only inside the delay window $\pm d/c$ |
| `lag_to_bearing` | turn the lag into an angle |

This part covers the first one.

**The idea:** a delay of $k$ samples is the same waveform, $k$ samples later. What was at index $n$
is now at index $n + k$. The output keeps the input's length: zeros (silence before the sound
arrives) are shifted in at the front, and samples pushed past the end are dropped. $k$ can be
negative, which gives an earlier copy:

```python
x = np.array([1., 2., 3., 4., 5.])
delay_copy(x, 2)  # 0 0 1 2 3
delay_copy(x, -1) # 2 3 4 5 0
```

**Question:** write `delay_copy(x, k)`.

**Answer:** first a loop, then the same thing as numpy slices. The slice version, as first
submitted:

```python
def delay_copy(x, k):
    y = np.zeros_like(x)
    if (k >= 0 & k < len(x)):
        y[:k] = 0
        y[k:] = x[:len(x)-k]
    elif (k < 0):
        y[:len(x)+k] = x[-k:len(x)]
    elif (k == -0):
        y = []
    return y
```

The checks for $k = 2$, $-1$ and $0$ passed. $k = 7$, longer than the 5-sample array, crashed:

```text
ValueError: could not broadcast
input array from shape (3,)
into shape (0,)
```

**What was missed:**

1. **`&` is not "and".** In Python, `&` is bitwise AND, and it binds before `>=` and `<`.
   So for $k = 7$ the condition reads `7 >= (0 & 7) < 5`, that is `7 >= 0 < 5`. Python chains
   that into `(7 >= 0) and (0 < 5)`, which is True. The branch ran and tried to copy 3 values
   into 0 places. The intent was right: "$k$ inside the array, otherwise $y$ stays zeros". Only
   the operator was wrong. In C++, logical AND is `&&`. In Python it is `and`. The single `&` is
   bitwise in both.
2. **The `k == -0` branch.** $-0$ is just $0$, which the first branch already takes, so this
   branch can never run. And it was wrong in itself: a delay of 0 is an unchanged copy, not an
   empty list.
3. **Why `x[:len(x)-k]` and not `x[:-k]`.** How many elements does `x[:-0]` have for a 5-element
   `x`? The answer was unsure. It is `x[:0]`, which is empty. So `x[:-k]` silently breaks at
   $k = 0$, and the explicit `len(x)-k` avoids that.

**Correction:** the condition with `and`, and the dead branch removed:

```python
def delay_copy(x, k):
    y = np.zeros_like(x)
    if (k >= 0 and k < len(x)):
        y[:k] = 0
        y[k:] = x[:len(x)-k]
    elif (k < 0):
        y[:len(x)+k] = x[-k:len(x)]
    return y
```

Python also lets the first condition be written as a chain, `0 <= k < len(x)`, which reads like
the maths.

## Checks that catch these

- A quick estimate before the calculator. Most of these slips fall to one rough line.
- Three significant figures until the last step.
- Read the question's last line again before boxing an answer.
- In code: a plain loop first as a correct reference, then the numpy form, with a checker judging
  both.

## Still open

- **A negative shift past the end.** What does the corrected `delay_copy` do for $k = -7$ on a
  5-sample array?
- **The sharp peak.** Why does GCC-PHAT, the method the rig uses to find the delay, give such a
  sharp peak?

Part 2: the other three functions of the toy.
