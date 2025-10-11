export const DISCORD_API_REFERENCE = `
# Discord API v10 Quick Reference
Base URL: https:
Auth Header: Authorization: Bot {token}
## Guild Endpoints
GET /guilds/{guild.id} - Get guild info
GET /guilds/{guild.id}/members?limit=100 - List members
GET /guilds/{guild.id}/members/{user.id} - Get member
GET /guilds/{guild.id}/channels - List channels
GET /guilds/{guild.id}/roles - List roles
GET /guilds/{guild.id}/bans - List bans
GET /guilds/{guild.id}/invites - List invites
GET /guilds/{guild.id}/voice-states - List voice states
GET /guilds/{guild.id}/emojis - List emojis
GET /guilds/{guild.id}/audit-logs - Get audit logs
## Channel Endpoints
GET /channels/{channel.id} - Get channel
GET /channels/{channel.id}/messages?limit=100 - Get messages
GET /channels/{channel.id}/messages/{message.id} - Get message
GET /channels/{channel.id}/pins - Get pinned messages
GET /channels/{channel.id}/invites - Get channel invites
GET /channels/{channel.id}/webhooks - Get webhooks
## User Endpoints
GET /users/@me - Get current user (bot)
GET /users/{user.id} - Get user
GET /users/@me/guilds - Get bot's guilds
## Available Context
- channelId: string
- guildId: string
- botToken: string
- fetch: Function
- console: Object
- interaction: Object (full Discord interaction)
## Output Variables (must be set)
- guildMembersInfo: string (or other custom variables)
## Example
const response = await fetch(
  \`https:
  { headers: { Authorization: \`Bot \${botToken}\` } }
);
const members = await response.json();
guildMembersInfo = members.map(m => m.user.username).join(', ');
`;
