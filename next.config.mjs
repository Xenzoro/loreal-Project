/** @type {import('next').NextConfig} */

// GitHub Pages serves this repo at https://xenzoro.github.io/loreal-Project/,
// so every URL the build generates needs that prefix.
const basePath = "/loreal-Project";

const nextConfig = {
  // Build the whole site to plain HTML, CSS and JS in out/ (GitHub Pages has no server).
  output: "export",
  basePath,
  // Exposed to components that need to build asset URLs by hand (next/image does not add basePath).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // GitHub Pages can't run the Next.js image optimizer, so images ship as is.
  // The logo is converted to WebP at its display size ahead of time instead.
  images: { unoptimized: true },
  // No cacheComponents: it requires a server and the build fails with output: "export".
  // Static export already fails the build if anything tries to render per request.
};

export default nextConfig;
