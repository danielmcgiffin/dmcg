export const SITE_URL = 'https://dannymcgiffin.com';
export const SITE_NAME = 'Danny McGiffin';
export const PERSON_NAME = 'Danny McGiffin';
export const JOB_TITLE = 'Independent business advisor and designer';

export const LOCATION = {
	locality: 'Herndon',
	region: 'Virginia',
	regionCode: 'VA',
	country: 'US',
	countryName: 'United States'
} as const;

export const ENTITY_STATEMENT =
  'Danny McGiffin is an independent business advisor and designer based in Herndon, Virginia. He helps owners and executives decide what actually needs to change before a major technology or systems commitment.';

export const ABOUT_LOCATION =
  'Based in Herndon, Virginia, working with businesses across Northern Virginia and the Washington, DC area.';

export const HOME_DESCRIPTION =
  'Before you spend a bunch of money on a new system, make sure you actually need it. Independent advice for owners and executives from Danny McGiffin.';

export const HOME_TITLE = 'Danny McGiffin — Before You Buy a New System';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/danny-mcgiffin/';
export const X_URL = 'https://x.com/therealmcgiffin';

export const SAME_AS = [LINKEDIN_URL, X_URL] as const;

export const IMAGE_PATH = '/og-systems-decision.png';
export const LOGO_PATH = '/favicon.svg';

export const KNOWS_ABOUT = [
  'Business strategy', 'Operating-model design', 'Organizational design',
  'Decision-making', 'Ownership and accountability', 'Business systems',
  'Customer experience', 'Employee experience', 'Workflow design',
  'Systems integration', 'AI and automation'
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
