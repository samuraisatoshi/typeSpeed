// Infrastructure Layer - InputHandler
class InputHandler {
    constructor() {
        this.onCharacter = null;
        this.onBackspace = null;
        this.onEnter = null;
        this.inputElement = null;
    }

    attachTo(inputElement) {
        this.inputElement = inputElement;

        inputElement.addEventListener('input', (e) => {
            if (e.isComposing) {
                // Dead-key/IME sequence in progress (e.g. '^' or accents on ABNT2/US-International
                // layouts) — wait for compositionend so the composed character isn't dropped.
                return;
            }
            const typedChar = e.target.value;
            if (typedChar && this.onCharacter) {
                this.onCharacter(typedChar);
            }
            e.target.value = '';
        });

        inputElement.addEventListener('compositionend', (e) => {
            const typedChar = e.data || e.target.value;
            if (typedChar && this.onCharacter) {
                this.onCharacter(typedChar);
            }
            e.target.value = '';
        });

        inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                e.preventDefault();
                if (this.onBackspace) {
                    this.onBackspace();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.onEnter) {
                    this.onEnter();
                }
                inputElement.value = '';
            }
        });
    }

    detach() {
        if (this.inputElement) {
            this.inputElement = null;
        }
    }
}

