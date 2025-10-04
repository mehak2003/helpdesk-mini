// HelpDesk Mini - JavaScript Application with API Integration
class HelpDeskApp {
    constructor() {
        this.apiBaseUrl = '/api';
        this.currentView = 'list';
        this.currentTicketId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTickets();
        this.loadStats();
    }

    // API Helper Methods
    async apiCall(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showError(error.message);
            throw error;
        }
    }

    // Loading and Error Handling
    showLoading(show = true) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        // Simple error notification - you could enhance this with a proper notification system
        alert(`Error: ${message}`);
    }

    // Ticket Management
    async loadTickets() {
        try {
            this.showLoading(true);
            const tickets = await this.apiCall('/tickets');
            this.renderTickets(tickets);
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        try {
            const stats = await this.apiCall('/tickets/stats/dashboard');
            this.updateStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async createTicket(ticketData) {
        try {
            this.showLoading(true);
            const ticket = await this.apiCall('/tickets', {
                method: 'POST',
                body: JSON.stringify(ticketData)
            });
            
            await this.loadTickets();
            await this.loadStats();
            return ticket;
        } catch (error) {
            console.error('Failed to create ticket:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async updateTicket(ticketId, updates) {
        try {
            this.showLoading(true);
            const ticket = await this.apiCall(`/tickets/${ticketId}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
            
            await this.loadTickets();
            await this.loadStats();
            return ticket;
        } catch (error) {
            console.error('Failed to update ticket:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async deleteTicket(ticketId) {
        try {
            this.showLoading(true);
            await this.apiCall(`/tickets/${ticketId}`, {
                method: 'DELETE'
            });
            
            await this.loadTickets();
            await this.loadStats();
        } catch (error) {
            console.error('Failed to delete ticket:', error);
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async getTicketDetails(ticketId) {
        try {
            const ticket = await this.apiCall(`/tickets/${ticketId}`);
            return ticket;
        } catch (error) {
            console.error('Failed to get ticket details:', error);
            throw error;
        }
    }

    // Comments Management
    async addComment(ticketId, commentText, author = 'Admin User') {
        try {
            const comment = await this.apiCall('/comments', {
                method: 'POST',
                body: JSON.stringify({
                    ticketId: ticketId,
                    text: commentText,
                    author: author
                })
            });
            
            // Refresh comments in the details modal if it's open
            if (this.currentTicketId === ticketId) {
                await this.loadTicketDetails(ticketId);
            }
            
            return comment;
        } catch (error) {
            console.error('Failed to add comment:', error);
            throw error;
        }
    }

    async loadComments(ticketId) {
        try {
            const comments = await this.apiCall(`/comments/${ticketId}`);
            return comments;
        } catch (error) {
            console.error('Failed to load comments:', error);
            throw error;
        }
    }

    // Rendering Methods
    renderTickets(tickets) {
        const container = document.getElementById('ticketsContainer');
        
        if (tickets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No tickets found</h3>
                    <p>Create your first ticket to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tickets.map(ticket => this.renderTicketCard(ticket)).join('');
    }

    renderTicketCard(ticket) {
        const isOverdue = ticket.sla_status === 'Overdue';
        
        return `
            <div class="ticket-card ${isOverdue ? 'overdue' : ''}" onclick="app.openTicketDetails('${ticket.id}')">
                <div class="ticket-header">
                    <div>
                        <div class="ticket-title">${ticket.title}</div>
                        <div class="ticket-id">${ticket.id}</div>
                    </div>
                    <div class="ticket-badges">
                        <span class="status-badge ${ticket.status}">${ticket.status.replace('-', ' ')}</span>
                        <span class="priority-badge ${ticket.priority}">${ticket.priority}</span>
                    </div>
                </div>
                <div class="ticket-meta">
                    <div><strong>Assignee:</strong> ${ticket.assignee}</div>
                    <div><strong>Category:</strong> ${ticket.category}</div>
                    <div><strong>Created:</strong> ${this.formatDate(ticket.created_at)}</div>
                    <div><strong>SLA:</strong> ${ticket.sla_status}</div>
                </div>
                <div class="ticket-description">
                    ${ticket.description.length > 100 ? ticket.description.substring(0, 100) + '...' : ticket.description}
                </div>
                <div class="ticket-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); app.openTicketDetails('${ticket.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="event.stopPropagation(); app.editTicket('${ticket.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${ticket.status !== 'resolved' ? `
                        <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); app.resolveTicket('${ticket.id}')">
                            <i class="fas fa-check"></i> Resolve
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async loadTicketDetails(ticketId) {
        try {
            const ticket = await this.getTicketDetails(ticketId);
            this.currentTicketId = ticketId;
            
            // Populate ticket details
            document.getElementById('detailsTicketId').textContent = ticket.id;
            document.getElementById('detailsTicketTitle').textContent = ticket.title;
            document.getElementById('detailsStatus').textContent = ticket.status.replace('-', ' ');
            document.getElementById('detailsStatus').className = `status-badge ${ticket.status}`;
            document.getElementById('detailsPriority').textContent = ticket.priority;
            document.getElementById('detailsPriority').className = `priority-badge ${ticket.priority}`;
            document.getElementById('detailsCreatedAt').textContent = this.formatDate(ticket.created_at);
            document.getElementById('detailsAssignee').textContent = ticket.assignee;
            document.getElementById('detailsSLA').textContent = ticket.sla_status;
            document.getElementById('detailsCategory').textContent = ticket.category;
            document.getElementById('detailsDescription').textContent = ticket.description;

            // Render comments
            this.renderComments(ticket.comments || []);
        } catch (error) {
            console.error('Failed to load ticket details:', error);
            this.showError('Failed to load ticket details');
        }
    }

    renderComments(comments) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;

        if (comments.length === 0) {
            commentsList.innerHTML = '<p style="color: #6b7280; font-style: italic;">No comments yet</p>';
            return;
        }

        commentsList.innerHTML = comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${this.formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">${comment.text}</div>
            </div>
        `).join('');
    }

    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    updateStats(stats) {
        document.getElementById('totalTickets').textContent = stats.total || 0;
        document.getElementById('openTickets').textContent = stats.open || 0;
        document.getElementById('resolvedTickets').textContent = stats.resolved || 0;
        document.getElementById('overdueTickets').textContent = stats.overdue || 0;
    }

    // Modal Management
    openCreateTicketModal() {
        document.getElementById('modalTitle').textContent = 'Create New Ticket';
        document.getElementById('ticketForm').reset();
        document.getElementById('ticketSLA').value = '24';
        this.currentTicketId = null;
        this.showModal('ticketModal');
    }

    async editTicket(ticketId) {
        try {
            const ticket = await this.getTicketDetails(ticketId);
            
            document.getElementById('modalTitle').textContent = 'Edit Ticket';
            document.getElementById('ticketTitle').value = ticket.title;
            document.getElementById('ticketDescription').value = ticket.description;
            document.getElementById('ticketPriority').value = ticket.priority;
            document.getElementById('ticketCategory').value = ticket.category;
            document.getElementById('ticketAssignee').value = ticket.assignee;
            document.getElementById('ticketSLA').value = ticket.sla;
            
            this.currentTicketId = ticketId;
            this.showModal('ticketModal');
        } catch (error) {
            this.showError('Failed to load ticket for editing');
        }
    }

    async openTicketDetails(ticketId) {
        await this.loadTicketDetails(ticketId);
        this.showModal('ticketDetailsModal');
    }

    closeModal() {
        this.hideModal('ticketModal');
    }

    closeDetailsModal() {
        this.hideModal('ticketDetailsModal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        modal.style.display = 'none';
    }

    // Event Handlers
    setupEventListeners() {
        // Form submission
        document.getElementById('ticketForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTicketSubmit();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', () => {
            this.loadTickets();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.loadTickets();
        });

        document.getElementById('priorityFilter').addEventListener('change', () => {
            this.loadTickets();
        });

        // Modal close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    }

    async handleTicketSubmit() {
        const submitButton = document.querySelector('#ticketForm button[type="submit"]');
        const submitText = document.getElementById('submitButtonText');
        const submitSpinner = document.getElementById('submitSpinner');
        
        // Show loading state
        submitButton.disabled = true;
        submitText.style.display = 'none';
        submitSpinner.style.display = 'inline-block';

        try {
            const formData = {
                title: document.getElementById('ticketTitle').value,
                description: document.getElementById('ticketDescription').value,
                priority: document.getElementById('ticketPriority').value,
                category: document.getElementById('ticketCategory').value,
                assignee: document.getElementById('ticketAssignee').value,
                sla: document.getElementById('ticketSLA').value
            };

            if (this.currentTicketId) {
                await this.updateTicket(this.currentTicketId, formData);
            } else {
                await this.createTicket(formData);
            }

            this.closeModal();
        } catch (error) {
            // Error is already handled in the API call
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitText.style.display = 'inline';
            submitSpinner.style.display = 'none';
        }
    }

    // Action Methods
    async addComment() {
        const commentText = document.getElementById('newComment').value.trim();
        if (!commentText || !this.currentTicketId) return;

        try {
            await this.addComment(this.currentTicketId, commentText);
            document.getElementById('newComment').value = '';
        } catch (error) {
            // Error is already handled in the API call
        }
    }

    async resolveTicket() {
        if (!this.currentTicketId) return;
        
        try {
            await this.updateTicket(this.currentTicketId, { status: 'resolved' });
            this.closeDetailsModal();
        } catch (error) {
            // Error is already handled in the API call
        }
    }

    // View Toggle
    toggleView(view) {
        this.currentView = view;
        const container = document.getElementById('ticketsContainer');
        
        if (view === 'grid') {
            container.classList.add('grid');
        } else {
            container.classList.remove('grid');
        }

        // Update button states
        document.querySelectorAll('.view-toggle .btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('priorityFilter').value = '';
        this.loadTickets();
    }
}

// Global functions for HTML onclick handlers
function openCreateTicketModal() {
    app.openCreateTicketModal();
}

function closeModal() {
    app.closeModal();
}

function closeDetailsModal() {
    app.closeDetailsModal();
}

function addComment() {
    app.addComment();
}

function editTicket() {
    if (app.currentTicketId) {
        app.editTicket(app.currentTicketId);
        app.closeDetailsModal();
    }
}

function resolveTicket() {
    app.resolveTicket();
}

function toggleView(view) {
    app.toggleView(view);
}

function clearFilters() {
    app.clearFilters();
}

// Initialize the application
const app = new HelpDeskApp();