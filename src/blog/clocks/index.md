---
layout: post.pug
title: "Making Clocks out of JavaScript"
year: 2022
month: "12"
day: "28"
order: 10
preview: "Back when I was in high school I had a Cadence Timescale watch, which, despite my parent&rsquo;s skepticism at the prospect of purchasing a timepiece from a no-name company with a sketchy website, they let me buy using their credit card&hellip;"
next_title: "Dice Rolling Notation: Now With Recursion!"
next_link: /blog/dice
prev_title: "Lear: A Shakespearian Command Line Utility"
prev_link: /blog/lear
---

This has been an odd, if enjoyable exercise. Follow these links for full-screen versions

* [Timescale](https://kyle-silver.github.io/clocks/#/timescale) &mdash; a faithful recreation of times now passed
* [Concentric Rings](https://kyle-silver.github.io/clocks/#/concentric) &mdash; wheels within wheels; biblical accuracy not guaranteed

<br>

<iframe
    class="clock-iframe"
    title="Timescale"
    style="height:400px"
    src="https://kyle-silver.github.io/clocks/#/timescale"
></iframe>

<h2 style="margin-top:0">Timescale</h2>

Back when I was in high school I had a [Cadence Timescale watch](https://www.reddit.com/r/Watches/comments/2ki1r1/review_cadence_reddit_timescale_watch/), which, despite my parent&rsquo;s skepticism at the prospect of purchasing a timepiece from a no-name company with a sketchy website, they let me buy using their credit card. It was by any measure a great watch for what it cost&mdash;which wasn&rsquo;t much&mdash;and teenage high school me felt cool every time someone did a double take trying to read it. The concentric circles made it confusing enough, but the design wasn&rsquo;t unheard of: _jump-hour_ watches, as I would later learn they were called, have been around for decades. No, what really made this watch strange was that unlike every other jump-hour watch I could find, all of the wheels rotated in what appeared to be the wrong direction. They spun clockwise, which seems logical enough&mdash;but this has the effect of making the stationary hand look like it was rotating _counterclockwise_, falling backwards through the hours instead of pushing forwards, and this in my friends elicited every emotion from bemusement to outright hostility.

I lost the watch while I was in college. I had bought myself a nicer and more normal watch, driven in no small part by the garish and definitely-unlicensed [Snoo](https://www.redditinc.com/blog/snoos-day-a-reddit-tradition) that was plastered haphazardly onto the face&mdash;but some time not long after the new watch arrived, the old one disappeared. The Cadence Watch Company itself is out of business, now, too, and years of scouring eBay for a replacement have come up short.

All this is to say that I no longer have the watch and no way to obtain another. As I started to learn Typescript (for the first time) and React (for, like, the fifth time) this year, I thought that recreating the timescale watch would be a rewarding challenge. For me there&rsquo;s a certain appeal to using CSS, which is rectangular to its very core, to draw spinning circles with text in odd orientations; pushing a system intended for managing static text layouts to do much more exotic and bizarre things is something I love about art projects on the web. Using ReactJS for this project is definitely overkill as the actual clock animations are done with native keyframes, but having a JavaScript framework made it effortless to procedurally generate all of the clock elements and animations such that everything is accurate to within about a second of reality&mdash;which, with an analog clock, is about as good as you can hope for.

<br>

<iframe
    class="clock-iframe"
    title="Concentric"
    style="height:420px"
    scroll="no"
    src="https://kyle-silver.github.io/clocks/#/concentric"
></iframe>

<h2 style="margin-top:0">Concentric Rings</h2>

This design came to me not long after completing the Timescale clock. It has a lot more moving parts but thankfully was a bit easier for me to put together since it was not my first, but second rodeo. To explain what&rsquo;s going on here: the single hand will make a complete revolution once every twelve hours; the &ldquo;minute wheel&rdquo; and &ldquo;second wheel&ldquo; rotate once per hour and once per minute, respectively. However, because the hour hand is moving along the circumference of the circle, the inner wheels also need to &ldquo;roll along&rdquo; in order to keep up.

<aside>
If you look closely, you can just about see the minute wheel rotating&mdash;although for me at least it's nearly impossible to see the either wheel actually moving.
</aside>

To be precise with the math, the wheels meet back up with the hour hand once every hour and minute, respectively. The time it takes the minute wheel, for example, to go from 0&deg; to 360&deg; in absolute terms is actually twelve elevenths of an hour. For example, if the minute hand starts at 12:00, the &ldquo;00&rdquo; on the minute wheel will be perfectly vertical. At 1:00, the &ldquo;00&rdquo; will not be vertical again, but will have rotated 330&deg; and be aligned with the 1 on the hour ring. The speed of rotation is therefore 5.5 degrees per minute rather than the 6 it would need to be if it were to complete one full revolution per hour.

<br>
