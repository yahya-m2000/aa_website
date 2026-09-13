import Image from "next/image";
import { useTranslations } from "next-intl";

export function AppPhone({ priority = false }: { priority?: boolean }) {
  const t = useTranslations("shop");
  return (
    <div className="app-device">
      <span className="app-device-button app-device-power" aria-hidden="true" />
      <span
        className="app-device-button app-device-volume"
        aria-hidden="true"
      />
      <div className="app-device-screen">
        <Image
          src="/images/aa-shop-pixel.webp"
          alt={t("phoneAlt")}
          width={837}
          height={1880}
          sizes="(max-width: 600px) 270px, (max-width: 1000px) 290px, 330px"
          priority={priority}
          quality={90}
        />
      </div>
    </div>
  );
}
