// preload.js
// To prevent errors in the data obtianed from the database.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});

// Import Howler and expose it to the renderer process
const { Howl } = require('howler');
window.Howl = Howl;