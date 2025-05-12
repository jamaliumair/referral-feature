"use client";

import { auth } from "@/firebase/firebaseconfig";
import { setUser } from "@/lib/slices/referraSlice";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AuthListner() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = { uid: user.uid, email: user.email, displayName: user.displayName };
        dispatch(setUser(userData)); // ✅ Set user in Redux state
      }
    });

    return () => unsubscribe();
  }, []);
    return null; // No need to render anything
}
