// Background script for Session Reminder extension
console.log('Session Reminder background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openReminderForm') {
    // Build URL with extracted data
    const baseUrl = 'http://localhost:3000/new';
    const params = new URLSearchParams();
    
    if (request.data.name) params.set('name', request.data.name);
    if (request.data.email) params.set('email', request.data.email);
    if (request.data.phone) params.set('phone', request.data.phone);
    if (request.data.sessionTitle) params.set('sessionTitle', request.data.sessionTitle);
    if (request.data.sessionTime) params.set('sessionTime', request.data.sessionTime);
    
    const finalUrl = baseUrl + '?' + params.toString();
    
    // Open new tab with the form
    chrome.tabs.create({
      url: finalUrl,
      active: true
    });
    
    sendResponse({ success: true });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Session Reminder extension installed');
    
    // Open welcome page
    chrome.tabs.create({
      url: 'http://localhost:3000',
      active: true
    });
  }
});