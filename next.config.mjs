/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilita cache en desarrollo
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Force dynamic rendering en desarrollo
  experimental: {
    forceSwcTransforms: true,
  }
}

export default nextConfig;
