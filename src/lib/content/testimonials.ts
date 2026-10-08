/** Client testimonials. The homepage renders the one flagged `featured`; case studies reference them by id. */
export type TestimonialId = 'roger-porres';

export interface Testimonial {
	readonly id: TestimonialId;
	readonly quote: string;
	readonly name: string;
	readonly role?: string;
	readonly context?: string;
	readonly featured?: boolean;
}

export const testimonials: readonly Testimonial[] = [
	{
		id: 'roger-porres',
		quote: '“Working with Danny was excellent. He didn’t just come in and automate what we had. He studied the problem, stripped away the noise, and eliminated work that shouldn’t have existed in the first place.”',
		name: 'Roger Porres',
		role: 'Director of Ancillary Services',
		featured: true,
	},
];

export const featuredTestimonial: Testimonial | undefined = testimonials.find((item) => item.featured);

export function testimonial(id: TestimonialId): Testimonial | undefined {
	return testimonials.find((item) => item.id === id);
}
