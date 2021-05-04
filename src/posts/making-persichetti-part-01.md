---
layout: post.pug
title: 'Making a Music Theory Library: Part 1'
order: 20
preview: 'Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code...'
copyright_year: 2021
---

Recently I&rsquo;ve been working on a library to codify some basic concepts of [common-practice](https://en.wikipedia.org/wiki/Common_practice_period) music theory. The purpose is twofold: to force me to nail down my understanding of tonal harmony &mdash; which has gotten a little rusty after being outside of school for so long &mdash; and to work on a Rust crate that someone else may actually find useful (or at the very least a fun curiosity). After several false starts, I wanted to write a bit about some of the challenges I faced getting this project off the ground. Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code, and the rest of this entry will attempt to explain why.

## What is a note, anyway?

If you&rsquo;ve never dipped your toe into the pond of music theory before, here&rsquo;s a quick primer: music is made up of individual &ldquo;notes&rdquo;, sometimes played alone and sometimes played together. A note is really just a name for a particular frequency of vibrations in a sound wave, and there are twelve distinct pitches of note that are recognized in most western music. In reality air can wiggle at a lot more than twelve fixed frequencies, but when a frequency doubles we just hear it as a higher version of the same, lower pitch.

Here&rsquo;s the first complication. Even though there are twelve distinct pitches, we only use seven letters to name them (in english, anyway). We use A, B, C, D, E, F, and G. If we want to get the note that&rsquo;s in between A and B, we can add a **_flat sign_** to the B (written B&flat;) or a **_sharp sign_** to the A (written A&sharp;). Both of these represent the one note in between A and B. Great! Now instead of having twelve names for twelve notes, we have a system that lets us give multiple names to the same pitch &mdash; I&rsquo;m sure that this won&rsquo;t cause any headaches down the road...

The **_is_** a reason for this system has to do with how most tonal music only uses seven-note &ldquo;scales&rdquo; or subsets of this twelve-note system, and by using sharps and flats we can guarantee that any seven note scale will have all of the letter names appear exactly once. This makes things easier to read on sheet music, but a full explanation is beyond the scope of what I want to cover here.

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

Well, one detail I left out was that in addition to normal sharps and flats, there are also **_double-sharps_** and **_double-flats_**, which arise in certain (rare) circumstances. And on top of that, there are theoretically **_triple_** versions of these accidentals, although they almost never appear because of how impractical they are to read. So, the most straightforward thing to do for accidentals would be to just hard-code the most common cases, like this:

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

Something doesn't feel quite right about this though. Those names have numbers in them &mdash; wouldn&rsquo;t it be easier to just encode the number directly? Rust&rsquo;s enums let us be a lot more flexible than in other C-like languages, after all. And while we&rsquo;re taking a second pass at this, what should we do about the case where there&rsquo; no accidental? Well, we could have something like making the accidental [optional](https://doc.rust-lang.org/rust-by-example/std/option.html), but given how often we&rsquo;ll need to interact with this API, it might be better to just stick a natural sign on everything (Natural signs &ldquo;cancel out&rdquo; sharps and flats).

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

This looks a lot better. We&rsquo;ve avoided the need for an **option** type, and we can even represent any number of n-tuple sharps or flats without needing to code them as special cases. All that being said, there are still two things gnawing at me. First, this implementation allows for silly things like <b>Flat(<span style="color:var(--blue)">0</span>)</b> which is an illegal value for that enum &mdash; the natural sign (&natural;) is the correct way to represent that value. Another way we could handle this is to have <b>Flat(<span style="color:var(--blue)">0</span>)</b> represent a diminution of a single half step. User feedback on the library could help dictate whether that&rsquo;s an appropriate course of action. We could also avoid this with something like Rust&rsquo;s [NonZeroUsize](https://doc.rust-lang.org/std/num/struct.NonZeroUsize.html), but that adds a lot of boilerplate to something that will be accessed very frequently. For now it&rsquo;s labeled **_caveat emptor_**, and we&rsquo;ll just be sure that we treat it correctly in our code.

The other issue is that <b><span style="color:var(--blue)">usize</span></b> type in there. Sized types are meant to represent the size of data structures in memory, such as the number of bytes a struct takes up on the heap, or the number of elements in a vector. I went back and forth on this, but I like the connotation of a size for the type here: it represents a magnitude, as opposed to a count. Yes, it does mean that this library might panic if someone tries to instantiate a <b>Flat(<span style="color:var(--blue)">65_537</span>)</b> on a 16-bit microprocessor, but that&rsquo;s a sacrifice I&rsquo;m willing to make.

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

An **_interval_** is the distance between two notes. The name of an interval is made of two parts: the **_size_**, which is the distance between the letter names of the notes; and the **_quality_**, which is an alteration to the size, adjusting it by half-step until the **_chromatic distance_** is correct. That&rsquo;s a lot of jargon, and it all stems from the fact that western tonal harmony has two notions of distance. Distance by letter name, known as **_diatonic_** distance, and distance by half-step, known as the **_chromatic_** distance.

Earlier I mentioned how 