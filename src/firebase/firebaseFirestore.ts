"use client"
import { collection, addDoc, setDoc, doc, query, where, onSnapshot, updateDoc, increment, getDocs, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseconfig";
import type { AppDispatch } from "@/lib/store"; // Adjust the path to your store file
import { checkReferralCode, errorState } from "@/lib/slices/referraSlice";

type ReferredUser = {
  name: string;
  email: string;
};

type UserObj = {
  name: string;
  email: string;
  uid: string;
  coins: number;
  referredUser?: ReferredUser;
};

export const saveData = async (users: UserObj,
   code: string | undefined,
    ownerUid: string,
  referralDoc: any,
  ) => {
  try {
    const uid = users.uid;
    console.log(`uid => ${uid}`)
    console.log(`code => ${code}`)
    if (!uid) throw new Error("UID is undefined. Cannot save data.");

    const docRef = doc(db, "users", uid);

    if (code) {
    
        if (ownerUid !== uid) {
          const refDoc = doc(db, "users", ownerUid);
          const { name, email } = users;
          await updateDoc(refDoc, {
            countReferrals: increment(1),
            coins: increment(500),
            referrals: arrayUnion({
              name, email,
            })
          })

          await setDoc(doc(db, "users", users.uid), {
            ...users,
            referredBy: { uid: ownerUid }
          }, { merge: true });
          console.log("Referring User Updated Successfully");


          await updateDoc(referralDoc.ref, {
            usedCount: increment(1)
          });
          return;
        }
      }
      else {
        console.warn("No referrer found for link =>", code);
        await setDoc(docRef, users);
    } 
  }catch (e) {
    console.error("Error adding document: ", e);
  }
}



export const createReferralCode = async (code: string, ownerUid: string) => {
  try {
    console.log("Creating referral code with code:", code);
    const docRef = await addDoc(collection(db, "referralCodes"), {
      code: code,
      ownerUid: ownerUid,
      createdAt: serverTimestamp(),
      usedCount: 0,
    });

    console.log("Referral code created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating referral code:", error);
    throw error;
  }
};