import config from './config.js';

class ReadmeLoader {
    constructor(owner, repo, element) {
        this.owner = owner;
        this.repo = repo;
        this.element = element;
        this.lastEtag = null;
        this.updateInterval = 5 * 60 * 1000; // Check for updates every 5 minutes
        this.lastUpdatedElement = document.getElementById('last-updated-date');
        this.lastFetchedElement = document.getElementById('last-fetched-date');
    }

    showLoading() {
        this.element.innerHTML = `
            <div class="readme-loading">
                <i class="fas fa-circle-notch fa-spin"></i>
                <p>Loading documentation...</p>
            </div>
        `;
    }

    async init() {
        try {
            this.showLoading();
            await this.loadMarkedLibrary();
            await this.fetchAndRender();
            this.startAutoUpdate();
        } catch (error) {
            console.error('Error initializing documentation:', error);
            this.handleError(error);
        }
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Format the time part
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (days > 30) {
            // For older dates, show full date and time
            const dateStr = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            return `${dateStr} at ${timeStr}`;
        } else if (days > 0) {
            return `${days} day${days === 1 ? '' : 's'} ago at ${timeStr}`;
        } else if (hours > 0) {
            return `${hours} hour${hours === 1 ? '' : 's'} ago at ${timeStr}`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago at ${timeStr}`;
        } else {
            return `just now (${timeStr})`;
        }
    }

    async loadMarkedLibrary() {
        if (window.marked) return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async fetchAndRender() {
        try {
            // Prepare headers with authentication
            const headers = {
                'Accept': 'application/vnd.github.v3.raw+json',
                'Authorization': `Bearer ${config.github.token}`
            };
            if (this.lastEtag) {
                headers['If-None-Match'] = this.lastEtag;
            }

            // Fetch both the README and the commit info
            const [readmeResponse, commitsResponse] = await Promise.all([
                fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/readme`, {
                    headers
                }),
                fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/commits?path=README.md&per_page=1`, {
                    headers
                })
            ]);

            // Update last fetched time
            const fetchTime = new Date();
            this.lastFetchedElement.textContent = this.formatDate(fetchTime);
            // Detailed tooltip format
            this.lastFetchedElement.title = fetchTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });

            // If content hasn't changed, only update the fetch time
            if (readmeResponse.status === 304) return;

            // Store the ETag for future requests
            this.lastEtag = readmeResponse.headers.get('ETag');

            // Get the raw markdown content
            const markdown = await readmeResponse.text();

            // Get the last commit date
            const [lastCommit] = await commitsResponse.json();
            if (lastCommit) {
                const lastUpdateDate = new Date(lastCommit.commit.committer.date);
                this.lastUpdatedElement.textContent = this.formatDate(lastUpdateDate);
                // Detailed tooltip format
                this.lastUpdatedElement.title = lastUpdateDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short'
                });
            }

            // Convert markdown to HTML and render
            const html = marked.parse(markdown);
            this.element.innerHTML = html;

            // Process relative links and images
            this.processLinks();
            
        } catch (error) {
            console.error('Error fetching README:', error);
            this.handleError(error, readmeResponse);
        }
    }

    handleError(error, response = null) {
        let errorMessage = 'Error loading documentation. ';
        
        if (error.message === 'Bad credentials') {
            errorMessage += 'Invalid GitHub token. Please check your configuration.';
        } else if (error.message && error.message.includes('API rate limit exceeded')) {
            errorMessage += 'GitHub API rate limit exceeded. Please try again later.';
        } else if (response && response.status === 404) {
            errorMessage += 'README.md not found in repository.';
        } else if (response && !response.ok) {
            errorMessage += `Server returned ${response.status}. Please try again later.`;
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            errorMessage += 'Network error. Please check your internet connection.';
        } else {
            errorMessage += 'Please try again later.';
        }

        this.element.innerHTML = `
            <div class="readme-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${errorMessage}</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;
    }

    processLinks() {
        const baseUrl = `https://github.com/${this.owner}/${this.repo}/blob/main/`;
        const rawBaseUrl = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/`;

        // Process links
        this.element.querySelectorAll('a').forEach(link => {
            if (link.href.startsWith(window.location.origin)) {
                const path = link.href.slice(window.location.origin.length);
                if (!path.startsWith('http')) {
                    link.href = baseUrl + path;
                }
            }
        });

        // Process images
        this.element.querySelectorAll('img').forEach(img => {
            if (img.src.startsWith(window.location.origin)) {
                const path = img.src.slice(window.location.origin.length);
                if (!path.startsWith('http')) {
                    img.src = rawBaseUrl + path;
                }
            }
        });
    }

    startAutoUpdate() {
        setInterval(() => this.fetchAndRender(), this.updateInterval);
    }
}

// Initialize the README loader when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const readmeContainer = document.getElementById('readme-container');
    if (readmeContainer) {
        const loader = new ReadmeLoader('permissionlesstech', 'bitchat-android', readmeContainer);
        loader.init();
    }
});

// Export the ReadmeLoader class
export default ReadmeLoader;
