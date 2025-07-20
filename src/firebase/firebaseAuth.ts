import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  signInWithPopup, GoogleAuthProvider
} from "firebase/auth";
import { auth, db } from "./firebaseconfig";
import { saveData } from "./firebaseFirestore";
import { AppDispatch } from "@/lib/store";
import { collection, doc, DocumentData, DocumentReference, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { checkReferralCode, errorState, setUser } from "@/lib/slices/referraSlice";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type checkCodeType = {
  error: boolean;
  ownerUid: string;
  referralDoc: DocumentData | null;
}

type UserType = {
  name: string;
  email: string;
  isEmailVerified?: boolean;
  uid: string;
  coins: number;
  countReferrals?: number;
  referrals?: Array<{ name: string; email: string }>;
  referredBy?: { uid: string };
}
export async function SignUp(
  name: string,
  email: string,
  password: string,
  code: string | null,
  dispatch: AppDispatch
) {
  let hasError: checkCodeType;
  if (code) {
    hasError = await checkCode(code, dispatch);
    if (hasError?.error) return;
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      console.log(`name => ${name}, email => ${email}, password => ${password}`);
      const userObj = {
        name,
        email,
        uid: user.uid,
        coins: 0,
        countReferrals: 0,
        ...(code && {
          referrals: []
        }
        )
      }


      console.log(`data to be saved  => ${userObj}`)
      saveData(userObj, code, hasError?.ownerUid, hasError?.referralDoc)
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("errorCode => ", errorCode);
      dispatch(errorState(errorMessage));
      // ..
    });
}

export function SignIn(email: string, password: string, dispatch: AppDispatch) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log(`email => ${email}, password => ${password}, uid => ${user.uid}`);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("errorCode => ", errorCode);
      dispatch(errorState(errorMessage));

    });
}


export function SignOut(dispatch: AppDispatch) {
  signOut(auth).then(() => {
    // Sign-out successful.
    dispatch(setUser(null));
  }).catch((error) => {
    // An error happened.
    console.log("error signing out => ", error.message);
  });
}


const checkCode = async (code: string, dispatch: AppDispatch): Promise<checkCodeType> => {
  if (code) {
    const q = query(collection(db, "referralCodes"), where("code", "==", code));
    const snapshot = await getDocs(q);
    console.log("snapshot => ", snapshot);
    if (!snapshot.empty) {
      console.log("snapshot is not empty", snapshot);
      const referralDoc = snapshot.docs[0];
      const { usedCount, ownerUid } = referralDoc.data();

      if (usedCount >= 1) {
        dispatch(checkReferralCode("This code has already been used."));
        return { error: true, ownerUid: "", referralDoc: null };
      }
      return { error: false, ownerUid, referralDoc };
    }
  }
  return { error: true, ownerUid: "", referralDoc: null };
};


const provider = new GoogleAuthProvider();
export const SignInWithGoogle = (router: AppRouterInstance, code: string | null) => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      let user = result.user;
      const userObj: UserType = {
        uid: user.uid,
        email: user.email ?? "",
        name: user.displayName ?? "",
        isEmailVerified: user.emailVerified ?? false,
        coins: 0,
        countReferrals: 0,
        ...(code && {
          referrals: []
        }
        )
      }
      const docRef = doc(db, 'users', user.uid)
      checkingUserInDb(docRef, userObj)
      router.push("/dashboard");
    }).catch((error) => {
    console.error("error occured => ", error.code);
    // // Handle Errors here.
    // const errorCode = error.code;
    // const errorMessage = error.message;
    // // The email of the user's account used.
    // const email = error.customData.email;
    // // The AuthCredential type that was used.
    // const credential = GoogleAuthProvider.credentialFromError(error);
    // // ...
    });
}

async function checkingUserInDb(docRef: DocumentReference, user: UserType) {
  const currentUser = await getDoc(docRef);
  if (!currentUser.data()) {
    createUser(docRef, user);
  }
}

async function createUser(docRef: DocumentReference, user: UserType) {
  await setDoc(docRef, {
    user
  })
}
