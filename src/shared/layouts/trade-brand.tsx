import Image from "next/image";

export function TradeBrand() {
  return (
    <span className="trade-brand">
      <Image
        src="/logo.png"
        alt="A&A Trade Solutions"
        width={4801}
        height={3599}
        sizes="100px"
        priority
      />
    </span>
  );
}
