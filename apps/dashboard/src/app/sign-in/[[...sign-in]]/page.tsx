import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

import { GryphonWordmark } from "@/components/brand/gryphon-mark";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gryphon-paper px-4">
      <Link href="/">
        <GryphonWordmark size="md" />
      </Link>
      <SignIn />
    </div>
  );
}
