export const testimonials = [
  { id: 'sample1' },
  { id: 'sample2' },
  { id: 'sample3' },
] as const;

export type TestimonialId = typeof testimonials[number]['id'];
