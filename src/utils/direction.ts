export function isPersian(text: string): boolean {
    // Persian Unicode range: \u0600-\u06FF
    const persianRegex = /[\u0600-\u06FF]/;
    // Extract the first character
    const firstThreeChars = text.trim().substring(0, 20);    
    // Test if any of the first three characters are Persian
    return persianRegex.test(firstThreeChars);
}

export function setTextDirection(element: Element): void {
    if (isPersian(element.textContent || "")) {
        element.setAttribute('dir', 'rtl');
    } else {
        element.setAttribute('dir', 'ltr');
    }
}

const observer = new MutationObserver((mutations: MutationRecord[]) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element; // Type assertion to Element
                if (['P', 'OL', 'UL', 'H3', 'H2', 'H1', "DIV"].includes(element.tagName.toUpperCase())) {
                    setTextDirection(element);
                }
            }
        });
    });
});

// Start observing the body for child node additions
observer.observe(document.body, { childList: true, subtree: true });

