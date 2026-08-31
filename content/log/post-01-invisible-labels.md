---
title: The proposal labels that are not in the document
slug: post-01-invisible-labels
summary: Three of five vendors' numbered proposals exist nowhere in their file. Word draws them at render time — which is why Word's own Find cannot see them either.
type: post
project: 3gpp-ran1-standardization-ledger
tags: [wireless-communication, standards, document-extraction, ran1]
published: true
published_at: 2026-08-31T00:00:00.000Z
media: []
---

I was building software that reads 3GPP contributions and pulls out what each
company proposed. For Huawei's document, the statements came back — but without
their labels. Nothing said which of them were proposals and which were
observations. There was no error and no warning. The output looked complete.

So I opened the document myself and typed "proposal 4" into the search. Nothing
came back for the fourth proposal. Paragraphs containing the word "proposal"
surfaced, but not the one I was looking for. I was certain proposal 4 existed,
and it does — you find it by scrolling.

This matters because of how the week before a meeting actually goes. Five vendors
critical to agenda item 11.4.1, channel coding, have submitted their technical
documents, and it is time to review them. I scan through the proposals, transfer
the facts to a spreadsheet, and place similar facts side by side, which gives a
relative positioning of each vendor on the subject. Agenda item 11.4.1 carries 41
documents. Mostly I have to read all 41, but when time is insufficient the
critical ones take precedence. Collectively, delegates and engineers work through
1,417 documents in RAN1#123, covering 50 agenda items. All of it repeats at the
next meeting.

Search returned nothing for numbered proposals and observations in Huawei's and
ZTE's documents. I read both by hand. The proposals are there, numbered, on the
page. The word "proposal" was searchable when it sat inside a paragraph, and not
searchable when it began a line — which is the opposite of what you would expect,
because the ones beginning a line are the ones that matter.

## Why the label is not there

The reason is in how Word stores a numbered list. The label is not typed into the
paragraph. It is stored once, as a template, in a separate part of the file:

```xml
<w:lvlText w:val="Proposal %1:"/>
<w:lvlText w:val="Observation %1: "/>
```

Each statement's paragraph carries a pointer to that template. Word substitutes
the counter and draws "Proposal 4:" on the screen at the moment it renders the
page. Those characters are in no paragraph of the document. This is why Word's
own Find cannot see them either: there is nothing there to find.

Two of the five vendors type their labels as ordinary text — Samsung has 64 of
them, Qualcomm 24. The other three have none at all. Reading the numbering
definition and simulating Word's counter recovers what was missing: 30
observations and 7 proposals for Huawei, 28 observations and 20 proposals for
ZTE, 9 observations and 8 proposals for Ericsson. Across the corpus, 41 label
sequences reconstruct with no gaps — the counter never skips, which is what makes
this recovery rather than guesswork.

## What I found, and what is still wrong

There is a detail here I did not expect. I inspected Huawei and ZTE by hand, and
found what the software could not see. The systematic pass then found a third
document with the same defect — Ericsson's — which I had never opened for this
purpose and did not know about until the measurement told me. Ericsson's
positions had survived extraction anyway, for an unrelated reason: its paragraphs
carry the style name "Proposal", and the style is stored even when the visible
label is not.

The labels are now recoverable. 88 of them for ZTE, 74 for Huawei, 17 for
Ericsson, reconstructed from the numbering definition with no gaps in the
sequences.

Recovering them and using them turned out to be two different jobs. When I
started writing this, the labels were reconstructed and stored, and the surface
I actually work in showed none of them. They are drawn now; that changed this
week.

The layer that decides whether a statement *is* a proposal or an observation
still does not read them. It looks at the paragraph's text, its style and its
heading shape, and nothing else — so ZTE still classifies zero statements, and
Huawei's come through as "views". I am stating that as a diagnosis rather than a
finding, but it is consistent with everything I can measure.

Which leaves three different numbers in play: what I can recover, what a reader
sees, and what the system can reason about. They are not the same number, and
quoting the first as though it were the third is exactly the kind of claim this
post is about.

## What is still broken

Some statements have neither a typed opener nor a recoverable one. They stay
unmarked rather than being assigned a guess.

Ericsson's conclusions section turns out to be 37 empty Word cross-reference
fields, so its positions have to be recovered from the body of the document
instead. Extraction is per-document, not per-vendor: the same company's next
contribution can behave differently, and there is no reason to assume it will
not.

## Why this is not a small problem

In a 3GPP contribution an observation and the proposal that follows it usually
work as a pair — the observation establishes the ground, the proposal makes the
request. It is a common shape rather than a rule; a proposal can stand with no
observation stated. But where the pair exists it carries the technical argument,
and you cannot follow it if you cannot tell which half you are reading.

Anything built on top of these documents — linking one company's argument to
another's, tracking how a position moved between meetings, finding where two
vendors genuinely disagree — assumes you can tell what a statement is. For most
of this corpus you could not, and nothing said so.

The general form, for anyone who will never open a 3GPP document: a file format
can display content that the file does not contain. "Search the text" is a weaker
guarantee than it sounds, and a tool that reads documents can return a result
that looks complete and is not.

I built the side-by-side comparison with AI agents first, and it worked. What it
did not do was survive being repeated across every topic, every working group and
every meeting — each document read costs again, and the reading never stops. That
is why the system does its deterministic work first and keeps language models out
of the query path.

The system is built in collaboration with AI agents, and so was this article.
This particular fix was one I pointed at and they implemented; the finding was
mine and the software's blindness to it was theirs.

---

I build systems that read standards documents and are honest about what they
could not read. Faster than doing it by hand, and without an LLM call for every
question asked — most of the structure is already in the file, if you are willing
to look for it. Specific about where they fail, because a position you cannot
check is not worth the time it saved.

*Next: the labels were invisible, but the software still found the statements.
It turns out a Word document says what a statement is in more than one way, and
the text is only one of them.*
