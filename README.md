# StudyGroupTasksBot

A Telegram bot to help study groups organize and track tasks.

## Features

- Log tasks
- Mark tasks as completed
- Works in group chats for collaborative study

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Telegram bot token:
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   ```
4. Build and start the bot:
   ```
   npm run build
   npm start
   ```

## Bot Commands

- `/start` - Introduction and help
- `/addtask [task]` - Add a new task
- `/tasks` - View your current tasks

## Usage in Groups

Add the bot to your study group and all members can track their tasks together.
