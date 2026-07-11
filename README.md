# 🚀 TypeSpeed - Code Typing Practice for Programmers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.javascript.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/typespeed/pulls)

**Practice typing with real code from your projects!** TypeSpeed is like MonkeyType but specifically designed for developers. Load your own source code and practice typing actual functions, algorithms, and syntax from 25+ programming languages.

![TypeSpeed Demo](https://img.shields.io/badge/Demo-Live-blue.svg)

## ✨ Features

- 📁 **Your Code, Your Practice** - Select any folder with source code to practice with real projects
- 🎯 **Smart Code Selection** - Intelligent snippet selection that focuses on actual code, not comments
- 🌈 **25+ Languages** - Support for JavaScript, Python, Java, C++, Rust, Go, Ruby, and more
- 📊 **Real-time Metrics** - Track WPM, accuracy, and progress as you type
- 📈 **Statistics Tracking** - Monitor your improvement over time with detailed session history
- 🔒 **100% Private** - Runs entirely offline in your browser, no data collection
- 🎨 **Beautiful UI** - Modern dark theme with syntax highlighting
- ⚡ **No Installation** - Just open the HTML file and start practicing
- ✋ **Typing Drills** - Dedicated lessons for left-hand, right-hand, and alternating hand practice
- 📖 **Live Quotes** - Motivational quotes via Wikiquote in English and Portuguese
- 📜 **Bible Passages** - Random Bible verses for typing practice
- 🔀 **Word Shuffling** - Randomized word order in drills for more realistic practice
- 📝 **Smart Wrap** - Automatic text wrapping for long lines

## 🚀 Quick Start

### Option 1: Direct Browser (Easiest)
1. Download or clone this repository
2. Open `index.html` in your browser
3. Select a folder with code files
4. Start typing!

```bash
git clone https://github.com/samuraisatoshi/typespeed.git
cd typespeed
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

### Option 2: Local Server (Avoids Browser Dialogs)
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```
Then open http://localhost:8000

## 🎮 How to Use

1. **Select Your Code** - Click "Select Code Folder" and choose a directory with source files
2. **Start Typing** - Click "Start Typing" to begin with a random code snippet
3. **Type Away** - Follow the highlighted code, typing exactly as shown
4. **Track Progress** - Watch your WPM and accuracy in real-time
5. **View Stats** - Check the Statistics tab to see your improvement over time

### Pro Tips
- Leading spaces/tabs are auto-skipped - focus on the actual code
- Use "New Snippet" to get different code samples
- Sessions are saved locally for progress tracking
- Delete individual sessions or clear all to start fresh

## 🏗️ Architecture

TypeSpeed is built with **Domain-Driven Design (DDD)** and **SOLID principles**:

```
js/
├── domain/              # Core business logic
│   ├── TypingSession.js       # Session management
│   ├── CodeFileRepository.js  # File storage
│   ├── Statistics.js          # Performance tracking
│   └── CodeSnippetSelector.js # Smart code selection
├── application/         # Application services
│   ├── TypingApp.js          # Main orchestrator
│   └── UIController.js       # UI state management
└── infrastructure/      # Technical implementation
    └── InputHandler.js       # Keyboard input handling
```

## 🔒 Privacy & Security

- **No Data Collection** - Your code never leaves your computer
- **No Internet Required** - Works 100% offline
- **No Analytics** - Zero tracking or telemetry
- **Local Storage Only** - Statistics saved in browser localStorage
- **Open Source** - Inspect the code yourself

## 🛠️ Customization

TypeSpeed is designed to be easily extended. Feel free to:
- Add new language support
- Customize the UI theme
- Add new metrics or statistics
- Integrate with your tools

## 📝 License

This project is **open source** and **free to use** under the MIT License.

You are free to:
- Use it commercially or personally
- Modify and customize it
- Distribute it
- Include it in your projects

**The only requirement**: Please keep the original author attribution.

## 👨‍💻 Author

**Original Author**: SamuraiSatoshi

Created with ❤️ for the developer community. If you find this tool useful, consider:
- ⭐ Starring this repository
- 🍴 Forking and contributing
- 📢 Sharing with other developers

## 💝 Support Development

If TypeSpeed helps your coding practice, consider supporting development:

- **XRP**: `rn43CJP86tG1LikfynhTARmWYDrkEGYyKH`
- **BTC**: `bc1qyf0n6x0fvukk5dz59ywrj5drzvpthpz3r4hgx0`

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

Please ensure:
- Code follows the existing DDD architecture
- SOLID principles are maintained
- Files stay under 550 lines
- Original author attribution remains

## 🐛 Known Issues

- Browser shows "upload files" dialog when selecting folders (this is normal browser behavior - your files are NOT uploaded anywhere)
- For best experience, use a local server to avoid browser security dialogs

## 📚 Resources

- [Instructions & Setup Guide](instructions.html)
- [Architecture Documentation](CLAUDE.md)
- [Issue Tracker](https://github.com/samuraisatoshi/typespeed/issues)

## 🙏 Acknowledgments

- Inspired by [MonkeyType](https://monkeytype.com/)
- Built with vanilla JavaScript for maximum compatibility
- Community feedback and contributions

---

**Remember**: Keep practicing, and your code typing speed will improve dramatically! 🚀

*Made with passion by SamuraiSatoshi*