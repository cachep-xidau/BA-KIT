/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@bsa-kit/shared'],
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
// Trigger Vercel deploy
