import React, { useState, createContext, useContext, ReactNode, useMemo } from 'react';

type NavbarContextApi = {
  title?: string;
  setTitle: (value: string) => void;
}

const NavbarContext = createContext<NavbarContextApi>({
  setTitle: () => { /* noop */ }
});

const useNavbarApi = () => {
  const [title, setTitle] = useState<string>();

  return useMemo(() => ({
    title,
    setTitle
  }), [title, setTitle]);
};

type NavbarContextProviderProps = {
  children: ReactNode;
}

const NavbarContextProvider = ({ children }: NavbarContextProviderProps) => {
  const state = useNavbarApi();

  return (
    <NavbarContext.Provider value={state}>
      {children}
    </NavbarContext.Provider>
  );
};

const useNavbar = () => useContext(NavbarContext);

export {
  NavbarContext,
  NavbarContextProvider,
  useNavbar
};
