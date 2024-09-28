function isPersian(text) {
    // Persian Unicode range: \u0600-\u06FF
    const persianRegex = /[\u0600-\u06FF]/;
    // Extract the first three characters
    const firstThreeChars = text.trim().substring(0, 1);
    console.log(firstThreeChars)
    // Test if any of the first three characters are Persian
    return persianRegex.test(firstThreeChars);
}
function setTextDirection(element) {
    if (isPersian(element.textContent)) {
        element.setAttribute('dir', 'rtl');
    } else {
        element.setAttribute('dir', 'ltr');
    }
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (['P',  'OL', 'UL', "H3", "H2", "H1"].includes(node.tagName.toUpperCase())) {
                    setTextDirection(node);
                }
            }
        });
    });
});

// Start observing the body for child node additions
observer.observe(document.body, { childList: true, subtree: true });
