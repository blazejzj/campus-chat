import { route } from "rwsdk/router";
import { runSeed } from "@/server/db/seed";

// THIS CODE IS PURE FOR SEEDING PURPOSES!
// We created a route because we had problems with worker:run in scripts...
// so insetad ,it just open an url and it seeds from there.
export const devSeedRoutes = [
    route("/dev/seed", async () => {
        await runSeed();

        return new Response(
            JSON.stringify({
                ok: true,
                message: "Database seeded with demo data",
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }),
];

export default devSeedRoutes;
