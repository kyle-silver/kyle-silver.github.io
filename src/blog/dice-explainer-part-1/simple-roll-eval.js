/**
 * @typedef RollProps
 * @prop {"start" | "stop"} action whether the keyframe indicates that the die
 *      should start or stop rolling
 * @prop {Array<number>} [bounds] an array of length 2 which has the upper and
 *      lower bounds of the die
 * @prop {number} [rate] the number of ticks between each change to the value of
 *      the die
 */

/**
 * @typedef DieKeyframe
 * @prop {number} at the tick number at which the row should be highlighted
 * @prop {Array<number>} position the position at the beginning of the
 *      animation
 * @prop {number} d_theta the change in rotation (in degrees) over the course of
 *      the ensuing keyframe
 * @prop {"start" | "stop"} [roll] whether the die starts or stops rolling on that keyframe
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
        dice_text.innerHTML = text;
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
            console.log(this.keyframes);
        }

        const [current, next] = this.keyframes.slice(0, 2);

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

        if (tick % 100 === 0) {
            console.log(current.at, next.at, tick, percentage_complete);
        }

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
        // the currently-highlighted row lives in the back
        const highlighted = this.keyframes.pop();
        this.unhighlight_row(highlighted);
        this.keyframes.push(highlighted);

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
        { id: "a01-line-03", at: 0 },
        { id: "a01-line-04", at: 100 },
        { id: "a01-line-05", at: 200 },
        { id: "a01-line-06", at: 500 },
        { id: "a01-line-07", at: 600 },
        { id: "a01-line-06", at: 700 },
        { id: "a01-line-05", at: 800 },
        { id: "a01-line-04", at: 900 },
        { id: "a01-line-05", at: 1000 },
    ])
    let die = new Die("a01-die-1", 0, 20, [
        { at: 0, position: [33.3 / 2, 15], d_theta: 0 },
        { at: 200, position: [33.3 / 2, 15], d_theta: 0 },
        { at: 500, position: [50, 15], d_theta: 720, roll: "start" },
        { at: 1000, position: [50, 15], d_theta: 0, roll: "stop" },
        { at: 1500, position: [66.6 + (33.3 / 2), 15], d_theta: 0 },
        { at: 10_000, position: [66.6 + (33.3 / 2), 15], d_theta: 0 },
    ]);
    let _ = setInterval(frame, 10);
    let ticks = 0;

    function frame() {
        // row highlight stuff
        rows.update(ticks);
        die.update(ticks)

        ticks = (ticks + 1) % 10_000;
    }
}

window.onload = animate_dice_roll