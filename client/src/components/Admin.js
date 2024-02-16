import React, { useContext, useEffect, useState } from 'react';
import { useWallet } from '../WalletContext';
import { ethers } from 'ethers';
import { Button, Box, TextField } from '@mui/material';
import Apeiron from '../artifacts/contracts/Apeiron.sol/Apeiron.json';

const ALLOWED_ADMINS = [
  'example_wallet_address',
  // Add more allowed admin addresses here
];

const contractAddress = '0xbf093B07F732242FCc1eAA5446877b4495A1c376';

function Admin() {
  const [isAllowed, setIsAllowed] = useState(false);
  const [publicMintOpen, setPublicMintOpen] = useState(false);
  const [whiteListMintOpen, setWhiteListMintOpen] = useState(false);
  const { walletAddress } = useWallet();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, Apeiron.abi, signer);

  const pauseContract = async () => {
    await contract.pause();
  };

  const unpauseContract = async () => {
    await contract.unpause();
  };

  const changeMintWindow = async () => {
    await contract.editMintWindow(publicMintOpen, whiteListMintOpen);
  };

  useEffect(() => {
    console.log(walletAddress)
    if (ALLOWED_ADMINS.includes(walletAddress)) {
      setIsAllowed(true);
    }
  }, [walletAddress]);

  if (!isAllowed) {
    return <div>
        <h1>Boo you are not admin!</h1>
    </div>;
  }

  return (
    <div>
      <h1>Admin Panel</h1>
      <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
        <Button onClick={pauseContract} variant="contained" sx={{ mb: 1 }}>
          Pause Contract
        </Button>
        <Button onClick={unpauseContract} variant="contained" sx={{ mb: 1 }}>
          Unpause Contract
        </Button>
        <TextField
          label="Public Mint Open"
          type="checkbox"
          onChange={(e) => setPublicMintOpen(e.target.checked)}
          sx={{ mb: 1 }}
        />
        <TextField
          label="White List Mint Open"
          type="checkbox"
          onChange={(e) => setWhiteListMintOpen(e.target.checked)}
          sx={{ mb: 1 }}
        />
        <Button onClick={changeMintWindow} variant="contained">
          Change Mint window
        </Button>
      </Box>
    </div>
  );
};

export default Admin;
