import { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
    return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
    const storedTokenData = localStorage.getItem('tokenData');
    const initialWalletAddress = storedTokenData ? JSON.parse(storedTokenData).walletAddress : '';

    const [walletAddress, setWalletAddress] = useState(initialWalletAddress);

    const value = {
        walletAddress,
        setWalletAddress,
    };

    return (
        <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
    );
};
