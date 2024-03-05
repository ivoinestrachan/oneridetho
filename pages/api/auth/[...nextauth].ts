import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";

const prisma = new PrismaClient();

function mapGender(genderString: string) {
  switch (genderString?.toLowerCase()) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    default:
      return 'Other';
  }
}

const crypto = require('crypto');

function generateUniqueSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, 
        dob: { label: "Date of Birth", type: "date" },
        gender: { label: "Gender", type: "text" },
        phoneNumber: { label: "Phone Number", type: "text" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const account = await prisma.account.findUnique({
          where: { email: credentials.email },
        });

        if (!account) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const genderEnum = mapGender(credentials.gender);

          const user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: credentials.email,
              dob: new Date(credentials.dob),
              gender: genderEnum, 
              phone: credentials.phoneNumber
            },
          });

          await prisma.account.create({
            data: {
              userId: user.id,
              email: credentials.email,
              password: hashedPassword,
            },
          });

          return { id: user.id.toString(), email: user.email };
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, account.password);
        if (!isPasswordMatch) return null;

        return { id: account.userId.toString(), email: account.email };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    //@ts-ignore
    async jwt({ token, account, profile }) {
      if (account && profile) {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          user = await prisma.user.create({
            //@ts-ignore
            data: {
              email: profile.email,
              name: profile.name,
              photoUrl: profile.picture,
            },
          });
        } else if (account.provider === "google") {
          user = await prisma.user.update({
            where: { email: profile.email },
            data: {
              name: profile.name,
              photoUrl: profile.picture,
           
            },
          });
        }

        token.uid = user.id;
      }

      return token;
    },

    //@ts-ignore
    async session({ session, token }) {
      if (token.uid) {
        const user = await prisma.user.findUnique({
          where: { id: token.uid },
        });

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            name: user.name,
            dob: user.dob,
            gender: user.gender,
            image: user.photoUrl,
            phone: user.phone,
          };
        }
      }

      return session;
    },
  },
};
//@ts-ignore
export default NextAuth(authOptions);
