# VibeDiscordBot

A serverless Discord bot with `/vibe` echo command, hosted on Vercel.

## Features

- 🎵 `/vibe` command - Echoes back your message with vibes
- ⚡ Serverless architecture using Vercel
- 🔒 Secure Discord signature verification
- 📦 TypeScript for type safety

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and create a bot
4. Copy the Bot Token
5. Go to "General Information" tab and copy:
   - Application ID
   - Public Key

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Discord credentials in `.env.local`:

```
DISCORD_APPLICATION_ID=your_application_id
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
```

### 4. Register Slash Commands

```bash
npm run register
```

### 5. Deploy to Vercel

```bash
vercel
```

After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

### 6. Configure Discord Interactions Endpoint

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "General Information"
4. Set "Interactions Endpoint URL" to: `https://your-app.vercel.app/api/interactions`
5. Discord will verify the endpoint

### 7. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions: `Send Messages`
4. Copy the generated URL and open it in your browser
5. Select a server and authorize

## Local Development

```bash
npm run dev
```

This starts Vercel dev server at `http://localhost:3000`

To test locally with Discord, you'll need to expose your local server using a tool like [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Then update your Discord Interactions Endpoint URL to the ngrok URL.

## Project Structure

```
├── api/
│   └── interactions.ts    # Main Discord interactions handler
├── src/
│   └── register-commands.ts  # Script to register slash commands
├── .env.example           # Environment variables template
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Commands

- `/vibe message:<your message>` - Echoes back your message with vibes

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Hosting**: Vercel (Serverless Functions)
- **Discord API**: discord-interactions library
- **Package Manager**: npm
