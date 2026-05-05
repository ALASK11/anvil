/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', '@google-cloud/cloud-sql-connector'],
}

module.exports = nextConfig
