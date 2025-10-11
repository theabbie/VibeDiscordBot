import { getDatabase } from './firebase';

export interface QueueTask {
  id: string;
  userCommand: string;
  channelId: string;
  guildId: string;
  botToken: string;
  interactionToken: string;
  applicationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  processedAt?: number;
  error?: string;
}

export async function addTaskToQueue(task: Omit<QueueTask, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const db = getDatabase();
  const taskRef = db.ref('discord/queue').push();
  const taskId = taskRef.key!;
  
  const queueTask: QueueTask = {
    ...task,
    id: taskId,
    status: 'pending',
    createdAt: Date.now(),
  };
  
  await taskRef.set(queueTask);
  console.log('Task added to queue:', taskId);
  return taskId;
}

export async function getNextPendingTask(): Promise<QueueTask | null> {
  const db = getDatabase();
  const snapshot = await db.ref('discord/queue')
    .orderByChild('status')
    .equalTo('pending')
    .limitToFirst(1)
    .once('value');
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const tasks = snapshot.val();
  const taskId = Object.keys(tasks)[0];
  const task = tasks[taskId];
  
  await db.ref(`discord/queue/${taskId}/status`).set('processing');
  await db.ref(`discord/queue/${taskId}/processedAt`).set(Date.now());
  
  return task;
}

export async function updateTaskStatus(
  taskId: string, 
  status: 'completed' | 'failed', 
  error?: string
): Promise<void> {
  const db = getDatabase();
  const updates: any = {
    status,
    processedAt: Date.now(),
  };
  
  if (error) {
    updates.error = error;
  }
  
  await db.ref(`discord/queue/${taskId}`).update(updates);
  console.log(`Task ${taskId} marked as ${status}`);
}

export async function cleanupOldTasks(olderThanMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const db = getDatabase();
  const cutoffTime = Date.now() - olderThanMs;
  
  const snapshot = await db.ref('discord/queue')
    .orderByChild('createdAt')
    .endAt(cutoffTime)
    .once('value');
  
  if (snapshot.exists()) {
    const tasks = snapshot.val();
    const deletePromises = Object.keys(tasks).map(taskId => 
      db.ref(`discord/queue/${taskId}`).remove()
    );
    await Promise.all(deletePromises);
    console.log(`Cleaned up ${deletePromises.length} old tasks`);
  }
}
