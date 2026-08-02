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

## TODO
### Current Parity
- [x] Keep the current command loader using grouped folders under `commands/`.
- [x] Keep the currently ported utility commands: `ping`, `serverinfo`, and `userinfo`.
- [x] Keep the currently ported fun commands from `tempus-utilities`: `8ball`, `flip`, `roll`, `owoify`, and `impostor`.
- [x] Keep the currently ported Pokemon commands: `pokedex`, `typedex`, `itemdex`, and `wtp`.
- [x] Keep the current welcome-card join event in `events/guildMemberAdd.js`.
- [x] Keep the current Pokemon image-generation/cache approach under `assets/generatedImages/`.

### Foundation
- [ ] Decide the state storage layer before porting legacy database features. Legacy code used SQLite tables/files for `scores`, `profile`, `userSettings`, `botsettings`, `excludesusers`, `punishments`, `giveaways.json`, and plugin-specific XP data.
- [ ] Add or replace legacy-only dependencies when their features are ported: `discord-giveaways`, `better-sqlite3` or a replacement, `humanize-duration`, `moment`, and `moment-duration-format`.
- [ ] Update `config.example.json` for the config keys the current and legacy code expect: `channel_ids.logs`, `channel_ids.welcome`, `channel_ids.games`, `embed_colours`, `owner_id`, `role_ids`, `role_menu_ids`, activity/presence settings, and moderation/logging plugin options.
- [ ] Add missing startup support needed by legacy event systems: `GatewayIntentBits.GuildInvites`, `GatewayIntentBits.GuildEmojisAndStickers`, and message/channel/reaction partials where required.
- [ ] Add a shared helper layer for repeated legacy behavior such as `nFormatter`, random numbers and XP mutation.
- [ ] Port remaining English response copy directly; the old localization system is deprecated.

### Commands
- [ ] Port `faq` with its Pixelmon Tempus FAQ choices.
- [ ] Port `info` with uptime, memory, guild/user counts, Discord.js version, Node version, and bot version.
- [ ] Port `privacy`.
- [ ] Port `rps`, including challenge flow and timer choices.
- [ ] Port `leaderboard` from `xp-plugin`, including top 5/10/15/20/25 choices.
- [ ] Port `profile messages` and `profile toggles`, including modal handling and display preferences.
- [ ] Port `usersettings`, including level-notification and language modal handling.
- [ ] Port `manage points`.
- [ ] Port `punish ban`, `punish kick`, `punish warn`, `punish mute`, and `punish query` with custom reasons, permission checks, punishment persistence, and logging.

### Events And Systems
- [ ] Port XP accrual on messages and interactions, including cooldowns, random 1-10 point awards, level calculation, and level-up notifications.
- [ ] Wire `userinfo` into restored profile, privacy, score, level, and role-display preferences.
- [ ] Port role-menu select handling for follower, vote, sneak peek, health, tournament, and here-for-you roles.
- [ ] Port member-role behavior from the old monolith and `bit-welcoming`.
- [ ] Port invite-detection moderation from `bit-moderation`, including role exemptions, external invite lookup, timeout/delete behavior, and logging.
- [ ] Port audit logging from `bit-logging`: bans, channels, emojis, invites, members, messages, roles, stickers, and channel pin updates.
- [ ] Restore configurable bot presence/status from the old ready event.

## Contributing
Contributions are welcome. Please avoid committing secrets (bot tokens) and follow the existing code style.

## License
Tempus Bot is licensed under the GNU General Public License v3.0 (GPL-3.0). See [LICENSE](LICENSE) for details.

## AI Disclosure
- AI assistance was used to draft and revise this README, including the migration TODO/checklist.
- AI assistance was used to inspect and summarize legacy Tempus/Bit plugin code for migration planning.
- AI assistance was used to clean the ignored `Legacy/` reference folder by removing replicated or superseded legacy files.
- AI-assisted content and code should be reviewed by the project maintainer before release.