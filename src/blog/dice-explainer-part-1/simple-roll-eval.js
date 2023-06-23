/**
 * @typedef DieKeyframe
 * @prop {number} at the tick number at which the row should be highlighted
 * @prop {Array<number>} position the position at the beginning of the
 *      animation
 * @prop {number} d_theta the change in rotation (in degrees) over the course of
 *      the ensuing keyframe
 * @prop {"start" | "stop"} [roll] whether the die starts or stops rolling on 
 *      that keyframe
 * @prop {number} [value] update the value of the die
 */

class Die {
    /**
     * @param {string} id the ID of the HTML element representing the die
     * @param {number} value the starting numeric value of the die
     * @param {number} faces the number of faces on the die
     * @param {Array<DieKeyframe>} keyframes any animation keyframes
     */
    constructor(id, value, faces, keyframes) {
        this.id = id;
        this.value = value;
        /** @type {number} absolute rotation in degrees */
        this.rotation = 0;
        this.faces = faces;
        this.rolling = false;
        this.keyframes = keyframes;
        this.set_text(this.value);
    }

    /**
     * @param {string} text the text of the die
     */
    set_text(text) {
        const element = document.getElementById(this.id);
        const dice_text = element.querySelector(".dice-text");
        dice_text.innerText = text;
    }

    /**
     * 
     * @returns {number}
     */
    roll_new_value() {
        let new_value = Math.floor(Math.random() * this.faces) + 1;
        if (new_value === this.value) {
            new_value = ((this.value + 1) % this.faces) + 1;
        }
        return new_value;
    }

    /**
     * @param {number} tick the current tick number
     */
    update(tick) {
        if (this.keyframes[1].at === tick) {
            const [current, next] = this.keyframes.splice(0, 2);
            this.keyframes.unshift(next);
            this.keyframes.push(current);
        }

        const [current, next] = this.keyframes.slice(0, 2);

        // update text values
        if (current.at === tick && current.value !== undefined) {
            console.log(`should set value at ${tick} to ${current.value}`);
            this.value = current.value;
            this.set_text(this.value);
        }

        // boring math
        const duration = next.at - current.at;
        const percentage_complete = Math.abs((tick - current.at) / duration);

        // calculate position
        const [x1, y1] = current.position;
        const [x2, y2] = next.position;
        const [dx, dy] = [x2 - x1, y2 - y1];
        const [x, y] = [x1 + (percentage_complete * dx), y1 + (percentage_complete * dy)];

        // update position
        const element = document.getElementById(this.id);
        element.style.left = `${x}%`;
        element.style.top = `${y}%`;

        // update angle
        const change_in_rotation = current.d_theta / Math.abs(duration);
        this.rotation += change_in_rotation;
        element.style.transform = `translate(-50%, -50%) rotate(${this.rotation}deg)`;

        // roll stuff 
        if (current.roll === "stop") {
            this.rolling = false;
        } else if (current.roll === "start") {
            this.rolling = true;
        }

        if (this.rolling && tick % 30 === 0) {
            this.value = this.roll_new_value();
            this.set_text(this.value);
        }
    }
}

/**
 * @typedef HighlightKeyframe
 * @prop {string} id the ID of the HTML element corresponding to the row which 
 *      should be highlighted.
 * @prop {number} at the tick number at which the row should be highlighted
 * @prop {function():void} [side_effect] a side effect to be executed when the
 *      keyframe is first triggered
 */

class RowHighlights {
    /**
     * @param {Array<HighlightKeyframe>} keyframes the keyframes for which rows
     *      need to be highlighted and when
     */
    constructor(keyframes) {
        this.keyframes = keyframes.sort((a, b) => a.at - b.at);
    }

    /**
     * @param {number} tick the current tick number
     */
    update(tick) {
        if (this.keyframes[0].at !== tick) {
            return;
        }
        // execute callback
        if (this.keyframes[0].side_effect) {
            this.keyframes[0].side_effect();
        }

        // the currently-highlighted row lives in the back
        const highlighted = this.keyframes.pop();
        this.unhighlight_row(highlighted);
        this.keyframes.push(highlighted);

        // next lives in the front
        const to_highlight = this.keyframes.shift();
        this.highlight_row(to_highlight);
        this.keyframes.push(to_highlight);
    }

    /**
     * @param {HighlightKeyframe} row the row to highlight
     */
    highlight_row(row) {
        const element = document.getElementById(row.id);
        element.style.backgroundColor = "var(--code-highlight";
        element.style.fontStyle = "italic";
    }

    /**
     * @param {HighlightKeyframe} row the row to unhighlight
     */
    unhighlight_row(row) {
        const element = document.getElementById(row.id);
        element.style.backgroundColor = "unset";
        element.style.fontStyle = "unset";
    }
}

function animate_dice_roll() {
    // let rows = new Rows(["line-03", "line-04", "line-05", "line-06", "line-07"])
    let rows = new RowHighlights([
        { id: "a01-line-03", at: 0, side_effect: () => update_n_counter(0) },
        { id: "a01-line-04", at: 200, side_effect: () => update_n_counter(1) },
        { id: "a01-line-05", at: 502 },
        { id: "a01-line-06", at: 1004 },
        { id: "a01-line-04", at: 1500, side_effect: () => update_n_counter(2) },
        { id: "a01-line-05", at: 1802 },
        { id: "a01-line-06", at: 2204 },
        { id: "a01-line-04", at: 2700, side_effect: () => update_n_counter(3) },
        { id: "a01-line-05", at: 3002 },
        { id: "a01-line-06", at: 3404 },
        { id: "a01-line-08", at: 3804 },
    ])
    let dice = [
        new Die("a01-die-1", 0, 6, [
            { at: 0, position: [16.65, 15], d_theta: 0, value: 0 },
            { at: 200, position: [16.65, 15], d_theta: 0 },
            { at: 500, position: [50, 15], d_theta: 0 },
            { at: 502, position: [50, 15], d_theta: 720, roll: "start" },
            { at: 1002, position: [50, 15], d_theta: 0, roll: "stop" },
            { at: 1004, position: [50, 15], d_theta: 0 },
            { at: 1404, position: [83.25, 15], d_theta: 0 },
            { at: 3999, position: [83.25, 15], d_theta: 0 },
        ]),
        new Die("a01-die-2", 0, 6, [
            { at: 0, position: [16.65, 40], d_theta: 0, value: 0 },
            { at: 1500, position: [16.65, 40], d_theta: 0 },
            { at: 1800, position: [50, 40], d_theta: 0 },
            { at: 1802, position: [50, 40], d_theta: 720, roll: "start" },
            { at: 2202, position: [50, 40], d_theta: 0, roll: "stop" },
            { at: 2204, position: [50, 40], d_theta: 0 },
            { at: 2604, position: [83.25, 40], d_theta: 0 },
            { at: 3999, position: [83.25, 40], d_theta: 0 },
        ]),
        new Die("a01-die-3", 0, 6, [
            { at: 0, position: [16.65, 65], d_theta: 0, value: 0 },
            { at: 2700, position: [16.65, 65], d_theta: 0 },
            { at: 3000, position: [50, 65], d_theta: 0 },
            { at: 3002, position: [50, 65], d_theta: 720, roll: "start" },
            { at: 3402, position: [50, 65], d_theta: 0, roll: "stop" },
            { at: 3404, position: [50, 65], d_theta: 0 },
            { at: 3804, position: [83.25, 65], d_theta: 0 },
            { at: 3999, position: [83.25, 65], d_theta: 0 },
        ]),
    ];
    let _ = setInterval(frame, 7);
    let ticks = 0;

    function frame() {
        // row highlight stuff
        rows.update(ticks);

        // move the dice
        dice.forEach((die) => die.update(ticks));

        // update the total counter
        update_total();

        ticks = (ticks + 1) % 4000;
    }

    function update_total() {
        const element = document.getElementById("a01-total-counter");
        const value = dice.map((die) => die.value).reduce((a, b) => a + b, 0);
        if (element.innerText === value) {
            return;
        }
        element.innerText = value.toFixed(0);
    }

    function update_n_counter(to) {
        const element = document.getElementById("a01-n-counter");
        if (to === 0) {
            element.className = "cd-black";
            element.innerText = "_"
        } else {
            element.className = "cd-purple";
            element.innerText = to.toFixed(0);
        }
    }
}

window.onload = animate_dice_roll