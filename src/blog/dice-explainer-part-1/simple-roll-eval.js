class Row {
    /**
     * @param {string} index the ID of the HTML element represented by this class
     */
    constructor(index) {
        this.index = index;
    }

    highlight_row() {
        const element = document.getElementById(this.index);
        element.style.backgroundColor = "var(--code-highlight";
        element.style.fontStyle = "italic";
    }

    unhighlight_row() {
        const element = document.getElementById(this.index);
        element.style.backgroundColor = "unset";
        element.style.fontStyle = "unset";
    }
}

class Rows {
    /**
     * @param {Array<string>} animation_order 
     */
    constructor(animation_order) {
        this.order = animation_order.map(id => new Row(id));
        /** @type number */
        this.current = 0;
        this.order[this.current].highlight_row();
    }

    highlight_next() {
        this.order[this.current].unhighlight_row();
        this.current = (this.current + 1) % this.order.length;
        this.order[this.current].highlight_row();
    }
}

function animate_dice_roll() {
    let rows = new Rows(["line-03", "line-04", "line-05", "line-06", "line-07"])
    let _ = setInterval(() => frame(rows), 15);
    let ticks = 0;
    let pos = 0;

    /**
     * 
     * @param {Rows} rows 
     */
    function frame(rows) {
        if (ticks % 100 === 0) {
            rows.highlight_next();
        }

        // box movement
        const animation_frames = 2000;
        const percentage_completed = 100 * (ticks % animation_frames) / animation_frames;
        const one_way_distance = 2 * percentage_completed;
        const raw_position = percentage_completed > 50 ? 200 - (one_way_distance) : one_way_distance;
        const scaled_position = raw_position * 0.95;
        const element = document.getElementById("test-box");
        element.style.left = `${scaled_position}%`;

        ticks += 1;

        // prevent overflow
        if (ticks > 8_000) {
            ticks = 0;
        }
        if (pos >= 200) {
            pos = 0;
        }
    }
}

window.onload = animate_dice_roll