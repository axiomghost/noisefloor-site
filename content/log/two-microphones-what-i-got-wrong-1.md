---
title: "Two microphones and a delay: what I got wrong (part 1)"
slug: two-microphones-what-i-got-wrong-1
summary: I am learning how two microphones find the direction of a sound. These are my mistakes so far, each with the fix, so I can revise from one page.
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

I am building a small rig: two microphones in a laptop, a clap somewhere on the desk, and code
that tells me which direction the clap came from. I want to understand every number in it, so I
answer questions on paper first, cold, before reading anything. Claude, the AI I work with,
grades my answers and writes the corrections.

This page is the list of what I got wrong, and the fix for each. I am putting it in public for
two reasons. It keeps me honest. And it gives me one place to revise from, on my phone, when I
am travelling.

The setup, so the numbers make sense: two microphones $d = 3.34$ cm apart, each recorded at
48,000 samples per second, sound at $c = 343$ m/s. The rig measures the delay $\tau$ between the
two microphones and turns it into an angle $\theta$, measured from straight ahead:

$$
\theta = \arcsin\!\left(\frac{c\,\tau}{d}\right)
$$

## 1. The speed of sound

**What I wrote:** 353 m/s.

**What's right:** 343 m/s at room temperature, 20 °C. 353 m/s is the speed at about 37 °C.

**Remember:** sound moves about a third of a metre per millisecond, and 0.343 mm per
microsecond. I passed this on a re-test four days later.

## 2. One sample period

**What I wrote:** $1/48000 = 2.08\times10^{-5}$ s, "about 0.2 µs". I was sure of it.

**What's right:** $2.08\times10^{-5}\ \mathrm{s} = 20.8\times10^{-6}\ \mathrm{s} = 20.8\ \mu\mathrm{s}$.
I was off by a factor of 100. In that time sound moves 7.15 mm, not 0.07 mm.

**The check that catches it:** 48 kHz is about 50 kHz, so one period is about
$1/50000\ \mathrm{s} = 20\ \mu\mathrm{s}$. A period of 0.2 µs would mean sampling at 5 MHz.

**Why it matters here:** the biggest delay this rig can ever see is 97 µs, under 5 samples.
With my wrong number it would have looked like 500 samples.

On the re-test I got the conversions right (44.1 kHz gives 22.68 µs) but made a new slip. The
question asked for a delay of 3.5 samples, and I boxed the length of one sample. The answer was
$3.5 \times 20.83 = 72.9$ µs. A quick estimate, $3.5 \times 20 \approx 70$, would have caught
it. Lesson: reread the question's last line before boxing the answer.

## 3. The sine of 30 degrees

**What I wrote:** $\sin 30^\circ = 2/\sqrt{5}$, from a right triangle with sides 1 and 2. And
$\arcsin 0.5 = 45^\circ$. I was sure of the second one.

**What's right:** $\sin 30^\circ = 0.5$, so $\arcsin 0.5 = 30^\circ$. My triangle with sides 1
and 2 is real, but its angle is $\arctan(1/2) = 26.57^\circ$, not $30^\circ$. The triangle for
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

Half the biggest delay means $30^\circ$, not $45^\circ$. The whole rig is this one pair, angle
and sine.

## 4. What the rig solves for

**What I wrote:** the last step of the chain was "inter-microphone distance estimation".

**What's right:** the chain is record, correlate, then geometry: $\theta = \arcsin(c\tau/d)$.
In normal use the spacing $d$ is known and the angle $\theta$ is what we solve for. Solving for
$d$ is a different job: calibration, done once with claps from known directions,
$d = c\tau/\sin\theta$.

**Remember:** one equation, two modes. Operating: $d$ known, solve $\theta$. Calibrating:
$\theta$ known, solve $d$. From radio: with known pilots you estimate the channel, with a known
channel you estimate the data.

## 5. Why both microphones need one clock

**What I wrote:** "necessary for accurate delay". True, but with no reason.

**What's right:** the delay is the difference between two arrival times. With one clock, both
channels share one timeline, and any start time cancels. With two separate recorders you get two
extra errors that look exactly like a real delay, a start offset $s$ (one recorder started later)
and a drift $\varepsilon$ (one clock ticks slightly faster):

$$
\tau_{\text{read}} = \tau_{\text{true}} + s + \varepsilon\, t
$$

**The size:** a 20 ppm rate difference drifts 20 µs every second. It passes the whole ±97 µs
delay window in under 5 seconds. A constant offset can be measured once and subtracted; a drift
cannot.

## 6. The biggest possible delay

**What I wrote:** I did not know why it was about 0.1 ms. I said so.

**What's right:** the biggest delay happens when the clap is on the line through both
microphones. The sound passes the near one and then travels the whole spacing $d$ to the far
one. So

$$
\begin{aligned}
\tau_{\max} &= \frac{d}{c} = \frac{3.34\ \mathrm{cm}}{343\ \mathrm{m/s}} \\
&= 97.3\ \mu\mathrm{s} = 4.67\ \text{samples}
\end{aligned}
$$

**Why nothing can be bigger, even close up:** one side of a triangle is never longer than the
other two together. So the difference between the two paths is never more than $d$.

**A word I mixed up:** I called this the "range". But range means the distance to the source.
The set of delays geometry allows, $-d/c \le \tau \le +d/c$, is the delay window. The scatter of
repeated claps is the spread.

## 7. The phase of a delayed tone

**What I wrote:** $\sin(2\pi t/f)$, and a delay as $e^{-j\tau}$. I stopped there.

**What's right:** a tone is $\sin(2\pi f t)$. Delay it by $\tau$ and multiply $f$ into the
bracket:

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

**What I had right:** each frequency in a clap gets its own phase, $2\pi f\tau$, so the rig
measures the one delay they all share.

**What was missing:** why a radio antenna pair gets away with one phase. A radio signal is
narrowband: 20 MHz wide around 2 GHz, about 1%. Across that band the phase barely moves, so one
phase describes the whole signal. A clap runs from about 300 Hz to 12 kHz. Across that band the
phase sweeps more than a full turn. There is no one phase to quote, only the slope of phase
against frequency, and that slope is the delay: $\varphi(f) = 2\pi\tau \cdot f$.

**One number to remember:** bandwidth times the biggest delay, $B\,\tau_{\max}$. For the antenna
pair it is 0.005. For my microphones it is 1.14. Much less than 1 means narrowband.

## 9. Rounding too early

**What I did:** in $\arcsin(343 \times 50\ \mu\mathrm{s} / 4\ \mathrm{cm})$ I rounded 0.42875 to
0.42 before the last step.

**What it cost:** $24.83^\circ$ instead of $25.39^\circ$, an error of $0.56^\circ$ from one
rounding.

**Remember:** keep three significant figures until the last step.

## 10. In code: `&` is not "and"

After the paper questions I asked for something more hands-on, so I am now writing the rig's
core in Python myself, one small function at a time, with a checker. The first function shifts a
signal by $k$ samples, with zeros coming in. I wrote it with a loop first, then saw it is just a
slice and rewrote it. That took me longer than it should have.

My condition for "$k$ is inside the array" was:

```python
if (k >= 0 & k < len(x)):
```

It passed three checks and crashed on $k = 7$ with a 5-sample array.

**Why:** in Python, `&` is bitwise AND, not logical AND. It also binds before `>=` and `<`.
So Python computes `0 & 7 = 0` first and reads the line as `7 >= 0 < 5`. Python chains that into
`(7 >= 0) and (0 < 5)`, which is True. The branch ran and tried to copy 3 values into 0 places.

**The fix:**

```python
if 0 <= k < len(x):
```

My logic was right. The operator was wrong. In C++, logical AND is `&&`. In Python it is `and`.
The single `&` is bitwise in both.

## Habits I am fixing

- Writing a quick estimate before the calculator. Most of my slips would have been caught by
  one rough line.
- Tagging every answer with how sure I am. My confident mistakes taught me the most.
- Rereading the question's last line before boxing an answer.

## Still unclear

Why GCC-PHAT, the method the rig uses to find the delay, gives such a sharp peak. I have parked
it until I reach the chapter on frequencies, where I will write a small version myself.

Next: the other three functions of the toy, and part 2 of this list.
