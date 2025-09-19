import { report } from 'process';
import {db} from './dbConfig'
import { Users, Reports, Rewards, CollectedWastes, Notifications, Transactions } from './schema';
import { eq, sql, and, desc, ne } from 'drizzle-orm';

export async function createUser(email: string, name: string){
    try {
       const [user] = await db.insert(Users).values({email, name}).returning().execute();
       return user ;
    } catch (error) {
        console.error("Error creating user:", error);
        return null;
    }
}
export async function getUsersByEmail(email: string){
    try {
        const [user] = await db.select().from(Users).where(eq(Users.email, email)).execute();
        return user;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
}
export async function createReport(userId: number,
  location: string,
  wasteType: string,
  amount: string,
  imageUrl?: string,
  type?: string,
  verificationResult?: any){
    try {
        const [report] = await db.insert(Reports).values({userId,location,wasteType,amount,imageUrl,verificationResult,status: "pending",}).returning().execute();

        const pointsEarned = 10; // award 10 points for report submission
        await updateRewardPoints(userId, pointsEarned);

        // Create a transaction for the earned points
        await createTransaction(userId, 'earned_report', pointsEarned, 'Points earned for reporting waste');

        // Create a notification for the user
        await createNotification(
        userId,
        `You've earned ${pointsEarned} points for reporting waste!`,'reward'
        );
        
        return report;

    } catch (error) {
        console.error("Error creating report:", error);
        return null;
    }
  }
export async function getReportsByUserId(userId: number){
    try {
        const reports = await db.select().from(Reports).where(eq(Reports.userId, userId)).execute();
        return reports;
    } catch (error) {
        console.error("Error fetching reports by userId:", error);
        return[];
    }
}
export async function getOrCreateRewards(userId: number){
    try {
        let [reward] = await db.select().from(Rewards).where(eq(Rewards.userId, userId)).execute();
        if(!reward){
            [reward] = await db.insert(Rewards).values({
                userId,
                name: 'Default Reward',
                collectionInfo: 'Default Collection Info',
                points: 0,
                level: 1,
                isAvailable: true,
            }).returning().execute()
        }
        return reward;
    } catch (error) {
        console.error("Error getting or creating rewards:",error)
        return null;
    }
}