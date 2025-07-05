// Content script for UseSession pages
console.log('Session Reminder extension loaded');

// Function to extract client data from UseSession pages
function extractClientData() {
  const allText = document.body.innerText;
  let clientData = {
    name: '',
    email: '',
    phone: '',
    sessionTitle: '',
    sessionTime: ''
  };

  // Extract email
  const emails = allText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emails) {
    clientData.email = emails[0];
  }

  // Extract phone
  const phones = allText.match(/[+]?[0-9]{10,15}/g);
  if (phones) {
    clientData.phone = phones[0];
  }

  const lines = allText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Check if we're on an individual session page
  if (window.location.href.includes('app.usesession.com/sessions/')) {
    // Extract name from individual session page (handles middle initials and middle names)
    // Matches: "John Smith", "Stacey E Colston", "Stacey E. Colston", "Mary Elizabeth Johnson", "John A. B. Smith"
    const nameMatch = allText.match(/([A-Z][a-z]+(?:\s+[A-Z]\.?)*(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+)(?=\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (nameMatch) {
      clientData.name = nameMatch[1];
    }

    // Extract time from individual session page
    const timeMatch = allText.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/);
    const dayMatch = allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/);
    
    if (timeMatch && dayMatch) {
      clientData.sessionTime = dayMatch[1] + ', ' + dayMatch[2] + ' at ' + timeMatch[1];
    } else if (dayMatch) {
      clientData.sessionTime = dayMatch[1] + ', ' + dayMatch[2];
    }

    // Extract session title from individual session pages
    // Try to find the session title from the page structure
    let sessionTitle = '';
    
    // Look for session title in the page header/title area
    const titleSelectors = [
      'h1', 'h2', 'h3', // Common title elements
      '[class*="title"]',
      '[class*="session"]',
      '[class*="booking"]'
    ];
    
    // First try to find the main session title (like "Sunflower Field Summer 2025")
    for (const selector of titleSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim();
        // Look for a meaningful title that's not generic UI text
        if (text && 
            text.length > 10 && 
            text.length < 100 &&
            !text.match(/^[0-9]/) && // Not a time/date
            !text.includes('@') && // Not an email
            !text.includes('$') && // Not a price
            !text.toLowerCase().includes('earnings') &&
            !text.toLowerCase().includes('bookings') &&
            !text.toLowerCase().includes('views') &&
            !text.toLowerCase().includes('waitlist') &&
            !text.toLowerCase().includes('balance') &&
            // Look for session titles with year/season/descriptive words
            (text.match(/\b20\d{2}\b/) || // Contains a year
             text.toLowerCase().includes('field') ||
             text.toLowerCase().includes('summer') ||
             text.toLowerCase().includes('winter') ||
             text.toLowerCase().includes('spring') ||
             text.toLowerCase().includes('fall') ||
             text.toLowerCase().includes('christmas') ||
             text.toLowerCase().includes('holiday') ||
             text.toLowerCase().includes('watermelon') ||
             text.toLowerCase().includes('sunflower') ||
             text.toLowerCase().includes('pumpkin') ||
             text.toLowerCase().includes('beach') ||
             text.toLowerCase().includes('studio') ||
             // Or traditional session keywords
             text.toLowerCase().includes('session') || 
             text.toLowerCase().includes('shoot') || 
             text.toLowerCase().includes('mini') ||
             text.toLowerCase().includes('portrait') ||
             text.toLowerCase().includes('photo'))) {
          sessionTitle = text;
          break;
        }
      }
      if (sessionTitle) break;
    }
    
    // Fallback: Look in text content for session patterns
    if (!sessionTitle) {
      const sessionPatterns = [
        // Match titles with year patterns like "Sunflower Field Summer 2025"
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\s+20\d{2})/gi,
        // Match seasonal/themed titles
        /(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\s+[A-Z][a-z]+)*(?:\s+20\d{2})?/gi,
        // Traditional session patterns
        /([A-Z][a-z\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\s]*)/gi,
        /(Watermelon|Sunflower|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary)[^.]*(?:Session|Shoot|Mini|Portrait|Photo)/gi,
        /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Mini|Session|Shoot|Portrait|Photo)/gi
      ];
      
      for (const pattern of sessionPatterns) {
        const matches = allText.match(pattern);
        if (matches && matches[0].length > 5 && matches[0].length < 80) {
          sessionTitle = matches[0].trim();
          break;
        }
      }
    }
    
    // Set the session title
    if (sessionTitle) {
      clientData.sessionTitle = sessionTitle;
    } else {
      // Final fallback
      clientData.sessionTitle = 'Photography Session';
    }
  } else {
    // Original logic for calendar/listing pages
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/[A-Za-z].+(Truck|Session|Mini|Shoot|Photo).*-.*[A-Z]{2}/)) {
        const cleanLine = line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g, '').trim();
        const parts = cleanLine.split(/\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/);
        clientData.sessionTitle = parts[0].trim();
        if (clientData.sessionTitle.endsWith(' at')) {
          clientData.sessionTitle = clientData.sessionTitle.replace(/ at$/, '');
        }
        break;
      } else if (line.match(/(Mini|Maternity|Newborn|Senior|Family|Wedding|Portrait|Pet|Commercial|Event|Beach|Studio|Outdoor|Indoor|Holiday|Christmas|Valentine|Easter|Spring|Summer|Fall|Winter|Birthday|Anniversary).*(Session|Shoot|Mini|Photography|Photo)/i)) {
        const cleanLine = line.replace(/[🍉🎃🎄🌸🌺🌻🌷🌹🌼🌿🍀🌱🌲🌳🌴🌵🌶️🌽🌾🌿🍀🍁🍂🍃]/g, '').trim();
        clientData.sessionTitle = cleanLine.split(/\s+(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)/)[0].trim();
        break;
      }
    }

    // Extract dates for calendar/listing pages
    const dates = allText.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)[^\n]*[0-9]{4}[^\n]*[0-9]{1,2}:[0-9]{2}[^\n]*(AM|PM)/gi);
    if (dates) {
      clientData.sessionTime = dates[0];
    } else {
      const altDates = allText.match(/(January|February|March|April|May|June|July|August|September|October|November|December)[^\n]*[0-9]{4}[^\n]*[0-9]{1,2}:[0-9]{2}[^\n]*(AM|PM)/gi);
      if (altDates) {
        clientData.sessionTime = altDates[0];
      }
    }

    // Extract names for calendar/listing pages (handles middle initials and middle names)
    // Matches: "John Smith", "Stacey E Colston", "Stacey E. Colston", "Mary Elizabeth Johnson", "John A. B. Smith"
    const names = allText.match(/^[A-Z][a-z]+(?:\s+[A-Z]\.?)*(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+$/gm);
    if (names) {
      clientData.name = names[0];
    }
  }

  return clientData;
}

// Function to create floating action button
function createFloatingButton() {
  // Remove existing button if it exists
  const existingButton = document.getElementById('session-reminder-btn');
  if (existingButton) {
    existingButton.remove();
  }

  // Check if user has a saved preference for button size
  const isMinimized = localStorage.getItem('sessionReminderButtonMinimized') === 'true';

  const button = document.createElement('div');
  button.id = 'session-reminder-btn';
  button.className = isMinimized ? 'session-reminder-floating-btn minimized' : 'session-reminder-floating-btn';
  button.innerHTML = `
    <div class="session-reminder-btn-content">
      <span class="session-reminder-icon">📱</span>
      <span class="session-reminder-text">Send Text Reminder</span>
    </div>
    <div class="session-reminder-resize-btn" title="${isMinimized ? 'Expand' : 'Minimize'} button">
      <span class="resize-icon">${isMinimized ? '⬆️' : '⬇️'}</span>
    </div>
  `;

  // Main button click handler
  const mainContent = button.querySelector('.session-reminder-btn-content');
  mainContent.addEventListener('click', function() {
    const clientData = extractClientData();
    
    // Send message to background script to open new tab
    chrome.runtime.sendMessage({
      action: 'openReminderForm',
      data: clientData
    });
  });

  // Resize button click handler
  const resizeBtn = button.querySelector('.session-reminder-resize-btn');
  resizeBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent main button click
    
    const currentlyMinimized = button.classList.contains('minimized');
    const newMinimized = !currentlyMinimized;
    
    if (newMinimized) {
      button.classList.add('minimized');
      resizeBtn.querySelector('.resize-icon').textContent = '⬆️';
      resizeBtn.title = 'Expand button';
    } else {
      button.classList.remove('minimized');
      resizeBtn.querySelector('.resize-icon').textContent = '⬇️';
      resizeBtn.title = 'Minimize button';
    }
    
    // Save preference
    localStorage.setItem('sessionReminderButtonMinimized', newMinimized.toString());
  });

  document.body.appendChild(button);
}

// Only create button on UseSession pages
if (window.location.href.includes('app.usesession.com')) {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingButton);
  } else {
    createFloatingButton();
  }

  // Also create button when navigating (for SPAs)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(createFloatingButton, 1000); // Wait for page to update
    }
  }).observe(document, { subtree: true, childList: true });
}