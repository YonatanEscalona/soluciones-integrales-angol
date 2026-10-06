import type { APIRoute } from 'astro';

// Crawlers use /robots.txt at the host root. A GitHub project subpath cannot set host-wide rules.
export const GET: APIRoute = ({site}) => {
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap.xml`, site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
