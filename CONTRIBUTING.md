# Contributing to Crypto Portfolio Dashboard

## Git Workflow and Conventions

### Branch Naming Convention

Use the following prefixes for branch names:
- `feature/` - New features (e.g., `feature/portfolio-management`)
- `fix/` - Bug fixes (e.g., `fix/api-error-handling`)
- `refactor/` - Code refactoring (e.g., `refactor/redux-structure`)
- `docs/` - Documentation updates (e.g., `docs/api-integration`)
- `test/` - Adding or updating tests (e.g., `test/component-tests`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Commit Message Convention

Follow the conventional commit format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

#### Scopes:
- `api`: API integration and services
- `store`: Redux store and state management
- `ui`: User interface components
- `portfolio`: Portfolio management features
- `dashboard`: Dashboard functionality
- `routing`: Navigation and routing
- `theme`: Theming and styling
- `config`: Configuration files

#### Examples:
```
feat(store): implement crypto data slice with normalized state
fix(api): handle rate limiting with exponential backoff
docs(readme): add setup instructions and architecture overview
refactor(ui): optimize component re-renders with React.memo
test(store): add unit tests for portfolio calculations
chore(deps): update dependencies to latest versions
```

### Feature-Based Development

1. **Create feature branch**: `git checkout -b feature/feature-name`
2. **Make atomic commits**: Each commit should represent a single logical change
3. **Write descriptive commit messages**: Follow the convention above
4. **Keep commits focused**: One feature per branch, multiple small commits per feature
5. **Merge to main**: Use pull requests for code review

### Commit Organization

Instead of large monolithic commits, break down changes into logical units:

**Good Example:**
```
feat(config): set up Vite build configuration and TypeScript
feat(store): implement Redux store with typed hooks
feat(api): create CoinGecko API service with error handling
feat(ui): build responsive crypto table component
feat(portfolio): add portfolio management with real-time calculations
```

**Bad Example:**
```
feat: implement entire crypto portfolio dashboard
```

### Pre-commit Checklist

Before committing, ensure:
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes without errors
- [ ] Commit message follows convention
- [ ] Changes are atomic and focused

### Development Workflow

1. **Start with main branch**: `git checkout main && git pull origin main`
2. **Create feature branch**: `git checkout -b feature/your-feature`
3. **Develop incrementally**: Make small, focused commits
4. **Test thoroughly**: Ensure all functionality works
5. **Push branch**: `git push origin feature/your-feature`
6. **Create pull request**: For code review and discussion
7. **Merge after approval**: Squash if needed to maintain clean history

This workflow ensures maintainable code history and makes it easy to track feature development and debug issues.
</text>
</invoke>