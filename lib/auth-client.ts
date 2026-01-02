
import { createAuthClient } from "better-auth/react";
import { API_URL } from "./config";

export const authClient = createAuthClient({
    baseURL: API_URL,
    basePath: "/api/auth",
    fetchOptions: {
        credentials: "include",
    },
});

export const { signIn, signUp, useSession, signOut } = authClient;



