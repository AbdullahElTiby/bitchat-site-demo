// Handle scrolling in releases container
document.addEventListener('DOMContentLoaded', () => {
    const releasesContainer = document.querySelector('.releases-container');
    
    if (releasesContainer) {
        releasesContainer.addEventListener('wheel', (e) => {
            const rect = releasesContainer.getBoundingClientRect();
            const isMouseInside = 
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (isMouseInside) {
                const canScrollUp = releasesContainer.scrollTop > 0;
                const canScrollDown = releasesContainer.scrollTop < releasesContainer.scrollHeight - releasesContainer.clientHeight;

                if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
                    e.preventDefault();
                    e.stopPropagation();
                    releasesContainer.scrollTop += e.deltaY;
                }
            }
        }, { passive: false });
    }
});
