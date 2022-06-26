---
layout: post.pug
title: "Lear: A Shakespearian Command Line Utility"
year: 2022
month: "06"
day: "26"
order: 0
preview: "I love quirky command line utilities. Sometimes the &ldquo;animal brain of Unix&rdquo; will happily provide its own weirdness&mdash;the <i>two-letter gang</i> (ed, dc, et al.) is always a safe bet for doing something other than what you expect—but it’s community-driven space where things really get wild"
# next_title: Python is Better When You Impose Restrictions
# next_link: "/blog/python-is-better-when-you-impose-restrictions"
---

I love quirky command line utilities. Sometimes the [&ldquo;animal brain of Unix&rdquo;](https://www.youtube.com/watch?v=vm1GJMp0QN4&t=2460) will happily provide its own weirdness&mdash;the _two-letter gang_ (ed, dc, et al.) is always a safe bet for doing something other than what you expect&mdash;but it&rsquo;s the community-driven space where things really get wild.

Some of my favorites include [fortune](https://en.wikipedia.org/wiki/Fortune_(Unix)), [cowsay](https://en.wikipedia.org/wiki/Cowsay), and [lolcat](https://github.com/busyloop/lolcat), but [sl](https://github.com/mtoyoda/sl) has a special place in my heart. Whenever you mistype `ls`, it plays an agonizingly slow animation of a slow locomotive making its way across your screen. And just to be extra annoying, it eats `Ctrl+C` and `Ctrl+D` (although you can still background it with `Ctrl+Z` if you want to be a buzzkill). As I was becoming more proficient with Rust and the crate ecosystem, I wanted to contribute my own weird, useless utility to this canon of highly serious programs.

## The Idea

`lear` is a program that prints a random quote from _King Lear_ every time you mistype `clear` into your console. This is something that I do with some frequency as I am not a very good typist.

As you can see from this dramatic re-enactment based on real-life events, `lear` works well, even in high pressure situations.

<pre class="code">
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> lear
<b>GONERIL</b>
 [Aside] O, ho, I know the riddle.--I will go.

 <i>As they are going out, enter EDGAR disguised</i>

<b>EDGAR</b>
 If e'er your grace had speech with man so poor,
 Hear me one word.

<b>ALBANY</b>
 I'll overtake you. Speak.

 <i>Exeunt all but ALBANY and EDGAR</i>

                                                          <i>(Lr. 5.1.43-46)</i>
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> ^C
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> ^C
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> arghhhh
bash: arghhhh: command not found
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> <span class="blink">_</span>
</pre>

For no practical reason, `lear` also supports the ability to quote specific passages with the addition of a few command-line arguments

<pre class="code">
<span class=cd-orange>kyle@mbp</span> <b>&raquo;</b> lear quote 5 3 383 386
<b>ALBANY</b>
 The weight of this sad time we must obey;
 Speak what we feel, not what we ought to say.
 The oldest hath borne most: we that are young
 Shall never see so much, nor live so long.

                                                        <i>(Lr. 5.3.383-386)</i>
</pre>

`lear` can be installed on MacOS via Homebrew or installed from source using cargo. Full installation instructions are available on [GitHub](https://github.com/kyle-silver/lear).

## Making Lear

The first challenge after coming up with the initial idea was finding a copy of _King Lear_ that I could use. It almost goes without saying, but in order for `lear` to be true to its name, it needed all of _King Lear_ to be included as part of the final program—and if I couldn’t find a free, online copy to use&hellip; well this project was going to be dead in the water.

As much as I was dedicated to this project, typing all 27,000+ words of the play from a physical copy was going to be too much of a time commitment. Thankfully MIT has been hosting the [complete works of Shakespeare](http://shakespeare.mit.edu/index.html) online (since 1993? What??) and they’ve placed the HTML versions they created into the public domain. Sweet! Thanks [Jeremy](https://twitter.com/jeremyhylton), that must have been a lot of typing and I’m very grateful that you did it several years before I was born because I don’t have the attention span to commit to that kind of thing. _Yoink!_

This was only the beginning of my text processing woes, though. As any machine learning enthusiast will tell you, after you’ve gotten your raw data, you need to standardize, sanitize, and normalize it. And in this case, the pre-netscape HTML had quite a few quirks. On the plus side, every line had its own name attribute with the act, scene, and line numbers! Thanks Jeremy! On the other hand, though, everything was composed of `<a>` and `<blockquote>` tags, with `<p>` tags only being used for stage directions. What the heck, Jeremy!

<pre class="code">
<span class=cd-blue>&lt;A</span> <span class=cd-orange>NAME</span>=<span class=cd-green>speech13</span><span class=cd-blue>&gt;</span>
  <span class=cd-blue>&lt;b&gt;</span>EDMUND<span class=cd-blue>&lt;/b&gt;</span>
<span class=cd-blue>&lt;/a&gt;</span>
<span class=cd-blue>&lt;blockquote&gt;</span>
  <span class=cd-blue>&lt;A</span> <span class=cd-orange>NAME</span>=<span class=cd-green>1.1.31</span><span class=cd-blue>&gt;</span>Sir, I shall study deserving.<span class=cd-blue>&lt;/A&gt;</span><span class=cd-blue>&lt;br&gt;</span>
<span class=cd-blue>&lt;/blockquote&gt;</span>
<span class=cd-blue>&lt;A</span> <span class=cd-orange>NAME</span>=<span class=cd-green>speech13</span><span class=cd-blue>&gt;</span>
  <span class=cd-blue>&lt;b&gt;</span>GLOUCESTER<span class=cd-blue>&lt;/b&gt;</span>
<span class=cd-blue>&lt;/a&gt;</span>
<span class=cd-blue>&lt;blockquote&gt;</span>
  <span class=cd-blue>&lt;A</span> <span class=cd-orange>NAME</span>=<span class=cd-green>1.1.32</span><span class=cd-blue>&gt;</span>He hath been out nine years, and away he shall<span class=cd-blue>&lt;/A&gt;</span><span class=cd-blue>&lt;br&gt;</span>
  <span class=cd-blue>&lt;A</span> <span class=cd-orange>NAME</span>=<span class=cd-green>1.1.33</span><span class=cd-blue>&gt;</span>again. The king is coming.<span class=cd-blue>&lt;/A&gt;</span><span class=cd-blue>&lt;br&gt;</span>
  <span class=cd-blue>&lt;p&gt;&lt;i&gt;</span>Sennet. Enter KING LEAR, CORNWALL, ALBANY, GONERIL, REGAN, CORDELIA, and Attendants<span class=cd-blue>&lt;/i&gt;&lt;/p&gt;</span>
<span class=cd-blue>&lt;/blockquote&gt;</span>
</pre>

I mean, uh&mdash;whaaa&hellip;?? Maybe I just don’t understand HTML. Jeremy is the MIT grad, I&rsquo;ll keep my mouth shut.

That aside, it was fairly straightforward to throw together a python script to transform the HTML version into a JSON format that would be easier for me to work with. Not [trivial](https://github.com/kyle-silver/lear/blob/main/preprocessing/munge.py ), mind you, but doable without a _huge_ investment of time.

## Performance Considerations (No, Really)

The actual implementation of `lear` was pretty uneventful. Once I had a serviceable format for the text of the play, all I had to do was pick some random numbers for the act, scene, and lines&mdash;then format everything and print it to the console. But after I had a basic version working, I started thinking about performance. Now, I know that for a joke application like this one performance doesn’t _really_ matter, but part of what makes `lear` amusing to me is the immediacy with which you’re punished for your mistakes. One second, you’re trying to clear some junk out of the terminal and then _bang!_ Now there’s even more junk in the terminal, you squint to read it and remember that you installed `lear` as a joke months ago, grumble to yourself, and move on with your life. It should be funny, but the seconds of interruption should be after the text is already on screen. If after accidentally triggering it took more than a fraction of a second for everything to run, it would quickly overstay its welcome and be perceived as a hinderance rather than just a funny inconvenience.

The program is structured so that each scene is its own JSON file, which at runtime is deserialized so that a few lines can be selected and printed. If these were actually stored as files separate from the application binary, we would need to spend time reading them into memory and dealing with file I/O, potentially across multiple operating systems. No thank you. Instead, since we know that we only want to read from these few files, we can use Rust&rsquo;s `include_str!` macro to turn these files into `const` strings which are already stored in memory. It also means that lear can be distributed as a single static binary which doesn’t depend on any other files, which is nice.

Now when `lear` runs, it picks the act and scene first&mdash;then only deserializes the JSON for that section as opposed to loading it in from a file or even worse: deserializing the entire play just to pick 5&ndash;7 lines. I suppose spending time parsing JSON is also time that could theoretically be saved, but the only alternative then would be inserting all of _King Lear_ as a bunch of prefabricated structs in the source code. That would have been a nightmare to manage, and on top of that [serde](https://serde.rs) is already so fast that deserializing a single scene (which is quite small compared to the play as a whole) is a cost that can be eaten rather imperceptibly.  

## Distribution

Now that I had a working program, I had to find a way to make it easily shareable with others. Thankfully, `cargo` makes it incredibly [easy](https://doc.rust-lang.org/cargo/commands/cargo-install.html) to distribute Rust binaries&mdash;on the condition that your end-users are okay with compiling them from source. So technically we can say that there’s cross-platform support. Cool.

The other main way that I get quirky CLI utilities is with Homebrew. That intimidated me because, although Ruby is a [normal language](https://www.destroyallsoftware.com/talks/wat) used by [cool people](https://github.com/readme/featured/why-the-lucky-stiff), I didn’t know the first thing about it, except that it was like Python but with a &ldquo;more interesting&rdquo; take on syntax. Thankfully [someone else](https://federicoterzi.com/blog/how-to-publish-your-rust-project-on-homebrew/) had already gone through the hassle of figuring out how to distribute Rust packages on homebrew and the process was relatively painless.

And that’s the lesson you should take away from this&mdash;be weird, steal from others, and do as little work as possible.
