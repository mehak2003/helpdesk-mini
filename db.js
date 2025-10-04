const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, 'helpdesk.db');
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createTicketsTable = `
                CREATE TABLE IF NOT EXISTS tickets (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
                    category TEXT NOT NULL,
                    assignee TEXT DEFAULT 'Unassigned',
                    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in-progress', 'resolved', 'closed')),
                    sla INTEGER NOT NULL DEFAULT 24,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            const createCommentsTable = `
                CREATE TABLE IF NOT EXISTS comments (
                    id TEXT PRIMARY KEY,
                    ticket_id TEXT NOT NULL,
                    text TEXT NOT NULL,
                    author TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
                )
            `;

            const createIndexes = `
                CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
                CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
                CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee);
                CREATE INDEX IF NOT EXISTS idx_comments_ticket_id ON comments(ticket_id);
            `;

            this.db.serialize(() => {
                this.db.run(createTicketsTable, (err) => {
                    if (err) {
                        console.error('Error creating tickets table:', err);
                        reject(err);
                        return;
                    }
                });

                this.db.run(createCommentsTable, (err) => {
                    if (err) {
                        console.error('Error creating comments table:', err);
                        reject(err);
                        return;
                    }
                });

                this.db.run(createIndexes, (err) => {
                    if (err) {
                        console.error('Error creating indexes:', err);
                        reject(err);
                        return;
                    }
                    console.log('Database tables created successfully');
                    resolve();
                });
            });
        });
    }

    // Generic query method
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Generic run method for INSERT, UPDATE, DELETE
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get single record
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Close database connection
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = new Database();