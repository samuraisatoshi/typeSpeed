/**
 * CodeFileRepository Domain Model
 * Manages the collection of code files for practice
 * Single Responsibility: Store and retrieve code files
 */
export class CodeFileRepository {
    constructor() {
        this.files = [];
        this.supportedExtensions = [
            'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
            'rs', 'go', 'rb', 'swift', 'kt', 'scala', 'php', 'cs',
            'sh', 'bash', 'sql', 'r', 'lua', 'dart', 'vue', 'svelte'
        ];
    }

    async loadFromFileList(fileList) {
        this.files = [];
        const files = Array.from(fileList);

        for (const file of files) {
            if (this.isValidCodeFile(file)) {
                try {
                    const content = await this.readFile(file);
                    const lines = content.split('\n');

                    if (lines.length >= 10) {
                        this.files.push({
                            name: file.name,
                            path: file.webkitRelativePath || file.name,
                            content: content,
                            language: this.detectLanguage(file.name),
                            lines: lines.length,
                            size: file.size
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to read file ${file.name}:`, error);
                }
            }
        }

        return this.files.length;
    }

    isValidCodeFile(file) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext &&
               this.supportedExtensions.includes(ext) &&
               file.size >= 50 &&
               file.size <= 500000;
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    detectLanguage(filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const languages = {
            'js': 'JavaScript', 'jsx': 'JavaScript',
            'ts': 'TypeScript', 'tsx': 'TypeScript',
            'py': 'Python', 'java': 'Java',
            'cpp': 'C++', 'c': 'C', 'h': 'C', 'hpp': 'C++',
            'rs': 'Rust', 'go': 'Go', 'rb': 'Ruby',
            'swift': 'Swift', 'kt': 'Kotlin',
            'scala': 'Scala', 'php': 'PHP', 'cs': 'C#',
            'sh': 'Bash', 'bash': 'Bash', 'sql': 'SQL',
            'r': 'R', 'lua': 'Lua', 'dart': 'Dart',
            'vue': 'Vue', 'svelte': 'Svelte'
        };
        return languages[ext] || 'Unknown';
    }

    getRandomFile() {
        if (this.files.length === 0) return null;
        return this.files[Math.floor(Math.random() * this.files.length)];
    }

    getFileCount() {
        return this.files.length;
    }

    hasFiles() {
        return this.files.length > 0;
    }
}