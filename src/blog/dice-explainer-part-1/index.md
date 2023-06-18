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
    <div id="animation">
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
