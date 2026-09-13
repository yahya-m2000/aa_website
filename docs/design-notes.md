# A&A Shop public app launch design

The public website advertises the launched A&A Shop app. Business sourcing, logistics, the company story, and contact remain below the app discovery experience.

## Visual system

- Outfit display typography and DM Sans body typography are scoped to the public locale layout.
- Cream, purple, lavender, peach, and soft green surfaces, with restrained scroll reveals and phone parallax.
- Header and content use the same responsive container.
- The original public/logo.png is proportionally cropped to its visible artwork. Header widths are 72px desktop and 64px mobile; footer widths are 84px and 76px.
- The compact footer contains navigation, contact and social links, copyright, and a back-to-top link.
- Reduced-motion preferences disable decorative movement. Radix handles menu and video dialog focus and dismissal.

## App identity and artwork

The English slogan is "Shop it. Make it yours." The Somali slogan is "Hadda Ka Iibso". Both appear in the home hero, the download call to action, the download page, and localized metadata.

AppPhone builds its hardware with CSS. Its inner viewport displays only the screen region of public/images/aa-shop-pixel.webp, based on the owner's A&A Shop screenshot. The generated outer phone and background are excluded from the visible region.

AppDownloadArt combines that screen with native SVG product illustrations, category cards, and subtle CSS motion. These illustrations have no raster background. They are decorative, hidden from assistive technology, and contain no invented prices or stock claims.

## Download flow

All Google Play badges link directly to the production listing defined in src/shared/data/app-release.ts:
https://play.google.com/store/apps/details?id=com.aatradesolutions.aacatalog&pcampaignid=web_share

The download-page QR code opens that same listing. Navigation and secondary app links still open the website's download page. The existing direct APK remains available in an alternative-download disclosure.

## Story videos

The original GitHub release assets use HEVC and omit Access-Control-Allow-Origin. Both issues could prevent browser playback. HEVC support depends on the browser and available decoders; see the [MDN codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs).

TradeVideo now serves optimized H.264/AAC MP4 copies from public/videos. The 720p, 30fps encodes use yuv420p pixels and fast-start metadata. Files and caption tracks share the website's origin, with native range requests for seeking. Large originals remain outside the source tree in .next/cache/aa-video.

Source-loading failures display a localized retry action and a direct-video link. A failed caption request does not replace an otherwise playable video.

To regenerate the published encodes from the original GitHub release files, use FFmpeg with: scale=-2:720,fps=30; libx264, preset slow, CRF 24, main profile, level 3.1, yuv420p, maxrate 1600k, bufsize 3200k; AAC 96k; movflags +faststart. Keep each complete original timeline so local captions stay synchronized.

## Contact form

Submitting the validated public form opens a mailto draft addressed to the existing business email. Its localized subject and body include name, email, phone, company, and the complete message. The form keeps its values, and a note below the submit button explains that visitors review and send from their own email app. The public form no longer posts to the contact API.

## Verification

- Production build, including TypeScript, and ESLint on changed public components passed.
- English and Somali home and download routes returned HTTP 200; Play badges use the supplied listing URL.
- English and Somali translation keys match.
- Both optimized videos passed complete decoding, H.264/AAC and fast-start checks, and local HTTP 206 seek requests. Their durations match the originals within 0.02 seconds.
- All four local caption files returned HTTP 200 with WEBVTT content.
- The old oversized footer phrase is absent from rendered pages.
- No admin portal or root layout/style files were edited.
- Browser visual, interaction, and playback checks could not run because the browser tool exposed no connected session. No enquiry emails were sent.
