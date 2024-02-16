import express from 'express';
import pool from '../db.js';
const router = express.Router();
// all routes here start with /metadata


// Getting one nft metadata entry from database
router.get('/:id', async (req, rsp) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM nftMetadata WHERE tokenid = $1", [id]);
      const metadata = result.rows[0];
  
      // Check if metadata exists
      if (!metadata) {
        console.log(`No metadata found for token ID: ${id}`);
        return rsp.status(404).json({ error: 'Metadata not found' });
      }
  
      // Build the json object for metadata
      const metadataJSON = {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: metadata.attributes,
      };
  
      rsp.json(metadataJSON);
    } catch (err) {
      console.error(err.message);
      rsp.status(500).json({ error: 'An error occurred while fetching metadata' });
    }
  });
  


export default router;