# Movie Recommendations App

An AI-powered movie recommendation application that uses a multi-agent system to provide personalized movie suggestions based on natural language criteria. The application integrates with The Movie Database (TMDB) API and supports multiple AI providers for flexible deployment.

## Demo
🚀 You can just try out the app for yourself!

<https://demo.lucdev.net/ai-movies-rec>

## Features

- **AI-Powered Recommendations**: Multi-agent system that consults recommendation models and searches TMDB for matching movies
- **Real-time Streaming**: Server-Sent Events (SSE) for progressive result streaming
- **Multi-Provider AI Support**: Choose from OpenRouter, xAI (Grok), or Ollama
- **Modern Tech Stack**: Built with Next.js 16, React 19, and TypeScript
- **Docker Support**: Production-ready containerization

## Prerequisites

- **Node.js** 20 or higher
- **pnpm** package manager
- **TMDB API Key** - Get one at [TMDB](https://www.themoviedb.org/settings/api)
- **AI Provider Setup** - Configure one of the following:
  - OpenRouter account and API key
  - xAI API key
  - Ollama (local or remote instance)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```bash
# TMDB API Key (required)
TMDB_API_KEY=your_tmdb_api_key_here

# AI Provider Selection (required)
# Options: "openrouter", "xai", or "ollama" (default: "ollama")
AI_MODEL_PROVIDER=ollama
```

### OpenRouter Configuration

If using OpenRouter as your AI provider:

```bash
AI_MODEL_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL_AGENT=openai/gpt-5-nano
OPENROUTER_MODEL_RECOMMENDER=openai/gpt-oss-120b
```

### xAI Configuration

If using xAI as your AI provider:

```bash
AI_MODEL_PROVIDER=xai
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL_AGENT=grok-4-fast-non-reasoning
XAI_MODEL_RECOMMENDER=grok-4
```

### Ollama Configuration

If using Ollama as your AI provider (default):

```bash
AI_MODEL_PROVIDER=ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL_AGENT=gemma3:4b
OLLAMA_MODEL_RECOMMENDER=gpt-oss:20b
```

**Note**: For Ollama, ensure the models are installed locally:
```bash
ollama pull gemma3:4b
ollama pull gpt-oss:20b
```

### Optional Configuration

```bash
# Base path for the application (default: "/ai-movies-rec/")
# Must start and end with a slash
NEXT_PUBLIC_BASE_PATH=/ai-movies-rec/

# Node environment (default: "development")
NODE_ENV=development
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-movies-rec-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local  # If you have an example file
# Or create .env.local manually with the variables above
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000/ai-movies-rec](http://localhost:3000/ai-movies-rec) in your browser.

## Running the Application

### Development Mode

```bash
pnpm dev
```

Starts the Next.js development server with hot reloading.

### Production Build

```bash
pnpm build
pnpm start
```

Builds the application for production and starts the production server.

## License

[MIT License](./LICENSE)
