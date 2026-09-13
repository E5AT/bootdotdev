# Boot.dev Projects

This repository is a collection of projects built while learning through
[Boot.dev](https://www.boot.dev/). Each project lives in its own directory and
has its own source code, dependencies, and run instructions.

## Projects

| Project | Description | Main technologies |
| --- | --- | --- |
| [AI Agent](./ai-agent) | An AI-powered coding agent with file and Python execution tools. | Python, OpenAI API |
| [Asteroids](./asteroids) | A small arcade game built from scratch. | Python, Pygame |
| [Blog Aggregator](./blog-aggregator) | A command-line RSS feed aggregator backed by PostgreSQL. | TypeScript, Node.js, PostgreSQL |
| [BookBot](./bookbot) | A text analysis tool that counts words and characters in books. | Python |
| [Date Test](./datetest) | Go experiments with dates and time. | Go |
| [Heifer](./heifer) | A small web project and cowsay-based application. | JavaScript, Vite |
| [Hello Go](./hellogo) | Introductory Go exercises. | Go |
| [My Strings](./mystrings) | Go string-handling exercises. | Go |
| [Note Taking App](./note-taking-app) | A command-line note-taking application using local JSON storage. | Python |
| [Pokedex CLI](./pokedex-cli) | A command-line Pokedex client. | TypeScript, Node.js |
| [Static Site](./static-site) | A static site generator that converts Markdown into HTML. | Python |
| [support.ai](./support.ai) | A frontend project for an AI support interface. | TypeScript, Vite |

## Working with a project

Clone the repository and change into the project directory you want to run:

```bash
git clone https://github.com/E5AT/bootdotdev.git
cd bootdotdev/<project-directory>
```

The exact setup depends on the project:

- **Python:** use Python 3.13 or newer where specified. Projects managed with
  `uv` include a `pyproject.toml` and `uv.lock`.
- **Node.js/TypeScript:** install dependencies with `npm install`, then use
  the scripts listed in the project's `package.json`.
- **Go:** change into the project directory and run the Go commands for that
  module, such as `go run .`.

Some projects include their own README with more specific requirements,
configuration, and commands. When available, start there.

## Repository structure

Each top-level project is intentionally independent. Shared repository-level
configuration is kept to a minimum so that each project can use the tools and
workflow that best match what it is teaching.
