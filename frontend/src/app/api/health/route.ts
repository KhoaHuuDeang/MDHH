import { NextResponse } from 'next/server';

// Simple health check endpoint for frontend
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mdhh-frontend',
    uptime: Math.round(process.uptime())
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache'
    }
  });
}