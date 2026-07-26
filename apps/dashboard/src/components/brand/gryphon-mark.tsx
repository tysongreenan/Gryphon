import Image from "next/image";

import { cn } from "@/lib/utils";

const MARK_SRC = "/brand/gryphon-mark.png";
const HERO_SRC = "/brand/gryphon-hero.jpg";

/** Wing / rising-signal mark from the Gryphon brand system. */
export function GryphonMark({
  className,
  alt = "Gryphon",
  priority = false,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK_SRC}
      alt={alt}
      width={128}
      height={128}
      priority={priority}
      className={cn("size-8 object-contain", className)}
    />
  );
}

/** Larger mark for sign-in / marketing hero panels. */
export function GryphonHeroMark({
  className,
  alt = "Gryphon",
  priority = false,
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={HERO_SRC}
      alt={alt}
      width={520}
      height={520}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}

export function GryphonWordmark({
  size = "md",
  className,
  priority = false,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
}) {
  const mark =
    size === "sm" ? "size-7" : size === "lg" ? "size-[42px]" : "size-[30px]";
  const text =
    size === "sm"
      ? "text-[17px]"
      : size === "lg"
        ? "text-2xl"
        : "text-lg";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <GryphonMark className={mark} priority={priority} alt="" />
      <span
        className={cn(
          "font-medium tracking-[-0.03em] text-gryphon-ink",
          text,
        )}
      >
        Gryphon
      </span>
    </span>
  );
}
