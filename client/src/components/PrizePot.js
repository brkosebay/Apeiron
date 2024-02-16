import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './PrizePot.css';

const PrizePot = ({ walletAddress, provider }) => {
  const [ethBalance, setEthBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await provider.getBalance(walletAddress);
      const eth = ethers.utils.formatEther(balance);
      setEthBalance(eth);
    };

    fetchBalance();
  }, [walletAddress, provider]);

  return (
    <div className="prize-pot">
      <h3>Prize Pot:</h3>
      <p>{ethBalance} ETH</p>
    </div>
  );
};

export default PrizePot;
