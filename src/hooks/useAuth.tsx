import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { User as UserType } from "../../typings";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "../../firebase";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface IAuth {
  user: User | null;
  signUp: (
    email: string,
    password: string,
    username: string,
    photoURL: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  loading: boolean;
  getUserData: (userId: string) => Promise<UserType | null>;
}
interface AuthProviderProps {
  children: React.ReactNode;
}
const defaultUserType: UserType | null = null;
const AuthContext = createContext<IAuth>({
  user: null,
  signUp: async () => {},
  signIn: async () => {},
  logout: async () => {},
  error: null,
  loading: false,
  getUserData: async () => defaultUserType,
});

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();

  // Persisting the user.
  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // Logged in...
          setUser(user);
          setLoading(false);
        } else {
          // Not logged in...
          setUser(null);
          setLoading(true);
          router.push("/login");
        }

        setInitialLoading(false);
      }),
    [router]
  );

  const storage = getStorage();

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      photoURL: string
    ) => {
      setLoading(true);

      // Step 1: Create user with email and password
      await createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;

          // Step 2: Upload photoURL to Firebase Storage
          const photoRef = ref(storage, `profilePhotos/${user.uid}`);
          await uploadString(photoRef, photoURL, "data_url");

          // Step 3: Get the download URL of the uploaded photo
          const downloadURL = await getDownloadURL(photoRef);

          // Step 4: Update user profile with displayName and photoURL
          await updateProfile(user, {
            displayName: username,
            photoURL: downloadURL,
          });

          // Step 5: Store user profile data in Firestore
          await setDoc(doc(db, "users", user.uid), {
            displayName: username,
            photoURL: downloadURL,
            email: email,
          });

          router.push("/");
        })
        .catch((error) => alert(error.message))
        .finally(() => setLoading(false));
    },
    [router, storage]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);

      await signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          setUser(user);
          router.push("/");
        })
        .catch((error) => alert(error.message))
        .finally(() => setLoading(false));
    },
    [router]
  );

  const logout = async () => {
    setLoading(true);
    signOut(auth)
      .then(() => {
        setUser(null);
      })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false));
  };

  async function getUserData(userId: string): Promise<UserType | null> {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserType;
        return userData;
      } else {
        console.log("User not found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  const memoedValue = useMemo(
    () => ({
      user,
      signUp,
      signIn,
      loading,
      logout,
      error,
      getUserData,
    }),
    [user, signUp, signIn, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
