document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
        if (element.children.length === 0) { 
            element.innerHTML = element.innerHTML.replace(/\$\{MESSAGES\.(\w+)\}/g, (match, key) => {
                return MESSAGES[key] || match;
            });
        }
    });
});