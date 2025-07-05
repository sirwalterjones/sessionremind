import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || !url.includes('usesession.com')) {
      return NextResponse.json(
        { error: 'Please provide a valid UseSession URL (app.usesession.com)' },
        { status: 400 }
      )
    }

    if (url.includes('book.usesession.com')) {
      return NextResponse.json(
        { error: 'That\'s a booking URL. You need the session management URL from app.usesession.com instead.' },
        { status: 400 }
      )
    }

    // Fetch the UseSession page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch UseSession page' },
        { status: 400 }
      )
    }

    const html = await response.text()
    
    // Extract data using the same logic as the bookmarklet
    const extractedData = extractClientDataFromHTML(html, url)
    
    return NextResponse.json({
      success: true,
      data: extractedData
    })

  } catch (error) {
    console.error('Error extracting UseSession data:', error)
    return NextResponse.json(
      { error: 'Failed to extract data from UseSession page' },
      { status: 500 }
    )
  }
}

function extractClientDataFromHTML(html: string, url: string) {
  // Convert HTML to text (simulate document.body.innerText)
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const clientData = {
    name: '',
    email: '',
    phone: '',
    sessionTitle: '',
    sessionTime: ''
  }

  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  if (emailMatch) {
    clientData.email = emailMatch[0]
  }

  // Extract phone
  const phoneMatch = text.match(/[+]?[0-9]{10,15}/)
  if (phoneMatch) {
    clientData.phone = phoneMatch[0]
  }

  // Check if individual session page
  if (url.includes('app.usesession.com/sessions/')) {
    // Extract name (before email)
    const nameMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z]\.?)*(?:\s+[A-Z][a-z]+)*\s+[A-Z][a-z]+)(?=\s+[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
    if (nameMatch) {
      clientData.name = nameMatch[1]
    }

    // Extract time
    const timeMatch = text.match(/([0-9]{1,2}:[0-9]{2} [AP]M - [0-9]{1,2}:[0-9]{2} [AP]M)/)
    const dayMatch = text.match(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), ([A-Z][a-z]+ [0-9]{1,2}[a-z]{2}, [0-9]{4})/)
    
    if (timeMatch && dayMatch) {
      clientData.sessionTime = `${dayMatch[1]}, ${dayMatch[2]} at ${timeMatch[1]}`
    } else if (dayMatch) {
      clientData.sessionTime = `${dayMatch[1]}, ${dayMatch[2]}`
    }

    // Extract session title using similar logic as bookmarklet
    let sessionTitle = ''
    
    // Look for session patterns in the text
    const sessionPatterns = [
      // Match titles with year patterns like "Sunflower Field Summer 2025"
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Summer|Winter|Spring|Fall|Holiday|Christmas)\s+20\d{2})/gi,
      // Match seasonal/themed titles
      /(Sunflower|Watermelon|Pumpkin|Christmas|Holiday|Beach|Studio|Maternity|Newborn|Family|Senior|Wedding|Engagement|Birthday|Anniversary|Field|Summer|Winter|Spring|Fall)(?:\s+[A-Z][a-z]+)*(?:\s+20\d{2})?/gi,
      // Traditional session patterns
      /([A-Z][a-z\s]*(Mini|Session|Shoot|Portrait|Photo|Photography)[A-Z\s]*)/gi
    ]
    
    for (const pattern of sessionPatterns) {
      const matches = text.match(pattern)
      if (matches && matches[0].length > 5 && matches[0].length < 80) {
        sessionTitle = matches[0].trim()
        break
      }
    }
    
    clientData.sessionTitle = sessionTitle || 'Photography Session'
  }

  return clientData
}