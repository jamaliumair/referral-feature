import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebaseconfig";
import { saveData } from "./firebaseFirestore";
import { AppDispatch } from "@/lib/store";
import { collection, DocumentData, getDocs, query, where } from "firebase/firestore";
import { checkReferralCode, errorState, setUser } from "@/lib/slices/referraSlice";

type checkCodeType = {
  error: boolean;
  ownerUid: string;
  referralDoc: DocumentData | null;
}

export async function SignUp(
  name: string,
   email: string,
   password: string,
   code: string | undefined,
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
      // const user = userCredential.user;
      console.log(`email => ${email}, password => ${password}`);
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

