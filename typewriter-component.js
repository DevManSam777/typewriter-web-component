class TypewriterEffect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    static get observedAttributes() {
        return ['phrases', 'font-size', 'color', 'font-family', 'cursor-color', 'font-weight'];
    }
    
    connectedCallback() {
        this.render();
        this.initTypewriter();
    }
    
    disconnectedCallback() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }
    
    render() {
        const fontSize = this.getAttribute('font-size') || '3rem';
        const color = this.getAttribute('color') || '#333333';
        const fontFamily = this.getAttribute('font-family') || '"Special Elite", "Courier New", monospace';
        const fontWeight = this.getAttribute('font-weight') || '600';
        const cursorColor = this.getAttribute('cursor-color') || color;
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    font-family: ${fontFamily};
                    font-size: ${fontSize};
                    font-weight: ${fontWeight};
                    color: ${color};
                    letter-spacing: 0.1em;
                    word-wrap: break-word;
                    line-height: 1.2;
                }
                
                .cursor {
                    position: relative;
                    font-weight: bold;
                    opacity: 1;
                    color: ${cursorColor};
                    left: -0.1em;
                }
            </style>
            <span class="text-container">
                <span id="text"></span><span class="cursor">|</span>
            </span>
        `;
    }
    
    initTypewriter() {
        // parse phrases
        const phrasesAttr = this.getAttribute('phrases');
        try {
            this.phrases = phrasesAttr ? JSON.parse(phrasesAttr) : ['Hello World!'];
        } catch (e) {
            this.phrases = ['Hello World!'];
        }
        
        // get elements
        this.textDisplay = this.shadowRoot.getElementById('text');
        this.cursor = this.shadowRoot.querySelector('.cursor');
        
        // state variables
        this.currentPhrase = [];
        this.i = 0;
        this.j = 0;
        this.isDeleting = false;
        this.isEnd = false;
        this.cursorVisible = true;
        
        // cursor animation setup
        const animateCursor = () => {
            this.cursorVisible = !this.cursorVisible;
            this.cursor.style.opacity = this.cursorVisible ? "1" : "0";
        };
        
        this.cursorInterval = setInterval(animateCursor, 400);
        this.cursor.style.transition = "all 0.15s ease";
        
        // start typewriter
        this.loopThroughPhrases();
    }
    
    loopThroughPhrases() {
        this.isEnd = false;

        if (this.i < this.phrases.length) {
            // TYPING EFFECT
            if (!this.isDeleting && this.j <= this.phrases[this.i].length) {
                this.currentPhrase.push(this.phrases[this.i][this.j]);
                this.j++;
                this.textDisplay.innerHTML = this.currentPhrase.join("");

                // make cursor visible during typing
                this.cursor.style.opacity = "1";
            }

            // DELETING EFFECT
            if (this.isDeleting && this.j <= this.phrases[this.i].length) {
                this.currentPhrase.pop();
                this.j--;
                this.textDisplay.innerHTML = this.currentPhrase.join("");
            }

            // end of phrase reached
            if (this.j == this.phrases[this.i].length) {
                this.isEnd = true;
                this.isDeleting = true;
            }

            // all characters deleted
            if (this.isDeleting && this.j === 0) {
                this.currentPhrase = [];
                this.isDeleting = false;
                this.i++;

                if (this.i === this.phrases.length) {
                    this.i = 0;
                }
            }
        }

        // timing control 
        const spedUp = Math.random() * 150;
        const normalSpeed = Math.random() * 300;
        const time = this.isEnd ? 2000 : this.isDeleting ? spedUp : normalSpeed;

        this.typingTimeout = setTimeout(() => this.loopThroughPhrases(), time);
    }
}

customElements.define('typewriter-effect', TypewriterEffect);