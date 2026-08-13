import {
	ENTITY_STATEMENT,
	HOME_DESCRIPTION,
	IMAGE_PATH,
	JOB_TITLE,
	KNOWS_ABOUT,
	LOCATION,
	PERSON_NAME,
	PRIMARY_AREAS_SERVED,
	SAME_AS,
	SITE_NAME,
	SITE_URL
} from '../site';

export const PERSON_ID = `${SITE_URL}/#person`;
export const SERVICE_ID = `${SITE_URL}/#service`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

type JsonLd = Record<string, unknown>;

function absoluteUrl(path: string): string {
	return new URL(path, SITE_URL).href;
}

function postalAddress() {
	return {
		'@type': 'PostalAddress',
		addressLocality: LOCATION.locality,
		addressRegion: LOCATION.regionCode,
		addressCountry: LOCATION.country
	};
}

function areaServed() {
	return PRIMARY_AREAS_SERVED.map((area) => ({
		'@type': area.type,
		name: area.name
	}));
}

export function personNode(): JsonLd {
	return {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: PERSON_NAME,
		url: SITE_URL,
		image: absoluteUrl(IMAGE_PATH),
		jobTitle: JOB_TITLE,
		description: ENTITY_STATEMENT,
		address: postalAddress(),
		knowsAbout: [...KNOWS_ABOUT],
		sameAs: [...SAME_AS],
		worksFor: { '@id': SERVICE_ID }
	};
}

export function professionalServiceNode(): JsonLd {
	return {
		'@type': 'ProfessionalService',
		'@id': SERVICE_ID,
		name: SITE_NAME,
		url: SITE_URL,
		image: absoluteUrl(IMAGE_PATH),
		logo: absoluteUrl(IMAGE_PATH),
		description: HOME_DESCRIPTION,
		founder: { '@id': PERSON_ID },
		employee: { '@id': PERSON_ID },
		address: postalAddress(),
		areaServed: areaServed(),
		knowsAbout: [...KNOWS_ABOUT],
		sameAs: [...SAME_AS],
		makesOffer: {
			'@type': 'Offer',
			url: `${SITE_URL}/ai-opportunity-sprint/`,
			itemOffered: {
				'@type': 'Service',
				name: 'AI Opportunity Sprint',
				url: `${SITE_URL}/ai-opportunity-sprint/`
			}
		}
	};
}

export function websiteNode(): JsonLd {
	return {
		'@type': 'WebSite',
		'@id': WEBSITE_ID,
		url: `${SITE_URL}/`,
		name: SITE_NAME,
		description: HOME_DESCRIPTION,
		inLanguage: 'en-US',
		publisher: { '@id': PERSON_ID }
	};
}

interface PageSchemaOptions {
	url: string;
	name: string;
	description: string;
	type?: 'WebPage' | 'ProfilePage' | 'ContactPage' | 'CollectionPage' | 'AboutPage';
	extra?: JsonLd[];
}

export function pageGraph({
	url,
	name,
	description,
	type = 'WebPage',
	extra = []
}: PageSchemaOptions): JsonLd {
	const pageId = `${url.replace(/#.*$/, '').replace(/\/?$/, '/')}#webpage`;
	const page: JsonLd = {
		'@type': type,
		'@id': pageId,
		url,
		name,
		description,
		isPartOf: { '@id': WEBSITE_ID },
		about: { '@id': PERSON_ID },
		mainEntity: type === 'ProfilePage' ? { '@id': PERSON_ID } : { '@id': SERVICE_ID }
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [websiteNode(), personNode(), professionalServiceNode(), page, ...extra]
	};
}

export function breadcrumbList(items: readonly { name: string; url: string }[]): JsonLd {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export function serviceNode(options: {
	id: string;
	name: string;
	description: string;
	url: string;
	areaServed?: readonly string[];
}): JsonLd {
	return {
		'@type': 'Service',
		'@id': options.id,
		name: options.name,
		description: options.description,
		url: options.url,
		provider: { '@id': PERSON_ID },
		serviceType: options.name,
		areaServed: (options.areaServed ?? PRIMARY_AREAS_SERVED.map((area) => area.name)).map((name) => ({
			'@type': 'AdministrativeArea',
			name
		}))
	};
}

export function articleNode(options: {
	url: string;
	headline: string;
	description: string;
	datePublished: Date;
}): JsonLd {
	return {
		'@type': 'BlogPosting',
		headline: options.headline,
		description: options.description,
		datePublished: options.datePublished.toISOString(),
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		mainEntityOfPage: options.url,
		url: options.url
	};
}

export function reviewNode(options: {
	reviewBody: string;
	authorName: string;
	authorJobTitle?: string;
	organization?: string;
}): JsonLd {
	const author: JsonLd = {
		'@type': 'Person',
		name: options.authorName
	};
	if (options.authorJobTitle) {
		author.jobTitle = options.authorJobTitle;
	}
	if (options.organization) {
		author.worksFor = {
			'@type': 'Organization',
			name: options.organization
		};
	}

	return {
		'@type': 'Review',
		itemReviewed: { '@id': SERVICE_ID },
		reviewBody: options.reviewBody,
		author
	};
}
