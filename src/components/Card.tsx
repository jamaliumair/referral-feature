"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Unsubscribe } from "firebase/auth"
import { auth, db } from "@/firebase/firebaseconfig"
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy as CopyIcon } from "lucide-react"
import { createReferralCode } from "@/firebase/firebaseFirestore"
import { SignOut } from "@/firebase/firebaseAuth"
import { useDispatch } from "react-redux"

type userType = {
  id: string,
  Coins: number,
  name: string,
  email: string,
  referralCount: number
} | null;

export function CardWithForm() {

 function generateReferralCode(length = 6): string {
  return [...crypto.getRandomValues(new Uint8Array(length))]
    .map((n) => (n % 36).toString(36))
    .join('')
    .toUpperCase();
}

  const [code, setCode] = useState("")
  const [user, setUser] = useState<userType[] | null>(null)
  const [name, setName] = useState("")
  const [copied, setCopied] = useState(false)
  const [coins, setCoins] = useState(0)
  const [countReferrals, setCountReferrals] = useState(0)
  const dispatch = useDispatch();

  // referralCode = generateRandomCode(6); // e.g., 'A1B2C3'
  const referralLink = `http://localhost:3000/auth/signup/${code}`
  const uid = auth?.currentUser?.uid;
 

  const readUser = useRef<Unsubscribe | null>(null)
  const getData = useCallback(() => {
    const collectionRef = collection(db, "users");
    console.log(`uid is this ${uid}`)
    const condition = where("uid", "==", uid)
    const q = query(collectionRef, condition);
    readUser.current = onSnapshot(q, (querySnapshot) => {
      const userData: userType[] = querySnapshot.docs.map((userDoc) => {
        const data = userDoc.data();
        console.log("user data => ,", data);
        return {
          id: userDoc.id,
          Coins: data.coins || 0,
          name: data.name,
          email: data.email,
          referralCount: data.countReferrals
        };
      });
      setUser(userData);
      setName(userData[0]?.name || "")
      setCoins(userData[0]?.Coins || 0)
      setCountReferrals(userData[0]?.referralCount || 0)
      console.log("Umair jamali", user);
    });
  }, [uid]);

 useEffect(() => {
    if (!uid) return;
    setCode(generateReferralCode())
    getData();
    return () => {
      if (readUser.current) {
        console.log("component unmount")
        readUser.current();
      }
    }
  }, [uid, getData])
  
  const handleCopy = async() => {
    setCode(generateReferralCode())
await createReferralCode(code, uid!);
    navigator.clipboard.writeText(referralLink!).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Referral Stats</CardTitle>
        <CardDescription>This cards lets you know the referral stats.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name" value={name} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Refferal Link</Label>
              <Input id="name" placeholder="Referral Link" value={referralLink} readOnly />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Coins</Label>
              <Input id="coins" placeholder="coins" value={coins} readOnly />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Total Users Referred</Label>
              <Input id="coins" placeholder="" value={countReferrals} readOnly />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => SignOut(dispatch)}>Sign Out</Button>
        {/* <Button>Copy</Button> */}
        <Button onClick={handleCopy} className="flex gap-2 items-center">
          {
            copied ?
              <>
                <Check className="h-4 w-4" /> Copied
              </> :
              <>
                <CopyIcon className="h-4 w-4" /> Copy
              </>
          }
        </Button>
      </CardFooter>
    </Card>
  )
}

