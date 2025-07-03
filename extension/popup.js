// Popup script for Session Reminder extension
document.addEventListener('DOMContentLoaded', function() {
    const testBtn = document.getElementById('test-btn');
    const helpBtn = document.getElementById('help-btn');
    const statusText = document.getElementById('status-text');
    
    // Check if we're on a UseSession page
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentTab = tabs[0];
        
        if (currentTab.url.includes('app.usesession.com')) {
            statusText.textContent = 'Ready on UseSession page';
            statusText.style.color = '#166534';
        } else {
            statusText.textContent = 'Navigate to UseSession';
            statusText.style.color = '#ea580c';
            
            // Change status indicator color
            const indicator = document.querySelector('.status-indicator');
            indicator.style.background = '#f97316';
            
            // Update status background
            const status = document.querySelector('.status');
            status.style.background = '#fff7ed';
            status.style.borderColor = '#fed7aa';
        }
    });
    
    // Test button - opens empty form
    testBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: 'https://sessionremind-71cqwif5w-walter-jones-projects.vercel.app/new',
            active: true
        });
        window.close();
    });
    
    // Help button - opens main page
    helpBtn.addEventListener('click', function() {
        chrome.tabs.create({
            url: 'https://sessionremind-71cqwif5w-walter-jones-projects.vercel.app',
            active: true
        });
        window.close();
    });
});