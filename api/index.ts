import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const permissions = '566216280104640';
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=${permissions}&scope=bot%20applications.commands`;
  
  return res.redirect(302, inviteUrl);
}
