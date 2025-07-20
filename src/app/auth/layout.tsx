
"use client"
import { RootState } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";




export default function AuthProtectedRoute({children}: {children: React.ReactNode}) {
    const route = useRouter();
    const pathname = usePathname();
    const slug = pathname.split("/").pop(); // get the last segment from path
    const isSlugPath = pathname.includes("/auth/signup/") && slug !== "signup";
    const user = useSelector((state: RootState) => state.referral.user);
    useEffect(() => {
            if (user) {                
                route.push("/dashboard")                
            }else if  (isSlugPath) {
                route.push(`/auth/signup/${slug}`)
            }

    },[user])
    return <>{children}</>;
}