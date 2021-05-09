---
layout: post.pug
title: 'Making a Music Theory Library: Part 1'
order: 20
preview: 'Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code...'
copyright_year: 2021
---

Recently I&rsquo;ve been working on a library to codify some basic concepts of [**common-practice**](https://en.wikipedia.org/wiki/Common_practice_period) music theory. The purpose is twofold: to force me to nail down my understanding of tonal harmony&mdash;which has gotten a little rusty after being out of school for so long&mdash;and to work on a Rust crate that someone else may actually find useful (or at the very least a fun curiosity). After several false starts, I wanted to write a bit about some of the challenges I faced getting this project off the ground. Music theory is one of those squishy, human things that doesn&rsquo;t easily lend itself to representations in code, and the rest of this entry will attempt to explain why.

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
    Sharp, Flat, DoubleSharp, DoubleFlat, TripleSharp, TripleFlat,
}
</pre>
    </div>
</div>

Something doesn't feel quite right about this though. Those names have numbers in them&mdash;wouldn&rsquo;t it be easier to just encode that number directly? Rust&rsquo;s enums let us be a lot more flexible than in other C-like languages, after all. And while we&rsquo;re taking a second pass at this, what should we do about the case where there&rsquo;s no accidental? Well, we could make the accidental [**optional**](https://doc.rust-lang.org/rust-by-example/std/option.html), but given how often we&rsquo;ll need to interact with this API it might be better to just stick a natural sign (&natural;) on everything that&rsquo;s unmodified (the natural sign indicates that a note is neither sharp nor flat).

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

The other issue is that <b class="inline-code"><span style="color:var(--blue)">usize</span></b> type in there. [**Size types**](https://doc.rust-lang.org/std/primitive.usize.html) are meant to represent the size of data structures in memory, such as the number of bytes a struct takes up on the heap, or the number of elements in a vector. I went back and forth on this, but I like the connotation of a size for the type here: it represents a magnitude, as opposed to a count. Yes, it does mean that this library might panic if someone tries to instantiate a <b class="inline-code">Flat(<span style="color:var(--blue)">65_537</span>)</b> on a 16-bit microprocessor, but that&rsquo;s a sacrifice I&rsquo;m willing to make.

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

The naming convention for intervals is based on how far apart the two notes are in the parent scale that they both come from. For example, if we&rsquo;re trying to find the distance between C and E, we can imagine that we&rsquo;re in the key of C major and then ask &ldquo;what&rsquo;s E&rsquo;s position in the C major scale?&ldquo; In this case, E is the third note in the scale, so we say it&rsquo;s &ldquo;a third&rdquo; away.

![A C major scale in treble clef, spelling out C D E F G A B](/media/making-persichetti-part-01/c-major-scale.png "C Major Scale")

This works well in simple cases, but we&rsquo;ve only covered seven out of the twelve notes&mdash;what do we do for the rest of them? Take A flat, for example. It&rsquo;s not in the C major scale: how far away from C is it? In this case, we would look for a scale that has both notes, like C minor. Since A flat is the sixth note of the C minor scale, we say that it&rsquo;s a **minor sixth** away. In our example above, we would have called that a **major third**, since it came from the major scale.

![A C minor scale in treble clef, spelling out C D E flat F G A flat B flat](/media/making-persichetti-part-01/c-minor-scale.png "C Minor Scale")

With that context, what would be a good way to represent that in code?

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">IntervalSize</span> {
    Unison, Second, Third, Fourth, Fifth, Sixth, Seventh,
}
&nbsp;
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">IntervalQuality</span> {
    Major, Minor, Perfect, Augmented(<span style="color:var(--blue)">usize</span>), Diminished(<span style="color:var(--blue)">usize</span>),
}
&nbsp;
<span style="color:var(--red)">pub struct</span> <span style="color:var(--blue)">Interval</span> {
    size<span style="color:var(--orange)">:</span> <span style="color:var(--blue)">IntervalSize</span>,
    quality<span style="color:var(--orange)">:</span> <span style="color:var(--blue)">IntervalQuality</span>,
}
</pre>
    </div>
</div>

That looks pretty good! As you can see, there are a couple of interval qualities that I haven&rsquo;t discussed yet, but still everything seems to be flowing pretty naturally from our earlier examples. The thing I really want to get to is the general algorithm for naming intervals, but before we get to that we still have a bit of ground left to cover.

First and foremost, not all combinations of interval size and quality are valid. Perfect fourths and major fifths are not allowed, and a diminished interval has a different meaning depending on whether the interval in question is from the &ldquo;perfect&rdquo; or &ldquo;major&rdquo; system. The reason mostly has to do with historical convention, and truthfully I don&rsquo;t know exactly why. It **is** the convention, however, and for this library we&rsquo;ll need to stick to it. Given what we said earlier about making illegal states unrepresentable, would it make sense to do something more like this?

<div class="codeblock-wrap">
    <div class="codeblock-header">
        <p>&lt;code lang="rust"/&gt;</p>
    </div>
    <div class="codeblock">
        <pre>
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">PerfectSystem</span> {
    Unison, Fourth, Fifth,
}
&nbsp;
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">MajorSystem</span> {
    Second, Third, Sixth, Seventh,
}
&nbsp;
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">DiminishedSystem</span> {
    Perfect(<span style="color:var(--blue)">usize</span>, <span style="color:var(--blue)">PerfectSystem</span>),
    Major(<span style="color:var(--blue)">usize</span>, <span style="color:var(--blue)">MajorSystem</span>),
}
&nbsp;
<span style="color:var(--red)">pub enum</span> <span style="color:var(--blue)">Interval</span> {
    Perfect(<span style="color:var(--blue)">PerfectSystem</span>),
    Major(<span style="color:var(--blue)">MajorSystem</span>),
    Minor(<span style="color:var(--blue)">MajorSystem</span>),
    Diminished(<span style="color:var(--blue)">DiminishedSystem</span>),
    Augmented(<span style="color:var(--blue)">DiminishedSystem</span>),
}
</pre>
    </div>
</div>

In one sense, yes&mdash;however this isn&rsquo;t the option I chose. This implementation is correct, but very verbose to deal with when writing methods that interact with it. Sometimes, that&rsquo;s okay because of the inherent complexity of the problem-space, but in our case the first implementation provides an easier interface to work with once we know that the struct is valid. What does validating the code look like, then?