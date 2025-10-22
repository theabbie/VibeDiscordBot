````markdown
# VibeDiscordBot

An AI-powered Discord bot that dynamically generates and executes code based on natural language commands using Google Gemini AI.

## ⚠️ Important Warnings

**🚨 WORK IN PROGRESS**: This bot is experimental and many features may not work as expected. Use at your own risk.

**🔒 SECURITY NOTICE**: 
- This bot executes AI-generated code dynamically, which carries inherent security risks
- **Only grant minimal permissions** required for your use case
- The bot has access to your Discord server data through the Bot Token
- AI-generated code is sandboxed but not 100% secure
- **Do NOT use in production environments without thorough security review**
- Consider running in a dedicated test server first

## Features

- 🤖 **AI-Powered Commands**: Use natural language to interact with your Discord server  
  - `/vibe command:<your natural language command>` - AI generates and executes code to fulfill your request  
  - Examples: "show 5 guild members", "list server roles", "get channel info"
- 🧠 **Google Gemini Integration**: Uses Gemini 2.5 Flash for code generation
- 🔥 **Firebase Queue System**: Reliable task queue to handle long-running operations
- ⚡ **Serverless Architecture**: Hosted on Vercel with cron-based task processing
- 🔒 **Secure Discord Signature Verification**: All interactions are cryptographically verified
- 📦 **TypeScript**: Full type safety throughout the codebase
- 🎯 **Dynamic Code Execution**: AI-generated code runs in a controlled context with Discord API access

## Setup

### 1. Install Dependencies

```bash
npm install
````

### 2. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and create a bot
4. Copy the Bot Token
5. Go to "General Information" tab and copy:

   * Application ID
   * Public Key

### 3. Set Up Firebase Realtime Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Realtime Database** (not Firestore)
4. Go to Project Settings → Service Accounts
5. Click "Generate New Private Key" and download the JSON file
6. Keep this file secure - it contains sensitive credentials

### 4. Set Up Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key for Gemini
3. Copy the API key

### 5. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

```
DISCORD_APPLICATION_ID=your_application_id
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_PUBLIC_KEY=your_public_key
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

**Note**: `FIREBASE_SERVICE_ACCOUNT` should be the entire JSON content from your Firebase service account file, as a single line.

### 6. Register Slash Commands

```bash
npm run register
```

### 7. Deploy to Vercel

```bash
vercel
```

After deployment, copy your Vercel URL (e.g., `https://your-app.vercel.app`)

**Important**: Add all environment variables to Vercel:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add all variables from `.env.local`

### 8. Configure Vercel Cron Job

Add to your `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/execute",
    "schedule": "* * * * *"
  }]
}
```

This runs the task processor every minute. Redeploy after adding this.

### 9. Configure Discord Interactions Endpoint

1. Go back to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "General Information"
4. Set "Interactions Endpoint URL" to: `https://your-app.vercel.app/api/interactions`
5. Discord will verify the endpoint

### 10. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select bot permissions (minimal recommended):

   * `View Channels`
   * `Send Messages`
   * `Read Message History`
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
│   ├── index.ts           # Landing page
│   ├── interactions.ts    # Discord interactions handler (queues tasks)
│   └── execute.ts         # Task processor (called by cron)
├── src/
│   ├── ai-prompt.ts       # AI system prompt for code generation
│   ├── discord-api-reference.ts  # Discord API documentation for AI
│   ├── code-example.txt   # Example code for AI reference
│   ├── firebase.ts        # Firebase initialization
│   ├── queue.ts           # Task queue management
│   └── register-commands.ts  # Script to register slash commands
├── .env.example           # Environment variables template
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## How It Works

### Architecture Overview

1. **User sends `/vibe` command** → Discord sends interaction to `/api/interactions`
2. **Interactions endpoint**:

   * Verifies Discord signature
   * Adds task to Firebase Realtime Database queue
   * Responds immediately with "thinking..." (deferred response)
3. **Vercel Cron** calls `/api/execute` every minute
4. **Execute endpoint**:

   * Fetches next pending task from queue
   * Sends user command to Google Gemini AI
   * AI generates TypeScript code to fulfill the command
   * Executes the generated code in a sandboxed context
   * Updates the Discord message with results
   * Marks task as completed in queue

### Queue System

The bot uses Firebase Realtime Database as a task queue because **Vercel's serverless functions have strict limitations**:

* Functions terminate immediately after sending a response
* Background execution is unreliable
* 10-second maximum execution time (even with paid plans)

**Queue Structure** (`discord/queue`):

```typescript
{
  id: string,
  userCommand: string,
  channelId: string,
  guildId: string,
  botToken: string,
  interactionToken: string,
  applicationId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  createdAt: number,
  processedAt?: number,
  error?: string
}
```

Tasks older than 24 hours are automatically cleaned up.

## Commands

* `/vibe command:<natural language command>` - AI generates and executes code based on your command

**Example commands:**

* `show 5 guild members`
* `list server roles`
* `get channel information`
* `count messages in this channel`
* `show server info`

## Tech Stack

* **Runtime**: Node.js 20 with TypeScript
* **Hosting**: Vercel (Serverless Functions)
* **AI**: Google Gemini 2.5 Flash
* **Database**: Firebase Realtime Database (task queue)
* **Discord API**: discord-interactions library
* **Package Manager**: npm

## ⚙️ Troubleshooting & Debugging

If you encounter issues during setup or runtime, try the following steps:

### Common Issues

| Problem                                          | Cause                                       | Solution                                                                                  |
| ------------------------------------------------ | ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Bot not responding**                           | Interactions endpoint not verified          | Recheck your Discord Developer Portal → General Information → "Interactions Endpoint URL" |
| **`403 Forbidden` error**                        | Missing bot permissions                     | Ensure the bot has at least “Send Messages” and “View Channels” permissions               |
| **Firebase permission errors**                   | Incorrect or malformed service account JSON | Copy your Firebase JSON key into `.env.local` as a single line string                     |
| **Gemini API not generating**                    | Invalid or expired API key                  | Generate a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)        |
| **Cron not triggering tasks**                    | Missing cron setup in `vercel.json`         | Verify your Vercel project includes the `crons` configuration and redeploy                |
| **Unexpected token errors in AI-generated code** | Gemini generated malformed code             | Re-run the command; AI output may vary between requests                                   |

### Debug Tips

* Use `console.log()` generously in your code to inspect interaction payloads
* Use `Firebase Console → Realtime Database → Data` tab to inspect the queue in real time
* Use `npm run dev` with [ngrok](https://ngrok.com/) to test local behavior
* Always check Vercel function logs (`vercel logs <deployment-url>`)

---

## ⚠️ Why Vercel Makes This Harder Than It Should Be

Vercel's serverless architecture introduces significant challenges for Discord bots:

### The Problems

1. **Immediate Response Requirement**: Discord requires a response within 3 seconds
2. **Long AI Processing**: Gemini API takes 2–6 seconds to generate code
3. **Function Termination**: Vercel kills functions immediately after sending a response
4. **No True Background Jobs**: `waitUntil` and separate routes still share execution context
5. **Timeout Limitations**: Even with `maxDuration: 10`, functions are unreliable for long tasks

### The Solution: External Queue

We implemented a **Firebase-based task queue** that decouples command receipt from execution:

* Commands are queued instantly (< 100ms)
* Vercel Cron processes the queue independently
* Each cron invocation is a fresh function with full 10-second timeout
* No parent-child dependency issues

### Recommendation: Self-Host Instead

**For a production Discord bot, we strongly recommend self-hosting:**

```bash
# Clone the repo
git clone https://github.com/theabbie/VibeDiscordBot
cd VibeDiscordBot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your credentials

# Run the bot
npm start
```

**Benefits of self-hosting:**

* No artificial timeouts
* True background processing
* No need for external queue (can use in-memory queue)
* Simpler architecture
* Lower latency
* No cold starts
* Better debugging

**Self-hosting options:**

* VPS (DigitalOcean, Linode, AWS EC2)
* Docker container
* Kubernetes cluster
* Railway.app (simpler than Vercel for bots)
* Fly.io

The Firebase queue system works but adds complexity and latency (1–60 seconds delay depending on cron frequency). Self-hosting eliminates these issues entirely.
