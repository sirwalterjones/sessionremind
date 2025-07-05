'use client'

export const isMobile = () => {
  if (typeof window === 'undefined') return false
  
  // Check user agent
  const userAgent = navigator.userAgent.toLowerCase()
  const mobileKeywords = ['mobile', 'android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows phone']
  const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword))
  
  // Check screen size
  const isMobileScreen = window.innerWidth <= 768
  
  // Check touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  return isMobileUA || (isMobileScreen && isTouchDevice)
}

export const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = () => {
  if (typeof window === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

export const canInstallPWA = () => {
  if (typeof window === 'undefined') return false
  return 'serviceWorker' in navigator && 'PushManager' in window
}

export const getBookmarkletInstructions = () => {
  if (isIOS()) {
    return {
      title: "iOS Safari Instructions",
      steps: [
        "1. Long-press the bookmarklet button",
        "2. Select 'Add to Reading List' or 'Add Bookmark'",
        "3. Choose 'Bookmarks' and save",
        "4. Use from your bookmarks on UseSession pages"
      ]
    }
  } else if (isAndroid()) {
    return {
      title: "Android Chrome Instructions", 
      steps: [
        "1. Long-press the bookmarklet button",
        "2. Select 'Add to bookmarks'",
        "3. Name it 'Session Reminder'",
        "4. Use from your bookmarks on UseSession pages"
      ]
    }
  } else {
    return {
      title: "Desktop Instructions",
      steps: [
        "1. Drag the button to your bookmarks bar",
        "2. If you can't drag, right-click and copy link",
        "3. Create new bookmark and paste the link",
        "4. Click the bookmark on UseSession pages"
      ]
    }
  }
}