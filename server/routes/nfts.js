import express from 'express';
import pool from '../db.js';
import io from '../index.js';
const router = express.Router();
import verifyJWT from '../middleware/verifyJWT.js';
// all routes here start with /nfts

// Getting all nft entries in database
router.get('/', async(req, rsp) => {
    try{
        const allNfts = await pool.query("SELECT * FROM nft");
        rsp.json(allNfts.rows);
    }
    catch (err) {
        rsp.status(500).json({message: err.message});
    }
})

router.get('/sorted', async(req, rsp) => {
    try {
        const sortedNfts = await pool.query(
            "SELECT * FROM nft ORDER BY points DESC"
        );
        rsp.json(sortedNfts.rows);
    } catch (err) {
        console.error(err.message);
    }
})

// Getting one nft entry from database
router.get('/:id', async(req, rsp) => {
    try {
        const { id } = req.params;
        const nft = await pool.query("SELECT * FROM nft WHERE tokenid = $1",
        [id]);
        rsp.json(nft.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

// Creating one nft entry
router.post('/', verifyJWT, async(req, rsp) => {
    try {
        const { tokenid,contractaddress, alltimehigh, points  } = req.body;
        const newNft = await pool.query(
            "INSERT INTO nft (tokenid, contractaddress, alltimehigh, points) VALUES ($1, $2, $3, $4) RETURNING *"
            , [tokenid, contractaddress, alltimehigh, points]
        );
        rsp.json(newNft.rows[0]);
        const updatedData = await pool.query(
            "SELECT * FROM nft ORDER BY points DESC"
        );
        io.emit('leaderboardUpdate', updatedData.rows);
    } catch (err) {
        console.error(err.message);
    }
})

// Update one nft entry
router.put('/:id', verifyJWT, async(req, rsp) => {
    try {
        const { id } = req.params;
        const { contractAddress, tokenId, points } = req.body;
        const updateNft = await pool.query(
            "UPDATE nft SET contractAddress = $1, points = $2 WHERE tokenId = $3"
            , [contractAddress, points, tokenId]
        );
        rsp.json("NFT was updated.");
    } catch (err) {
        console.error(err.message)
    }

})

// Delete one nft entry
router.delete('/:id', verifyJWT, async(req, rsp) => {
    try {
        const { id } = req.params;
        const deleteNft = await pool.query(
            "DELETE FROM nft WHERE tokenId = $1"
        , [id]
        );
        rsp.json("NFT was deleted.");
    } catch (err) {
        console.error(err.message)
    }

})

export default router;