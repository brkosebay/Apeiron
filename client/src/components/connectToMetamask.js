import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Box } from '@mui/material';
import { ethers } from 'ethers';
import { useWallet } from '../WalletContext';

const api = "http://localhost:5000"


const ConnectToMetamask = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { walletAddress, setWalletAddress } = useWallet();


    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        const handleAccountsChanged = async(accounts) => {
            setIsAuthenticated(false);
            localStorage.removeItem('tokenData');
            if (accounts.length === 0) {
                console.log('Please connect to MetaMask.');
            } else {
                setWalletAddress(accounts[0]);
                await connectToMetamask();
            }
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        }
    }, [isAuthenticated]);

    const checkAuthStatus = async () => {
        const tokenData = localStorage.getItem('tokenData');
        if (!tokenData) return;

        const parsedTokenData = JSON.parse(tokenData);
        const token = parsedTokenData.token;
        setWalletAddress(parsedTokenData.walletAddress);
    
        try {
            const response = await axios.get(api + "/users/check-auth", {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.status === 200) {
                console.log("authenticated")
                setIsAuthenticated(true);
            }
        }
        catch (error) {
            console.log('Error checking authentication status: ', error);
        }
    }

    const connectToMetamask = async () => {
        if (isAuthenticated) {return};
        setIsLoading(true);
        try {
            // Connect to metamask and get user accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWalletAddress(walletAddress);
            // Check if user is registered, if not, register them
            const isRegistered = await checkIfUserRegistered(accounts[0]);

            if (!isRegistered) { // Register the user
                const responseRegister = await axios.post(api + '/users/register', { walletaddress: accounts[0] });
                if (responseRegister.status !== 200) {
                    console.error("Failed to register the user.");
                    return;
                }
            }
            // Request nonce from backend
            const responseNonce = await axios.get(api + '/users/' + accounts[0] + '/nonce');
            const nonce = responseNonce.data.nonce;

            // Sign message
            const signedMessage = await handleSignMessage(accounts[0], nonce);

            // Send signature to backend
            const responseSign = await axios.post(api + '/users/' + accounts[0] + '/signature', signedMessage);

            console.log(responseSign.data)
            // Set token in local state or context (if you are using context)
            // For this example, I'm not setting the token

            // If successful, redirect to home
            if (responseSign.status === 200) {
                console.log("successful.")
                const tokenData = {
                    token: responseSign.data.token,
                    walletAddress: accounts[0]
                }
                localStorage.setItem('tokenData', JSON.stringify(tokenData));
                setWalletAddress(accounts[0]);
                 // Update isAuthenticated state
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkIfUserRegistered = async (walletaddress) => {
        try {
            const response = await axios.get(`${api}/users/${walletaddress}`);
            return response.data.isRegistered;
        } catch (error) {
            console.error('Error checking user registration status:', error);

        }
    };

    const handleSignMessage = async (account, nonce) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const message = `Nonce: ${nonce}`;
        const signature = await signer.signMessage(message);
        return { account, signature };
    };

    return (
        <Button
            onClick={connectToMetamask}
            variant="contained"
            disabled={isLoading || isAuthenticated}
        >
            {isAuthenticated
                ? 'Already Connected'
                : isLoading
                    ? 'Connecting...'
                    : 'Connect to Metamask'}
        </Button>
    );
};

export default ConnectToMetamask;
