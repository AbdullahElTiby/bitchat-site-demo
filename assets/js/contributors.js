import config from './config.js';

class ContributorsManager {
    constructor() {
        this.owner = 'permissionlesstech';
        this.repo = 'bitchat-android';
        this.contributorsList = document.getElementById('contributors-list');
        this.statsContainer = document.getElementById('stats-container');
        this.statsPeriod = document.getElementById('stats-period');
        this.headers = {
            'Authorization': `token ${config.github.token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        
        this.init();
    }

    async init() {
        await this.fetchContributors();
        this.setupEventListeners();
        this.fetchStatistics('all');
    }

    async fetchContributors() {
        try {
            // Fetch contributors
            const contributorsResponse = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/contributors`,
                { headers: this.headers }
            );
            const contributors = await contributorsResponse.json();

            // Fetch additional details for each contributor
            const contributorsWithDetails = await Promise.all(
                contributors.map(async (contributor) => {
                    const userResponse = await fetch(contributor.url, { headers: this.headers });
                    const userDetails = await userResponse.json();
                    
                    // Fetch user's commits
                    const commitsResponse = await fetch(
                        `https://api.github.com/repos/${this.owner}/${this.repo}/commits?author=${contributor.login}`,
                        { headers: this.headers }
                    );
                    const commits = await commitsResponse.json();

                    return {
                        ...contributor,
                        details: userDetails,
                        recentCommits: commits.slice(0, 5)
                    };
                })
            );

            this.updateContributorsView(contributorsWithDetails);
        } catch (error) {
            console.error('Error fetching contributors:', error);
            this.showError();
        }
    }

    updateContributorsView(contributors) {
        this.contributorsList.innerHTML = contributors
            .map((contributor, index) => this.createContributorCard(contributor, index))
            .join('');
    }

    createContributorCard(contributor, index) {
        const rank = index + 1;
        const recentActivity = contributor.recentCommits
            .map(commit => `
                <li class="contribution-item">
                    <i class="fas fa-code-commit"></i>
                    ${this.truncateText(commit.commit.message, 50)}
                </li>
            `)
            .join('');

        return `
            <div class="contributor-card">
                <div class="rank-badge ${rank <= 3 ? 'top-' + rank : ''}">#${rank}</div>
                <div class="contributor-header">
                    <img src="${contributor.avatar_url}" alt="${contributor.login}" class="contributor-avatar">
                    <div class="contributor-info">
                        <h3>${contributor.details.name || contributor.login}</h3>
                        <span class="contributor-role">${contributor.details.bio ? this.truncateText(contributor.details.bio, 40) : 'Contributor'}</span>
                    </div>
                </div>
                <ul class="contribution-list">
                    ${recentActivity}
                </ul>
                <div class="contributor-footer">
                    <div class="contribution-metrics">
                        <span class="metric">
                            <i class="fas fa-code-commit"></i>
                            ${contributor.contributions}
                        </span>
                        <span class="metric">
                            <i class="fas fa-star"></i>
                            ${contributor.details.public_repos}
                        </span>
                    </div>
                    <a href="${contributor.html_url}" target="_blank" class="github-link">
                        <i class="fab fa-github"></i>
                        Profile
                    </a>
                </div>
            </div>
        `;
    }

    async fetchStatistics(period) {
        try {
            // Calculate date range
            const endDate = new Date();
            let startDate = new Date();
            switch (period) {
                case 'week':
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date(0); // Beginning of time
            }

            // Fetch statistics
            const [commits, prs, issues] = await Promise.all([
                this.fetchCommitCount(startDate),
                this.fetchPRCount(startDate),
                this.fetchIssueCount(startDate)
            ]);

            // Update statistics display
            document.getElementById('total-commits').textContent = commits;
            document.getElementById('total-prs').textContent = prs;
            document.getElementById('total-issues').textContent = issues;
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    }

    async fetchCommitCount(since) {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/commits?since=${since.toISOString()}`
        );
        const commits = await response.json();
        return commits.length;
    }

    async fetchPRCount(since) {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/pulls?state=all&since=${since.toISOString()}`
        );
        const prs = await response.json();
        return prs.length;
    }

    async fetchIssueCount(since) {
        const response = await fetch(
            `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=closed&since=${since.toISOString()}`
        );
        const issues = await response.json();
        return issues.length;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showError() {
        this.contributorsList.innerHTML = `
            <div class="contributor-error">
                <i class="fas fa-exclamation-circle"></i>
                Unable to load contributors. Please try again later.
            </div>
        `;
    }

    setupEventListeners() {
        if (this.statsPeriod) {
            this.statsPeriod.addEventListener('change', (e) => {
                this.fetchStatistics(e.target.value);
            });
        }
    }
}

// Initialize the contributors manager when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContributorsManager();
});
