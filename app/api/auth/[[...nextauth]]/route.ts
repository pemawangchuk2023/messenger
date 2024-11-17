import bcrypt from "bcrypt"; 
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prismadb";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("Authorize attempt with:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("Invalid credentials: email or password missing");
          throw new Error("Invalid credentials");
        }
        const user = await prisma.user.findUnique({
          where: { 
            email: credentials.email
          },
        });
        
        if (!user || !user.hashedPassword) {
          console.log("User not found or no hashed password");
          throw new Error("Invalid credentials");
        }
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        console.log("Password match:", isCorrectPassword);
        
        if (!isCorrectPassword) {
          console.log("Incorrect password");
          throw new Error("Invalid credentials");
        }
        
        console.log("Authentication successful for:", user.email);
        return {
          id: user.id.toString(), 
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified ?? undefined, 
        };
      },
    })
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
 
    async signIn({ user }) {
      console.log(`User ${user.email} logged in successfully`);
      return true; 
    },
  }
};

// Export NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
