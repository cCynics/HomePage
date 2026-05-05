// Search Engine URLs
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    github: 'https://github.com/search?q='
};

let currentEngine = 'google';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateGreeting();
    loadNotes();
    fetchBibleVerse();
    fetchWeather();
    setupSearchEngines();
    setupSearch();
    setupNotes();
    
    // Update time every second
    setInterval(updateTime, 1000);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
});

// Time and Date
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Greeting based on time
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 5 && hour < 12) {
        greeting = 'good morning';
    } else if (hour >= 12 && hour < 17) {
        greeting = 'good afternoon';
    } else if (hour >= 17 && hour < 21) {
        greeting = 'good evening';
    } else {
        greeting = 'good night';
    }
    
    document.getElementById('greeting').textContent = `${greeting}, nick`;
}

// Weather (using Open-Meteo — no API key required)
const WMO_CODES = {
    0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy Fog',
    51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
    61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
    71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
    80: 'Showers', 81: 'Rain Showers', 82: 'Heavy Showers',
    85: 'Snow Showers', 86: 'Heavy Snow Showers',
    95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Severe Thunderstorm'
};

async function fetchWeather() {
    const el = document.getElementById('weather');
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=47.6062&longitude=-122.3321&current_weather=true&temperature_unit=fahrenheit`;
        const data = await (await fetch(url)).json();
        const { temperature, weathercode } = data.current_weather;
        const condition = WMO_CODES[weathercode] ?? 'Unknown';
        el.textContent = `${Math.round(temperature)}°F  ${condition}`;
    } catch (error) {
        el.textContent = 'Weather unavailable';
        console.error('Weather fetch error:', error);
    }
}

// Bible Verse (using Bible API)
async function fetchBibleVerse() {
    try {
        const response = await fetch('https://beta.ourmanna.com/api/v1/get/?format=json');
        const data = await response.json();
        
        if (data.verse && data.verse.details) {
            document.getElementById('verse-text').textContent = data.verse.details.text;
            document.getElementById('verse-reference').textContent = data.verse.details.reference;
        }
    } catch (error) {
        document.getElementById('verse-text').textContent = 'Unable to load verse today.';
        document.getElementById('verse-reference').textContent = '';
        console.error('Bible verse fetch error:', error);
    }
}

// Search Engine Toggle
function setupSearchEngines() {
    const buttons = document.querySelectorAll('.engine-btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentEngine = button.dataset.engine;
            document.getElementById('search-input').focus();
        });
    });
}

// Search Form
function setupSearch() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        
        if (query) {
            const searchUrl = searchEngines[currentEngine] + encodeURIComponent(query);
            window.open(searchUrl, '_blank');
            input.value = '';
        }
    });
}

// Notes with localStorage
function setupNotes() {
    const notesTextarea = document.getElementById('notes');
    
    notesTextarea.addEventListener('input', () => {
        localStorage.setItem('homepage-notes', notesTextarea.value);
    });
}

function loadNotes() {
    const saved = localStorage.getItem('homepage-notes');
    if (saved) {
        document.getElementById('notes').value = saved;
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input').focus();
        document.getElementById('search-input').select();
    }
    
    // Ctrl/Cmd + N to focus notes
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('notes').focus();
    }
    
    // Ctrl/Cmd + 1/2/3 to switch search engines
    if ((e.ctrlKey || e.metaKey) && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const engines = ['google', 'duckduckgo', 'github'];
        const index = parseInt(e.key) - 1;
        const button = document.querySelector(`[data-engine="${engines[index]}"]`);
        if (button) button.click();
    }
}