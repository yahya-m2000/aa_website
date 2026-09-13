'use client';

import { useTranslations } from 'next-intl';

/** A schematic trade corridor, intentionally not a geographic coverage map. */
export function TradeGlobe({ mode }: { mode: 'sea' | 'air' }) {
  const t = useTranslations('experience');
  return (
    <div className={`trade-globe trade-globe-${mode}`}>
      <svg viewBox="0 0 640 530" role="img" aria-label={t('routeAlt')}>
        <defs>
          <radialGradient id="globe-fill" cx="35%" cy="30%"><stop offset="0" stopColor="#292440" /><stop offset="1" stopColor="#12131c" /></radialGradient>
          <linearGradient id="route-gradient" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#e1d5fa" /><stop offset="1" stopColor="#a77cf2" /></linearGradient>
          <pattern id="land-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#91839d" /></pattern>
          <clipPath id="globe-clip"><circle cx="320" cy="265" r="221" /></clipPath>
        </defs>
        <circle cx="320" cy="265" r="249" fill="none" stroke="#aaa0bb" strokeOpacity=".12" strokeDasharray="2 8" />
        <circle cx="320" cy="265" r="221" fill="url(#globe-fill)" stroke="#625b72" strokeOpacity=".35" />
        <g clipPath="url(#globe-clip)" fill="none" stroke="#bcb1cb" strokeOpacity=".1">
          {[65, 135, 190].map((rx) => <ellipse key={rx} cx="320" cy="265" rx={rx} ry="221" />)}
          {[80, 155, 220, 290, 355, 420].map((y) => <path key={y} d={`M85 ${y} Q320 ${y + 62} 555 ${y}`} />)}
          <path d="M99 265h442M320 44v442" />
        </g>
        <g fill="url(#land-dots)" clipPath="url(#globe-clip)">
          <path d="m207 204 37-21 35 11 29 3 8 26 30 22 22 13-14 22-19 8-14 43-19 14-4 40-28 31-12-20-8-38-22-35-4-28-27-10-25-25 8-38z" />
          <path d="m276 154 12-29 29-10 21 12 16-26 39 7 26-18 38 32 42 6 41 50-19 32-32 8-20 32-23 2-12 33-16-12-17-35-21-7-17 14-19-30-34-12-12-20-33-9z" />
          <path d="m262 145-22 2-8 26 23 9 25-13zm122 149 9-18 10 30-5 19zm81 63 40-12 23 28-9 29-35 6-26-24zm-122 5-10 39 10 13 13-37z" />
        </g>
        <path className="trade-route-shadow" d={mode === 'sea' ? 'M457 203 C535 360 358 428 310 291' : 'M457 203 Q347 110 310 291'} fill="none" stroke="#9b71ed" strokeWidth="18" strokeOpacity=".08" />
        <path className="trade-route-line" d={mode === 'sea' ? 'M457 203 C535 360 358 428 310 291' : 'M457 203 Q347 110 310 291'} fill="none" stroke="url(#route-gradient)" strokeWidth="2" strokeDasharray="7 7" />
        <g fill="#d1b6ff"><circle cx="457" cy="203" r="5" /><circle cx="310" cy="291" r="5" /></g>
        <g fill="none" stroke="#c4a0ff"><circle className="trade-route-pulse" cx="457" cy="203" r="14" /><circle className="trade-route-pulse" cx="310" cy="291" r="14" /></g>
        <g fontFamily="sans-serif" fontSize="11" letterSpacing="2" fill="#eae4f2"><text x="455" y="175">{t('china')}</text><text x="230" y="324">{t('africa')}</text></g>
        <path d="M35 54h24M47 42v24M565 459h24M577 447v24" stroke="#a393b7" strokeOpacity=".6" />
      </svg>
      <div className="trade-globe-caption"><span className="trade-status-dot" />{t('corridor')}<span>CN → AF</span></div>
    </div>
  );
}
