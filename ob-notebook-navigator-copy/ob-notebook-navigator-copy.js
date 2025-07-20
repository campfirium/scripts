// CustomJS class - Add copy full content functionality to Notebook Navigator
// Supports: right-click menu or double right-click on note item
// Usage:
// 1. Place this file in vault/scripts/ directory
// 2. Set "scripts" in CustomJS Folder field
// 3. Add filename (without .js) to "Startup scripts"
// 4. Restart Obsidian

class NotebookNavigatorCopyExtension {
    constructor() {
        this.app = app;
        this.injected = false;
        this.lastRightClickTime = 0;
        this.lastRightClickElement = null;
        this.currentRightClickedElement = null; // Store the currently right-clicked element
        this.doubleClickDelay = 500; // Double click within 500ms is valid
        console.log("Notebook Navigator copy extension class initialized");
    }
    
    // Method called by CustomJS startup script
    async invoke() {
        console.log("Initializing Notebook Navigator copy extension...");
        await this.waitForNotebookNavigator();
        this.injectStyles();
        this.injectContextMenu();

        console.log("Notebook Navigator copy extension loaded");
    }
    
    // Debug listeners removed - problem identified
    
    // Inject minimal styles
    injectStyles() {
        if (document.getElementById('nn-copy-extension-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'nn-copy-extension-styles';
        style.textContent = `
            .nn-menu-text {
                color: var(--text-normal);
                font-size: var(--font-ui-small);
                line-height: 1.4;
            }
        `;
        
        document.head.appendChild(style);
        console.log('Menu text styles injected');
    }
    
    // Wait for plugin to load
    waitForNotebookNavigator() {
        return new Promise((resolve) => {
            const check = () => {
                if (this.app.plugins.plugins['notebook-navigator'] && 
                    document.querySelector('.notebook-navigator')) {
                    console.log("Notebook Navigator plugin found");
                    resolve();
                } else {
                    setTimeout(check, 500);
                }
            };
            check();
        });
    }
    
    // Unified copy function - handles both menu click and double right-click
    async performCopy(fileItem) {
        try {
            const filePath = this.getFilePathFromElement(fileItem);
            if (!filePath) return;
            
            const file = this.app.vault.getAbstractFileByPath(filePath);
            if (!file || file.children) return;
            
            const content = await this.app.vault.read(file);
            
            // Try Electron clipboard first (least side effects)
            const electronClipboard = window.require?.('electron')?.clipboard;
            if (electronClipboard) {
                electronClipboard.writeText(content);
                console.log('Used Electron clipboard');
            } else {
                // Fallback to modern clipboard API
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(content);
                    console.log('Used navigator.clipboard');
                } else {
                    // Last resort: execCommand
                    const textArea = document.createElement('textarea');
                    textArea.value = content;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    textArea.style.width = '2em';
                    textArea.style.height = '2em';
                    textArea.style.padding = '0';
                    textArea.style.border = 'none';
                    textArea.style.outline = 'none';
                    textArea.style.boxShadow = 'none';
                    textArea.style.background = 'transparent';
                    
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    console.log('Used execCommand fallback');
                }
            }
            
            // Show visual feedback
            this.showCopyFeedback(fileItem);
            
            console.log(`Copied: ${file.basename}`);
        } catch (error) {
            console.error('Failed to copy note content:', error);
        }
    }
    
    // Show visual feedback for successful copy
    showCopyFeedback(element) {
        if (!element) return;
        
        // Create overlay for flash effect
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'var(--interactive-accent)';
        overlay.style.opacity = '0.1'; // 90% transparency (10% opacity)
        overlay.style.borderRadius = 'var(--radius-m)';
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'opacity 0.2s ease';
        
        // Make sure element has relative positioning
        const originalPosition = element.style.position;
        if (!element.style.position || element.style.position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(overlay);
        
        // Flash effect
        setTimeout(() => {
            overlay.style.opacity = '0.1';
        }, 50);
        
        // Remove overlay after duration
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (originalPosition) {
                element.style.position = originalPosition;
            }
        }, 800);
    }
    
    // Get file path from DOM element
    getFilePathFromElement(element) {
        // Try to get from data-path attribute
        if (element.dataset.path) {
            return element.dataset.path;
        }
        
        // Fallback: find by filename
        const fileNameElement = element.querySelector('.nn-file-name');
        if (!fileNameElement) return null;
        
        const fileName = fileNameElement.textContent.trim();
        const files = this.app.vault.getMarkdownFiles();
        const matchingFile = files.find(f => f.basename === fileName || f.name === fileName);
        
        return matchingFile ? matchingFile.path : null;
    }
    
    // Create menu item
    createCopyMenuItem(filePath) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        
        menuItem.innerHTML = `
            <div class="menu-item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-copy">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
            </div>
            <div class="nn-menu-text">Copy Full Content</div>
        `;
        
        menuItem.addEventListener('click', () => {
            const menu = menuItem.closest('.menu');
            if (menu) {
                menu.style.display = 'none';
                setTimeout(() => menu.remove(), 50);
            }
            
            setTimeout(() => {
                this.performCopy(this.currentRightClickedElement);
            }, 60);
        });
        
        return menuItem;
    }
    
    // Handle double right click
    handleDoubleRightClick(event, fileItem) {
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastRightClickTime;
        
        // Check if it's a double click on the same element within time limit
        if (this.lastRightClickElement === fileItem && timeDiff < this.doubleClickDelay) {
            // Double right click, execute copy directly
            event.preventDefault();
            event.stopPropagation();
            
            // Use unified copy function
            this.performCopy(fileItem);
            console.log('Double right click copy executed');
            
            // Reset state
            this.lastRightClickTime = 0;
            this.lastRightClickElement = null;
            return true; // Indicates double click handled
        } else {
            // Record this right click
            this.lastRightClickTime = currentTime;
            this.lastRightClickElement = fileItem;
            return false; // Indicates single right click
        }
    }
    
    // Inject context menu functionality
    injectContextMenu() {
        if (this.injected) return;
        
        document.body.addEventListener('contextmenu', (event) => {
            const fileItem = event.target.closest('.nn-file-item');
            if (!fileItem) return;
            
            // Store the current right-clicked element
            this.currentRightClickedElement = fileItem;
            
            // Check if it's a double right click
            if (this.handleDoubleRightClick(event, fileItem)) {
                return; // Double click handled, don't show menu
            }
            
            // Single right click, show menu with reduced delay
            setTimeout(() => {
                // Be more specific about context menu selection - exclude status bar
                let menuEl = document.querySelector('div.menu.context-menu:not(.status-bar-item)');
                
                // If not found, try other selectors but exclude status bar
                if (!menuEl) {
                    const menus = document.querySelectorAll('.menu');
                    for (const menu of menus) {
                        if (!menu.closest('.status-bar') && !menu.classList.contains('status-bar-item')) {
                            menuEl = menu;
                            break;
                        }
                    }
                }
                
                if (!menuEl) {
                    console.log('No valid context menu found');
                    return;
                }
                
                // Check if our item already exists
                if (menuEl.querySelector('[data-nn-copy]')) {
                    console.log('Copy item already exists in menu');
                    return;
                }
                
                const filePath = this.getFilePathFromElement(fileItem);
                if (!filePath) {
                    console.log('No file path found');
                    return;
                }
                
                const copyMenuItem = this.createCopyMenuItem(filePath);
                copyMenuItem.setAttribute('data-nn-copy', 'true'); // Add marker
                const separator = document.createElement('div');
                separator.className = 'menu-separator';
                separator.setAttribute('data-nn-copy', 'true');
                
                // Insert at last position
                menuEl.appendChild(separator);
                menuEl.appendChild(copyMenuItem);
                
                console.log('Menu item added to context menu:', menuEl);
                
            }, 20);
        }, true);
        
        this.injected = true;
        console.log('Notebook Navigator right-click copy functionality injected! Supports double right-click for quick copy');
    }
}