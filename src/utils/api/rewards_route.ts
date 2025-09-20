import { NextRequest, NextResponse } from 'next/server';
import { getAvailableRewards, redeemReward } from '@/utils/db/actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const rewards = await getAvailableRewards(Number(userId));
  return NextResponse.json(rewards);
}

export async function POST(req: NextRequest) {
  const { userId, rewardId } = await req.json();
  if (!userId || rewardId === undefined)
    return NextResponse.json({ error: 'Missing userId or rewardId' }, { status: 400 });

  try {
    const updatedReward = await redeemReward(Number(userId), Number(rewardId));
    return NextResponse.json(updatedReward);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
