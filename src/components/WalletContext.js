import { createContext } from "react";

const WalletContext = createContext({
  wallet: 0,
  setWallet: () => {},
  refreshWallet: () => {},
});

export default WalletContext;
