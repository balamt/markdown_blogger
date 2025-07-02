/**
 * Code Blocks Enhancement Script
 * This script adds copy button functionality to code blocks
 * and integrates with Prism.js for syntax highlighting
 */

// Function to create and add copy buttons to all code blocks
function addCopyButtons() {
    // Select all pre code blocks
    const codeBlocks = document.querySelectorAll('pre:not(.copy-added)');
    
    codeBlocks.forEach(codeBlock => {
        // Mark as processed
        codeBlock.classList.add('copy-added');
        codeBlock.classList.add('line-numbers');
        
        // Create the copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.title = 'Copy to clipboard';
        
        // Add button to code block
        codeBlock.appendChild(copyButton);
        
        // Add click event to copy code
        copyButton.addEventListener('click', function() {
            const code = codeBlock.querySelector('code') 
                ? codeBlock.querySelector('code').textContent 
                : codeBlock.textContent;
            
            navigator.clipboard.writeText(code).then(() => {
                // Visual feedback on copy
                copyButton.innerHTML = '<i class="fas fa-check"></i>';
                copyButton.classList.add('success');
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.classList.remove('success');
                }, 2000);
            }).catch(err => {
                console.error('Could not copy text: ', err);
                copyButton.innerHTML = '<i class="fas fa-times"></i>';
                copyButton.classList.add('error');
                
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
                    copyButton.classList.remove('error');
                }, 2000);
            });
        });
    });
}

// Function to observe content changes and handle new code blocks
function observeContentChanges() {
    // Observer to handle dynamically loaded content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if we need to reinitialize Prism
                const hasCodeBlocks = Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && 
                           (node.tagName === 'PRE' || 
                            node.querySelector('pre'));
                });
                
                if (hasCodeBlocks) {
                    // Re-highlight code blocks with Prism
                    if (typeof Prism !== 'undefined') {
                        Prism.highlightAll();
                    }
                    
                    // Add copy buttons to new code blocks
                    addCopyButtons();
                }
            }
        });
    });

    // Observe changes in the main content area
    const mainContent = document.querySelector('main');
    if (mainContent) {
        observer.observe(mainContent, {
            childList: true,
            subtree: true
        });
    }
}

// Function to hook into blog content loading
function setupBlogContentHooks() {
    // If the blogs are loaded via blogs.js, we need to hook into that process
    if (typeof loadBlogContent === 'function') {
        const originalLoadBlogContent = loadBlogContent;
        window.loadBlogContent = function(url) {
            return originalLoadBlogContent(url).then(() => {
                // After blog content is loaded, initialize code blocks
                setTimeout(() => {
                    if (typeof Prism !== 'undefined') {
                        Prism.highlightAll();
                    }
                    addCopyButtons();
                }, 100);
            });
        };
    }
}

// Initialize all code block enhancements
function initCodeBlockEnhancements() {
    addCopyButtons();
    observeContentChanges();
    setupBlogContentHooks();
}

// Make addCopyButtons globally available
window.addCopyButtons = addCopyButtons;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initCodeBlockEnhancements();
});
