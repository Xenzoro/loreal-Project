/** @type {import('next').NextConfig} */

const nextConfig = {
  // Build the whole site to plain HTML, CSS and JS in out/. Hosted on Vercel at
  // the root of its domain; GitHub Pages only serves a redirect to it
  // (.github/workflows/pages-redirect.yml).
  output: "export",
  // Static export can't run the Next.js image optimizer, so images ship as is.
  // The logo is already a small WebP at its exact size.
  images: { unoptimized: true },
  // No cacheComponents: the build fails with it in export mode.
};

export default nextConfig;
