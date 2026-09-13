import Image from "next/image";
import { appRelease } from "@/shared/data/app-release";

export function GooglePlayBadge() {
  const badge = (
    <Image
      src="/images/google-play-badge.png"
      width={646}
      height={250}
      alt="Get it on Google Play"
      sizes="200px"
    />
  );

  return (
    <a
      href={appRelease.googlePlayUrl}
      className="shop-play-badge"
      target="_blank"
      rel="noopener noreferrer"
    >
      {badge}
    </a>
  );
}
