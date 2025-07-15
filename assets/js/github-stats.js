import config from './config.js';

// GitHub repository statistics
const repoStats = {
    owner: 'permissionlesstech',
    repo: 'bitchat-android',
    async fetchStats() {
        try {
            const token = config.github.token;
            if (!token || token === 'YOUR_GITHUB_TOKEN_HERE') {
                throw new Error('GitHub token is not configured. Please copy config.template.js to config.js and add your token');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            // Fetch basic repository info
            const repoResponse = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}`, { headers })
                .catch(err => {
                    throw new Error('Network error while connecting to GitHub API. Please check your internet connection.');
                });
            const repoData = await repoResponse.json();

            if (!repoResponse.ok) {
                if (repoData.message === "Bad credentials") {
                    throw new Error("Invalid GitHub token. Please check your configuration.");
                } else if (repoData.message?.includes("API rate limit exceeded")) {
                    throw new Error("GitHub API rate limit exceeded. Please try again later or use an authentication token.");
                } else {
                    throw new Error(`Failed to fetch repo data: ${repoData.message}`);
                }
            }

            // Fetch all contributors
            const contributorsResponse = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/contributors`, { headers });
            const contributorsData = await contributorsResponse.json();

            if (!contributorsResponse.ok) {
                throw new Error(`Failed to fetch contributors: ${contributorsData.message}`);
            }

            // Fetch commit count
            const commitsResponse = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/commits?per_page=1`, { headers });
            const commitCount = commitsResponse.headers.get('Link') ? 
                this.extractTotalCount(commitsResponse.headers.get('Link')) : 
                (await commitsResponse.json()).length;

            // Update statistics in the UI
            this.updateStatistics({
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                watchers: repoData.subscribers_count,
                commits: commitCount,
                contributors: contributorsData.length,
                issues: repoData.open_issues_count
            });

        } catch (error) {
            console.error('Error fetching repository statistics:', error);
            this.showError(error.message);
        }
    },

    extractTotalCount(linkHeader) {
        const matches = linkHeader.match(/page=(\d+)>; rel="last"/);
        return matches ? parseInt(matches[1]) : 0;
    },

    updateStatistics(stats) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="stats-card">
                <i class="fas fa-users"></i>
                <div class="stats-info">
                    <h4>Contributors</h4>
                    <div class="stats-value">${stats.contributors}</div>
                </div>
            </div>
            <div class="stats-card">
                <i class="fas fa-code-branch"></i>
                <div class="stats-info">
                    <h4>Forks</h4>
                    <div class="stats-value">${stats.forks}</div>
                </div>
            </div>
            <div class="stats-card">
                <i class="fas fa-eye"></i>
                <div class="stats-info">
                    <h4>Watchers</h4>
                    <div class="stats-value">${stats.watchers}</div>
                </div>
            </div>
            <div class="stats-card">
                <i class="fas fa-star"></i>
                <div class="stats-info">
                    <h4>Stars</h4>
                    <div class="stats-value">${stats.stars}</div>
                </div>
            </div>
            <div class="stats-card">
                <i class="fas fa-code-commit"></i>
                <div class="stats-info">
                    <h4>Commits</h4>
                    <div class="stats-value">${stats.commits}</div>
                </div>
            </div>
            <div class="stats-card">
                <i class="fas fa-exclamation-circle"></i>
                <div class="stats-info">
                    <h4>Open Issues</h4>
                    <div class="stats-value">${stats.issues}</div>
                </div>
            </div>
        `;
    },

    showError(message) {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        // Update the stats grid with error message
        statsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="error-message">
                    <h4>Failed to load statistics</h4>
                    <p>${message}</p>
                    <small>Check the browser console for more details</small>
                </div>
                <button class="retry-btn" onclick="window.repoStats.fetchStats()">
                    <i class="fas fa-sync"></i> Retry
                </button>
            </div>
        `;

        // Also update the readme container if it exists
        const readmeContainer = document.getElementById('readme-container');
        if (readmeContainer) {
            readmeContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="error-message">
                        <h4>Error loading documentation</h4>
                        <p>${message}</p>
                    </div>
                    <button class="retry-btn" onclick="window.location.reload()">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
        }
    }
};

// Make repoStats available globally for the retry button
window.repoStats = repoStats;

// Initialize stats when the page loads
document.addEventListener('DOMContentLoaded', () => {
    repoStats.fetchStats();
});
