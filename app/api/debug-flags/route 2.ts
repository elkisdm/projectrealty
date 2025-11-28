import { NextResponse } from 'next/server';
import { clearAllOverrides, getFlagsStatus } from '@lib/flags';

export async function GET() {
  try {
    const status = getFlagsStatus();
    return NextResponse.json({
      success: true,
      flags: status,
      message: 'Flags status retrieved'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    clearAllOverrides();
    const status = getFlagsStatus();
    return NextResponse.json({
      success: true,
      flags: status,
      message: 'All overrides cleared'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
