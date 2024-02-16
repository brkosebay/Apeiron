CREATE DATABASE apeiron;

CREATE TABLE nft(
    tokenID INT PRIMARY KEY,
    contractAddress VARCHAR(42),
    allTimeHigh DECIMAL(38,18),
    points INT,
    lastTradePrice DECIMAL(38,18),
    trade_count INT DEFAULT 0
);

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    walletAddress VARCHAR(42),
    nonce VARCHAR(32)
); 

CREATE TABLE nftMetadata(
    tokenID INT PRIMARY KEY REFERENCES nft(tokenID),
    name VARCHAR(255),
    description TEXT,
    image VARCHAR(255),
    attributes JSONB
);

-- Create table for storing the last processed block number
CREATE TABLE IF NOT EXISTS last_processed_block (
  id SERIAL PRIMARY KEY,
  block_number BIGINT NOT NULL
);

-- Insert a default row for the last processed block number
-- (only if the table is empty)
INSERT INTO last_processed_block (block_number)
SELECT 0
WHERE NOT EXISTS (SELECT 1 FROM last_processed_block WHERE id = 1);

CREATE TABLE nft_trades(
    id SERIAL PRIMARY KEY,
    tokenID INT REFERENCES nft(tokenID),
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_nfts(
    user_id INT REFERENCES users(id),
    tokenID INT REFERENCES nft(tokenID),
    PRIMARY KEY (user_id, tokenID)
);

