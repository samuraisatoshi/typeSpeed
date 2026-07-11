// Shared utility: reflows hard-wrapped prose (single '\n' inserted only
// for visual line width, not real structure) back into flowing paragraphs,
// so the browser can wrap it visually and typing only requires Enter at
// genuine paragraph breaks (a blank line in the source). Only applied to
// 'Text'-language content — code keeps its real line breaks untouched.
class ParagraphReflow {
    static reflow(text) {
        if (!text) return text;
        return text
            .split(/\n[ \t]*\n/)
            .map(paragraph => paragraph.split('\n').map(line => line.trim()).filter(Boolean).join(' '))
            .join('\n\n');
    }
}

