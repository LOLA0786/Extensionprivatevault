# Contributing to PrivateVault

Thank you for your interest in contributing to PrivateVault!

## Development Setup

See the [Quick Start](#quick-start) section in the main README.

## Project Structure

privatevault/
├── extension/ # Chrome extension (client-side)
├── backend/ # API server (server-side)
├── shared/ # Shared types and utilities
├── docs/ # Documentation
└── infra/ # Infrastructure as code

markdown
Copy code

## Code Style

- **TypeScript** for all code
- **ESLint** for linting
- **Prettier** for formatting (coming soon)

Run linters:
```bash
npm run lint
Commit Messages
Follow Conventional Commits:

makefile
Copy code
feat: add approval workflow
fix: resolve hash chain verification bug
docs: update architecture diagram
Pull Request Process
Fork the repository

Create a feature branch: git checkout -b feat/my-feature

Make your changes

Run tests: npm test

Commit with conventional commits

Push and create a PR

Testing
bash
Copy code
# Run all tests
npm test

# Run extension tests
cd extension && npm test

# Run backend tests
cd backend && npm test
Adding Site Adapters
To add support for a new AI site:

Create extension/src/content/site_adapters/yoursite.ts

Implement the SiteAdapter interface

Export the adapter

Add to manifest.json content_scripts

Test thoroughly

Example:

typescript
Copy code
export const yourSiteAdapter: SiteAdapter = {
  name: 'yoursite',
  detect: () => window.location.hostname === 'yoursite.com',
  getPromptText: () => { /* ... */ },
  getResponseText: () => { /* ... */ },
  onSubmit: (callback) => { /* ... */ },
  onResponse: (callback) => { /* ... */ },
};
License
By contributing, you agree that your contributions will be licensed under the MIT License.
