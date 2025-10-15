export type LoginFail = {
    ok: false;
    reason: "WRONG_CREDENTIALS" | "DATABASE_ERROR"; // for starters with define those 2
};

export type LoginSuccess = {
    ok: true;
    token: string;
    user: {
        id: number;
        email: string;
    };
};

export type LoginResult = LoginSuccess | LoginFail;
