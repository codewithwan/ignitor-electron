# IGNITOR - Educational Game Launcher

![IGNITOR Screenshot](https://i.ibb.co.com/HLkBjVys/image.png)

## Introduction

IGNITOR is a modern, educational game launcher application built with Electron and React. It provides a sleek, user-friendly interface for managing and playing educational games. The launcher supports both HTML5 web games and native executable applications, making it versatile for various educational content.

## Features

- **Intuitive Game Library**: Easily browse and launch your imported games
- **Game Importing**: Import games from ZIP files with automatic detection of entry points
- **Customization**: Personalize game icons and background colors
- **Playtime Tracking**: Monitor how long you've played each game
- **Statistics**: View your gaming habits and most-played titles
- **Cross-Platform**: Runs on Windows, macOS, and Linux

## Screenshots

<!-- Add screenshots of your application here -->

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/codewithwan/ignitor-electron.git
cd ignitor-electron
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Build the application:
```bash
npm run build
# or
yarn build
```

4. Start the application:
```bash
npm start
# or
yarn start
```

### Building for Distribution

```bash
npm run make
# or
yarn make
```

This will create distributable packages for your platform in the `out` directory.

## Usage

### Importing Games

1. Click on the "Import" button in the sidebar
2. Click "Import Game" and select a ZIP file containing your game
3. The game will be extracted and added to your library

Supported game formats:
- HTML5 games (with index.html, game.html, or main.html entry points)
- Executable games (.exe, .app, .sh, .bat files)

### Launching Games

1. Browse your games in the Library or Home screen
2. Click on a game card or its "Play" button to launch the game
3. Use the "Stop Playing" button to exit the game

### Customizing Games

1. In the game importer view, click on a game card
2. Use the "Change Color" button to modify the background color
3. Use the "Change Icon" button to select a different icon for the game

## Development

### Project Structure

- `src/main` - Electron main process code
- `src/preload` - Preload scripts for Electron
- `src/renderer` - React front-end application
- `resources` - Application icons and assets

### Scripts

- `npm run dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run lint` - Run linting
- `npm test` - Run tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)
