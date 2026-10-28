/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;
let assetPrefix = undefined;
let basePath = undefined;

if (isGithubActions) {
  const repo = process.env.GITHUB_REPOSITORY
    ? process.env.GITHUB_REPOSITORY.replace(/.*?\//, "")
    : "meeting-roon-system-Thanadon";
  assetPrefix = `/${repo}/`;
  basePath = `/${repo}`;
}

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(isGithubActions ? { basePath, assetPrefix } : {}),
};

export default nextConfig;
