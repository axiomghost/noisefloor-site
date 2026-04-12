---
title: "The Pipeline Was Fine. The Context Was Broken."
description: "A short technical postmortem on how long-horizon context drift made an LDPC evaluation pipeline look healthy while quietly breaking the meaning of its outputs."
pubDate: 2026-04-12
draft: false
audience: "technically literate engineers and researchers working with simulation pipelines, coding theory, or agent-assisted engineering workflows"
thesis: "In long-running agent-assisted engineering work, the real failure mode is often not missing code but broken semantic continuity: important context is stored, but not retrieved and enforced when later implementation decisions are made."
project: "ldpc-bg1"
tags: [ldpc, sionna, agents, memory, simulation, failure-analysis, research-engineering, context]
---

I built an LDPC evaluation pipeline under the Sionna framework that looked increasingly healthy.

It had structure. It had stages. It had config, simulation, and comparison code. At first glance, it produced the sort of output that feels like progress.

But after enough iterations — and, yes, enough tokens — the pipeline was not failing at the surface level. It was failing more quietly.

The deeper problem was that important semantic context was not being retained and reapplied reliably enough over time.

Some details had already been identified as important. They were important enough to be written down and remembered. But memory that exists is not the same thing as memory that is retrieved correctly when a later implementation decision depends on it.

That gap matters.

Over a longer project horizon, different parts of the system started operating under assumptions that were no longer fully aligned. One concrete version of this was a mismatch between a Sionna-based demapper path and another demapper assumption, even though the Sionna-supported implementation had already been flagged in memory as the direction to preserve. The likely weak point was retrieval, not storage. In this setup, local embeddings were used for memory retrieval, and somewhere along the way the right semantic anchor did not come back strongly enough to constrain the next implementation step.

Once that kind of inconsistency enters the pipeline, the outputs can still look clean. The plots still render. The runs still finish. But the meaning of the numbers starts slipping.

That is the real reason the numbers became untrustworthy. If your error rate gets worse while SNR gets better, something upstream is lying to you — not necessarily maliciously, but semantically.

The numbers were not random. The pipeline was not fake. The issue was that the evaluation contract had drifted internally. The system was producing answers under assumptions that were no longer properly synchronized across the implementation.

This is the failure mode I care about in long-horizon agent-assisted work.

People often focus on whether the code runs, whether the pipeline is structured, whether the outputs are reproducible, and whether the framework usage looks disciplined. All of that matters. But a project can satisfy those surface conditions and still fail if important context is not carried forward in a way that is retrievable and enforceable.

That is the difference between stored memory and working continuity.

If the important semantic anchors are only written down somewhere, but not mapped back into later implementation choices, the system accumulates polished inconsistency. And polished inconsistency is dangerous because it looks like maturity. I could have burned a tremendous number of tokens invoking a stronger model and perhaps gotten back to the right path faster. But doing things the inexpensive way means getting your hands dirty and discovering exactly where the continuity broke.

So the lesson here is not “always stick to one framework” or “agents are unreliable.” It is simpler and more uncomfortable than that:

important context must not only be stored — it must be retrievable at the right moment and strong enough to constrain implementation.

Otherwise the pipeline may be fine, and the context may still be broken.
