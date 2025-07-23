"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { SignInWithGoogle, SignUp } from "@/firebase/firebaseAuth"
import { useAppSelector } from "@/lib/hooks"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"

type SignupFormProps = React.ComponentPropsWithoutRef<"div"> & {
  params?: {
    slug? : string | null;
  };
};

export function SignupForm({
  className,
  params,
  ...props
}: SignupFormProps ) {
  
  const error = useAppSelector((state) => state.referral.error);   
  const dispatch = useDispatch();
  const router = useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [name,setName] = useState("");
  const referralCode: string | null = params?.slug ?? null;
  console.log(referralCode)
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Signup</CardTitle>
          <CardDescription>
            Enter your email below to signup to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="name"
                  placeholder="Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required 
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer" onClick={(e) => {
                e.preventDefault();
                SignUp(name, email,password, referralCode, dispatch)
                }}>
                Signup
              </Button>
              <p className="text-red-600">{error}
              </p>
              <Button variant="outline" className="w-full cursor-pointer" onClick={(e) => {
                e.preventDefault();
                SignInWithGoogle(router, referralCode, dispatch)
              }}>
                Signup with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Alreaday Have an Account ?{" "}
              <Link href="./login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
