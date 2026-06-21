/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,           // enable gzip/brotli compression
  poweredByHeader: false,   // don't send X-Powered-By header
  reactStrictMode: true,    // catch bugs early in development
};


export default nextConfig;
