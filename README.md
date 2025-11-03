# TypeSpeed - Code Typing Practice

A simple, single-file web application for practicing typing with real source code from your projects.

## Features

- **Single HTML File** - No server, no dependencies, runs entirely in the browser
- **Folder Selection** - Select any folder containing source code files
- **Random Snippets** - Automatically selects random files and sections for variety
- **Smart Indentation** - Auto-skips leading spaces/tabs so you only type actual code
- **Syntax Highlighting** - Visual indicators for spaces, tabs, and line breaks
- **Real-time Metrics** - Track WPM, accuracy, and progress
- **Persistent Statistics** - Saves your practice history in browser localStorage
- **Multi-language Support** - Works with 25+ programming languages

## Usage

1. **Open the file** - Simply open `typespeed.html` in any modern web browser
2. **Select a folder** - Click "Select Code Folder" and choose a folder with source code
3. **Start typing** - Click "Start Typing" to begin with a random code snippet
4. **Practice** - Type the highlighted code as accurately as possible
5. **New snippets** - Click "New Snippet" for different code
6. **View statistics** - Click the "Statistics" tab to see your progress

## How It Works

- **Indentation is automatic** - Leading spaces/tabs are skipped, focus on the actual code
- **Visual feedback** - Green for correct, red for errors, yellow cursor shows position
- **Smart selection** - Algorithm picks code-dense sections, avoiding empty lines and comments
- **Progress tracking** - All sessions are saved locally for long-term progress tracking

## Browser Compatibility

Works in all modern browsers that support:
- File API for folder selection
- localStorage for data persistence
- ES6+ JavaScript features

Tested on Chrome, Firefox, Safari, and Edge.

## License

MIT
