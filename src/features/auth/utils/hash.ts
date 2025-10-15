import bcrypt from "bcryptjs";

// This method is separated since we could potentially add more/different hashing methods
export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
}
