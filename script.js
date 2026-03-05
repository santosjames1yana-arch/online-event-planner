// ============================================
// EVENT PLANNER APPLICATION
// ============================================

// ============================================
// DATA MANAGEMENT
// ============================================

class EventManager {
    constructor() {
        this.events = this.loadEvents();
        this.init();
    }

    // Load events from localStorage
    loadEvents() {
        const stored = localStorage.getItem('eventPlannerEvents');
        return stored ? JSON.parse(stored) : [];
    }

    // Save events to localStorage
    saveEvents() {
        localStorage.setItem('eventPlannerEvents', JSON.stringify(this.events));
    }

    // Add new event
    addEvent(eventData) {
        const event = {
            id: Date.now().toString(),
            ...eventData,
            createdAt: new Date().toISOString()
        };
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    // Get event by ID
    getEventById(id) {
        return this.events.find(event => event.id === id);
    }

    // Update event
    updateEvent(id, updates) {
        const index = this.events.findIndex(event => event.id === id);
        if (index !== -1) {
            this.events[index] = { ...this.events[index], ...updates };
            this.saveEvents();
            return this.events[index];
        }
        return null;
    }

    // Delete event
    deleteEvent(id) {
        this.events = this.events.filter(event => event.id !== id);
        this.saveEvents();
    }

    // Get upcoming events (sorted by date)
    getUpcomingEvents(limit = null) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = this.events
            .filter(event => new Date(event.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return limit ? upcoming.slice(0, limit) : upcoming;
    }

    // Get events by date
    getEventsByDate(date) {
        const dateStr = new Date(date).toISOString().split('T')[0];
        return this.events.filter(event => event.date === dateStr);
    }

    // Get events by category
    getEventsByCategory(category) {
        if (!category) return this.events;
        return this.events.filter(event => event.category === category);
    }

    init() {
        // Add sample events if none exist
        if (this.events.length === 0) {
            this.addSampleEvents();
        }
    }

    addSampleEvents() {
        const today = new Date();
        const sampleEvents = [
            {
                name: 'Team Meeting',
                date: this.getDateString(today, 3),
                time: '10:00',
                location: 'Conference Room A',
                category: 'meeting',
                description: 'Quarterly review and planning session with the team.',
                guests: 'John Doe, Jane Smith, Mike Johnson'
            },
            {
                name: 'Sarah\'s Birthday Party',
                date: this.getDateString(today, 7),
                time: '18:00',
                location: 'Central Park',
                category: 'birthday',
                description: 'Birthday celebration for Sarah. Bring gifts and get ready for fun!',
                guests: 'Friends and family'
            },
            {
                name: 'Math Class',
                date: this.getDateString(today, 1),
                time: '14:00',
                location: 'Room 205',
                category: 'school',
                description: 'Regular mathematics class session.',
                guests: 'Class students'
            },
            {
                name: 'Company Event',
                date: this.getDateString(today, 10),
                time: '19:00',
                location: 'Downtown Hotel',
                category: 'party',
                description: 'Annual company celebration and networking event.',
                guests: 'All employees'
            }
        ];

        sampleEvents.forEach(event => this.addEvent(event));
    }

    getDateString(date, daysOffset) {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + daysOffset);
        return newDate.toISOString().split('T')[0];
    }
}

// Initialize event manager
const eventManager = new EventManager();

// ============================================
// UI UTILITIES
// ============================================

// Format date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, options);
}

// Format time
function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Get category emoji
function getCategoryEmoji(category) {
    const emojis = {
        birthday: '🎂',
        meeting: '💼',
        school: '🎓',
        party: '🎉',
        other: '📅'
    };
    return emojis[category] || '📅';
}

// ============================================
// NAVIGATION & HAMBURGER MENU
// ============================================

function setupNavigation() {
    const hamburger = document.getElementById('hamburger');
    if (!hamburger) return;

    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Update active link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// HOME PAGE
// ============================================

function setupHomePage() {
    const upcomingEventsGrid = document.getElementById('upcomingEventsGrid');
    if (!upcomingEventsGrid) return;

    const upcomingEvents = eventManager.getUpcomingEvents(3);

    if (upcomingEvents.length === 0) {
        upcomingEventsGrid.innerHTML = `
            <div class="empty-state">
                <p>No upcoming events yet.</p>
                <a href="create-event.html" class="btn btn-secondary">Create an Event</a>
            </div>
        `;
        return;
    }

    upcomingEventsGrid.innerHTML = upcomingEvents.map(event => createEventCard(event)).join('');
}

// Create event card HTML
function createEventCard(event) {
    const emoji = getCategoryEmoji(event.category);
    return `
        <div class="event-card">
            <div class="event-card-header">
                <h3>${emoji} ${event.name}</h
