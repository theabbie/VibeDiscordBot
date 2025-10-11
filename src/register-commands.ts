const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
if (!DISCORD_TOKEN || !APPLICATION_ID) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID');
  process.exit(1);
}
const commands = [
  {
    name: 'vibe',
    description: 'Execute AI-generated Discord bot commands',
    options: [
      {
        name: 'command',
        description: 'Natural language command (e.g., "show guild members")',
        type: 3, 
        required: true,
      },
    ],
  },
];
async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${DISCORD_TOKEN}`,
      },
      body: JSON.stringify(commands),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to register commands: ${response.status} ${error}`);
    }
    const data = await response.json();
    console.log('✅ Successfully registered commands:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    process.exit(1);
  }
}
registerCommands();
