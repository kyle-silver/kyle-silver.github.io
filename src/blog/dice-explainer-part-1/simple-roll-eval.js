/**
 * @typedef DieKeyframe
 * @prop {number} at the tick number at which the row should be highlighted
 * @prop {Array<number>} position the position at the beginning of the
 *      animation
 * @prop {number} orientation the rotation (in degrees) at the start of the keyframe
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
        const [x1, y1] = current.position;
        const [x2, y2] = next.position;
        const [dx, dy] = [x2 - x1, y2 - y1];
        const [x, y] = [x1 + (percentage_complete * dx), y1 + (percentage_complete * dy)];

        // update position
        const element = document.getElementById(this.id);
        element.style.left = `${x}%`;
        element.style.top = `${y}%`;
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
        { at: 0, position: [0, 0], orientation: 0 },
        { at: 1000, position: [95, 0], orientation: 0 },
        { at: 2000, position: [0, 0], orientation: 0 },
    ]);
    let _ = setInterval(frame, 10);
    let ticks = 0;
    let pos = 0;

    function frame() {
        // row highlight stuff
        rows.update(ticks);
        die.update(ticks)

        // // box movement
        // const animation_frames = 2000;
        // const percentage_completed = 100 * (ticks % animation_frames) / animation_frames;
        // const one_way_distance = 2 * percentage_completed;
        // const raw_position = percentage_completed > 50 ? 200 - (one_way_distance) : one_way_distance;
        // const scaled_position = raw_position * 0.95;
        // const element = document.getElementById("test-box");
        // element.style.left = `${scaled_position}%`;

        ticks += 1;

        // prevent overflow
        if (ticks > 2_000) {
            ticks = 0;
        }
        if (pos >= 200) {
            pos = 0;
        }
    }
}

window.onload = animate_dice_roll