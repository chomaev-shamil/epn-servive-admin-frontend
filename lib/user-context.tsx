"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { CurrentUserResponse } from "@/types/admin";

interface UserContextValue {
  user: CurrentUserResponse | null;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
});

export function useCurrentUser() {
  return useContext(UserContext);
}

export function UserProvider({
  children,
  fetchUser,
}: {
  children: ReactNode;
  fetchUser: () => Promise<CurrentUserResponse>;
}) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
