const repoName = 'SmartContract'; // ตัวอย่าง ถ้า repo ชื่อ nextjs-blog

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: `/${repoName}`,
  assetPrefix: `/${repoName}/`,
};

module.exports = nextConfig;


export default nextConfig;
