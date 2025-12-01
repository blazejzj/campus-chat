import db from "./index";
import { users, profiles } from "./userSchema";
import { rooms, roomMemberships } from "./roomSchema";
import { friendships } from "./friendsSchema";
import { dmThreads, dmThreadParticipants } from "./dmSchema";
import { messages } from "./messageSchema";
import { notifications } from "./notificationSchema";

import { hashPassword } from "../../features/auth/utils/hash";

const GLOBAL_ROOM_SLUG = "global";

function logStep(step: string) {
    console.log(`> ${step}`);
}

async function clearDatabase() {
    logStep("Clearing existing data");

    await db.delete(notifications);
    await db.delete(messages);
    await db.delete(dmThreadParticipants);
    await db.delete(dmThreads);
    await db.delete(friendships);
    await db.delete(roomMemberships);
    await db.delete(rooms);
    await db.delete(profiles);
    await db.delete(users);

    console.log("Database cleared");
}

type SeededUser = { id: number; email: string };

type SeededUsers = {
    anna: SeededUser;
    martin: SeededUser;
    lecturer: SeededUser;
    demo: SeededUser;
    karolina: SeededUser;
    stefan: SeededUser;
};

async function seedUsers(): Promise<SeededUsers> {
    logStep("Seeding users and profiles");

    const now = new Date();
    const passwordHash = await hashPassword("Password123!");

    const insertedUsers = await db
        .insert(users)
        .values([
            {
                email: "anna.student@hiof.no",
                passwordHash,
                createdAt: now,
            },
            {
                email: "martin.student@hiof.no",
                passwordHash,
                createdAt: now,
            },
            {
                email: "lecturer@hiof.no",
                passwordHash,
                createdAt: now,
            },
            {
                email: "demo.user@campuschat.local",
                passwordHash,
                createdAt: now,
            },
            {
                email: "karolina.student@hiof.no",
                passwordHash,
                createdAt: now,
            },
            {
                email: "stefan.student@hiof.no",
                passwordHash,
                createdAt: now,
            },
        ])
        .returning({
            id: users.id,
            email: users.email,
        });

    const [anna, martin, lecturer, demo, karolina, stefan] = insertedUsers;

    await db.insert(profiles).values([
        {
            userId: anna.id,
            displayName: "Anna Larsen",
            status: "Student on the Web Applications course",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
        {
            userId: martin.id,
            displayName: "Martin Johansen",
            status: "Working on the course project",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
        {
            userId: lecturer.id,
            displayName: "Course Lecturer",
            status: "Responsible for Web Applications",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
        {
            userId: demo.id,
            displayName: "Demo User",
            status: "Testing CampusChat features",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
        {
            userId: karolina.id,
            displayName: "Karolina Nowak",
            status: "Focusing on UI and interaction design",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
        {
            userId: stefan.id,
            displayName: "Stefan Eriksen",
            status: "Working on database layer and seeding",
            avatarUrl: "",
            notificationsEnabled: true,
            updatedAt: now,
        },
    ]);

    console.log("Users and profiles seeded");

    return { anna, martin, lecturer, demo, karolina, stefan };
}

function makeSlug(name: string) {
    const base = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    const suffix = Date.now().toString(36);
    return `${base}-${suffix}`;
}

type SeededRooms = {
    globalRoom: { id: number; name: string };
    webAppsRoom: { id: number; name: string };
    examPrepRoom: { id: number; name: string };
    groupOneRoom: { id: number; name: string };
};

async function seedRoomsAndMemberships(
    usersSeeded: SeededUsers
): Promise<SeededRooms> {
    logStep("Seeding rooms and memberships");

    const now = new Date();

    const insertedRooms = await db
        .insert(rooms)
        .values([
            {
                name: "Global chat",
                visibility: "public",
                createdBy: null,
                createdAt: now,
                slug: GLOBAL_ROOM_SLUG,
            },
            {
                name: "Web Applications 2025",
                visibility: "private",
                createdBy: usersSeeded.demo.id,
                createdAt: now,
                slug: makeSlug("Web Applications 2025"),
            },
            {
                name: "Exam Prep – WebApps",
                visibility: "private",
                createdBy: usersSeeded.anna.id,
                createdAt: now,
                slug: makeSlug("Exam Prep – WebApps"),
            },
            {
                name: "Group 1 – CampusChat Project",
                visibility: "private",
                createdBy: usersSeeded.martin.id,
                createdAt: now,
                slug: makeSlug("Group 1 – CampusChat Project"),
            },
        ])
        .returning({
            id: rooms.id,
            name: rooms.name,
        });

    const [globalRoom, webAppsRoom, examPrepRoom, groupOneRoom] = insertedRooms;

    await db.insert(roomMemberships).values([
        {
            roomId: globalRoom.id,
            userId: usersSeeded.anna.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: globalRoom.id,
            userId: usersSeeded.martin.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: globalRoom.id,
            userId: usersSeeded.lecturer.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: globalRoom.id,
            userId: usersSeeded.demo.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: globalRoom.id,
            userId: usersSeeded.karolina.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: globalRoom.id,
            userId: usersSeeded.stefan.id,
            role: "member",
            joinedAt: now,
        },

        {
            roomId: webAppsRoom.id,
            userId: usersSeeded.demo.id,
            role: "owner",
            joinedAt: now,
        },
        {
            roomId: webAppsRoom.id,
            userId: usersSeeded.anna.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: webAppsRoom.id,
            userId: usersSeeded.martin.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: webAppsRoom.id,
            userId: usersSeeded.lecturer.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: webAppsRoom.id,
            userId: usersSeeded.karolina.id,
            role: "member",
            joinedAt: now,
        },

        {
            roomId: examPrepRoom.id,
            userId: usersSeeded.anna.id,
            role: "owner",
            joinedAt: now,
        },
        {
            roomId: examPrepRoom.id,
            userId: usersSeeded.martin.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: examPrepRoom.id,
            userId: usersSeeded.stefan.id,
            role: "member",
            joinedAt: now,
        },

        {
            roomId: groupOneRoom.id,
            userId: usersSeeded.anna.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: groupOneRoom.id,
            userId: usersSeeded.martin.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: groupOneRoom.id,
            userId: usersSeeded.karolina.id,
            role: "member",
            joinedAt: now,
        },
        {
            roomId: groupOneRoom.id,
            userId: usersSeeded.stefan.id,
            role: "member",
            joinedAt: now,
        },
    ]);

    console.log("Rooms and memberships seeded");

    return { globalRoom, webAppsRoom, examPrepRoom, groupOneRoom };
}

async function seedFriendships(usersSeeded: SeededUsers) {
    logStep("Seeding friendships");

    const now = new Date();

    const makePair = (a: number, b: number) =>
        a < b ? { userIdA: a, userIdB: b } : { userIdA: b, userIdB: a };

    await db.insert(friendships).values([
        {
            ...makePair(usersSeeded.anna.id, usersSeeded.martin.id),
            createdAt: now,
        },
        {
            ...makePair(usersSeeded.anna.id, usersSeeded.lecturer.id),
            createdAt: now,
        },
        {
            ...makePair(usersSeeded.demo.id, usersSeeded.anna.id),
            createdAt: now,
        },
        {
            ...makePair(usersSeeded.demo.id, usersSeeded.martin.id),
            createdAt: now,
        },
        {
            ...makePair(usersSeeded.karolina.id, usersSeeded.stefan.id),
            createdAt: now,
        },
        {
            ...makePair(usersSeeded.karolina.id, usersSeeded.anna.id),
            createdAt: now,
        },
    ]);

    console.log("Friendships seeded");
}

async function seedGlobalMessages(
    usersSeeded: SeededUsers,
    globalRoomId: number
) {
    logStep("Seeding global chat messages");

    const base = Date.now();
    const mkTime = (minutesOffset: number) =>
        new Date(base + minutesOffset * 60 * 1000);

    const authorMap: Record<string, SeededUser> = {
        anna: usersSeeded.anna,
        martin: usersSeeded.martin,
        lecturer: usersSeeded.lecturer,
        demo: usersSeeded.demo,
        karolina: usersSeeded.karolina,
        stefan: usersSeeded.stefan,
    };

    const rawMessages: Array<{
        author: keyof typeof authorMap;
        offset: number;
        body: string;
    }> = [
        {
            author: "anna",
            offset: 0,
            body: "Hi everyone, this is the shared global chat for the Web Applications course.",
        },
        {
            author: "martin",
            offset: 1,
            body: "I am currently working on the group assignment. How far have you come?",
        },
        {
            author: "anna",
            offset: 2,
            body: "We have implemented authentication and basic chat. Next step is notifications.",
        },
        {
            author: "lecturer",
            offset: 3,
            body: "Remember to push your code regularly and keep the README up to date.",
        },
        {
            author: "demo",
            offset: 4,
            body: "I tried the application locally. Rooms and direct messages seem to work well.",
        },
        {
            author: "martin",
            offset: 5,
            body: "Does anyone have a suggestion for how to structure services and repositories?",
        },
        {
            author: "lecturer",
            offset: 6,
            body: "Try to keep controllers thin and move logic into services where it makes sense.",
        },
        {
            author: "anna",
            offset: 7,
            body: "We also added a profile page where you can change display name, email and password.",
        },
        {
            author: "demo",
            offset: 8,
            body: "The seed data makes it much easier to test room invites and friend requests.",
        },
        {
            author: "martin",
            offset: 9,
            body: "I will run through the app once more before delivery to check edge cases.",
        },
        {
            author: "karolina",
            offset: 10,
            body: "I am checking how the UI behaves with long messages and different screen sizes.",
        },
        {
            author: "stefan",
            offset: 11,
            body: "Database seeding works fine now. It is easier to demonstrate the app to others.",
        },
        {
            author: "anna",
            offset: 12,
            body: "If someone finds issues with validation or error messages, please post them here.",
        },
        {
            author: "martin",
            offset: 13,
            body: "I like that notifications are kept simple but still useful for invites and requests.",
        },
        {
            author: "lecturer",
            offset: 14,
            body: "Make sure your error handling is clear enough for users who are not developers.",
        },
        {
            author: "karolina",
            offset: 15,
            body: "The profile page now shows the updated display name in the dashboard. Looks good.",
        },
        {
            author: "demo",
            offset: 16,
            body: "I tested logging in with different browsers. The session handling seems stable.",
        },
        {
            author: "stefan",
            offset: 17,
            body: "The friendships feature is helpful for testing direct messages without creating new users.",
        },
        {
            author: "anna",
            offset: 18,
            body: "For the report, we should describe how the architecture is separated into layers.",
        },
        {
            author: "martin",
            offset: 19,
            body: "Yes, we can mention services, repositories, controllers and routes with concrete examples.",
        },
        {
            author: "karolina",
            offset: 20,
            body: "I will add a short section about usability and how notifications support collaboration.",
        },
        {
            author: "lecturer",
            offset: 21,
            body: "Remember that the assignment is about both code quality and user experience.",
        },
        {
            author: "demo",
            offset: 22,
            body: "I tried inviting a friend and accepting the invite. The rooms list updated correctly.",
        },
        {
            author: "anna",
            offset: 23,
            body: "We also verified that deleting a room removes messages and memberships correctly.",
        },
        {
            author: "stefan",
            offset: 24,
            body: "Global chat history is now long enough to scroll and test the auto scroll behaviour.",
        },
        {
            author: "martin",
            offset: 25,
            body: "If there is time left, we could add small improvements to empty states and loading texts.",
        },
        {
            author: "karolina",
            offset: 26,
            body: "I updated some text labels so they sound natural and not too technical.",
        },
        {
            author: "lecturer",
            offset: 27,
            body: "This chat log is a good example of how to demonstrate the application during grading.",
        },
        {
            author: "demo",
            offset: 28,
            body: "If anything breaks, you can always rerun the seed script and start from a clean state.",
        },
        {
            author: "anna",
            offset: 29,
            body: "Thanks everyone. I think the project is in a good state for submission now.",
        },
    ];

    for (const msg of rawMessages) {
        await db.insert(messages).values({
            roomId: globalRoomId,
            threadId: null,
            authorId: authorMap[msg.author].id,
            body: msg.body,
            createdAt: mkTime(msg.offset),
        });
    }

    console.log("Global chat messages seeded");
}

async function seedDmAndRoomMessages(
    usersSeeded: SeededUsers,
    roomsSeeded: SeededRooms
) {
    logStep("Seeding DM threads and room messages");

    const now = new Date();

    // DM thread between Anna and Demo
    const [annaDemoThread] = await db
        .insert(dmThreads)
        .values({ createdAt: now })
        .returning({ id: dmThreads.id });

    await db.insert(dmThreadParticipants).values([
        {
            threadId: annaDemoThread.id,
            userId: usersSeeded.anna.id,
            joinedAt: now,
        },
        {
            threadId: annaDemoThread.id,
            userId: usersSeeded.demo.id,
            joinedAt: now,
        },
    ]);

    // DM thread between Martin and Karolina
    const [martinKarolinaThread] = await db
        .insert(dmThreads)
        .values({ createdAt: now })
        .returning({ id: dmThreads.id });

    await db.insert(dmThreadParticipants).values([
        {
            threadId: martinKarolinaThread.id,
            userId: usersSeeded.martin.id,
            joinedAt: now,
        },
        {
            threadId: martinKarolinaThread.id,
            userId: usersSeeded.karolina.id,
            joinedAt: now,
        },
    ]);

    const t = (minutes: number) =>
        new Date(now.getTime() + minutes * 60 * 1000);

    const roomMessages = [
        {
            roomId: roomsSeeded.webAppsRoom.id,
            threadId: null,
            authorId: usersSeeded.demo.id,
            body: "Welcome to the Web Applications 2025 group. This room is used for course related communication and group work.",
            createdAt: t(0),
        },
        {
            roomId: roomsSeeded.webAppsRoom.id,
            threadId: null,
            authorId: usersSeeded.anna.id,
            body: "Hi everyone. I will mainly use this room to keep track of tasks and ask questions about the assignment.",
            createdAt: t(1),
        },
        {
            roomId: roomsSeeded.webAppsRoom.id,
            threadId: null,
            authorId: usersSeeded.lecturer.id,
            body: "This is a reminder that all group members should be added to the relevant rooms before the deadline.",
            createdAt: t(2),
        },
        {
            roomId: roomsSeeded.webAppsRoom.id,
            threadId: null,
            authorId: usersSeeded.martin.id,
            body: "We still need to test the behaviour when a room is deleted. I can look at that later today.",
            createdAt: t(3),
        },
        {
            roomId: roomsSeeded.webAppsRoom.id,
            threadId: null,
            authorId: usersSeeded.karolina.id,
            body: "I added some small visual improvements to the room list so it is easier to scan.",
            createdAt: t(4),
        },

        {
            roomId: roomsSeeded.examPrepRoom.id,
            threadId: null,
            authorId: usersSeeded.anna.id,
            body: "This room is for exam preparation. Feel free to share summaries, links and questions related to the syllabus.",
            createdAt: t(5),
        },
        {
            roomId: roomsSeeded.examPrepRoom.id,
            threadId: null,
            authorId: usersSeeded.martin.id,
            body: "I will upload notes from the last lecture later today.",
            createdAt: t(6),
        },
        {
            roomId: roomsSeeded.examPrepRoom.id,
            threadId: null,
            authorId: usersSeeded.stefan.id,
            body: "I collected a few links to example projects that might be helpful for revision.",
            createdAt: t(7),
        },

        {
            roomId: roomsSeeded.groupOneRoom.id,
            threadId: null,
            authorId: usersSeeded.anna.id,
            body: "For the report we should describe the main use cases and how they are supported by the application.",
            createdAt: t(8),
        },
        {
            roomId: roomsSeeded.groupOneRoom.id,
            threadId: null,
            authorId: usersSeeded.martin.id,
            body: "I can write a short section about the architecture and how we separated responsibilities.",
            createdAt: t(9),
        },
        {
            roomId: roomsSeeded.groupOneRoom.id,
            threadId: null,
            authorId: usersSeeded.karolina.id,
            body: "I will add a part about the user interface and what we did to keep it simple.",
            createdAt: t(10),
        },
        {
            roomId: roomsSeeded.groupOneRoom.id,
            threadId: null,
            authorId: usersSeeded.stefan.id,
            body: "I will document the seeding script and how to run migrations and seeds for the database.",
            createdAt: t(11),
        },
    ];

    const dmMessages = [
        {
            roomId: null,
            threadId: annaDemoThread.id,
            authorId: usersSeeded.anna.id,
            body: "Hi. I just wanted to check that the direct message feature works as expected.",
            createdAt: t(12),
        },
        {
            roomId: null,
            threadId: annaDemoThread.id,
            authorId: usersSeeded.demo.id,
            body: "Yes, it looks good. Messages in this thread are only visible to the two participants.",
            createdAt: t(13),
        },

        {
            roomId: null,
            threadId: martinKarolinaThread.id,
            authorId: usersSeeded.martin.id,
            body: "Can you check if the new styles for the dashboard look fine on smaller screens?",
            createdAt: t(14),
        },
        {
            roomId: null,
            threadId: martinKarolinaThread.id,
            authorId: usersSeeded.karolina.id,
            body: "Yes, I tested it. The layout works well on both laptop and mobile resolution.",
            createdAt: t(15),
        },
    ];

    for (const msg of [...roomMessages, ...dmMessages]) {
        await db.insert(messages).values({
            roomId: msg.roomId,
            threadId: msg.threadId,
            authorId: msg.authorId,
            body: msg.body,
            createdAt: msg.createdAt,
        });
    }

    console.log("DM threads and room messages seeded");
}

async function seedNotifications(
    usersSeeded: SeededUsers,
    roomsSeeded: SeededRooms
) {
    logStep("Seeding notifications");

    const now = new Date();

    await db.insert(notifications).values({
        userId: usersSeeded.martin.id,
        type: "room_invite",
        payload: JSON.stringify({
            roomId: roomsSeeded.webAppsRoom.id,
            roomName: roomsSeeded.webAppsRoom.name,
            invitedByUserId: usersSeeded.demo.id,
            invitedByEmail: usersSeeded.demo.email,
        }),
        createdAt: now,
        readAt: null,
    });

    await db.insert(notifications).values({
        userId: usersSeeded.karolina.id,
        type: "room_invite",
        payload: JSON.stringify({
            roomId: roomsSeeded.groupOneRoom.id,
            roomName: roomsSeeded.groupOneRoom.name,
            invitedByUserId: usersSeeded.martin.id,
            invitedByEmail: usersSeeded.martin.email,
        }),
        createdAt: now,
        readAt: null,
    });

    await db.insert(notifications).values({
        userId: usersSeeded.anna.id,
        type: "friend_request",
        payload: JSON.stringify({
            fromUserId: usersSeeded.demo.id,
            fromEmail: usersSeeded.demo.email,
        }),
        createdAt: now,
        readAt: null,
    });

    await db.insert(notifications).values({
        userId: usersSeeded.stefan.id,
        type: "friend_request",
        payload: JSON.stringify({
            fromUserId: usersSeeded.karolina.id,
            fromEmail: usersSeeded.karolina.email,
        }),
        createdAt: now,
        readAt: null,
    });

    console.log("Notifications seeded");
}

export async function runSeed() {
    console.log("=== CampusChat DB seeding ===");

    await clearDatabase();

    const usersSeeded = await seedUsers();
    const roomsSeeded = await seedRoomsAndMemberships(usersSeeded);
    await seedFriendships(usersSeeded);
    await seedGlobalMessages(usersSeeded, roomsSeeded.globalRoom.id);
    await seedDmAndRoomMessages(usersSeeded, roomsSeeded);
    await seedNotifications(usersSeeded, roomsSeeded);

    console.log("Seeding completed successfully.");
    console.log("You can log in with for example:");
    console.log("  Email:    anna.student@hiof.no");
    console.log("  Password: Password123!");
}
