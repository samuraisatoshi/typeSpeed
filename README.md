# TypeSpeed - Code Typing Practice Application

A local web application for practicing typing with real source code from your projects, similar to MonkeyType but specifically designed for programmers.

## Features

- **Multi-Language Support**: Practice typing with code in TypeScript, JavaScript, Python, Swift, C/C++, Java, Rust, Go, Ruby, and more
- **Project Scanning**: Select any folder on your computer to use real source code for practice
- **Syntax Highlighting**: Code is properly formatted and highlighted based on language
- **Real-time Metrics**: Track WPM (Words Per Minute), accuracy, and other performance metrics
- **Statistics Tracking**: Monitor your progress over time with detailed statistics
- **Responsive Design**: Clean, modern interface that works on desktop and mobile

## Architecture

Built with **Domain-Driven Design (DDD)** and **SOLID principles**:

- **Shared Domain**: Core value objects and entities
- **Code Source Domain**: File scanning and management
- **Code Formatter Domain**: Language-specific formatting and highlighting
- **Typing Domain**: Session management and input processing
- **Statistics Domain**: Performance tracking and analysis
- **Application Layer**: Command handlers and use cases
- **Infrastructure Layer**: Web server and API endpoints

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Architecture**: Domain-Driven Design with SOLID principles
- **Security**: Helmet, Rate Limiting, Input Validation, XSS Prevention
- **Code Quality**: ESLint, Prettier, 550-line file limit enforced

## Security Features

TypeSpeed implements comprehensive security measures:

- **Path Traversal Protection**: Validates all file paths against allowed directories
- **CORS Whitelist**: Only accepts requests from trusted origins
- **Rate Limiting**: Protects against DoS attacks with tiered rate limiting
- **Input Validation**: Validates all user inputs to prevent injection attacks
- **XSS Prevention**: Sanitizes all displayed data
- **Security Headers**: Uses Helmet to set secure HTTP headers
- **Request Size Limits**: Prevents memory exhaustion attacks

For detailed security information, see [SECURITY.md](./SECURITY.md)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd typespeed
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (optional):
```bash
cp .env.example .env
# Edit .env to customize security settings
```

4. Build the TypeScript code:
```bash
npm run build
```

## Usage

### Development Mode

Run the development server with hot-reloading:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

Build and start the production server:
```bash
npm run build
npm start
```

### Using the Application

1. **Open the application** in your browser at `http://localhost:3000`

2. **Scan a project folder**:
   - Enter the path to a folder containing source code
   - Click "Scan Folder" to discover code files
   - The app will report how many files were found

3. **Start typing practice**:
   - Optionally select a specific programming language
   - Click "Start Typing" to begin a session
   - Type the displayed code as accurately and quickly as possible

4. **View statistics**:
   - Click on "Statistics" to see your performance metrics
   - Track your progress over time
   - View your personal best scores

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/languages` - Get supported languages
- `POST /api/scan` - Scan a project folder
- `POST /api/session/start` - Start a typing session
- `POST /api/session/:id/input` - Process typing input
- `POST /api/session/:id/complete` - Complete a session
- `GET /api/statistics/:userId` - Get user statistics
- `GET /api/leaderboard` - Get global leaderboard

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint TypeScript files
- `npm run format` - Format code with Prettier
- `npm run domain:validate` - Validate domain model
- `npm run clean` - Clean build directory

## Project Structure

```
typespeed/
├── src/
│   ├── domain/          # Core business logic
│   │   ├── shared/      # Shared value objects
│   │   ├── codeSource/  # File management
│   │   ├── codeFormatter/ # Code formatting
│   │   ├── typing/      # Typing mechanics
│   │   └── statistics/ # Performance tracking
│   ├── application/     # Use cases
│   ├── infrastructure/  # Web server
│   └── presentation/    # UI logic
├── public/              # Static assets
│   ├── css/            # Styles
│   ├── js/             # Client JavaScript
│   └── index.html      # Main HTML
├── .claude/            # Claude Code configuration
│   ├── agents/         # AI subagents
│   ├── skills/         # AI skills
│   └── settings.json   # Project settings
└── scripts/
    └── hooks/          # Quality enforcement hooks
```

## Quality Standards

- **SOLID Principles**: Every class follows Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion
- **DDD Patterns**: Clear domain boundaries, entities, value objects, and aggregates
- **File Size Limit**: Maximum 550 lines per file (automatically enforced)
- **Code Formatting**: Prettier for consistent style
- **Type Safety**: Strict TypeScript configuration

## Contributing

1. Follow the established DDD architecture
2. Ensure all code follows SOLID principles
3. Keep files under 550 lines
4. Update `map_domain.json` when adding new classes
5. Write tests for new features
6. Run linting and formatting before committing

## License

MIT

## Support

For issues or questions, please open an issue in the repository.