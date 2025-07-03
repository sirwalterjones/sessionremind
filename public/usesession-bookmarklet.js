// Enhanced UseSession Bookmarklet
// This version is specifically optimized for UseSession.com pages

javascript:(function(){
  // Enhanced client data extraction using improved session title logic
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
      // Extract name from individual session page
      const nameMatch = allText.match(/([A-Z][a-z]+ [A-Z][a-z]+)(?=\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
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

      // Extract names for calendar/listing pages
      const names = allText.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/gm);
      if (names) {
        clientData.name = names[0];
      }
    }

    return clientData;
  }

  // Extract the data
  const data = extractClientData();
  
  // Build URL parameters
  const params = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  // Determine base URL
  const baseUrl = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : 
    window.location.origin.includes('sessionremind') ? 
    window.location.origin : 
    'https://sessionremind.com';
  
  const targetUrl = `${baseUrl}/new?${params.toString()}`;
  
  // Log for debugging
  console.log('UseSession data extracted:', data);
  console.log('Target URL:', targetUrl);
  
  // Open new window
  window.open(targetUrl, '_blank');
  
  // Show confirmation
  const confirmationText = `✅ Client data extracted successfully!\n\n` +
    `📝 Name: ${data.name || 'Not found'}\n` +
    `📞 Phone: ${data.phone || 'Not found'}\n` +
    `📧 Email: ${data.email || 'Not found'}\n` +
    `📸 Session: ${data.sessionTitle || 'Not found'}\n` +
    `⏰ Time: ${data.sessionTime || 'Not found'}\n\n` +
    `The Session Reminder form is now open in a new tab with this information pre-filled.`;
  
  alert(confirmationText);
})();