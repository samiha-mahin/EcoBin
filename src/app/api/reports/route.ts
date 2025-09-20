import { NextRequest, NextResponse } from 'next/server';
import { createReport, getReportsByUserId } from '@/utils/db/actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const reports = await getReportsByUserId(Number(userId));
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, location, wasteType, amount, imageUrl } = body;

  if (!userId || !location || !wasteType || !amount)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  const report = await createReport(userId, location, wasteType, amount, imageUrl);
  return NextResponse.json(report);
}
