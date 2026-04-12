---
title: Multi-Agent Setup in OpenClaw with Strict Memory Separation
description: A case study on splitting one OpenClaw workspace into clear agent lanes with file-based memory boundaries, lane bootstraps, and cleaner routing.
pubDate: 2026-04-12
draft: false
audience: builders working with agentic systems, OpenClaw users, and anyone trying to run multiple long-lived specialist lanes without context bleed
thesis: Multi-agent setups stay usable when memory boundaries, lane responsibilities, and startup reads are made explicit in files instead of left to ambient context.
project: publishing
tags: [openclaw, multi-agent, memory, agents, workflow, architecture]
---

I run one shared workspace across very different kinds of work: LDPC code design, Unreal Engine experiments, and a publishing pipeline for turning useful technical work into public writing.

Trying to do all of that in one long-lived assistant context is a recipe for sludge. Decoder notes end up next to publishing edits. Build churn spills into strategy. The assistant stops feeling like a specialist and starts feeling like a very eager intern with seven open tabs and no object permanence.

So I set up four lanes:

- **MAIN** — strategy, routing, approvals, synthesis
- **LDPC** — LDPC / 3GPP PHY execution
- **ENGINE** — Unreal / networking / flagship builds
- **PUBLISHING** — site, blog, packaging, release prep

The goal was simple enough:

- one shared workspace model
- separate continuity per lane
- strict memory separation by convention
- MAIN coordinates; specialists stay in their own domains

That was the plan. The implementation was less tidy.

## The first problem: the separation model was easy to describe and harder to make real

At first glance, the user interface seemed like it should be enough. It showed agents. It showed sessions. But the management story was incomplete. Creating and shaping a new specialist lane was not something the UI cleanly supported in practice.

The important distinction turned out to be this:

- **sessions** are conversation continuity within one identity
- **agents** are the real unit of separation

If you want separate long-lived specialist brains, you need separate agents.

## The second problem: memory is shared by default

The default memory model was fine for one assistant. It was not fine for four.

A shared daily note and a shared long-term memory file make sense when all work belongs to one lane. They become noisy fast when one lane is reasoning about coding theory, another is building engine systems, and another is shaping public-facing writing.

There was no strict runtime memory firewall. So the only workable answer was to build separation as an explicit operating convention in files.

## The fix: lane-local memory by file structure

The practical solution was to create lane-specific memory directories with a small, repeatable structure:

- `role.md` — what the lane is for
- `state.md` — current truth and active priorities
- `bootstrap.md` — what to read at startup
- `log.md` — rolling operational notes

That structure made the startup path explicit. Each lane could be told exactly what to read and, just as importantly, what **not** to read.

This turns out to matter a lot. Agents are much easier to steer when the operating model is visible in files instead of implied by vibes.

## The governance move that made the difference

The real anchor became `AGENTS.md`.

That file established:

- the lane model
- lane identities
- where each lane should read and write
- the rule that specialists should not default-read each other’s local memory
- the deprecation of the old shared daily-note model for multi-agent work

From there, each lane’s bootstrap file provided a narrower read list. MAIN could retain a cross-project view. Specialists could stay focused.

This was not a hard security boundary. It was a governance boundary. But in practice, explicit file instructions were good enough to stop most context bleed.

## The problem that appeared later: split workspaces silently drift

The next issue was subtler.

Some agents shared the same workspace. Others did not.

That meant updating the governance files in one workspace did **not** automatically update the others. One lane could be running the new protocol while another was still booting from an older set of assumptions.

That created a deceptively awkward debugging situation:

- one agent looked correct
- another agent behaved like the old model still existed
- both were technically "working"
- neither was actually aligned

The lesson was brutal and useful:

> When an agent behaves oddly, the first question is not “what did I write in AGENTS.md?”
> 
> It is: **which AGENTS.md is this agent actually reading?**

That question explains more multi-agent weirdness than it has any right to.

## The fix for split-workspace drift

The cleanest answer was to make each specialist workspace carry governance that pointed explicitly to the right lane bootstrap and memory locations.

In other words:

- no guessing the lane
- no assuming a shared workspace model where it did not exist
- no relying on one central file to control every agent regardless of workspace

Each specialist workspace needed governance that matched its actual runtime reality.

Once that was done, the lanes started behaving like lanes instead of like distant cousins with mismatched maps.

## What this setup solves

This model improved several things at once:

- **less context bleed** — publishing work stopped inheriting unrelated technical churn
- **cleaner specialist continuity** — each lane could accumulate local operational memory without drowning the others
- **clearer routing** — MAIN could coordinate without absorbing execution detail
- **model portability** — because the governance lived in markdown files, the operating model was less dependent on any one backend

The whole system became more legible.

## What it does not solve

It is worth saying plainly: this is still a convention-first system.

If an agent is allowed to read the workspace, and it chooses to ignore instructions, the files are not a real security wall. The separation works because the governance is explicit and the operating discipline is strong — not because there is a perfect runtime enforcement boundary.

That is good enough for workflow architecture.
It is not the same thing as a hardened isolation model.

## The practical lesson

If you want multiple long-lived specialist lanes, do not rely on ambient context and good intentions.

Write the structure down.

Define:

- what each lane is
- what it reads
- what it writes
- what it must not absorb
- how handoffs work
- where durable truth lives

A multi-agent setup gets better when it becomes more explicit, not more magical.

That turned out to be the whole trick.

## A final note

The strange thing about agent architecture is that the hard part is rarely the elegant diagram.

The hard part is finding the quiet places where one workspace assumption leaks into another, where one old protocol survives in a forgotten corner, and where one file you thought was global turns out to be local.

Which is, in its own way, quite a normal systems problem.
