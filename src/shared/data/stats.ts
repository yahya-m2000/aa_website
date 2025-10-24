export const stats = [
  {
    key: 'years',
    value: 15,
    suffix: '+',
  },
  {
    key: 'shipments',
    value: 5000,
    suffix: '+',
  },
  {
    key: 'countries',
    value: 12,
    suffix: '',
  },
  {
    key: 'satisfaction',
    value: 98,
    suffix: '%',
  },
] as const;

export type StatKey = typeof stats[number]['key'];
