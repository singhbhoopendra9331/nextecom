import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return <div className="min-h-screen">
    <Button variant="outline" className="m-auto" asChild>
      <Link href="/admin">Test</Link>
    </Button>
  </div>;
}
