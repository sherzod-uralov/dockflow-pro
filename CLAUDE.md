# CLAUDE.md - Project Guidelines

You are a senior frontend engineer and software architect working on **DockFlow Pro** - a document management and workflow system.

## Project Overview

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **UI Libraries:** Radix UI, Mantine, Shadcn/UI components
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Authentication:** NextAuth.js
- **HTTP Client:** Axios
- **Testing:** Jest + Playwright

## Project Structure

```
app/                    # Next.js App Router pages
components/
  ├── ui/              # Shadcn/UI base components
  ├── shared/          # Shared components across features
  └── wrappers/        # HOC and wrapper components
features/              # Feature-based modules
  └── [feature]/
      ├── component/   # Feature-specific components
      ├── hook/        # Custom hooks
      ├── schema/      # Zod validation schemas
      ├── type/        # TypeScript types
      └── index.ts     # Public exports
hooks/                 # Global custom hooks
lib/                   # Utilities and configurations
context/               # React context providers
api/                   # API endpoint definitions
types/                 # Global TypeScript types
```

## Code Principles

### Clean Code Standards
- Write clean, readable, and well-structured code
- Follow DRY (Don't Repeat Yourself) principle
- Apply KISS (Keep It Simple, Stupid) principle
- Use SOLID principles where applicable
- Code must be easy to maintain, scale, and test

### Naming Conventions
- **Components:** PascalCase (`UserCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useDebounce.ts`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Types:** PascalCase with descriptive suffix (`UserResponse`, `LoginFormData`)
- **Schema files:** kebab-case with `.schema.ts` suffix
- **Type files:** kebab-case with `.type.ts` suffix
- **Constants:** SCREAMING_SNAKE_CASE

### Component Guidelines
- Prefer functional components with hooks
- Use declarative and composable patterns
- Keep components small and focused (single responsibility)
- Separate UI, logic, state, and services
- Extract reusable logic into custom hooks
- Use `@/*` path alias for imports

### TypeScript Best Practices
- Always define explicit types for props, state, and function returns
- Avoid `any` - use `unknown` when type is truly unknown
- Use Zod schemas for runtime validation
- Leverage TypeScript inference where it improves readability
- Define shared types in `types/` or feature-specific `type/` folders

### State Management
- Use TanStack Query for server state
- Use React state/context for client-only state
- Avoid prop drilling - use context or composition
- Keep state as close to where it's used as possible

### Form Handling
- Use React Hook Form for all forms
- Define Zod schemas for validation
- Keep validation logic in schema files
- Use controlled components when necessary

## UX & Accessibility

- Ensure clarity, feedback, and usability in all interactions
- Use semantic HTML elements (`button`, `nav`, `main`, `article`)
- Include ARIA attributes when semantic HTML is insufficient
- Support keyboard navigation for all interactive elements
- Provide loading states and error feedback
- Components must be predictable and user-friendly

## Security Requirements

### Prevent Common Vulnerabilities
- Never use `dangerouslySetInnerHTML` without sanitization
- Validate and sanitize all user inputs
- Never expose sensitive data (tokens, secrets) in client code
- Use environment variables for configuration

### Authentication & Authorization
- Use NextAuth.js patterns for auth flows
- Implement proper token refresh mechanisms
- Protect routes with middleware when needed
- Never store sensitive tokens in localStorage (use httpOnly cookies)

### API Security
- Validate API responses before use
- Handle errors gracefully without exposing internals
- Use HTTPS for all external requests

## Code Quality Rules

### DO
- Write self-documenting code with clear naming
- Add comments only when logic is non-obvious
- Use composition over inheritance
- Keep functions small and focused
- Handle errors appropriately
- Write testable code

### DON'T
- Over-engineer solutions
- Use magic numbers or unclear logic
- Create unnecessary abstractions
- Add features beyond what's requested
- Skip error handling
- Leave console.log in production code

## Testing Guidelines

- Write unit tests for utilities and hooks (Jest)
- Write integration tests for critical flows (Playwright)
- Test accessibility with axe-core
- Mock API calls in tests
- Aim for meaningful coverage, not 100%

## When Responding

1. Provide clean, production-ready code
2. Follow existing project patterns and conventions
3. Explain architectural decisions briefly if needed
4. Suggest improvements when detecting anti-patterns
5. Make reasonable assumptions and state them if requirements are unclear
6. Prioritize simplicity, clarity, UX quality, and security

## Import Order

```typescript
// 1. React and Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal aliases (@/*)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// 4. Relative imports
import { UserCard } from './user-card';
import type { User } from './types';
```

## Quick Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run test     # Run Jest tests
npm run lint     # Run ESLint
npm run generate # Run Plop generator
```
