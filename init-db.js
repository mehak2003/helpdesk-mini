const db = require('../database/db');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        await db.init();
        
        // Add some sample data
        console.log('Adding sample data...');
        
        // Sample tickets
        const sampleTickets = [
            {
                id: 'TKT-' + Date.now().toString(36).toUpperCase(),
                title: 'Login issues with the new system',
                description: 'Users are reporting that they cannot log in to the new customer portal. Error message shows "Invalid credentials" even with correct username and password.',
                priority: 'high',
                category: 'technical',
                assignee: 'John Smith',
                sla: 4,
                status: 'open'
            },
            {
                id: 'TKT-' + (Date.now() + 1).toString(36).toUpperCase(),
                title: 'Billing inquiry - Invoice #12345',
                description: 'Customer is questioning charges on their latest invoice. They believe there are duplicate charges for the premium plan.',
                priority: 'medium',
                category: 'billing',
                assignee: 'Sarah Johnson',
                sla: 24,
                status: 'open'
            },
            {
                id: 'TKT-' + (Date.now() + 2).toString(36).toUpperCase(),
                title: 'Feature request - Dark mode',
                description: 'Would like to request a dark mode option for the application. This would be helpful for users who work in low-light environments.',
                priority: 'low',
                category: 'feature-request',
                assignee: 'Unassigned',
                sla: 72,
                status: 'open'
            }
        ];

        for (const ticket of sampleTickets) {
            await db.run(`
                INSERT INTO tickets (id, title, description, priority, category, assignee, sla, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [ticket.id, ticket.title, ticket.description, ticket.priority, ticket.category, ticket.assignee, ticket.sla, ticket.status]);
        }

        // Sample comments
        const sampleComments = [
            {
                id: 'comment-1',
                ticket_id: sampleTickets[0].id,
                text: 'I\'ve reproduced the issue. It seems to be related to the new authentication service. Investigating further.',
                author: 'John Smith'
            },
            {
                id: 'comment-2',
                ticket_id: sampleTickets[0].id,
                text: 'Found the root cause - there\'s a bug in the password hashing function. Working on a fix.',
                author: 'John Smith'
            }
        ];

        for (const comment of sampleComments) {
            await db.run(`
                INSERT INTO comments (id, ticket_id, text, author)
                VALUES (?, ?, ?, ?)
            `, [comment.id, comment.ticket_id, comment.text, comment.author]);
        }

        console.log('✅ Database initialized successfully with sample data');
        console.log(`📊 Created ${sampleTickets.length} sample tickets`);
        console.log(`💬 Created ${sampleComments.length} sample comments`);
        
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;