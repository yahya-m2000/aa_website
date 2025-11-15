export const stats = [
  {
    key: 'years',
    value: 2,
    suffix: '+',
  },
  {
    key: 'shipments',
    value: 500,
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
