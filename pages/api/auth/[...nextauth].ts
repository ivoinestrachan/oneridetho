import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function mapGender(genderString: string) {
  switch (genderString.toLowerCase()) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    default:
      return 'Male';
  }
}




export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "DriverCredentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const account = await prisma.account.findUnique({
          where: { email: credentials.email },
        });

        if (!account) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          account.password
        );

        if (!passwordMatch) {
          return null;
        }

        return { id: account.userId.toString(), email: account.email};
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" }, 
        dob: { label: "Date of Birth", type: "date" },
        gender: { label: "Gender", type: "text" } ,
        phoneNumber: { label: "Phone Number", type: "text" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        let account = await prisma.account.findUnique({
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
