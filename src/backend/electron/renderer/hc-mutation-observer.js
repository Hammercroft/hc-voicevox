// TODO skip nodes whose parentElement.tagName is SCRIPT/STYLE

var replacements = {};

function replaceInNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent;
        for (const [jp, en] of Object.entries(replacements)) {
            text = text.replaceAll(jp, en);
        }
        if (text !== node.textContent) node.textContent = text;
    }
}

function walkAndReplace(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) replaceInNode(node);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
            walkAndReplace(node);
        }
    }
});

//observer.observe(document.body, { childList: true, subtree: true });
//walkAndReplace(document.body); // catch anything already rendered

function init() {
    walkAndReplace(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
}

/*const interval = setInterval(() => {
    const incoming = window.__mutationReplacements
    if (incoming) {
        clearInterval(interval)
        replacements = incoming // update the outer var
        walkAndReplace(document.body) // re-scan what's already rendered
    }
}, 100)*/
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('localeAPI', {
    setMutationReplacements: (incoming) => {
        replacements = incoming
        walkAndReplace(document.body)
    }
})

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init(); // already ready
}
