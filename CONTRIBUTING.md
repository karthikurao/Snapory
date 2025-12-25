# Contributing to Snapory

Thank you for your interest in contributing to Snapory! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment for all contributors

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, versions, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has been suggested in Issues
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/karthikurao/Snapory.git
   cd Snapory
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the coding standards (see below)
   - Write clear commit messages
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend
   cd backend && dotnet test
   
   # Frontend
   cd frontend && npm test
   
   # AI Service
   cd ai-service && pytest
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Request review

## Coding Standards

### General
- Write clear, self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow SOLID principles

### Backend (ASP.NET Core)
- Follow Microsoft C# coding conventions
- Use async/await for I/O operations
- Implement proper error handling
- Add XML documentation for public APIs
- Use dependency injection

### Frontend (Next.js/React)
- Follow React best practices
- Use TypeScript for type safety
- Implement proper error boundaries
- Use functional components and hooks
- Follow naming conventions:
  - Components: PascalCase
  - Files: PascalCase for components, kebab-case for others
  - Functions/variables: camelCase

### AI Service (Python)
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions pure when possible
- Use async for I/O operations

## Commit Message Guidelines

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add photo filtering by date
fix: resolve S3 upload timeout issue
docs: update deployment guide for Azure
```

## Project Structure

```
Snapory/
├── backend/          # ASP.NET Core API
├── frontend/         # Next.js application
├── ai-service/       # Python AI service
└── infrastructure/   # Deployment configs
```

## Development Setup

### Prerequisites
- .NET 8.0 SDK
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Redis
- Git

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/karthikurao/Snapory.git
   cd Snapory
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Run with Docker Compose** (recommended)
   ```bash
   docker-compose up --build
   ```

3. **Or run services individually**
   
   Terminal 1 - Backend:
   ```bash
   cd backend
   dotnet restore
   dotnet run --project src/Snapory.Api/Snapory.Api.csproj
   ```
   
   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   Terminal 3 - AI Service:
   ```bash
   cd ai-service
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### AI Service Tests
```bash
cd ai-service
pytest
```

## Documentation

When adding features, update:
- README.md (if user-facing)
- Code comments
- API documentation
- Deployment docs (if infrastructure changes)

## Questions?

- Open an issue for questions
- Join discussions in GitHub Discussions
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Snapory! 🎉
