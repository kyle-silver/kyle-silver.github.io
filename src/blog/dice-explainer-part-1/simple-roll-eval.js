/**
 * @typedef DieKeyframe
 * @prop {number} at the tick number at which the row should be highlighted
 * @prop {Array<number>} position the position at the beginning of the
 *      animation
 * @prop {number} d_theta the change in rotation (in degrees) over the course of
 *      the ensuing keyframe
 */

class Die {

    /**
     * @param {string} id the ID of the HTML element representing the die
     * @param {number} value the starting numeric value of the die
     * @param {Array<DieKeyframe>} keyframes any animation keyframes
     */
    constructor(id, value, keyframes) {
        this.id = id;
        this.value = value;
        /** @type {number} absolute rotation in degrees */
        this.rotation = 0;
        this.keyframes = keyframes;
    }

    /**
     * @param {number} tick the current tick number
     */
    update(tick) {
        const [current, next] = this.keyframes.slice(0, 2);
        if (next.at === tick) {
            this.keyframes.unshift(next);
            this.keyframes.push(current);
            return;
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
        element.style.rotate = `${this.rotation}deg`;
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
        { id: "line-03", at: 0 },
        { id: "line-04", at: 100 },
        { id: "line-05", at: 200 },
        { id: "line-06", at: 500 },
        { id: "line-07", at: 600 },
        { id: "line-06", at: 700 },
        { id: "line-05", at: 800 },
        { id: "line-04", at: 900 },
        { id: "line-05", at: 1000 },
    ])
    let die = new Die("test-die", 6, [
        { at: 0, position: [0, 0], d_theta: 0 },
        { at: 1000, position: [95, 0], d_theta: 1500 },
    ]);
    let _ = setInterval(frame, 10);
    let ticks = 0;
    let pos = 0;

    function frame() {
        // row highlight stuff
        rows.update(ticks);
        die.update(ticks)

        ticks = (ticks + 1) % 2000;
    }
}

window.onload = animate_dice_roll