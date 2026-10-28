/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.replace(/.*?\//, "")
  : "meeting-roon-system-Thanadon";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(isGithubActions ? { basePath: `/${repo}` } : {}),
};

export default nextConfig;
