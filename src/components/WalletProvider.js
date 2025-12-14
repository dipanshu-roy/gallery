import React, { useState, useEffect } from "react";
import WalletContext from "./WalletContext";
import { getToken } from "../storage/storage";

export default function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(0);

  const refreshWallet = async () => {
    try {
      const token = await getToken();

      if (!token) {
        setWallet(0);
        return;
      }

      const res = await fetch("http://3.110.147.202/api/wallet", {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const data = await res.json();

      if (data.status === 200) {
        setWallet(data.wallet_balance ?? 0);
      } else {
        setWallet(0);
      }
    } catch (e) {
      setWallet(0);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        refreshWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
