import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const zipPath = path.join(process.cwd(), 'extension', 'session-reminder-extension-stone-theme.zip');
    const zipBuffer = fs.readFileSync(zipPath);
    
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="session-reminder-extension-stone-theme.zip"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Extension not found' }, { status: 404 });
  }
}