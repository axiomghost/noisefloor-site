---
title: "Sound pressure level and decibels: the basics"
slug: sound-pressure-level-and-decibels
summary: What a sound level in dB actually measures, why it uses 20 log and not 10 log, and the handful of numbers worth remembering. A primer for the posts that follow.
type: post
project: acoustic-localization
series: drone-hearing
series_order: 1
tags: [statistical-signal-processing, acoustics]
published: true
published_at: 2026-11-14T00:00:00.000Z
media: []
---

Before writing about how far a microphone can hear a drone, I need the units straight. This is
the short version: what a level in dB means for sound, and the few numbers I keep coming back to.

## Sound is a small ripple on air pressure

The air around us sits at about 101,325 Pa. Sound is a tiny, fast ripple on top of that. A loud
sound of 1 Pa is a change of about one part in 100,000. A microphone turns that ripple into a
voltage, and a recorder samples the voltage, 48,000 times per second for example. Each sample
is the pressure at one instant. It is not a level.

A level is computed afterwards, from the RMS pressure over a window of many samples. If you have
worked with radio, it is like RSRP: computed from the IQ samples over a window, never stored as a
sample itself.

## Sound pressure level

The sound pressure level, SPL, is

`L = 20 log10( p / p0 )`, with `p0 = 20 µPa`

where p is the RMS pressure. The reference of 20 µPa is roughly the quietest sound a young
person can hear at 1 kHz, so 0 dB SPL is the threshold of hearing, not silence.

Why 20 and not 10? Power goes as pressure squared, and a decibel is defined on power. Taking
20 log of a pressure is the same as taking 10 log of p². It is the same reason a voltage ratio
in radio uses 20 log while a power ratio uses 10 log. As with dBm, the number only means
something with its reference, so "dB SPL" (re 20 µPa) is the full name.

## Numbers worth remembering

| Level | RMS pressure | Rough everyday example |
|---|---|---|
| 0 dB SPL | 20 µPa | threshold of hearing |
| 20 dB SPL | 200 µPa | a very quiet room |
| 60 dB SPL | 0.02 Pa | conversation at 1 m |
| 94 dB SPL | 1 Pa | the level of a microphone calibrator |
| 130 dB SPL | 63 Pa | around the threshold of pain |

The everyday examples are typical values, not measurements. And the ratios:

- Double the pressure: +6 dB.
- Double the power: +3 dB. Two equal, independent sources together are 3 dB louder than one.
- Ten times the pressure: +20 dB, which is a hundred times the power.

## Source level: the EIRP of a sound source

To compare sources you need a fixed distance, and the usual one is 1 m. The source level is the
SPL measured 1 m from the source. A drone with a source level of 80 dB produces about 0.2 Pa at
1 m. It plays the part of EIRP in a link budget: the level at the microphone is the source level
minus the loss along the path, just as received power is EIRP minus path loss.

## Two more terms you will meet

- **dB(A).** A level weighted to match human hearing, which counts low frequencies for much less.
  Regulations and noise maps use it. A detector does not hear that way, so a site's dB(A) figure
  can hide low-frequency noise that matters to it.
- **Self-noise.** The noise a microphone makes on its own, quoted as the SPL that would produce
  the same output. MEMS datasheets give an SNR referenced to 94 dB SPL at 1 kHz, so the
  self-noise is 94 dB minus that SNR. A microphone with 65 dB SNR has a self-noise of about
  29 dB SPL.

That is all the vocabulary the next posts need. The next one uses it to work out
[how far a microphone can hear a drone](/log/how-far-can-a-microphone-hear-a-drone/).
