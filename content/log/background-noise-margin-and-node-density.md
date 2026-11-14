---
title: Background noise, margin and node density
slug: background-noise-margin-and-node-density
summary: The background noise sets how loud the drone must arrive, that sets the range, and the range sets how many nodes a site needs. A 7 dB noisier day can mean three and a half times the nodes.
type: post
project: acoustic-localization
tags: [statistical-signal-processing, acoustics]
published: true
published_at: 2026-11-14T12:00:00.000Z
media: []
---

In the [last post](/log/how-far-can-a-microphone-hear-a-drone/) I treated the level a microphone
needs as just a number, 20 dB. This post is about where that number comes from, and what it does
to the number of nodes a site needs. The short version: the background noise sets it, the
processing buys some of it back, and the result sets the node count.

## Noise adds as power

Everything the microphone hears except the drone is background: traffic, wind, birds, the
microphone's own electronics. Independent sources add as powers, not as dB:

`L_total = 10 log10( Σ 10^(L_i / 10) )`

Two equal sources give 3 dB more than one. A source 10 dB below the loudest adds only 0.4 dB, and
one 20 dB below adds almost nothing. This one rule answers a practical question. A quieter
microphone only helps when its own noise is within about 10 dB of the background. At a busy
site, the background swamps the microphone's own noise and a better microphone buys nothing.

## Margin, and why negative is normal

The margin at a node is the drone's level there minus the background:

`m = L1 − TL(r) − B`

Here L1 is the drone's level at 1 m, TL(r) is the transmission loss from the last post, and B is
the background. At any useful range the margin is negative. The drone is quieter than everything
else the microphone hears.

The node still works, because it does not listen to one sample. It correlates the sound over a
band and a time window, and the drone's sound adds up coherently while the noise does not. If you
have worked on CDMA, this is processing gain in exactly the sense you know. In my simulation, a
node reported reliably down to about −6 dB margin, and half the time at about −11 dB. Those are
simulation numbers, not field measurements.

So the level the node needs is the background plus the lowest margin it works at. With a
background of 26 dB and a −6 dB threshold, that is the 20 dB from the last post.

## A pair is only as good as its weaker node

To locate the drone, two nodes compare their recordings. Both recordings are noisy, so the
correlation between them has its own SNR:

`1/S = 1/S1 + 1/S2 + 1/(S1·S2)`

with S1 and S2 as linear power ratios. This is the end-to-end SNR of an amplify-and-forward
two-hop relay, the same expression. The weaker hop dominates. In practice, you pick the loudest
node as the reference, because a weak reference pulls every pair down together.

## From margin to node density

One node covers an area that grows with the square of its range, so the number of nodes a site
needs goes as

`N ∝ 1/r²`

Inside the crossover range, where spreading sets the range, every 6 dB of margin halves or
doubles the range. That is a factor of 4 in nodes, and 10 dB is a factor of 10. Beyond the
crossover the air is already taking level fast, so the factor is smaller, but the direction is
the same.

Here is the same drone as in the last post (80 dB at 1 m, the 1 kHz band, 20 °C, 70 %), at a
site whose background changes. The background levels and the gains are example numbers.

| Situation | Level needed | Range | Nodes, against the quiet night |
|---|---|---|---|
| Quiet night, background 26 dB | 20 dB | 678 m | ×1 |
| Day, background 7 dB higher | 27 dB | 363 m | ×3.5 |
| Day, with 4 dB more from a longer window | 23 dB | 524 m | ×1.7 |
| Day, with 9 dB more from 8 microphones per node | 18 dB | 797 m | ×0.7 |

Seven dB of daytime noise costs three and a half times the nodes. Microphones per node buy that
back and more. Note that a localization network needs several nodes to hear the drone at once,
not one, so the absolute node count depends on the geometry. That is a topic of its own. The
scaling with 1/r² does not change.

## The levers that buy margin

| Lever | What it buys | What it costs |
|---|---|---|
| Nodes closer together | 10 dB from spreading | 10 times the nodes |
| More microphones per node | about 9 dB from 8 microphones, if their noise is independent | cost, size, sync and calibration; less in a city, where nearby microphones share noise |
| A longer window | 3 to 5 dB from 0.5 to 1 s, in my simulation | latency; a moving drone smears |
| A quieter microphone | a lower floor | pays only within about 10 dB of the background |
| Operating hours | urban nights run about 7 dB quieter than days | coverage for only part of the day |

The first row is the expensive one. That is why the other four are worth looking at first.

---

The thresholds and the window gain come from my own simulation of the sensor network and the
drone, not from a field test. The ranges use the same model as the
[interactive page](/interactive/hearing-range/).
