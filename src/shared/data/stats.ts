export const stats = [
  {
    key: 'years',
    value: 2,
    suffix: '+',
  },
  {
    key: 'countries',
    value: 5,
    suffix: '',
  },
] as const;

export type StatKey = typeof stats[number]['key'];
