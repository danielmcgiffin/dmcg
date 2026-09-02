export const SITE_URL = 'https://dannymcgiffin.com';
export const SITE_NAME = 'Danny McGiffin';
export const PERSON_NAME = 'Danny McGiffin';
export const JOB_TITLE = 'Operations engineer';

export const LOCATION = {
	locality: 'Herndon',
	region: 'Virginia',
	regionCode: 'VA',
	country: 'US',
	countryName: 'United States'
} as const;

export const ENTITY_STATEMENT =
	'Danny McGiffin — Operations Engineering is a founder-led operations engineering firm based in Herndon, Virginia, serving growing companies across Northern Virginia and the Washington, DC area.';

export const ABOUT_LOCATION =
	"I'm an operations engineer based in Herndon, Virginia. I work with growing companies across Northern Virginia and the Washington, DC area.";

export const HOME_DESCRIPTION =
	"I find the operational work consuming your team's time and margin, redesign it, and build the systems that give that capacity back.";

export const HOME_TITLE = 'Danny McGiffin — Operations Engineering';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/danny-mcgiffin/';
export const X_URL = 'https://x.com/therealmcgiffin';

export const SAME_AS = [LINKEDIN_URL, X_URL] as const;

export const IMAGE_PATH = '/og-image.png';
export const LOGO_PATH = '/og-image.png';

export const KNOWS_ABOUT = [
	'Operations engineering',
	'Workflow redesign',
	'Business process improvement',
	'Systems integration',
	'Internal software tools',
	'Workflow automation',
	'Artificial intelligence implementation'
] as const;

/** Regions named on the homepage and in the sitewide footer. */
export const PRIMARY_AREAS_SERVED = [
	{ type: 'City', name: 'Herndon' },
	{ type: 'AdministrativeArea', name: 'Northern Virginia' },
	{ type: 'AdministrativeArea', name: 'Washington, DC' }
] as const;

/** Cities and counties named on the Northern Virginia service page. */
export const SERVICE_AREA_PLACES = [
	'Herndon',
	'Reston',
	'Chantilly',
	'Fairfax',
	'Tysons',
	'McLean',
	'Vienna',
	'Ashburn',
	'Leesburg',
	'Arlington',
	'Alexandria',
	'Loudoun County',
	'Fairfax County',
	'Washington, DC'
] as const;
