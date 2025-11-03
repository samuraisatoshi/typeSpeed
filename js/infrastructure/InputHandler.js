/**
 * InputHandler Infrastructure Service
 * Handles keyboard input events
 * Single Responsibility: Capture and process user input
 */
export class InputHandler {
    constructor() {
        this.onCharacter = null;
        this.onBackspace = null;
        this.onEnter = null;
        this.inputElement = null;
    }

    attachTo(inputElement) {
        this.inputElement = inputElement;

        // Handle regular character input
        inputElement.addEventListener('input', (e) => {
            const typedChar = e.target.value;
            if (typedChar && this.onCharacter) {
                this.onCharacter(typedChar);
            }
            e.target.value = ''; // Clear input
        });

        // Handle special keys
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
            // Remove event listeners if needed
            this.inputElement = null;
        }
    }
}