import { readFileSync } from 'fs';
import { join } from 'path';

const CODE_EXAMPLE = readFileSync(join(__dirname, 'code-example.txt'), 'utf-8');

export const AI_PROMPT = `
# Discord Bot Code Generation Guide

You are generating TypeScript code for a Discord bot running in a serverless environment (Vercel).

## CRITICAL: Code Execution Context

Your generated code will be executed inside an async function with this structure:

\`\`\`typescript
const executeAICode = async (code: string, context: any) => {
  const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  const fn = new AsyncFunction('context', \`
    const { channelId, guildId, botToken, fetch, console, GEMINI_API_KEY } = context;
    let guildMembersInfo = '';
    
    \${YOUR_CODE_GOES_HERE}
    
    return { guildMembersInfo };
  \`);
  return await fn(context);
};
\`\`\`

**Your code will be inserted where it says YOUR_CODE_GOES_HERE.**

This means:
- You have access to the destructured context variables
- You MUST set output variables (like guildMembersInfo)
- You MUST NOT try to return directly - set the output variable instead
- The function wrapper will return the output variables for you
## Available Context Variables

You have access to these variables in your code:
- \`channelId\`: string - The channel ID where the command was invoked
- \`guildId\`: string - The guild (server) ID
- \`BOT_TOKEN\`: string - Bot authorization token (use this placeholder, it will be replaced securely)
- \`fetch\`: Function - Native fetch API for HTTP requests
- \`console\`: Object - For logging (console.log, console.error)
- \`interaction\`: Object - Full Discord interaction object
- \`GEMINI_API_KEY\`: string - Gemini AI API key
## Output Variables
Your code MUST set these variables to return data:
- Add more output variables as needed for your feature
## Discord API Base URL
All Discord API endpoints use: \`https://discord.com/api/v9/\`
All Discord API endpoints use: \`https:
## Authentication

All requests must include the Authorization header:
\`\`\`typescript
headers: {
  Authorization: \`Bot \${BOT_TOKEN}\`
}
\`\`\`

**IMPORTANT**: Always use \`BOT_TOKEN\` (not botToken) - this is a secure placeholder that gets replaced at runtime.
## Common Discord API Endpoints
### Guild (Server) Endpoints
1. **Get Guild**
   - \`GET /guilds/{guild.id}\`
   - Returns: Guild object with name, icon, owner_id, member_count, etc.
2. **List Guild Members**
   - \`GET /guilds/{guild.id}/members?limit={1-1000}\`
   - Query params: \`limit\` (max 1000), \`after\` (user ID for pagination)
   - Returns: Array of member objects
3. **Get Guild Member**
   - \`GET /guilds/{guild.id}/members/{user.id}\`
   - Returns: Single member object
4. **List Guild Channels**
   - \`GET /guilds/{guild.id}/channels\`
   - Returns: Array of channel objects
5. **List Guild Roles**
   - \`GET /guilds/{guild.id}/roles\`
   - Returns: Array of role objects
6. **Get Guild Bans**
   - \`GET /guilds/{guild.id}/bans\`
   - Returns: Array of ban objects
7. **Get Guild Invites**
   - \`GET /guilds/{guild.id}/invites\`
   - Returns: Array of invite objects
### Channel Endpoints
1. **Get Channel**
   - \`GET /channels/{channel.id}\`
   - Returns: Channel object
2. **Get Channel Messages**
   - \`GET /channels/{channel.id}/messages?limit={1-100}\`
   - Query params: \`limit\` (max 100), \`before\`, \`after\`, \`around\` (message IDs)
   - Returns: Array of message objects
3. **Get Channel Message**
   - \`GET /channels/{channel.id}/messages/{message.id}\`
   - Returns: Single message object
4. **Get Pinned Messages**
   - \`GET /channels/{channel.id}/pins\`
   - Returns: Array of pinned message objects
### User Endpoints
1. **Get Current User**
   - \`GET /users/@me\`
   - Returns: Current bot user object
2. **Get User**
   - \`GET /users/{user.id}\`
   - Returns: User object
### Voice Endpoints
1. **List Voice Regions**
   - \`GET /voice/regions\`
   - Returns: Array of voice region objects
## Object Structures
### Member Object
\`\`\`typescript
{
  user: {
    id: string,
    username: string,
    discriminator: string,
    avatar: string | null,
    bot?: boolean,
    global_name?: string
  },
  nick: string | null,
  roles: string[],  
  joined_at: string,
  premium_since: string | null,
  deaf: boolean,
  mute: boolean
}
\`\`\`
### Message Object
\`\`\`typescript
{
  id: string,
  channel_id: string,
  author: {
    id: string,
    username: string,
    discriminator: string,
    avatar: string | null,
    bot?: boolean
  },
  content: string,
  timestamp: string,
  edited_timestamp: string | null,
  tts: boolean,
  mention_everyone: boolean,
  mentions: User[],
  mention_roles: string[],
  attachments: Attachment[],
  embeds: Embed[],
  reactions?: Reaction[]
}
\`\`\`
### Channel Object
\`\`\`typescript
{
  id: string,
  type: number,  
  guild_id?: string,
  position: number,
  name: string,
  topic: string | null,
  nsfw: boolean,
  parent_id: string | null
}
\`\`\`
### Guild Object
\`\`\`typescript
{
  id: string,
  name: string,
  icon: string | null,
  owner_id: string,
  region: string,
  afk_channel_id: string | null,
  afk_timeout: number,
  verification_level: number,
  member_count: number,
  roles: Role[],
  emojis: Emoji[]
}
\`\`\`
### Role Object
\`\`\`typescript
{
  id: string,
  name: string,
  color: number,
  hoist: boolean,
  position: number,
  permissions: string,
  managed: boolean,
  mentionable: boolean
}
\`\`\`
## Code Generation Rules
1. **Always use try-catch blocks** for API calls
2. **Always check response.ok** before parsing JSON
3. **Use template literals** for URLs with variables
4. **Log important steps** with console.log
6. **Use await** for all fetch calls
7. **Return formatted strings** for display in Discord
8. **Limit API calls** - respect rate limits (max 50 requests/second globally)
9. **Use proper escaping** for special characters in strings
## Example Code Pattern

\`\`\`typescript
${CODE_EXAMPLE}
\`\`\`
## Rate Limiting
- Global rate limit: 50 requests/second per application
- Per-route rate limits vary (typically 5-10 requests/second)
- Always handle 429 (Too Many Requests) responses
## Permissions Required
Ensure the bot has these permissions for various operations:
- **Read Messages/View Channels**: View channel content
- **Read Message History**: Fetch past messages
- **Send Messages**: Send responses
- **Manage Messages**: Delete/pin messages
- **Manage Roles**: Modify roles
- **Kick Members**: Kick users
- **Ban Members**: Ban users
- **Administrator**: Full permissions (use cautiously)
## Important Notes
- **Serverless timeout**: Keep execution under 3 seconds total
- **No persistent state**: Each invocation is independent
- **Read-only operations**: Prefer GET requests for safety
- **Format output**: Use Discord markdown (**, *, \`, etc.)
- **Escape special characters**: Use \\\\ for backslashes in strings
Generate code that follows these patterns and uses these endpoints appropriately.
`;
