import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const expectedUsername = process.env.ADMIN_USERNAME || "admin";
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!credentials?.username || !credentials?.password) return null;
        if (!passwordHash) return null;
        if (credentials.username !== expectedUsername) return null;

        const valid = await bcrypt.compare(credentials.password, passwordHash);
        if (!valid) return null;

        return { id: "1", name: expectedUsername };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
