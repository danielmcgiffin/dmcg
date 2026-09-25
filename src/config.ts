export const BOOKING_URL = 'https://cal.com/dannymcgiffin/30min';
export const SUBSCRIBE_URL = 'https://therealmcgiffin.substack.com/subscribe';
export const GA_MEASUREMENT_ID = 'G-ZYTMP3PS7G';

/** Tag a booking link with the CTA it came from, so Cal.com records where the click started. */
export function bookingUrl(src: string): string {
	return `${BOOKING_URL}?src=${src}`;
}

/** Link directly to the publication's subscribe flow and identify the site placement. */
export function subscribeUrl(placement: string): string {
	const url = new URL(SUBSCRIBE_URL);
	url.searchParams.set('utm_source', 'dannymcgiffin.com');
	url.searchParams.set('utm_medium', 'website');
	url.searchParams.set('utm_campaign', 'writing');
	url.searchParams.set('utm_content', placement);
	return url.toString();
}
