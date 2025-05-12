// import { ModeToggle } from "@/components/togglemode";

import { Button } from "@/components/ui/button";
import Link from "next/link";



export default function Home() {
  return (
    // <h1>Hello World</h1>
    // <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 items-center justify-center min-h-screen">
      <Button type="submit" className="w-20">
        <Link href="/auth/login">Login</Link>
      </Button>
      <Button variant="outline" className="w-20">
      <Link href="/auth/signup">SignUp</Link>
      </Button>
    {/* </div>/ */}
    </div>
  )
}
