// Handle scrolling in the README container
document.addEventListener('DOMContentLoaded', () => {
    const readmeContainer = document.querySelector('.markdown-body');
    const contributeSection = document.getElementById('contribute');

    if (readmeContainer) {
        readmeContainer.addEventListener('wheel', (event) => {
            // Get the scroll position and the maximum scroll possible
            const scrollTop = readmeContainer.scrollTop;
            const scrollHeight = readmeContainer.scrollHeight;
            const height = readmeContainer.clientHeight;
            const delta = event.deltaY;
            const isScrollingUp = delta < 0;
            const isScrollingDown = delta > 0;
            
            // Check if we're at the top or bottom of the container
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + height >= scrollHeight;

            // If we're not at the boundaries, or if we are but scrolling away from them
            if (
                (!isAtTop || !isScrollingUp) && 
                (!isAtBottom || !isScrollingDown)
            ) {
                // Prevent the main page from scrolling
                event.preventDefault();
                event.stopPropagation();
                
                // Manually scroll the container
                readmeContainer.scrollTop += delta;
            }
        }, { passive: false });

        // Prevent space key from scrolling the main page when readme is focused
        readmeContainer.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                event.preventDefault();
            }
        });
    }
});
