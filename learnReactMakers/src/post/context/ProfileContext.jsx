import { createContext, useState } from "react";
import { useUser } from "../../hooks/useUser";


export const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useUser();

  const [tagline, setTagline] = useState("Trying to romanticize my life 🌸");

  const profile = {
    greeting: user?.name ? `It's me, ${user.name}!` : `Welcome! there`,
    tagline,
  };

  const setProfile = ({ tagline: newTagline }) => {
  if (newTagline) setTagline(newTagline);
};

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}