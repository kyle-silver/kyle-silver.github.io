---
layout: post.pug
title: "This Dice Roller Was More Complicated Than I Could Have Ever Possibly Imagined"
year: 2023
month: "03"
day: "18"
order: 20
preview: "Just some placeholder text for now :-)"
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

<div class="container">
    <form onsubmit="window.render(document.getElementById('expression').value); return false" class="my-form">
        <input id="expression" type="text" />
        <input type="submit" value="Submit" />
    </form>
    <pre class="code" id="draw-output">
<b>A Recursive Dice Roller</b>
<br />
Common dice rolling options are supported:
&ndash; Roll a single die:       <b>d6</b>
&ndash; Roll multiple dice:      <b>3d8 + 4</b>
&ndash; Roll many, keep highest: <b>2d20k1 - 3</b>
&ndash; Roll many, keep lowest:  <b>3d10kl2</b>
&ndash; You can use parentheses: <b>3 *(2d6 + 4)</b>
&ndash; Add many rolls together: <b>3d8 + 2d6 + 2</b>
<br />
But! In addition to these normal operations,
you can also nest expressions with arbitrary
depth
&ndash; <b>(2d6)d8</b>
&ndash; <b>(d10 + 7)d(4d6* 2)k(d6) - 2</b>
&ndash; <b>((5d4)d3)d2</b>

</pre>
</div>

Hello, world!
