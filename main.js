// XSearch Pro - Main JavaScript File
// Advanced X.COM Search Builder Functionality

// Global state management
let searchState = {
    term: '',
    parameters: [],
    history: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    templates: [
        {
            name: 'Viral Content',
            description: 'Find highly engaging content with minimum interactions',
            parameters: ['min_faves:50', 'min_retweets:10', '-filter:links']
        },
        {
            name: 'News Monitoring',
            description: 'Track breaking news and current events',
            parameters: ['min_faves:5', 'min_retweets:2', '-filter:replies', 'since:2024-01-01']
        },
        {
            name: 'Expert Opinions',
            description: 'Find insights from verified accounts',
            parameters: ['min_faves:20', 'filter:verified', '-filter:replies']
        }
    ]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupAnimations();
    loadSearchHistory();
    loadSelectedTemplate();
    updateURL();
});

// App initialization
function initializeApp() {
    // Initialize typed text animation
    if (document.getElementById('typed-text')) {
        new Typed('#typed-text', {
            strings: [
                'Search Builder',
                'Research Tool',
                'Analytics Platform',
                'Search Optimizer'
            ],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize search count
    updateSearchCount();
}

// Event listeners setup
function setupEventListeners() {
    // Search term input
    const searchTermInput = document.getElementById('search-term');
    if (searchTermInput) {
        searchTermInput.addEventListener('input', function() {
            searchState.term = this.value;
            updateURL();
        });
    }
    
    // Demo search input
    const demoSearchInput = document.getElementById('demo-search');
    if (demoSearchInput) {
        demoSearchInput.addEventListener('input', function() {
            updateDemoURL(this.value);
        });
    }
}

// Animation setup
function setupAnimations() {
    // Animate feature cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuart',
                    delay: anime.stagger(100)
                });
            }
        });
    }, observerOptions);
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
    
    // Animate navigation on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const nav = document.querySelector('nav');
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            nav.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });
}

// Parameter management
function addParameter(paramType) {
    let paramValue = '';
    
    // Handle different parameter types
    switch(paramType) {
        case 'min_faves':
            paramValue = prompt('Enter minimum likes:', '10') || '10';
            paramValue = `min_faves:${paramValue}`;
            break;
        case 'min_retweets':
            paramValue = prompt('Enter minimum retweets:', '5') || '5';
            paramValue = `min_retweets:${paramValue}`;
            break;
        case 'min_replies':
            paramValue = prompt('Enter minimum replies:', '2') || '2';
            paramValue = `min_replies:${paramValue}`;
            break;
        case 'from:':
            paramValue = prompt('Enter username (without @):', 'username') || 'username';
            paramValue = `from:${paramValue}`;
            break;
        case 'to:':
            paramValue = prompt('Enter username (without @):', 'username') || 'username';
            paramValue = `to:${paramValue}`;
            break;
        case '@':
            paramValue = prompt('Enter username (without @):', 'username') || 'username';
            paramValue = `@${paramValue}`;
            break;
        case 'since:':
            paramValue = prompt('Enter start date (YYYY-MM-DD):', '2024-01-01') || '2024-01-01';
            paramValue = `since:${paramValue}`;
            break;
        case 'until:':
            paramValue = prompt('Enter end date (YYYY-MM-DD):', '2024-12-31') || '2024-12-31';
            paramValue = `until:${paramValue}`;
            break;
        default:
            paramValue = paramType;
    }
    
    if (paramValue && !searchState.parameters.includes(paramValue)) {
        searchState.parameters.push(paramValue);
        updateParameterChips();
        updateURL();
        
        // Animate new chip
        const chipsContainer = document.getElementById('parameter-chips');
        const newChip = chipsContainer.lastElementChild;
        if (newChip) {
            anime({
                targets: newChip,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutBack'
            });
        }
    }
}

// Remove parameter
function removeParameter(param) {
    const index = searchState.parameters.indexOf(param);
    if (index > -1) {
        searchState.parameters.splice(index, 1);
        updateParameterChips();
        updateURL();
    }
}

// Update parameter chips display
function updateParameterChips() {
    const container = document.getElementById('parameter-chips');
    if (!container) return;
    
    if (searchState.parameters.length === 0) {
        container.innerHTML = '<div class="text-gray-400 text-sm">Click parameters to add them...</div>';
        return;
    }
    
    container.innerHTML = searchState.parameters.map(param => `
        <div class="search-chip">
            ${param}
            <button class="ml-2 hover:text-red-300" onclick="removeParameter('${param}')">×</button>
        </div>
    `).join('');
}

// Clear all parameters
function clearParameters() {
    searchState.parameters = [];
    searchState.term = '';
    
    const searchTermInput = document.getElementById('search-term');
    if (searchTermInput) {
        searchTermInput.value = '';
    }
    
    updateParameterChips();
    updateURL();
    
    // Animate clear action
    anime({
        targets: '#parameter-chips',
        scale: [1, 0.9, 1],
        duration: 300,
        easing: 'easeInOutQuad'
    });
}

// Update URL display
function updateURL() {
    const urlOutput = document.getElementById('url-output');
    if (!urlOutput) return;
    
    let baseURL = 'https://x.com/search?f=live&q=';
    let queryParts = [];
    
    if (searchState.term) {
        queryParts.push(encodeURIComponent(searchState.term));
    }
    
    searchState.parameters.forEach(param => {
        queryParts.push(encodeURIComponent(param));
    });
    
    const finalURL = baseURL + queryParts.join(encodeURIComponent(' '));
    urlOutput.textContent = finalURL;
    
    // Animate URL update
    anime({
        targets: urlOutput,
        backgroundColor: ['rgba(59, 130, 246, 0.1)', 'rgba(0, 0, 0, 0.3)'],
        duration: 500,
        easing: 'easeInOutQuad'
    });
}

// Update demo URL in hero section
function updateDemoURL(searchTerm) {
    const demoURL = `https://x.com/search?f=live&q=${encodeURIComponent(searchTerm || 'breaking')}${encodeURIComponent(' min_faves:10 -filter:links min_retweets:5')}`;
    const urlDisplays = document.querySelectorAll('.url-display');
    
    urlDisplays.forEach(display => {
        if (display.closest('.hero-bg')) {
            display.textContent = demoURL;
        }
    });
}

// Copy URL to clipboard
function copyURL() {
    const urlOutput = document.getElementById('url-output');
    if (!urlOutput) return;
    
    const url = urlOutput.textContent;
    
    navigator.clipboard.writeText(url).then(() => {
        // Show success feedback
        showNotification('URL copied to clipboard!', 'success');
        
        // Save to history
        saveToHistory(url);
        
        // Animate copy button
        const button = event.target;
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            backgroundColor: ['#10b981', '#059669', '#10b981'],
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }).catch(() => {
        showNotification('Failed to copy URL', 'error');
    });
}

// Open search in X.COM
function openSearch() {
    const urlOutput = document.getElementById('url-output');
    if (!urlOutput) return;
    
    const url = urlOutput.textContent;
    
    if (url !== 'https://x.com/search?f=live&q=') {
        window.open(url, '_blank');
        saveToHistory(url);
    } else {
        showNotification('Please add a search term or parameters first', 'warning');
    }
}

// Save search configuration
function saveSearch() {
    const urlOutput = document.getElementById('url-output');
    if (!urlOutput) return;
    
    const url = urlOutput.textContent;
    const name = prompt('Enter a name for this search:');
    
    if (name && url !== 'https://x.com/search?f=live&q=') {
        const savedSearch = {
            name: name,
            url: url,
            term: searchState.term,
            parameters: [...searchState.parameters],
            timestamp: new Date().toISOString()
        };
        
        let savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
        savedSearches.push(savedSearch);
        localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
        
        showNotification('Search saved successfully!', 'success');
    } else if (url === 'https://x.com/search?f=live&q=') {
        showNotification('Please create a search first', 'warning');
    }
}

// Apply template
function applyTemplate() {
    const templateNames = searchState.templates.map(t => t.name);
    const selectedTemplate = prompt(`Choose a template:\n${templateNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nEnter number (1-${templateNames.length}):`);
    
    const index = parseInt(selectedTemplate) - 1;
    if (index >= 0 && index < searchState.templates.length) {
        const template = searchState.templates[index];
        searchState.parameters = [...template.parameters];
        
        // Animate template application
        anime({
            targets: '#parameter-chips',
            opacity: [1, 0, 1],
            duration: 500,
            easing: 'easeInOutQuad',
            complete: () => {
                updateParameterChips();
                updateURL();
            }
        });
        
        showNotification(`Applied template: ${template.name}`, 'success');
    } else if (selectedTemplate !== null) {
        showNotification('Invalid template selection', 'error');
    }
}

// Save to search history
function saveToHistory(url) {
    const search = {
        url: url,
        term: searchState.term,
        parameters: [...searchState.parameters],
        timestamp: new Date().toISOString()
    };
    
    searchState.history.unshift(search);
    
    // Keep only last 50 searches
    if (searchState.history.length > 50) {
        searchState.history = searchState.history.slice(0, 50);
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchState.history));
    updateSearchCount();
}

// Load search history
function loadSearchHistory() {
    updateSearchCount();
}

// Load selected template from templates page
function loadSelectedTemplate() {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    const customizeTemplate = localStorage.getItem('customizeTemplate');
    
    if (selectedTemplate) {
        try {
            const template = JSON.parse(selectedTemplate);
            applyTemplateToBuilder(template);
            localStorage.removeItem('selectedTemplate');
            showNotification(`Applied template: ${template.name}`, 'success');
        } catch (error) {
            console.error('Error loading template:', error);
        }
    }
    
    if (customizeTemplate) {
        try {
            const template = JSON.parse(customizeTemplate);
            applyTemplateToBuilder(template);
            localStorage.removeItem('customizeTemplate');
            showNotification(`Customize template: ${template.name}`, 'info');
        } catch (error) {
            console.error('Error loading template for customization:', error);
        }
    }
}

// Apply template to search builder
function applyTemplateToBuilder(template) {
    // Set search term
    const searchTermInput = document.getElementById('search-term');
    if (searchTermInput) {
        searchTermInput.value = template.searchTerm || '';
        searchState.term = template.searchTerm || '';
    }
    
    // Set parameters
    searchState.parameters = [...template.parameters];
    
    // Update UI
    updateParameterChips();
    updateURL();
    
    // Animate template application
    anime({
        targets: '#parameter-chips',
        scale: [0.9, 1],
        duration: 300,
        easing: 'easeOutBack'
    });
}

// Update search count display
function updateSearchCount() {
    const countElement = document.getElementById('search-count');
    if (countElement) {
        const today = new Date().toDateString();
        const todaySearches = searchState.history.filter(search => 
            new Date(search.timestamp).toDateString() === today
        );
        countElement.textContent = todaySearches.length;
    }
}

// View search history
function viewHistory() {
    if (searchState.history.length === 0) {
        showNotification('No search history yet', 'info');
        return;
    }
    
    const historyHTML = searchState.history.slice(0, 10).map((search, index) => `
        <div class="border-b border-gray-600 pb-3 mb-3 last:border-b-0">
            <div class="text-sm text-gray-300 mb-1">${new Date(search.timestamp).toLocaleString()}</div>
            <div class="text-xs text-gray-400 mb-2 font-mono">${search.url.substring(0, 60)}...</div>
            <div class="text-xs text-gray-500">
                Term: ${search.term || 'None'} | Parameters: ${search.parameters.length}
            </div>
        </div>
    `).join('');
    
    showModal('Search History', historyHTML);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-6 z-50 px-6 py-4 rounded-lg text-white font-medium transform translate-x-full transition-transform duration-300`;
    
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-600');
            break;
        case 'error':
            notification.classList.add('bg-red-600');
            break;
        case 'warning':
            notification.classList.add('bg-amber-600');
            break;
        default:
            notification.classList.add('bg-blue-600');
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Show modal
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    modal.innerHTML = `
        <div class="glass-card rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-white font-semibold text-xl">${title}</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div class="text-gray-300">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate modal in
    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: modal.querySelector('.glass-card'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutBack'
    });
}

// Smooth scroll to search builder
function scrollToSearch() {
    const searchBuilder = document.getElementById('search-builder');
    if (searchBuilder) {
        searchBuilder.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Utility functions
function encodeURIComponent(str) {
    return encodeURI(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

// Export functions for global access
window.addParameter = addParameter;
window.removeParameter = removeParameter;
window.clearParameters = clearParameters;
window.copyURL = copyURL;
window.openSearch = openSearch;
window.saveSearch = saveSearch;
window.applyTemplate = applyTemplate;
window.viewHistory = viewHistory;
window.scrollToSearch = scrollToSearch;
