/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  env: {
    API_KEY: process.env.API_KEY,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.NEXTAUTH_SECRET,
  },
}

module.exports = nextConfig;
