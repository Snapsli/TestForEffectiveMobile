import "dotenv/config";
export const env = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 8000,
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    NODE_ENV: process.env.NODE_ENV || "development",
};
if (!env.MONGO_URI)
    throw new Error("MONGO_URI is required");
if (!env.JWT_SECRET)
    throw new Error("JWT_SECRET is required");
