import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_PROMPT } from '../src/ai-prompt';
import { DISCORD_API_REFERENCE } from '../src/discord-api-reference';
import { initializeFirebase } from '../src/firebase';
import { getNextPendingTask, updateTaskStatus, cleanupOldTasks } from '../src/queue';

export const config = {
  maxDuration: 10,
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Initialize Firebase
    initializeFirebase();
    
    // Get next pending task from queue
    const task = await getNextPendingTask();
    
    if (!task) {
      console.log('No pending tasks in queue');
      return res.status(200).json({ status: 'no_tasks' });
    }
    
    console.log(`Processing task ${task.id}: ${task.userCommand}`);
    
    const { userCommand, channelId, guildId, botToken, interactionToken, applicationId } = task;
    const geminiApiKey = process.env.GEMINI_API_KEY;
  
  let aiGeneratedCode = '';
  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `${AI_PROMPT}

${DISCORD_API_REFERENCE}

## User Command
"${userCommand}"

Generate ONLY the TypeScript code (no explanations, no markdown) that fulfills this command. Remember:
- Use BOT_TOKEN placeholder for authentication
- Set guildMembersInfo variable with the result
- Use try-catch for error handling
- Log important steps with console.log`;
    
    console.log('Generating code with Gemini for command:', userCommand);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    aiGeneratedCode = response.text().trim();
    aiGeneratedCode = aiGeneratedCode.replace(/```typescript\n?/g, '').replace(/```\n?/g, '');
    console.log('Generated code:', aiGeneratedCode.substring(0, 200) + '...');
  } catch (error: any) {
    console.error('Gemini API error:', error);
    await updateTaskStatus(task.id, 'failed', error.message);
    await fetch(
      `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '❌ Failed to generate code with AI' }),
      }
    );
    return;
  }

  const executeAICode = async (code: string, context: any) => {
    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction('context', `
        const { channelId, guildId, botToken, fetch, console, GEMINI_API_KEY } = context;
        let guildMembersInfo = '';
        
        ${code.replace(/BOT_TOKEN/g, 'botToken')}
        
        return { guildMembersInfo };
      `);
      
      return await fn(context);
    } catch (error) {
      console.error('Error executing AI code:', error);
      return { guildMembersInfo: '\n\n_Error executing AI code_' };
    }
  };

  const result = await executeAICode(aiGeneratedCode, {
    channelId,
    guildId,
    botToken,
    fetch,
    console,
    GEMINI_API_KEY: geminiApiKey,
  });

  const responseContent = `🤖 **Command:** ${userCommand}\n${result.guildMembersInfo}\n\n_[AI-generated code executed]_`;
  console.log('Sending follow-up with content length:', responseContent.length);
  
  const webhookUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;
  const editResponse = await fetch(webhookUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: responseContent }),
  });
  
  console.log('Edit response status:', editResponse.status);
  if (editResponse.ok) {
    await updateTaskStatus(task.id, 'completed');
    console.log(`Task ${task.id} completed successfully`);
  } else {
    const errorText = await editResponse.text();
    console.error('Edit error:', errorText);
    await updateTaskStatus(task.id, 'failed', errorText);
  }
  
  // Cleanup old tasks (older than 24 hours)
  await cleanupOldTasks();
  
  // Respond after everything is done
  return res.status(200).json({ status: 'completed', taskId: task.id });
  
  } catch (error: any) {
    console.error('Execute handler error:', error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
}
