# Database Setup Guide for HelpDesk Mini

This guide shows you how to connect your HelpDesk Mini application to various databases.

## 🚀 Quick Start (SQLite - Default)

The application comes with SQLite configured by default, which requires no additional setup.

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```

### 3. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🐘 PostgreSQL Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE helpdesk;
CREATE USER helpdesk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE helpdesk TO helpdesk_user;
\q
```

### 3. Update Configuration
Create a `.env` file:
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=helpdesk
DB_USER=helpdesk_user
DB_PASSWORD=your_password
```

### 4. Install PostgreSQL Driver
```bash
npm install pg
```

### 5. Update Database Connection
Modify `database/db.js` to use PostgreSQL instead of SQLite.

## 🐬 MySQL Setup

### 1. Install MySQL
```bash
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS with Homebrew
brew install mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database
```bash
mysql -u root -p
CREATE DATABASE helpdesk;
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON helpdesk.* TO 'helpdesk_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Update Configuration
Create a `.env` file:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=helpdesk
DB_USER=helpdesk_user
DB_PASSWORD=your_password
```

### 4. Install MySQL Driver
```bash
npm install mysql2
```

## 🐳 Docker Setup

### 1. Using Docker Compose (Recommended)
```bash
# Start the application with SQLite
docker-compose up -d

# Or with PostgreSQL
# Uncomment the postgres service in docker-compose.yml
docker-compose up -d
```

### 2. Using Docker
```bash
# Build the image
docker build -t helpdesk-mini .

# Run the container
docker run -p 3000:3000 helpdesk-mini
```

## 🔧 Database Schema

### Tickets Table
```sql
CREATE TABLE tickets (
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
);
```

### Comments Table
```sql
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
);
```

## 🔄 Migration from localStorage

If you have existing data in localStorage, you can migrate it to the database:

### 1. Export Data from Browser
```javascript
// Run this in browser console
const tickets = JSON.parse(localStorage.getItem('helpdesk_tickets') || '[]');
console.log(JSON.stringify(tickets, null, 2));
```

### 2. Import to Database
Create a migration script to import the data into your chosen database.

## 🚀 Deployment Options

### 1. Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### 2. Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### 3. DigitalOcean App Platform
- Connect your GitHub repository
- Set environment variables
- Deploy automatically

### 4. AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Or use serverless functions (Lambda, Cloud Functions, Azure Functions)

## 🔍 Database Monitoring

### SQLite
```bash
# View database file
sqlite3 database/helpdesk.db
.tables
.schema tickets
SELECT * FROM tickets;
```

### PostgreSQL
```bash
psql -U helpdesk_user -d helpdesk
\dt
\d tickets
SELECT * FROM tickets;
```

### MySQL
```bash
mysql -u helpdesk_user -p helpdesk
SHOW TABLES;
DESCRIBE tickets;
SELECT * FROM tickets;
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Ensure database server is running
   - Verify network connectivity

2. **Permission Denied**
   - Check database user permissions
   - Verify file system permissions

3. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:3000 | xargs kill -9`

4. **Migration Issues**
   - Check database schema compatibility
   - Verify data types and constraints

### Performance Optimization

1. **Add Indexes**
   ```sql
   CREATE INDEX idx_tickets_status ON tickets(status);
   CREATE INDEX idx_tickets_priority ON tickets(priority);
   CREATE INDEX idx_tickets_assignee ON tickets(assignee);
   ```

2. **Connection Pooling**
   - Configure connection pool size
   - Set appropriate timeouts

3. **Query Optimization**
   - Use EXPLAIN to analyze queries
   - Add appropriate WHERE clauses

## 📊 Backup and Recovery

### SQLite
```bash
# Backup
cp database/helpdesk.db backup/helpdesk-$(date +%Y%m%d).db

# Restore
cp backup/helpdesk-20231201.db database/helpdesk.db
```

### PostgreSQL
```bash
# Backup
pg_dump -U helpdesk_user helpdesk > backup/helpdesk-$(date +%Y%m%d).sql

# Restore
psql -U helpdesk_user helpdesk < backup/helpdesk-20231201.sql
```

### MySQL
```bash
# Backup
mysqldump -u helpdesk_user -p helpdesk > backup/helpdesk-$(date +%Y%m%d).sql

# Restore
mysql -u helpdesk_user -p helpdesk < backup/helpdesk-20231201.sql
```

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use strong passwords
   - Rotate credentials regularly

2. **Database Security**
   - Use SSL connections
   - Restrict database access
   - Regular security updates

3. **API Security**
   - Implement authentication
   - Add rate limiting
   - Validate input data

---

For more help, check the main README.md or create an issue in the repository.