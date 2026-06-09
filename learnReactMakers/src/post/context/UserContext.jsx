import { createContext, useState } from "react";

const USER_KEY = "app_user";

function getUserFromLocalStorage() {
  try {
    return (
      JSON.parse(localStorage.getItem(USER_KEY)) || {
        name: "",
        isLoggedIn: false,
      }
    );
  } catch {
    return { name: "", isLoggedIn: false };
  }
}

function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const UserContext = createContext(null); // wadah

// 2. state nama user disimpan di sini
export function UserProvider({ children }) {
  const [user, setUser] = useState(getUserFromLocalStorage());

  const handleSaveUser = (name) => {
    const newUser = { name, isLoggedIn: true };
    setUser(newUser);
    saveUser(newUser); // simpan ke localStorage
  };

  const clearUser = () => {
    const clearedUser = { name: "", isLoggedIn: false };
    setUser(clearedUser);
    saveUser(clearedUser);
  };

  return (
    <UserContext.Provider value={{ user, saveUser: handleSaveUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}