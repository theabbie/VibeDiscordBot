import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  InteractionType,
  InteractionResponseType,
  verifyKey,
} from 'discord-interactions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_PROMPT } from '../src/ai-prompt';
import { DISCORD_API_REFERENCE } from '../src/discord-api-reference';
import { initializeFirebase } from '../src/firebase';
import { addTaskToQueue } from '../src/queue';
export const config = {
  maxDuration: 10,
};

export default async function handler(
  req: VercelRequest & { waitUntil?: (promise: Promise<any>) => void },
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const signature = req.headers['x-signature-ed25519'] as string;
  const timestamp = req.headers['x-signature-timestamp'] as string;
  const rawBody = JSON.stringify(req.body);
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey) {
    console.error('DISCORD_PUBLIC_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  const isValidRequest = verifyKey(rawBody, signature, timestamp, publicKey);
  if (!isValidRequest) {
    console.error('Invalid request signature');
    return res.status(401).json({ error: 'Invalid request signature' });
  }
  const interaction = req.body;
  if (interaction.type === InteractionType.PING) {
    return res.status(200).json({ type: InteractionResponseType.PONG });
  }
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const { name, options } = interaction.data;
    if (name === 'vibe') {
      const commandOption = options?.find((opt: any) => opt.name === 'command');
      const userCommand = commandOption?.value || 'show guild members';
      const channelId = interaction.channel_id;
      const guildId = interaction.guild_id;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      if (!geminiApiKey) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Gemini API key not configured',
            flags: 64,
          },
        });
      }

      if (!botToken) {
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Bot token not configured',
            flags: 64,
          },
        });
      }
      
      try {
        // Initialize Firebase
        initializeFirebase();
        
        // Add task to queue
        const taskId = await addTaskToQueue({
          userCommand,
          channelId,
          guildId,
          botToken,
          interactionToken: interaction.token,
          applicationId: process.env.DISCORD_APPLICATION_ID!,
        });
        
        console.log(`Task ${taskId} queued for command: ${userCommand}`);
        
        // Respond immediately with deferred response
        return res.status(200).json({
          type: 5,
        });
      } catch (error) {
        console.error('Error queuing task:', error);
        return res.status(200).json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '❌ Failed to queue command',
            flags: 64,
          },
        });
      }
    }
    return res.status(200).json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: 'Unknown command',
        flags: 64, 
      },
    });
  }
  return res.status(400).json({ error: 'Unknown interaction type' });
}
