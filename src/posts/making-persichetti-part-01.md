---
layout: post.pug
title: 'Making a Music Theory Library: Part 1'
order: 20
preview: 'Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code...'
copyright_year: 2021
---

Recently I&rsquo;ve been working on a library to codify some basic concepts of [common-practice](https://en.wikipedia.org/wiki/Common_practice_period) music theory. The purpose is twofold: to force me to nail down my understanding of tonal harmony&mdash;which has gotten a little rusty after being out of school for so long&mdash;and to work on a Rust crate that someone else may actually find useful (or at the very least a fun curiosity). After several false starts, I wanted to write a bit about some of the challenges I faced getting this project off the ground. Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code, and the rest of this entry will attempt to explain why.

## What is a note, anyway?

If you&rsquo;ve never dipped your toe into the pond of music theory before, here&rsquo;s a quick primer: music is made up of individual &ldquo;notes&rdquo;, sometimes played alone and sometimes played together. A note is really just a name for a particular frequency of vibrations in a sound wave, and there are twelve distinct pitches of note that are recognized in most western music. In reality air can wiggle at a lot more than twelve fixed frequencies, but when a frequency doubles we just hear it as a higher version of the same, lower pitch.

Here&rsquo;s the first complication. Even though there are twelve distinct pitches, we only use seven letters to name them (in english, anyway). We use A, B, C, D, E, F, and G. If we want to get the note that&rsquo;s in between A and B, we can add a **flat sign** to the B (written B&flat;) or a **sharp sign** to the A (written A&sharp;). Both of these represent the one note in between A and B. Great! Now instead of having twelve names for twelve notes, we have a system that lets us give multiple names to the same pitch&mdash;I&rsquo;m sure that this won&rsquo;t cause any headaches down the road...

The reason for this system has to do with how most tonal music only uses seven-note &ldquo;scales&rdquo; or subsets of this twelve-note system, and by using sharps and flats we can guarantee that any seven note scale will have all of the letter names appear exactly once. This makes things easier to read on sheet music, but a full explanation is beyond the scope of what I want to cover here.

So, how do we represent this in code?

Well, an enum definitely feels like the right fit for these note names. Let&rsquo;s give that a whirl.

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">NoteName</span> {
    C, D, E, F, G, A, B,
}
</pre>
    </div>
</div>

That seems like a pretty good place to start. How should we handle accidentals?

Well, one detail I left out was that in addition to normal sharps and flats, there are also **double-sharps** and **double-flats**, which arise in certain (rare) circumstances. And on top of that, there are theoretically **triple** versions of these accidentals, although they almost never appear because of how impractical they are to read. So, the most straightforward thing to do for accidentals would be to just hard-code the most common cases, like this:

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">Accidental</span> {
    Sharp, Flat,
    DoubleSharp, DoubleFlat,
    TripleSharp, TripleFlat,
}
</pre>
    </div>
</div>

Something doesn't feel quite right about this though. Those names have numbers in them&mdash;wouldn&rsquo;t it be easier to just encode that number directly? Rust&rsquo;s enums let us be a lot more flexible than in other C-like languages, after all. And while we&rsquo;re taking a second pass at this, what should we do about the case where there&rsquo;s no accidental? Well, we could make the accidental [optional](https://doc.rust-lang.org/rust-by-example/std/option.html), but given how often we&rsquo;ll need to interact with this API it might be better to just stick a natural sign (&natural;) on everything that&rsquo;s unmodified (the natural sign indicates that a note is neither sharp nor flat).

Yeah, let&rsquo;s give this another go!

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">Accidental</span> {
    Natural, Sharp(<span style="color:var(--blue)">usize</span>), Flat(<span style="color:var(--blue)">usize</span>),
}
</pre>
    </div>
</div>

This looks a lot better. We&rsquo;ve avoided the need for an <b class="inline-code">Option</b> type and we can even represent any number of n-tuple sharps or flats without needing to code them as special cases. All that being said, there are still two things gnawing at me. First, <b class="inline-code">Flat(<span style="color:var(--blue)">0</span>)</b> represents an alteration of **one** half-step. In a previous iteration, I had <b class="inline-code">Flat(<span style="color:var(--blue)">1</span>)</b> represent a single flat, which looks intuitive at first but implies that <b class="inline-code">Flat(<span style="color:var(--blue)">0</span>)</b> is the same thing as a natural sign. Yuck! One principle that Rust has instilled in me is to try and make illegal states unrepresentable in code: every opportunity that an end-user has to write code that compiles but is semantically meaningless&mdash;like a flat sign that doesn&rsquo;t lower the pitch of a note&mdash;is a foot-gun. Wherever possible, we want to avoid putting foot-guns into our library. So while zero-indexed accidentals look a bit strange at first, I think they&rsquo;re the right call.

The other issue is that <b class="inline-code"><span style="color:var(--blue)">usize</span></b> type in there. Sized types are meant to represent the size of data structures in memory, such as the number of bytes a struct takes up on the heap, or the number of elements in a vector. I went back and forth on this, but I like the connotation of a size for the type here: it represents a magnitude, as opposed to a count. Yes, it does mean that this library might panic if someone tries to instantiate a <b class="inline-code">Flat(<span style="color:var(--blue)">65_537</span>)</b> on a 16-bit microprocessor, but that&rsquo;s a sacrifice I&rsquo;m willing to make.

Now that we have our note names and our note accidentals, we can create a neat little struct that joins them both together into a proper **Note**:

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub struct</span> <span style="color:var(--blue)">Note</span> {
    name<span style="color:var(--orange)">:</span> <span style="color:var(--blue)">NoteName</span>,
    accidental<span style="color:var(--orange)">:</span> <span style="color:var(--blue)">Accidental</span>,
}
</pre>
    </div>
</div>

Now that we have this most fundamental building block laid down, we can start to see what sort of structures and relationships we can build with it. To me the next thing to do is to define what the relationship between notes looks like, which leads us to...

## Intervals, or: why musicians think a fourth is bigger than a third

An **interval** is the distance between two notes. The name of an interval is made of two parts: the **size**, which is the distance between the letter names of the notes; and the **quality**, which is an alteration to the size, adjusting it by half-step until the **chromatic distance** is correct. That&rsquo;s a lot of jargon, and it all stems from the fact that western tonal harmony has two notions of distance. Distance by letter name, known as **diatonic** distance, and distance by half-step, known as the **chromatic** distance.

