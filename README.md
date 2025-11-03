# TypeSpeed - Code Typing Practice Application

A local web application for practicing typing with real source code from your projects, similar to MonkeyType but specifically designed for programmers.

## Features

- **Privacy First**: No data collection, no internet connection required
- **Multi-Language Support**: Practice with TypeScript, JavaScript, Python, Swift, C/C++, Java, Rust, Go, Ruby, and more
- **Project Scanning**: Select any folder on your computer to use real source code
- **Smart Code Selection**: Intelligent snippet selection based on complexity and length
- **Real-time Feedback**: Visual feedback for correct/incorrect typing
- **Statistics Tracking**: Monitor your progress with WPM and accuracy metrics
- **Clean Architecture**: Domain-Driven Design with SOLID principles

## Usage

Simply open the `index.html` file in your browser:

```bash
open index.html
```

Or directly:
- **macOS**: `open file:///path/to/typespeed/index.html`
- **Windows**: Open `index.html` in your browser
- **Linux**: `xdg-open index.html`

### First Time Usage

When you first open the application, you'll see a welcome screen that:
1. Explains the privacy-first approach (no data collection)
2. Clarifies the browser's folder selection behavior
3. Provides instructions for getting started
4. Has a "Don't show again" option

### How to Use

1. **Scan a Project Folder**:
   - Enter the path to a folder containing source code
   - Click "Scan Folder" to discover code files
   - The browser may show a file selection dialog - this is normal browser security behavior

2. **Start Typing**:
   - Select a programming language (optional)
   - Click "Start Typing" to begin
   - Type the displayed code as accurately as possible

3. **View Statistics**:
   - Your typing speed (WPM) and accuracy are shown in real-time
   - Session statistics are saved locally in your browser

## Architecture

Built with **Domain-Driven Design (DDD)** and **SOLID principles**:

```
js/
├── domain/              # Core business logic
│   ├── TypingSession.js       # Typing session management
│   ├── CodeFileRepository.js  # File storage and retrieval
│   ├── Statistics.js          # Performance tracking
│   └── CodeSnippetSelector.js # Smart code selection
├── application/         # Application services
│   ├── TypingApp.js          # Main orchestrator
│   └── UIController.js       # UI state management
├── infrastructure/      # Technical implementation
│   └── InputHandler.js       # Keyboard input handling
└── app-standalone.js    # Bundled version for browser
```

## File Structure

- `index.html` - Main application (works directly in browser)
- `index-modules.html` - ES6 modules version (requires web server)
- `css/styles.css` - Application styles
- `js/` - Domain-driven JavaScript architecture

## Privacy & Security

- **No Data Collection**: All data stays on your computer
- **No Internet Required**: Works completely offline
- **Local Storage Only**: Statistics saved in browser's localStorage
- **No External Dependencies**: Pure JavaScript, no frameworks

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Development

The project follows strict architectural principles:
- Single Responsibility Principle
- Open/Closed Principle
- Dependency Inversion
- Clean separation of concerns

## License

MIT License - Feel free to use and modify as needed.