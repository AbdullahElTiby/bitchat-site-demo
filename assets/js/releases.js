import config from './config.js';

class ReleaseManager {
    constructor() {
        this.owner = 'permissionlesstech';
        this.repo = 'bitchat-android';
        this.simpleView = document.getElementById('simple-view');
        this.detailedView = document.getElementById('detailed-view');
        this.releasesList = document.getElementById('releases-list');
        this.androidDownloadBtn = document.getElementById('android-download');
        this.headers = {
            'Authorization': `token ${config.github.token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        this.toggleBtns = document.querySelectorAll('.toggle-btn');
        this.mobileToggleBtn = document.querySelector('.toggle-view-btn');
        
        this.init();
    }

    async init() {
        await this.fetchReleases();
        this.setupEventListeners();
    }

    async fetchReleases() {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${this.owner}/${this.repo}/releases`,
                { headers: this.headers }
            );
            const releases = await response.json();

            if (releases.length > 0) {
                // Update simple view with latest release
                this.updateSimpleView(releases[0]);
                // Update detailed view with all releases
                this.updateDetailedView(releases);
            }
        } catch (error) {
            console.error('Error fetching releases:', error);
            this.showError();
        }
    }

    updateSimpleView(latestRelease) {
        const versionTag = this.androidDownloadBtn.querySelector('.version-tag');
        const versionInfo = this.androidDownloadBtn.querySelector('.version-info');
        
        versionTag.textContent = 'Android';
        versionInfo.textContent = latestRelease.tag_name;
        
        // Find the APK asset
        const apkAsset = latestRelease.assets.find(asset => asset.name.endsWith('.apk'));
        if (apkAsset) {
            this.androidDownloadBtn.href = apkAsset.browser_download_url;
        }
    }

    updateDetailedView(releases) {
        this.releasesList.innerHTML = releases.map(release => this.createReleaseHTML(release)).join('');
    }

    createReleaseHTML(release) {
        const date = new Date(release.published_at);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="release-item">
                <div class="release-header">
                    <div class="release-title">
                        <span class="release-tag">${release.tag_name}</span>
                        <h4>${release.name || release.tag_name}</h4>
                    </div>
                    <span class="release-date">
                        <i class="far fa-calendar-alt"></i>
                        ${formattedDate}
                    </span>
                </div>
                <div class="release-body">
                    ${marked.parse(release.body || 'No description provided.')}
                </div>
                <div class="release-assets">
                    ${release.assets.map(asset => `
                        <a href="${asset.browser_download_url}" class="asset-link">
                            <i class="fas fa-download"></i>
                            ${asset.name}
                            <span class="file-size">(${this.formatFileSize(asset.size)})</span>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    showError() {
        this.releasesList.innerHTML = `
            <div class="release-error">
                <i class="fas fa-exclamation-circle"></i>
                Unable to load releases. Please try again later.
            </div>
        `;
    }

    setupEventListeners() {
        // View toggle buttons
        this.toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.toggleView(view);
                
                // Update button states
                this.toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
            });
        });

        // Mobile toggle button
        if (this.mobileToggleBtn) {
            this.mobileToggleBtn.addEventListener('click', () => {
                const isDetailed = this.detailedView.classList.contains('active');
                this.toggleView(isDetailed ? 'simple' : 'detailed');
                this.mobileToggleBtn.innerHTML = isDetailed ? 
                    '<i class="fas fa-code-branch"></i> Show Technical Details' :
                    '<i class="fas fa-mobile-alt"></i> Show Simple View';
            });
        }

        // Auto-update every 5 minutes
        setInterval(() => this.fetchReleases(), 5 * 60 * 1000);
    }

    toggleView(view) {
        if (view === 'simple') {
            this.simpleView.classList.add('active');
            this.detailedView.classList.remove('active');
        } else {
            this.simpleView.classList.remove('active');
            this.detailedView.classList.add('active');
        }
    }
}

// Initialize the release manager when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new ReleaseManager();
});
