---
layout: post.pug
title: "Dice Rolling Notation: Now With Recursion!"
year: 2023
month: "03"
day: "18"
order: 20
preview: "Dice notation is actually pretty straightforward. It&rsquo;s not <i>trivial</i> to implement, but if you&rsquo;re already comfortable with string processing it&rsquo;s the kind of thing you can do in an afternoon. When I tried to add recursion to the notation, though, I needed to break out so much heavier machinery&hellip;"
prev_title: "Making Clocks with JavaScript"
prev_link: /blog/clocks
---

<script type="module">
    import init, { evaluate_and_draw } from "./recursive_dice_roller.js";
    import * as colorize from "./colorize.js";
    await init();
    window.render = function render(expression) {
        const result = evaluate_and_draw(expression);
        const colorized = colorize.colorful(result);
        document.getElementById("draw-output").innerHTML = colorized;
    };
</script>

<div class="roll-container">
    <form
        class="roll-form"
        style="display:flex;align-items:stretch;"
        onsubmit="window.render(document.getElementById('expression').value); return false"
    >
        <input
            type="text"
            id="expression"
            style="width:100%;margin-right:3px;font-size:1rem;font-family:'Ruda';"
            value="(3d4 - 2)d(d6*2)k(d2 + 1) + 5"
        />
        <input
            type="submit"
            style="padding-left:10px;padding-right:10px;font-family:Ruda;font-weight:bold"
            value="Roll"
        />
    </form>
    <pre class="code" id="draw-output">
<b>A Recursive Dice Roller</b>
<br />
Common dice rolling options are supported:
&ndash; Roll a single die:       <b>d6</b>
&ndash; Roll multiple dice:      <b>3d8 + 4</b>
&ndash; Roll many, keep highest: <b>2d20k1 - 3</b>
&ndash; Roll many, keep lowest:  <b>3d10kl2</b>
&ndash; You can use parentheses: <b>3&nbsp;* (2d6 + 4)</b>
&ndash; Add many rolls together: <b>3d8 + 2d6 + 2</b>
<br />
But! In addition to these normal operations,
you can also nest expressions with arbitrary
depth
&ndash; <b>(2d6)d8</b>
&ndash; <b>(d10 + 7)d(4d6 * 2)k(d6) - 2</b>
&ndash; <b>((5d4)d3)d2</b>
</pre>
</div>

This was a fun little project that I made to learn about programming languages and parsers&mdash;as well as WebAssembly. If you&rsquo;re having fun playing around with the dice roller, stick around for a breakdown on how I made it.
