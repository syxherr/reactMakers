import { useContext } from "react";
import { UserContext } from "../post/context/UserContext";
 
// 4. buat custom hook
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
 