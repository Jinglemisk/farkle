# Coding Guidelines for Farkle Game

## General Guidelines

- Use clear, descriptive variable and function names
- Add comments for complex logic or non-obvious functionality
- Follow a consistent coding style throughout the project
- Keep functions small and focused on a single responsibility
- Use error handling appropriately

## JavaScript Conventions

- Use camelCase for variable and function names (e.g., `playerName`, `updateScoreboard`)
- Use PascalCase for class names (e.g., `GameState`, `PlayerProfile`)
- Use UPPER_SNAKE_CASE for constants (e.g., `MAX_PLAYERS`, `DEFAULT_PORT`)
- Use modern ES6+ features where appropriate (arrow functions, template literals, etc.)
- Prefer `const` over `let` where possible, and avoid using `var`

## File Structure

- Keep related components and functionality in the same directory
- Use descriptive file names that reflect the content's purpose
- Organize code logically, with core game logic separated from UI/presentation logic

## Socket.io Guidelines

- Use event names that clearly describe the action or state change they represent
- Keep socket event handlers concise and focused on a single responsibility
- Use namespaces or rooms for different game instances if implementing multiple simultaneous games
- Handle disconnections gracefully to maintain game state integrity

## HTML/CSS Conventions

- Use semantic HTML elements where appropriate
- Keep CSS class names descriptive and related to the component they style
- Use a consistent naming convention for CSS classes (e.g., BEM or similar)
- Organize CSS properties in a consistent order

## Code Review Process

Before merging any new features or significant changes:

1. Ensure the code follows these guidelines
2. Test the changes thoroughly
3. Make sure the code doesn't introduce any new bugs
4. Check for any potential performance issues

## Git Workflow

- Use descriptive commit messages that explain what changes were made and why
- Create feature branches for new functionality
- Keep commits focused on a single logical change
- Merge feature branches back to the main branch when they're complete and tested

## Documentation

- Document API endpoints and socket events
- Keep the README updated with any significant changes
- Document game rules and mechanics in comments where they're implemented
- Include setup instructions for any new dependencies

## Testing

- Test new features thoroughly before committing
- Check for edge cases and potential user errors
- Ensure the game works correctly across different browsers
- Test multiplayer functionality with multiple connections 