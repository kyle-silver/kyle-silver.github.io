---
layout: post.pug
title: "Building the Recursive Dice Roller" 
year: 2023
month: "06"
day: "17"
order: 30
preview: "This is gonna be a long one&hellip; a really deep dive into how user input can be transformed into actual dice rolls, and how to deal with the pesky problem of recursion"
prev_link: /blog/dice
---

<link href="animation.css" type="text/css" rel="stylesheet">

*Interpretation* means performing the actual computation our expression represents. On the path that we’re taking, it means walking through our hierarchy of instructions and performing the actions they describe one by one. It may seem like an empty semantic game to say that the expression `2×3` has no meaning, but somehow `Multiply(2, 3)` does&mdash;I promise that there’s a reason for all of this symbol shuffling. Taking that on faith for now, though, we can walk through our &ldquo;tree&rdquo; of expressions and begin evaluating them.

<div class="animation-container" id="tree-reduction">
    <link href="tree-reduction.css" type="text/css" rel="stylesheet">
    <div id="tree-reduction-animation">
        <div class="node" id="add">Add</div>
        <div class="node" id="one">1</div>
        <span class="node" id="multiply">Multiply</span>
        <div class="node" id="two">2</div>
        <div class="node" id="three">3</div>
        <div class="node" id="six">6</div>
        <div class="node" id="seven">7</div>
        <span class="line top" id="tier-one-bar"></span>
        <span class="line vertical top" id="tier-one-left-tick"></span>
        <span class="line vertical top" id="tier-one-right-tick"></span>
        <span class="line vertical top" id="tier-one-center-tick"></span>
        <span class="line bottom" id="tier-two-bar"></span>
        <span class="line vertical bottom" id="tier-two-left-tick"></span>
        <span class="line vertical bottom" id="tier-two-right-tick"></span>
        <span class="line vertical bottom" id="tier-two-center-tick"></span>
    </div>
</div>

We started with the “leaves” furthest from the “root” and began combining them until we were left with a single number, representing the output of our computation. This is known as *tree-walking interpretation*. There are other things we could have done with this tree, namely interpretation’s big brother, *compilation*, where the tree is encoded as a set of *CPU instructions* and stored in an *executable* so it can be run at a later time&mdash;or even on a different machine altogether. For now, though, we’ll stick with interpretation and see where this tree-walking path leads us.

Now, what would it look like to “execute” this roll instruction? We know that we need to generate some random numbers, with the number of random values matching the `dice` variable and the range of possible values being between 1 and the value of the `sides` variable; once we have them, we can sum their values to get our final answer. For our random number generator. We’ll get the random numbers from a third-party library called [*rand*](https://crates.io/crates/rand ) and use [Rust](https://www.rust-lang.org/ ) as our programming language.

<div
    class="animation-with-code"
    id="simple-roll-eval"
    title="Order of operations for 1 + (2 * 3)"
>
    <link href="simple-roll-eval.css" type="text/css" rel="stylesheet">
    <script src="simple-roll-eval.js" defer=true></script>
    <div class="animation-container" id="simple-roll-eval-animation">
        <div class="dice" id="test-box"><div class="dice-text">X</div></div>
    </div>
    <div class="code" id="code-snippet">
        <div class="code-line" id="line-01">
            <span class="cd-orange">impl</span>
            <span class="cd-blue">Roll</span>
            <span class="cd-black">{</span>
        </div>
        <br>
        <div class="code-line" id="line-02">
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-orange">fn</span>
            <span class="cd-yellow">roll</span><span class="cd-black">(</span><span class="cd-orange">&</span><span class="cd-blue"><i>self</i></span><span class="cd-black">,</span>
            <span class="cd-black">rng</span><span class="cd-orange">: &mut impl</span>
            <span class="cd-blue">Rng</span><span class="cd-black">)</span>
            <span class="cd-orange">-></span>
            <span class="cd-blue">i32</span>
            <span class="cd-black">{</span>
        </div>
        <br>
        <div class="code-line" id="line-03">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-orange">let mut</span>
            <span class="cd-black">total</span>
            <span class="cd-orange">=</span>
            <span class="cd-purple">0</span><span class="cd-black">;</span>
        </div>
        <br>
        <div class="code-line" id="line-04">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-orange">for</span>
            <span class="cd-black">n</span>
            <span class="cd-orange">in</span>
            <span class="cd-black">(</span><span class="cd-purple">1</span><span class="cd-orange">..=</span><span class="cd-blue"><i>self</i></span><span class="cd-orange">.</span><span class="cd-black">dice) {</span>
        </div>
        <br>
        <div class="code-line" id="line-05">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-orange">let</span>
            <span class="cd-black">rolled_value</span>
            <span class="cd-orange">=</span>
            <span class="cd-black">rng</span><span class="cd-orange">.</span><span class="cd-yellow">gen_range</span><span class="cd-black">(</span><span class="cd-purple">1</span><span class="cd-orange">..=</span><span class="cd-blue"><i>self</i></span><span class="cd-orange">.</span><span class="cd-black">sides);</span>
        </div>
        <br>
        <div class="code-line" id="line-06">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-black">total</span>
            <span class="cd-orange">=</span>
            <span class="cd-black">total</span>
            <span class="cd-orange">+</span>
            <span class="cd-black">rolled_value;</span>
        </div>
        <br>
        <div class="code-line" id="line-07">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-black">}</span>
        </div>
        <br>
        <div class="code-line" id="line-08">
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-orange">return</span>
            <span class="cd-black">total;</span>
        </div>
        <br>
        <div class="code-line" id="line-09">
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span class="cd-black">}</span>
        </div>
        <br>
        <div class="code-line" id="line-10">
            <span class="cd-black">}</span>
        </div>
    </div>
</div>

I don’t want to expect that you know Rust&mdash;or any programming language for that matter&mdash;as a prerequisite for understanding where the rest of this example is headed. The concepts we’re going to tackle are both fascinating and surprisingly intuitive; the code is just the medium through which they’re being explored. To that end, don’t fret if the code looks odd. I will do my best to explain what’s going on in each case. And for the rustaceans out there&mdash;you can check out the [source code](https://github.com/kyle-silver/recursive-dice-roller/blob/5cdf1bfb581d80f148122906ad46e739d4a96c23/src/eval.rs#L218-L261 ) to see how these examples were adapted.
