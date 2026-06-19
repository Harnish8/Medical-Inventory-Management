import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing username or password");
        }
        
        await dbConnect();
        
        const user = await User.findOne({ username: credentials.username });
        
        if (!user || !user.password) {
          throw new Error("Invalid username or password");
        }
        
        if (user.status !== 'Active') {
          throw new Error("Account is inactive");
        }
        
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordMatch) {
          throw new Error("Invalid username or password");
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        } as any;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 minutes session timeout as per PRD
  },
  secret: process.env.NEXTAUTH_SECRET,
};
