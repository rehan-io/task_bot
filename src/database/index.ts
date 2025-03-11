import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./tasks.db');

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          first_name TEXT,
          username TEXT
        )
      `);

      // Create tasks table - removed due_time
      db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          chat_id INTEGER,
          task TEXT,
          completed INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

export const getUser = (userId: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const addUser = (userId: number, firstName: string, username?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO users (id, first_name, username) VALUES (?, ?, ?)',
      [userId, firstName, username || null],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const addTask = (
  userId: number,
  chatId: number,
  task: string
): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO tasks (user_id, chat_id, task) VALUES (?, ?, ?)',
      [userId, chatId, task],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
};

export const getTasks = (userId: number, chatId: number): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE user_id = ? AND chat_id = ?',
      [userId, chatId],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

export const getPendingTasks = (): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE completed = 0',
      [],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
};

export const completeTask = (taskId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE tasks SET completed = 1 WHERE id = ?',
      [taskId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export default db;
