import React from 'react';
import { ethers } from 'ethers';
import Apeiron from '../artifacts/contracts/Apeiron.sol/Apeiron.json';
import Leaderboard from './Leaderboard.js';
import PrizePot from './PrizePot';
import { Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';
const contractAddress = '0xbf093B07F732242FCc1eAA5446877b4495A1c376';



function leaderboardPage() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, Apeiron.abi, signer);

  const mintToken = async () => {
    const connection = contract.connect(signer);
    const addr = connection.address;
    const metadata = '';
    const result = await contract.publicMint(metadata, {
      value: ethers.utils.parseEther('0.001'),
    });
    await result.wait();
  }
  return (
    <Container>
      <Box mt={4}>
        <Typography variant="h3" align="center">
          Leaderboard
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button onClick={mintToken} variant="contained" color="secondary">
          Mint New Token
        </Button>
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <PrizePot />
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Leaderboard />
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
      </Box>
    </Container>
  );
}

export default leaderboardPage;