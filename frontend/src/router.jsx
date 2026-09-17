import React, { useState, useEffect, createContext, useContext } from 'react';

const RouterContext = createContext({
  pathname: window.location.pathname,
  navigate: () => {}
});

export const CustomRouter = ({ children }) => {
  const [pathname, setPathname] = useState(window.location.pathname);

  const navigate = (to) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      setPathname(to);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return navigate;
};

export const useLocation = () => {
  const { pathname } = useContext(RouterContext);
  return { pathname };
};
