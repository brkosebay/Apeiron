import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config()
import { ethers } from 'ethers';
const router = express.Router();
import verifyJWT from '../middleware/verifyJWT.js';
// all routes here start with /users


function generateSecureNonce() {
    const nonce = crypto.randomBytes(16).toString('hex');
    return nonce;
}

// Check if a user with the given wallet address is registered
router.get('/:walletaddress', async (req, rsp) => {
    try {
        const { walletaddress } = req.params;
        const user = await pool.query("SELECT * FROM users WHERE walletaddress = $1", [walletaddress]);

        if (user.rows.length > 0) {
            rsp.json({ isRegistered: true });
        } else {
            rsp.json({ isRegistered: false });
        }
    } catch (err) {
        console.error(err.message);
        rsp.status(500).json({ message: err.message });
    }
})

// Registering one user
router.post('/register', async (req, rsp) => {
    try {
        const { walletaddress } = req.body;
        const existingUser = await pool.query("SELECT * FROM users WHERE walletaddress = $1", [walletaddress]);

        if (existingUser.rows.length > 0) {
            rsp.status(400).json({ message: "User already registered" });
            return;
        } else {
            // Generate a nonce for the new user
            const nonce = generateSecureNonce();
            console.log(nonce)
            // Insert the new user into the database
            await pool.query("INSERT INTO users (walletaddress, nonce) VALUES ($1, $2)", [walletaddress, nonce]);
            rsp.status(200).json({ message: "User registered successfully" });

        }
    } catch (err) {
        console.error(err.message);
        rsp.status(500).json({ message: err.message });
    }
})

//Get users nonce
router.get('/:walletaddress/nonce', verifyJWT, async (req, rsp) => {
    try {
        const { walletaddress } = req.params;
        const user = await pool.query("SELECT * FROM users WHERE walletaddress = $1", [walletaddress]);

        if (user.rows.length > 0) {
            const nonce = await pool.query("SELECT nonce FROM users WHERE walletaddress = $1", [walletaddress]);
            rsp.json(nonce.rows[0]);
        } else {
            rsp.json({ isRegistered: false });
        }
    } catch (err) {
        console.error(err.message);
        rsp.status(500).json({ message: err.message });
    }
})

//Create/Update users nonce
router.post('/:walletaddress/signature', async (req, rsp) => {
    try {
        const { walletaddress } = req.params;
        const user = await pool.query("SELECT * FROM users WHERE walletaddress = $1", [walletaddress]);

        if (user.rows.length > 0) {
            const User = user.rows[0];
            const msg = `Nonce: ${User.nonce}`;
            // Verify signature
            const recoveredAddress = ethers.verifyMessage(msg, req.body.signature);
            if (recoveredAddress.toLowerCase() === walletaddress) {
                // Update user nonce
                const newNonce = generateSecureNonce();
                await pool.query('UPDATE users SET nonce = $1 WHERE walletaddress = $2', [newNonce, walletaddress]);

                // Set JWT token
                const token = jwt.sign({
                    _id: User.id,
                    address: User.walletaddress,
                }, process.env.jwtSecret, { expiresIn: '6h' });

                rsp.status(200).json({
                    success: true,
                    token: `Bearer ${token}`,
                    user: User,
                    msg: "You are now logged in.",
                });
            } else {
                rsp.status(401).send('Invalid credentials');
            }
        }
    } catch (err) {
        console.error(err.message);
        rsp.status(500).json({ message: err.message });
    }
})



router.get('/check-auth', (req, rsp) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return rsp.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
        if (err) { // The user is not authenticated
            return rsp.status(401).json({ message: 'Not authenticated' });
        }

        rsp.status(200).json({ message: "Authenticated" });
    });
});

//Get all nfts that user holds.
router.get('/:walletaddress/nfts', verifyJWT, async (req, rsp) => {
    try {
        const { walletaddress } = req.params;
        const nfts = await pool.query(`
        SELECT nft.*
        FROM user_nfts
        JOIN nft ON user_nfts.tokenID = nft.tokenID
        JOIN users ON user_nfts.user_id = users.id
        WHERE users.walletAddress = $1;
      `, [walletaddress]);
      return rsp.json(nfts.rows);; // This will contain all the NFTs for the wallet address
    } catch (error) {
      console.error("Error fetching NFTs for wallet address:", error);
      return null;
    }
})



export default router;