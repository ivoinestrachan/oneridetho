import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        let account = await prisma.account.findUnique({
          where: { email: credentials.email },
        });

        if (!account) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          const user = await prisma.user.create({
            data: {
              name: "John Doe",
              email: credentials.email,
              dob: new Date(),
              gender: "Other",
            },
          });

          account = await prisma.account.create({
            data: {
              userId: user.id,
              email: credentials.email,
              password: hashedPassword,
            },
          });
        }

        if (account) {
            return { id: account.userId.toString(), email: account.email };
          } else {
            throw new Error("Unable to create or authenticate account");
          }          
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

});
