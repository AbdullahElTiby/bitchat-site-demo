class ContributorsScroll {
    constructor() {
        this.contributorsSection = document.getElementById('contributors');
        this.contributorsGrid = document.querySelector('.contributors-grid');
        this.init();
    }

    init() {
        if (!this.contributorsSection || !this.contributorsGrid) return;
        
        // Add wheel event listener to the contributors grid only
        this.contributorsGrid.addEventListener('wheel', (event) => this.handleScroll(event), { passive: false });
    }

    handleScroll(event) {
        // Get the target element that was actually clicked
        const target = event.target;
        
        // Check if we're inside a contributor card or directly in the grid
        const isInsideGrid = target.closest('.contributor-card') || 
                           target.closest('.contributors-grid');
        
        if (isInsideGrid) {
            // Only prevent default and handle scroll if we're inside the grid
            event.preventDefault();
            event.stopPropagation();
            
            // Calculate scroll amount based on wheel delta
            const delta = event.deltaY || event.detail || event.wheelDelta;
            
            // Check if we can scroll further
            const canScrollUp = this.contributorsGrid.scrollTop > 0;
            const canScrollDown = this.contributorsGrid.scrollTop + this.contributorsGrid.clientHeight < this.contributorsGrid.scrollHeight;
            
            // Only scroll if there's more content in that direction
            if ((delta > 0 && canScrollDown) || (delta < 0 && canScrollUp)) {
                this.contributorsGrid.scrollTop += delta;
            }
        }
        // If we're not in the grid, let the default page scroll happen
    }
}

// Initialize the contributors scroll handler
document.addEventListener('DOMContentLoaded', function() {
    new ContributorsScroll();
});

// Initialize the contributors scroll handler
document.addEventListener('DOMContentLoaded', function() {
    new ContributorsScroll();
});
