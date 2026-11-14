---
title: How far can a microphone hear a drone?
slug: how-far-can-a-microphone-hear-a-drone
summary: Spreading sets the range up close and the air takes over further out. A few dB of air absorption can double the number of microphones a site needs.
type: post
project: acoustic-localization
tags: [statistical-signal-processing, acoustics]
links: [{"label":"Interactive: hearing range","url":"https://umronotes.m-umar81.workers.dev/interactive/hearing-range/"}]
published: true
published_at: 2026-11-14T00:00:00.000Z
media: [{"path":"/media/hearing-range-dashboard.png","kind":"image","caption":"The interactive hearing-range page"}]
---

If you plan a network of microphones to pick up drones, the first number you need is how far
one microphone can hear one. Everything else follows from it. One microphone covers a circle of
radius r, so the number you need for a site goes as 1/r². Halve the range and you need four
times the hardware.

So it is worth knowing what sets that range.

## Two ways the sound gets quieter

The first is spreading. The drone's sound goes out in all directions, so the same power is
spread over a sphere that keeps growing. Nothing is lost, it only gets thinner. Every time the
range doubles, the level drops by 6 dB. If you have worked with radio, this is the 20 log r of
free-space path loss. It is the same law.

The second is the air. Some of the sound turns into heat on the way. This loss is a fixed number
of dB per kilometre, and it climbs steeply with frequency. At 20 °C and 70 % humidity it is about
1 dB/km at 250 Hz, 5 dB/km at 1 kHz and 23 dB/km at 4 kHz. In radio terms it plays the part of
rain or oxygen attenuation at millimetre wave: a dB/km term on top of the spreading.

Put together, the transmission loss is

`TL(r, f) = 20 log10(r) + α(f) · r`

with r in metres and α in dB per metre. The level at the microphone is the drone's level at
1 m minus this.

## Where the air takes over

Close in, spreading dominates. Going from 10 m to 20 m costs 6 dB, and the air takes almost
nothing over that distance. Further out, the spreading loss grows more and more slowly while the
air term keeps growing in step with range. The two fall at the same rate at the crossover range,
r = 8.7/α:

- 250 Hz: about 7.7 km
- 1 kHz: about 1.7 km
- 4 kHz: about 380 m

Inside the crossover, spreading sets the range. Beyond it, the air does.

## A few dB cost a lot

Take a drone at 80 dB at 1 m, and a microphone that needs the sound to arrive at 20 dB. Both are
example numbers, not measurements. Spreading alone lets the microphone hear the drone out to
1 km.

At 1 kHz the air takes only 3.4 dB on top of that. It sounds small, but the range drops to
678 m, and covering the same area takes 2.2 times as many microphones. Near the edge of hearing
the level falls slowly with range, so every dB lost costs a lot of range.

| Band and weather | Range with air | Microphones vs spreading alone |
|---|---|---|
| 250 Hz, 20 °C, 70 % | 891 m | ×1.3 |
| 1 kHz, 20 °C, 70 % | 678 m | ×2.2 |
| 4 kHz, 20 °C, 70 % | 372 m | ×7.2 |
| 1 kHz, −5 °C, 30 % | 447 m | ×5.0 |

The last row is the one that is easy to miss: the same 1 kHz band on a cold, dry day. Absorption
triples and the microphone count goes up five times. A network planned on a mild day can have
gaps in winter.

## Try it yourself

[![The hearing-range page: level at the microphone against range, with and without air absorption](/media/hearing-range-dashboard.png)](https://umronotes.m-umar81.workers.dev/interactive/hearing-range/)

[Open the interactive page](https://umronotes.m-umar81.workers.dev/interactive/hearing-range/).
It has sliders for frequency, drone level, the level the microphone needs, temperature and
humidity. It starts with one question: guess the range at 4 kHz before you move anything.

## What this leaves out

This is open air only. Ground reflection, buildings, wind and temperature layers can each move
the level by several dB at a few hundred metres. It also looks at one frequency band at a time.
A real drone spreads its sound over many bands, and the range is set by whichever band gets
furthest above the noise. Finally, the 20 dB the microphone needs was just a number here. In
practice the background noise at the site sets it, which is a topic for another post.

---

Air absorption follows ISO 9613-1. The numbers come from the model on the interactive page. The
drone level and the needed level are example inputs, not measurements of any drone or site.
