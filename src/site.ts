export const SITE_URL = 'https://dannymcgiffin.com';
export const SITE_NAME = 'Danny McGiffin';
export const PERSON_NAME = 'Danny McGiffin';
export const JOB_TITLE = 'Workflow automation and AI consultant';

export const LOCATION = {
	locality: 'Herndon',
	region: 'Virginia',
	regionCode: 'VA',
	country: 'US',
	countryName: 'United States'
} as const;

export const ENTITY_STATEMENT =
	'Danny McGiffin is a workflow automation and AI consultant based in Herndon, Virginia, serving businesses across Northern Virginia and the Washington, DC area.';

export const ABOUT_LOCATION =
	"I'm a workflow automation and AI consultant based in Herndon, Virginia. I work with small and midsize businesses across Northern Virginia and the Washington, DC area.";

export const HOME_DESCRIPTION =
	'I find the work that is eating your time and margin, redesign it, and automate what should not require a person, so your existing team can handle more.';

export const HOME_TITLE = 'Danny McGiffin: Grow the Business, Not the Back Office';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/danny-mcgiffin/';
export const X_URL = 'https://x.com/therealmcgiffin';

export const SAME_AS = [LINKEDIN_URL, X_URL] as const;

export const IMAGE_PATH = '/og-image.png';
export const LOGO_PATH = '/og-image.png';

export const KNOWS_ABOUT = [
	'Workflow automation',
	'Business process improvement',
	'Systems integration',
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
