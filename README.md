# HelpDesk Mini - Ticket Management System

A modern, responsive HelpDesk application built with HTML, CSS, and JavaScript for managing support tickets, SLA tracking, and comments.

## Features

### 🎫 Ticket Management
- Create, edit, and delete support tickets
- Track ticket status (Open, In Progress, Resolved, Closed)
- Priority levels (Low, Medium, High, Urgent)
- Category classification (Technical, Billing, General, Feature Request)
- Assign tickets to team members

### ⏰ SLA (Service Level Agreement) Tracking
- Configurable SLA hours per ticket
- Real-time SLA status monitoring
- Overdue ticket identification
- Visual indicators for SLA status

### 💬 Comments System
- Add comments to tickets
- Track comment history with timestamps
- Author attribution for comments

### 📊 Dashboard & Analytics
- Real-time statistics dashboard
- Ticket count by status
- Overdue ticket tracking
- Visual data representation

### 🔍 Search & Filtering
- Search tickets by title, description, or ID
- Filter by status and priority
- Clear filters functionality

### 📱 Responsive Design
- Mobile-first approach
- Responsive grid and list views
- Touch-friendly interface
- Cross-device compatibility

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation

1. **Clone or download the project files**
   ```bash
   git clone <repository-url>
   cd helpdesk-mini
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Start using the application**
   - The application will load with sample data
   - Create new tickets using the "New Ticket" button
   - View and manage existing tickets

## Usage

### Creating a Ticket
1. Click the "New Ticket" button
2. Fill in the required fields:
   - Title (required)
   - Description (required)
   - Priority (required)
   - Category
   - Assignee
   - SLA hours
3. Click "Save Ticket"

### Managing Tickets
- **View Details**: Click on any ticket to view full details
- **Edit**: Use the "Edit" button to modify ticket information
- **Resolve**: Mark tickets as resolved when completed
- **Add Comments**: Use the comments section to add updates

### Filtering and Search
- Use the search bar to find tickets by content
- Apply status and priority filters
- Toggle between list and grid views
- Clear all filters when needed

## File Structure

```
helpdesk-mini/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and responsive design
├── script.js           # JavaScript application logic
└── README.md           # Project documentation
```

## Technical Details

### Data Storage
- Uses browser's localStorage for data persistence
- No server-side database required
- Data persists between browser sessions

### Browser Compatibility
- Modern browsers with ES6+ support
- LocalStorage support required
- CSS Grid and Flexbox support recommended

### Performance
- Client-side rendering for fast interactions
- Efficient DOM manipulation
- Minimal external dependencies

## Customization

### Adding New Ticket Categories
Edit the category select options in `index.html`:
```html
<select id="ticketCategory">
    <option value="technical">Technical</option>
    <option value="billing">Billing</option>
    <option value="general">General</option>
    <option value="feature-request">Feature Request</option>
    <option value="your-category">Your Category</option>
</select>
```

### Modifying SLA Defaults
Change the default SLA value in `script.js`:
```javascript
sla: parseInt(ticketData.sla) || 24, // Change 24 to your default
```

### Styling Customization
- Modify `styles.css` for visual changes
- CSS custom properties for easy theming
- Responsive breakpoints can be adjusted

## Deployment Options

### Static Hosting
- **GitHub Pages**: Push to GitHub and enable Pages
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your GitHub repository
- **Surge.sh**: `npm install -g surge && surge`

### Local Development
- Use any local web server
- Live reload for development
- Browser developer tools for debugging

## Future Enhancements

### Potential Features
- [ ] User authentication and roles
- [ ] Email notifications
- [ ] File attachments
- [ ] Advanced reporting
- [ ] API integration
- [ ] Multi-language support
- [ ] Ticket templates
- [ ] Automated workflows

### Backend Integration
- [ ] Node.js/Express API
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time updates with WebSockets
- [ ] User management system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



## Support

For questions or issues:
- Create an issue in the repository
- Check the documentation
- Review the code comments

---

**HelpDesk Mini** - A simple yet powerful ticket management solution for small to medium teams.
