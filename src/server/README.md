# Server TypeScript Configuration

This folder contains the server-side TypeScript code for the Electronic Signature App.

## Configuration

The `tsconfig.json` file has been configured with the following features:

- **TypeScript Compilation**: Full support for compiling TypeScript to CommonJS JavaScript
- **NoCheck Mode**: Uses `noCheck: true` for faster compilation without type checking
- **Node.js Support**: Configured for Node.js environment with proper module resolution
- **Source Maps**: Generates source maps for debugging
- **Output Directory**: Compiles to `../../dist/server/`

### Key Configuration Options

- `module: "CommonJS"` - Outputs CommonJS modules for Node.js compatibility
- `moduleResolution: "node"` - Uses Node.js module resolution
- `noCheck: true` - Skips type checking for faster compilation
- `skipLibCheck: true` - Skips checking of declaration files
- `strict: false` - Relaxed type checking for easier development
- `esModuleInterop: true` - Enables ES module interoperability

## Available Scripts

Run these commands from the project root:

```bash
# Build the server (compile TypeScript to JavaScript)
npm run build:server

# Build the server in watch mode (recompiles on changes)
npm run build:server:watch

# Start the compiled server
npm run start:server

# Clean the server build output
npm run clean:server

# Development mode (uses tsx for direct TypeScript execution)
npm run dev:server
```

## File Structure

```
src/server/
├── controllers/     # Route controllers
├── models/         # Data models
├── routes/         # Express routes
├── services/       # Business logic services
├── utils/          # Utility functions
├── index.ts        # Main server entry point
└── tsconfig.json   # TypeScript configuration
```

## Compilation Output

The compiled JavaScript files are output to:

```
dist/server/
├── controllers/
├── models/
├── routes/
├── services/
├── utils/
├── index.js        # Compiled main entry point
└── *.js.map        # Source maps for debugging
```

## Notes

- The configuration extends the root `tsconfig.json` but overrides settings for server-specific needs
- Uses CommonJS modules for better Node.js compatibility
- Source maps are generated for easier debugging of the compiled code
- The `noCheck` option speeds up compilation by skipping type checking
