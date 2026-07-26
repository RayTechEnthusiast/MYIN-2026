import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`brand image-brand ${compact ? "compact" : ""}`} aria-label="MYIN home">
      <Image
        src="/myin-logo.png"
        alt="MYIN — Muslim Youth Internship Network"
        width={240}
        height={160}
        priority
      />
    </Link>
  );
}
