# TypeSpeed Node.js Web Application

## Project Overview
TypeSpeed is a Node.js web application built with strict architectural principles and domain-driven design patterns.

## Architecture Principles

### SOLID Principles Compliance
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Entities open for extension, closed for modification
- **Liskov Substitution**: Derived classes substitutable for base classes
- **Interface Segregation**: Many specific interfaces over general-purpose ones
- **Dependency Inversion**: Depend on abstractions, not concretions

### Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear boundaries between different domains
- **Entities**: Objects with unique identity
- **Value Objects**: Immutable objects without identity
- **Aggregates**: Cluster of domain objects as single unit
- **Repositories**: Abstraction for data access
- **Domain Services**: Business logic not belonging to entities
- **Application Services**: Orchestration of domain logic

## Code Organization Rules

### File Structure
- Maximum 550 lines per code file
- Split large files into focused modules
- Group by feature/domain, not by file type

### Domain Mapping
- **MANDATORY**: Update `map_domain.json` after EVERY code change
- Domain structure:
  ```json
  {
    "domain_name": {
      "description": "Clear domain purpose",
      "goal": "Business objective",
      "dependencies": ["list", "of", "dependencies"],
      "classes": {
        "ClassName": {
          "description": "Class purpose",
          "goal": "Class objective",
          "methods": ["method1", "method2"],
          "dependencies": ["internal", "external"]
        }
      }
    }
  }
  ```

## Development Guidelines

### Token Economy for Agents
- Use concise, clear language
- Avoid verbose explanations
- Focus on essential information
- Minimize redundant comments

### Code Style
- Use 2-space indentation
- Async/await over callbacks
- Prefer const over let
- Destructuring for object/array access
- Template literals for string concatenation

### Testing Requirements
- Unit tests for all domain logic
- Integration tests for services
- E2E tests for critical user paths
- Minimum 80% code coverage

### Error Handling
- Always throw proper errors with context
- No silent failures or fallback mocking
- Implement domain-specific exceptions
- Log errors with appropriate severity

### Dependencies
- Use npm for package management
- Lock versions in package-lock.json
- Regular security audits with `npm audit`
- Document all external dependencies

## Frequently Used Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Check code style
- `npm run format` - Auto-format code

### Domain Management
- `npm run domain:validate` - Validate map_domain.json
- `npm run domain:generate` - Generate domain documentation
- `npm run domain:check` - Check domain consistency

## Project Structure
```
src/
├── domain/           # Core business logic
│   ├── entities/    # Domain entities
│   ├── services/    # Domain services
│   └── valueObjects/ # Value objects
├── application/      # Application services
│   ├── commands/    # Command handlers
│   └── queries/     # Query handlers
├── infrastructure/   # External concerns
│   ├── persistence/ # Data access
│   ├── web/        # Web framework
│   └── config/     # Configuration
└── shared/          # Shared kernel
    ├── types/      # Type definitions
    └── utils/      # Utility functions
```

## Important Notes

### Mandatory Rules
- NEVER use fallback behavior to mask errors
- ALWAYS update map_domain.json after code changes
- NEVER exceed 550 lines per file
- ALWAYS follow SOLID principles
- ALWAYS apply DDD patterns

### Prohibited Practices
- No mocking features on failure
- No simplified approaches that compromise architecture
- No skipping error handling
- No verbose agent responses
- No ignoring domain boundaries

### Before Code Changes
- Understand full codebase context
- Ask clarifying questions if unclear
- Review existing domain model
- Check current test coverage
- Validate against SOLID/DDD principles

## External Resources
- @README.md for project overview
- @package.json for dependencies
- @map_domain.json for domain structure
- @tsconfig.json for TypeScript config