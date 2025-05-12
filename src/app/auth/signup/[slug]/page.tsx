"use client"
import { SignupForm } from "@/components/signup-form"
import { useParams } from "next/navigation"

export default function SignUp() {
  const param = useParams()
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm params={param}/>
      </div>
    </div>
  )
}
