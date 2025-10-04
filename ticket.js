const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

const router = express.Router();

// GET /api/tickets - Get all tickets with optional filtering
router.get('/', async (req, res) => {
    try {
        const { status, priority, search, assignee } = req.query;
        
        let sql = `
            SELECT t.*, 
                   COUNT(c.id) as comment_count,
                   CASE 
                       WHEN t.status IN ('resolved', 'closed') THEN 'Completed'
                       WHEN (julianday('now') - julianday(t.created_at)) * 24 > t.sla THEN 'Overdue'
                       WHEN (julianday('now') - julianday(t.created_at)) * 24 > (t.sla - 2) THEN 'Due Soon'
                       ELSE printf('%.0fh remaining', t.sla - (julianday('now') - julianday(t.created_at)) * 24)
                   END as sla_status
            FROM tickets t
            LEFT JOIN comments c ON t.id = c.ticket_id
        `;
        
        const conditions = [];
        const params = [];
        
        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }
        
        if (priority) {
            conditions.push('t.priority = ?');
            params.push(priority);
        }
        
        if (assignee) {
            conditions.push('t.assignee = ?');
            params.push(assignee);
        }
        
        if (search) {
            conditions.push('(t.title LIKE ? OR t.description LIKE ? OR t.id LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' GROUP BY t.id ORDER BY t.created_at DESC';
        
        const tickets = await db.query(sql, params);
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// GET /api/tickets/:id - Get single ticket with comments
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get ticket details
        const ticket = await db.get(`
            SELECT *, 
                   CASE 
                       WHEN status IN ('resolved', 'closed') THEN 'Completed'
                       WHEN (julianday('now') - julianday(created_at)) * 24 > sla THEN 'Overdue'
                       WHEN (julianday('now') - julianday(created_at)) * 24 > (sla - 2) THEN 'Due Soon'
                       ELSE printf('%.0fh remaining', sla - (julianday('now') - julianday(created_at)) * 24)
                   END as sla_status
            FROM tickets 
            WHERE id = ?
        `, [id]);
        
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Get comments for this ticket
        const comments = await db.query(`
            SELECT * FROM comments 
            WHERE ticket_id = ? 
            ORDER BY created_at ASC
        `, [id]);
        
        res.json({ ...ticket, comments });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
});

// POST /api/tickets - Create new ticket
router.post('/', async (req, res) => {
    try {
        const { title, description, priority, category, assignee, sla } = req.body;
        
        // Validation
        if (!title || !description || !priority) {
            return res.status(400).json({ 
                error: 'Title, description, and priority are required' 
            });
        }
        
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ 
                error: 'Invalid priority. Must be one of: ' + validPriorities.join(', ') 
            });
        }
        
        const id = 'TKT-' + Date.now().toString(36).toUpperCase();
        const slaHours = parseInt(sla) || 24;
        
        const result = await db.run(`
            INSERT INTO tickets (id, title, description, priority, category, assignee, sla)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, title, description, priority, category || 'general', assignee || 'Unassigned', slaHours]);
        
        // Fetch the created ticket
        const newTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
        
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// PUT /api/tickets/:id - Update ticket
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, priority, category, assignee, sla, status } = req.body;
        
        // Check if ticket exists
        const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (priority !== undefined) {
            updates.push('priority = ?');
            params.push(priority);
        }
        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }
        if (assignee !== undefined) {
            updates.push('assignee = ?');
            params.push(assignee);
        }
        if (sla !== undefined) {
            updates.push('sla = ?');
            params.push(parseInt(sla));
        }
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);
        
        await db.run(`
            UPDATE tickets 
            SET ${updates.join(', ')} 
            WHERE id = ?
        `, params);
        
        // Fetch updated ticket
        const updatedTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
        res.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// DELETE /api/tickets/:id - Delete ticket
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if ticket exists
        const existingTicket = await db.get('SELECT * FROM tickets WHERE id = ?', [id]);
        if (!existingTicket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Delete ticket (comments will be deleted automatically due to CASCADE)
        await db.run('DELETE FROM tickets WHERE id = ?', [id]);
        
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// GET /api/tickets/stats/dashboard - Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
                SUM(CASE WHEN status IN ('open', 'in-progress') AND 
                    (julianday('now') - julianday(created_at)) * 24 > sla THEN 1 ELSE 0 END) as overdue
            FROM tickets
        `);
        
        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;