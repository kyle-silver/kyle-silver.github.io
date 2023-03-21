class Style {
    /**
     * represents the current style of the output
     * @param {string} color 
     * @param {string} weight 
     */
    constructor(color, weight) {
        this.color = color;
        this.weight = weight;
    }

    /**
     * This is a CRIME
     * @param {Arrau<string>} tokens 
     * @param {string} color 
     * @param {string} weight 
     */
    set(tokens, color, weight) {
        let changed = false;
        if (this.color !== color) {
            this.color = color;
            changed = true;
        }
        if (this.weight !== weight) {
            this.weight = weight;
            changed = true;
        }
        if (changed) {
            tokens.push(`</span><span style="${this.style()}">`);
        }
    }

    /**
     * @returns {string} the current inline style parameters
     */
    style() {
        return `color:var(--ayu-${this.color});font-weight:${this.weight}`;
    }
}

/**
 * Adds color to the tree output by interspersing a bunch of spans lol
 * @param {string} input the tree drawn by the WASM function
 * @returns {string}
 */
export function colorful(input) {
    let style = new Style("black", "300");

    /** @type {Array<string>} */
    let tokens = [`<span style="${style.style()}">`];

    for (let i = 0; i < input.length; i++) {
        let c = input.charAt(i);
        if (/\d{1}/.test(c)) {
            style.set(tokens, "purple", "300");
        } else if (/[\+\-=>\u00D7\*]{1}/.test(c)) {
            style.set(tokens, "orange", "300");
        } else if (c === "k") {
            if (/[\dl\()]{1}/.test(input.charAt(i + 1))) {
                style.set(tokens, "purple", "300");
            }
        } else if (c === "d" || c === "l") {
            if (/[\d\(]{1}/.test(input.charAt(i + 1))) {
                style.set(tokens, "purple", "300");
            }
        } else if (/\w{1}/.test(c)) {
            style.set(tokens, "green", "700");
        } else if (/[\u2502\u2500\u251C]{1}/.test(c)) {
            style.set(tokens, "back", "300");
        } else {
            style.set(tokens, "back", "300");
        }
        tokens.push(c)
    }
    tokens.push("</span>")
    return tokens.join("");
}
