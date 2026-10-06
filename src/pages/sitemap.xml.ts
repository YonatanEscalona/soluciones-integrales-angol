import type { APIRoute } from 'astro';
import { services } from '../data/services';

export const GET: APIRoute = ({site}) => {
  const home = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/`, site).href;
  const urls = [home, ...services.map(service => new URL(`servicios/${service.slug}/`, home).href)];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url.replaceAll('&', '&amp;')}</loc></url>`).join('')}</urlset>`;
  return new Response(xml, {headers: {'Content-Type': 'application/xml; charset=utf-8'}});
};
