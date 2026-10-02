// src/CommonContext.js
import { createContext } from 'react';

const Commoncontext = createContext({
  user: null,
  refreshUser: () => Promise.resolve(),
});

export default Commoncontext;
