import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/app/lib/mongoose";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Tài khoản",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Vui lòng nhập email và mật khẩu!");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });

        if (!user || (!user.password && user.email)) {
          throw new Error("Không tìm thấy người dùng với email này!");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Mật khẩu không đúng!");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_local_secret_for_skycast_ai",
  pages: {
    signIn: "/auth/login", // Tùy chỉnh trang đăng nhập sau 
  },
});

export { handler as GET, handler as POST };
