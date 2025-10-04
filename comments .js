const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

const router = express.Router();

// GET /api/comments/:ticketId - Get all comments for a ticket
router.get('/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        
        // Check if ticket exists
        const ticket = await db.get('SELECT id FROM tickets WHERE id = ?', [ticketId]);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const comments = await db.query(`
            SELECT * FROM comments 
            WHERE ticket_id = ? 
            ORDER BY created_at ASC
        `, [ticketId]);
        
        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// POST /api/comments - Add comment to ticket
router.post('/', async (req, res) => {
    try {
        const { ticketId, text, author } = req.body;
        
        // Validation
        if (!ticketId || !text || !author) {
            return res.status(400).json({ 
                error: 'Ticket ID, text, and author are required' 
            });
        }
        
        // Check if ticket exists
        const ticket = await db.get('SELECT id FROM tickets WHERE id = ?', [ticketId]);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        const id = uuidv4();
        
        const result = await db.run(`
            INSERT INTO comments (id, ticket_id, text, author)
            VALUES (?, ?, ?, ?)
        `, [id, ticketId, text, author]);
        
        // Fetch the created comment
        const newComment = await db.get('SELECT * FROM comments WHERE id = ?', [id]);
        
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
});

// PUT /api/comments/:id - Update comment
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        
        // Check if comment exists
        const existingComment = await db.get('SELECT * FROM comments WHERE id = ?', [id]);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        await db.run(`
            UPDATE comments 
            SET text = ?, created_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [text, id]);
        
        // Fetch updated comment
        const updatedComment = await db.get('SELECT * FROM comments WHERE id = ?', [id]);
        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if comment exists
        const existingComment = await db.get('SELECT * FROM comments WHERE id = ?', [id]);
        if (!existingComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        await db.run('DELETE FROM comments WHERE id = ?', [id]);
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;