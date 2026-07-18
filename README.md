# Tempus Bot

Tempus Bot is a lightweight Discord bot built with `discord.js` providing utility and fun commands, including a small Pokémon lookup feature.

## Features

- Modular command structure under the `commands/` folder (e.g., `utility`, `fun`, `pokemon`).
- Example commands: `ping`, `server`, `user`, `8ball`, `pokedex`.
- Event-driven: ready and interaction handlers live in `events/`.

## Prerequisites

- Node.js (recommend Node 18+)
- A Discord bot token and (optionally) a guild for testing

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

## Configuration

The bot reads the Discord token from `config.json` in the project root. Create a `config.json` file with the following structure (do not commit your real token):

```json
{
	"token": "YOUR_BOT_TOKEN",
	"client_id": "YOUR_CLIENT_ID",
	"guild_id": "OPTIONAL_GUILD_ID"
}
```

For improved security, prefer using environment variables or a secrets manager and ensure `config.json` is ignored by Git. This project already includes `config.json` in `.gitignore`.

## Running

Start the bot with:

```bash
node index.js
```

Or add a `start` script to `package.json` and run `npm start`.

## Commands

Commands live under the `commands/` directory. To add a new command, follow the structure used by existing files: export an object with `data` and `execute` properties.

## Contributing

Contributions are welcome. Please avoid committing secrets (bot tokens) and follow the existing code style.

## License

Tempus Bot is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) for details.

