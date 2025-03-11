import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { addUser, addTask, getTasks, completeTask, getPendingTasks } from './database';

let bot: TelegramBot;

export const initBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is not defined in .env file');
  }

  bot = new TelegramBot(token, { polling: true });

  // Handle start command
  bot.onText(/\/start/, handleStart);
  
  // Handle add task command - simplified pattern without time
  bot.onText(/\/addtask (.+)/, handleAddTask);
  
  // Handle list tasks command
  bot.onText(/\/tasks/, handleListTasks);
  
  // Handle callback queries (for completing tasks)
  bot.on('callback_query', handleCallbackQuery);

  // Remove notification cron job as we don't have time-based tasks anymore

  return bot;
};

const handleStart = async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name || 'User';
  const username = msg.from?.username;

  if (!userId) return;

  try {
    await addUser(userId, firstName, username);
    
    const welcomeMessage = `
Hello ${firstName}! Welcome to StudyGroupTasksBot.

Commands:
- /addtask [task] - Add a new task
- /tasks - List all your tasks
- Use buttons to mark tasks as complete

You can add me to your study group and I'll help everyone track their tasks!
    `;
    
    await bot.sendMessage(chatId, welcomeMessage);
  } catch (error) {
    console.error('Error in start command:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error. Please try again later.');
  }
};

const handleAddTask = async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name || 'User';

  if (!userId || !match || !match[1]) return;

  try {
    const task = match[1].trim();
    
    await addUser(userId, firstName, msg.from?.username);
    const taskId = await addTask(userId, chatId, task);
    
    await bot.sendMessage(
      chatId, 
      `Task added: "${task}"`
    );
  } catch (error) {
    console.error('Error adding task:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error adding your task.');
  }
};

const handleListTasks = async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) return;

  try {
    const tasks = await getTasks(userId, chatId);
    
    if (tasks.length === 0) {
      return bot.sendMessage(chatId, 'You have no tasks. Add one with /addtask [task]');
    }
    
    let message = 'Your tasks:\n\n';
    
    for (const task of tasks) {
      const status = task.completed ? '✅' : '⏳';
      message += `${status} ${task.task}\n`;
      
      // If task is not completed, add a complete button
      if (!task.completed) {
        await bot.sendMessage(chatId, `${task.task}`, {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Mark as Completed', callback_data: `complete:${task.id}` }]
            ]
          }
        });
      }
    }
  } catch (error) {
    console.error('Error listing tasks:', error);
    await bot.sendMessage(chatId, 'Sorry, there was an error retrieving your tasks.');
  }
};

const handleCallbackQuery = async (query: TelegramBot.CallbackQuery) => {
  const chatId = query.message?.chat.id;
  
  if (!query.data || !chatId) return;

  const [action, taskId] = query.data.split(':');
  
  if (action === 'complete') {
    try {
      await completeTask(parseInt(taskId));
      await bot.answerCallbackQuery(query.id, { text: 'Task marked as completed!' });
      
      // Update the message to show completed
      if (query.message) {
        await bot.editMessageText(`✅ ${query.message.text}`, {
          chat_id: chatId,
          message_id: query.message.message_id
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      await bot.answerCallbackQuery(query.id, { text: 'Error completing task' });
    }
  }
};

// Removed checkTaskNotifications as we don't have time-based tasks anymore
