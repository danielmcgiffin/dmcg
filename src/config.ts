export const BOOKING_URL = 'https://cal.com/dannymcgiffin/30min';

/** Tag a booking link with the CTA it came from, so Cal.com records where the click started. */
export function bookingUrl(src: string): string {
	return `${BOOKING_URL}?src=${src}`;
}
