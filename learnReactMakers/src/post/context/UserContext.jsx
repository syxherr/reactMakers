import { createContext, useState } from "react";

export const UserContext = createContext(null); // wadah


// state nama user disimpan di sini
export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: "",
    isLoggedIn: false,
  });

  const saveUser = (name) => {
    setUser({ name, isLoggedIn: true });
  };

  const clearUser = () => {
    setUser({ name: "", isLoggedIn: false });
  };

  return (
    <UserContext.Provider value={{ user, saveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}