import { business, serviceAreas } from '../data/business';
import { services, type Service } from '../data/services';

export function canonicalUrl(pathname: string, site: URL | string) {
  const url = new URL(pathname, site);
  url.search = '';
  url.hash = '';
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}

export function buildStructuredData(input: {home: string; canonical: string; title: string; description: string; image: string; service?: Service}) {
  const {home, canonical, title, description, image, service} = input;
  const businessId = `${home}#empresa`;
  const websiteId = `${home}#website`;
  const pageId = `${canonical}#webpage`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'GeneralContractor', '@id': businessId,
      name: business.name, url: home,
      telephone: business.telephone, email: business.email,
      logo: new URL('images/logo-soluciones-integrales.png', home).href,
      image: new URL('images/obra-casa-verde-hd.webp', home).href,
      description: 'Construcción de casas, quinchos, radieres y remodelaciones en Angol y La Araucanía.',
      address: {'@type': 'PostalAddress', streetAddress: business.streetAddress, addressLocality: business.city, addressRegion: business.region, addressCountry: business.country},
      areaServed: serviceAreas,
      ...(new URL(home).hostname !== new URL(business.originalWebsite).hostname ? {sameAs: [business.originalWebsite]} : {}),
      hasOfferCatalog: {'@type': 'OfferCatalog', name: 'Servicios de construcción', itemListElement: services.map(item => ({'@type': 'Offer', itemOffered: {'@type': 'Service', name: item.name, url: new URL(`servicios/${item.slug}/`, home).href, provider: {'@id': businessId}, areaServed: serviceAreas}}))},
    },
    {'@type': 'WebSite', '@id': websiteId, url: home, name: business.name, inLanguage: 'es-CL', publisher: {'@id': businessId}},
    {'@type': 'WebPage', '@id': pageId, url: canonical, name: title, description, inLanguage: 'es-CL', isPartOf: {'@id': websiteId}, about: {'@id': service ? `${canonical}#servicio` : businessId}, primaryImageOfPage: {'@type': 'ImageObject', url: image}},
  ];
  if (service) graph.push(
    {'@type': 'Service', '@id': `${canonical}#servicio`, name: service.heading.replace(/\.$/, ''), serviceType: service.name, description: service.intro, url: canonical, provider: {'@id': businessId}, areaServed: serviceAreas, mainEntityOfPage: {'@id': pageId}},
    {'@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Inicio', item: home},
      {'@type': 'ListItem', position: 2, name: service.name, item: canonical},
    ]},
  );
  return {'@context': 'https://schema.org', '@graph': graph};
}

export const serializeSchema = (schema: unknown) => JSON.stringify(schema).replace(/</g, '\\u003c');
