import { ethers } from "ethers";
import { createRequire } from 'node:module';
import axios from "axios";
import pool from '../server/db.js';
import io from './index.js';
import generateMetadata from './metadataGenerator/metadataGenerator.js';
const require = createRequire(import.meta.url);

const Apeiron = require("../client/src/artifacts/contracts/Apeiron.sol/Apeiron.json")

const contractAddress = '0xbf093B07F732242FCc1eAA5446877b4495A1c376';
const apiAddress = "https://testnets-api.opensea.io/api/v1/asset/";
const percentage = 0.15;
const mintPrice = 0.001;
const apiKey = "alchemy_api_key_here"
const network = "goerli"

async function getLastProcessedBlock() {
  try {
    const query = "SELECT block_number FROM last_processed_block WHERE id = 1";
    const result = await pool.query(query);
    return result.rows[0].block_number;
  } catch (error) {
    console.error("Error fetching last processed block number:", error);
    return null; // Or a default starting block if needed
  }
}

function updateLastProcessedBlock(blockNumber) {
  const query = "UPDATE last_processed_block SET block_number = $1 WHERE id = 1";
  const values = [blockNumber];
  pool.query(query, values, (error) => {
    if (error) {
      console.error("Error updating last processed block number:", error);
    }
  });
}

async function nftPrice(tokenID, from, to) {
  let previousPrice;
  let points;

  try {
    // Insert the details of the trade inside the nft_trades table.
    await pool.query(
      "INSERT INTO nft_trades (tokenID, from_address, to_address) VALUES ($1, $2, $3)",
      [tokenID, from, to]
    );

    // Incrament the nft trade count.
    await pool.query(
      "UPDATE nft SET trade_count = trade_count + 1 WHERE tokenid = $1",
      [tokenID]
    );

    // Get the details from the OpenSea API.
    console.log(apiAddress + contractAddress + "/" + tokenID)
    const response = await axios.get(apiAddress + contractAddress + "/" + tokenID);
    
    console.log("Token " + tokenID + " updated.");

    if (response.data.last_sale !== null) {
      const soldPrice = response.data.last_sale.total_price;
      const ethValue = parseFloat(ethers.formatEther(soldPrice));
      console.log(ethValue);

      const nft = await pool.query("SELECT * FROM nft WHERE tokenid = $1", [tokenID]);
      console.log(nft.rows);
      previousPrice = parseFloat(nft.rows[0].alltimehigh);
      points = nft.rows[0].points;
      tradeCount = nft.rows[0].trade_count;
      console.log(previousPrice);
      console.log(points);

      if (ethValue > previousPrice + (previousPrice * percentage)) {
        const newPoints = points + 100;
        await pool.query(
          "UPDATE nft SET points = $1 , alltimehigh = $2, lasttradeprice = $3 WHERE tokenid = $4",
          [newPoints, ethValue, ethValue, tokenID]
        );
      } else if (ethValue > previousPrice) {
        await pool.query(
          "UPDATE nft SET alltimehigh = $1, lasttradeprice = $2 WHERE tokenid = $3",
          [ethValue, ethValue, tokenID]
        );
      } else {
        await pool.query(
          "UPDATE nft SET lasttradeprice = $1 WHERE tokenid = $2",
          [ethValue, tokenID]
        );
      }
      const attributes = [
        {
          trait_type: "Rank",
          value: tokenID
        },
        {
          trait_type: "Times Traded",
          value: tradeCount
        },
        {
          trait_type: "All Time High",
          value: ethValue
        },
        {
          trait_type: "Points",
          value: points + 100
        }
      ]
      await pool.query(
        "UPDATE nftMetadata SET attributes = $1 WHERE tokenID = $2",
        [JSON.stringify(attributes), tokenID]
      );
      console.log(`Attributes for tokenID ${tokenID} have been updated.`);
      const updatedData = await pool.query("SELECT * FROM nft ORDER BY points DESC");
      io.emit('leaderboardUpdate', updatedData.rows);
      console.log("points have been updated");
    }
  } catch (err) {
    console.log(err.message);
  }
}

async function linkNftToUser(walletAddress, tokenID) {
  try {
    // Find the user ID associated with the wallet address
    const userQuery = "SELECT id FROM users WHERE walletAddress = $1";
    const userResult = await pool.query(userQuery, [walletAddress]);
    console.log(userResult.rows)
    const userID = userResult.rows[0].id;

    // Insert the relationship between the user and the NFT into the user_nfts table
    const insertQuery = "INSERT INTO user_nfts (user_id, tokenID) VALUES ($1, $2)";
    await pool.query(insertQuery, [userID, tokenID]);

    console.log(`Linked token ID ${tokenID} to user ID ${userID}`);
  } catch (error) {
    console.error("Error linking NFT to user:", error);
  }
}

async function updateNftLink(walletAddress, tokenID) {
  try {
    // Find the user ID associated with the wallet address
    const userQuery = "SELECT id FROM users WHERE walletAddress = $1";
    const userResult = await pool.query(userQuery, [walletAddress]);
    console.log(userResult.rows)
    const userID = userResult.rows[0].id;

    // Insert the relationship between the user and the NFT into the user_nfts table
    const updateQuery = "UPDATE user_nfts SET user_id = $1 WHERE tokenID = $2";
    await pool.query(updateQuery, [userID, tokenID]);

    console.log(`Updated link of token ID ${tokenID} to user ID ${userID}`);
  } catch (error) {
    console.error("Error updating linking NFT to user:", error);
  }
}



async function mintToDatabase(tokenID) {
  console.log("nft minted.")
  console.log(tokenID)
  const points = 0;
  const allTimeHigh = mintPrice;
  console.log(mintPrice)
  try {
    const newNft = await pool.query(
      "INSERT INTO nft (tokenID, contractAddress, allTimeHigh, points, lasttradeprice) VALUES ($1, $2, $3, $4, $5) RETURNING *"
      , [tokenID, contractAddress, allTimeHigh, points, 0]
    );
    const metadata = await generateMetadata(tokenID, mintPrice);
    console.log("Metadata created:", metadata);

    const result = await pool.query("INSERT INTO nftMetadata (tokenId, name, description, image, attributes) VALUES ($1, $2, $3, $4, $5)",
      [tokenID, metadata.name, metadata.description, metadata.image, JSON.stringify(metadata.attributes)]);

    const updatedData = await pool.query(
      "SELECT * FROM nft ORDER BY points DESC"
    );
    io.emit('leaderboardUpdate', updatedData.rows)
  } catch (error) {
    console.log(error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function processTransferEvents(fromBlock, contract, provider) {
  try {
    // Get the latest block number
    const latestBlockNumber = await provider.getBlockNumber();

    // Check if fromBlock is within the range
    if (fromBlock > latestBlockNumber) {
      console.log(`fromBlock (${fromBlock}) is greater than the latest block number (${latestBlockNumber}). Skipping processing.`);
      return;
    }

    const transferEvents = await contract.queryFilter('Transfer', parseInt(fromBlock));
    for (const event of transferEvents) {
      const decoded = contract.interface.decodeEventLog('Transfer', event.data, event.topics);
      const { from, to } = decoded;
      const value = decoded[2]
      const tokenID = Number(value)
      const blockNumber = event.blockNumber;
      console.log(`Transfer event triggered. Token ID: ${tokenID}, From: ${from}, To: ${to}, Block number: ${blockNumber}`);

      if (from == "0x0000000000000000000000000000000000000000") {
        mintToDatabase(tokenID)
      }
      else if (to == "0x0000000000000000000000000000000000000000") { }
      else {
        nftPrice(tokenID)
      }

      updateLastProcessedBlock(blockNumber);
      await sleep(3000)
    }
  } catch (error) {
    console.error("Error processing Transfer events:", error);
  }
}

async function nftTracker() {
  const provider = new ethers.AlchemyProvider(network, apiKey)
  const contract = new ethers.Contract(contractAddress, Apeiron.abi, provider);

  // Get the last processed block number from the database
  let lastProcessedBlock = await getLastProcessedBlock();

  lastProcessedBlock = parseInt(lastProcessedBlock) + 1;

  processTransferEvents(lastProcessedBlock, contract, provider);

  contract.on("Transfer", async (from, to, value, event) => {
    var fromVariable = from;
    var toVariable = to;
    var tokenID = ethers.formatUnits(value, 0);
    var blockNumber = event.log.blockNumber;
    if (fromVariable == "0x0000000000000000000000000000000000000000") {
      await mintToDatabase(tokenID); // add to database as its a mint
      await linkNftToUser(to.toLowerCase(), tokenID); // Link NFT to user  
    }
    else if (toVariable == "0x0000000000000000000000000000000000000000") { }
    else {
      setTimeout(nftPrice, 3000, tokenID, from, to); // wait 3 seconds before getting metadata
      updateNftLink(to.toLowerCase(), tokenID);
    }
    updateLastProcessedBlock(blockNumber);
    
  })
}

export default nftTracker;