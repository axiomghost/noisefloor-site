---
title: "Two microphones and a delay: questions and corrections (part 4)"
slug: two-microphones-what-i-got-wrong-4
summary: From a lag to a bearing. The link c·τ = d·sinθ between the measured delay and the geometry, the delay window on a wider spacing and why 5.59 samples becomes 6, and a source at 70° that reads as 58.9°, as questions, the answers given, and the corrections.
type: post
project: acoustic-localization
series: learning-in-the-open
series_order: 4
tags: [statistical-signal-processing]
links: []
published: true
published_at: 2026-11-28T00:00:00.000Z
media: []
---

Part 3 found the correlation peak inside the delay window. This part covers the idea behind the
fourth function of the toy, `lag_to_bearing`: how a lag in samples becomes an angle. It also
closes two questions left open in part 3. The code and the run end to end follow in part 5.

The conventions are the toy's. Mic 0 is on the left and mic 1 on the right, as seen from the
chair facing the laptop. The bearing $\theta$ is the angle from straight ahead, positive to the
right. A positive lag means mic 0 hears the sound later, so the source is on the right.

## 1. From a delay to an angle

**Question:** the correlation gives the delay in samples, and samples times the sample period
give seconds. Where does the extra path $d \sin\theta$ come in, and how does a time become an
angle?

**Answer:** both halves were known: the chain from correlation to a delay in seconds, and the
extra path $d \sin\theta$ from the geometry. The link between them was missing.

**Correction:** the extra path is what makes the delay. The sound covers the extra stretch
$d \sin\theta$ at speed $c$, and that takes exactly the delay $\tau$ the correlation measures:

$$
c\,\tau = d \sin\theta
$$

Both sides are the same length in metres. The left side is measured, the right side is geometry.
Solved for the unknown angle:

$$
\hat\theta = \arcsin\!\left(\frac{c\,\tau}{d}\right)
$$

The ratio is clipped to $[-1, 1]$ first, because noise or an echo can make $c\tau$ larger than
$d$, and $\arcsin$ has no answer there. A clipped reading means end-fire, $\pm 90°$.

A worked number, for lag 1 with $d = 3.34$ cm at 48 kHz:

| Step | Value |
|---|---|
| $\tau = 1 / f_s$ | 20.83 µs |
| extra path $c\tau$ | 7.15 mm |
| ratio $c\tau / d$ | 0.2141 |
| $\hat\theta$ | 12.36° |

The same link seen from the other side: a source at 20° has an extra path of 11.42 mm and a
delay of 33.29 µs. Divide one by the other and the result is 343 m/s, the speed of sound. They
are one length in two units.

**Remember** (from radio): in OTDOA positioning, $c$ times the time difference between two
base stations is a difference of distances, so the handset lies on a hyperbola. Here the two
"stations" are microphones 3.34 cm apart and the source is far away. The hyperbola flattens into
its asymptote, a straight line at angle $\theta$, and the difference of distances becomes
$d \sin\theta$.

## 2. The delay window on a wider spacing

**Question** (open from part 3): a second laptop has its microphones 4.0 cm apart and runs at
48 kHz. What is the largest delay, in µs and in samples? Which `max_lag` should the search use,
and why round it that way? Why can no true delay be longer?

**Answer:** about 100 µs and 5 samples by hand, then 116.6 µs and 5.59 samples. No true delay can
be longer, because the extra path $d \sin\theta$ is largest at 90°; a longer delay points to noise
or an echo. Right. `max_lag` was left out at first, then given as 6, because the bearing
error would be smaller with 6 than with 5. The number is right; the reason is a consequence, not
the rule.

**Correction:** `max_lag` is not a reading. It says where the search looks. The window must
contain every whole lag the peak can land on. The largest true delay is 5.59 samples, and the
peak lands on the whole lag nearest the true delay, so 6. Every source beyond 79.5° has a true
delay above 5.5 samples and peaks at lag 6, since $\arcsin(5.5 / 5.59) = 79.5°$.

A simulation shows the difference, with the method of part 3: a 960-sample noise burst given a
band-limited fractional delay, then correlated. Delay is the true delay in samples; the columns
±5 and ±6 are the bearing each search window reports:

| Source | Delay | ±5 | ±6 |
|---|---|---|---|
| 80° | 5.51 | 63.3° | 90.0° |
| 85° | 5.57 | 63.3° | 90.0° |
| 90° | 5.59 | 63.3° | 90.0° |

With $\pm 5$, lag 6 is never looked at. The search returns lag 5, and every source from 79.5° to
90° reads as 63.3°: up to 27° off, with no warning. The smaller error with $\pm 6$ follows from
the rule; it is not the reason for it.

**Remember:** `max_lag` is $d/c \cdot f_s$ rounded **up**. It is the same rule that turned 4.67
into 5 in part 3.

## 3. A source at 30°

**Question:** a source 30° to the right of the 4.0 cm laptop. What is the extra path in mm, and
the lag in samples before rounding? Work out the sine without a calculator.

**Answer:** $\sin 30° = 1/2$, so the extra path is 20 mm, and 0.02 m ÷ 343 m/s ÷ 20.83 µs gives
2.8 samples. Right.

**Correction:** nothing to correct. The steps are section 1's link run forwards: angle, extra
path, time, samples. The exact values are 20.0 mm, 58.28 µs and 2.797 samples.

## 4. A source at 70° that reads as 58.9°

**Question** (open from part 3): the rig itself, 3.34 cm at 48 kHz, searches a window of
$\pm 5$. The source is 70° to the right. Which lag does `peak_lag` return, and which bearing does
`lag_to_bearing` report? How large is the error, and is the window the cause?

**First answer:** a quantisation error, with no numbers, and the cause given as an inconsistent
$c$ or $d$. Wrong: in this question $c$ and $d$ are exact, so they cannot be the cause.

**Second answer:** the true delay is 91.5 µs, or 4.39 samples. The peak sits at lag 4, which is
83.32 µs, and reads as 58.83° instead of 70°. The cause is the rounding; with the full 91.5 µs
the bearing would be 70°. Right, but incomplete: the error in degrees and the role of the
window are not stated. Two values also drift. Four samples are 83.33 µs, and $c$ = 343 m/s gives
58.83° where the toy's 343.2 m/s gives 58.90°.

**Correction:**

$$
\begin{aligned}
L &= \frac{d \sin 70°}{c}\, f_s = 4.39 \text{ samples} \\
\text{peak} &= 4 \quad \text{(nearest whole lag)} \\
\hat\theta &= \arcsin\frac{c \cdot 4 / f_s}{d} = 58.90°
\end{aligned}
$$

The error is $-11.1°$: the source reads 11° closer to straight ahead than it is. This is
whole-sample quantisation. The peak can only sit on a whole lag, so the rig can only report a
ladder of bearings, and the rungs widen towards end-fire: 12.4° from lag 0 to lag 1, but 31.1°
from lag 4 to lag 5. The window is not the cause, since $\pm 5$ holds both lag 4 and lag 5.

A wrong $c$ or $d$ is a different error, a calibration bias: it scales every reading the same
way. Quantisation snaps each reading to the nearest rung.

**Remember:** a model and its implementation must use the same constants. 343 m/s against
343.2 m/s moves this bearing by 0.07°, enough to fail a check at 0.01°.

## Still open

- **One mask on both arrays.** On lags −3…7 with `max_lag` 5: what does `lags[inside]` hold? What
  goes wrong if `c` is cut with the mask but the full `lags` is indexed with `i`?
- **The sharp peak.** Why does GCC-PHAT give a much sharper peak than this plain correlation?

Part 5: the code of `lag_to_bearing`, and the toy run end to end.
