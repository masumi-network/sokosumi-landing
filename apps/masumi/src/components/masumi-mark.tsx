import Image from "next/image";

type MasumiMarkProps = {
  size?: number;
  className?: string;
};

export function MasumiMark({ size = 40, className = "" }: MasumiMarkProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="Masumi"
      width={size}
      height={size}
      className={`animate-masumi-logo-enter rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      priority
      unoptimized
    />
  );
}
