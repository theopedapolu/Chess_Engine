/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    return config;
  },
  basePath: '/Chess_Engine',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;