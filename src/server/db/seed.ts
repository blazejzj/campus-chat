import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { groups } from "./groupShema";

export default defineScript(async ({ env }) => {
    try {
        const db = drizzle(env.DB);
        await db.delete(groups);

        await db.insert(groups).values({
            id: "group1",
            name: "Test Group",
            creatorId: 1,
        });
        const result = await db.select().from(groups).all();

        console.log("🌱 Finished seeding");
    } catch (error) {
        console.error("Error seeding database:", error);
    }
});