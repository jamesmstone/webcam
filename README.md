# bun-react-tailwind-shadcn-template

A modern React template featuring Tailwind CSS for styling and Shadcn UI components, designed for fast development with Bun runtime.

## Features

- **Component Library Integration**: Pre-configured with Shadcn UI components for consistent and accessible UI elements.
- **Responsive Design**: Tailwind CSS enables rapid, responsive styling without leaving your HTML.
- **Build Tooling**: Leverages Bun for lightning-fast package management, bundling, and runtime execution.

## Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js (v18+)
- No additional system dependencies required

## Usage

### Install Dependencies

```bash
bun install
```

### Development Server

Start the development server with hot reloading:

```bash
bun dev
```

### Production Build

Build the project for production:

```bash
bun run build
```

### Run in Production

Serve the built application:

```bash
bun start
```

## Project Structure

- `src/`: Main source code directory
  - `components/`: Reusable UI components (e.g., `ui/` for Shadcn components)
  - `lib/`: Utility functions and helpers
  - `App.tsx`: Main application component
  - `index.tsx`: Application entry point
- `styles/`: Global stylesheets (e.g., `globals.css` for Tailwind)

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
