import React, { useState, useEffect } from 'react';
import './nftCards.css';
import openseaLogo from '../images/opensea.png';
import blurLogo from '../images/blur.png';

const NftCards = () => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const fetchNfts = async () => {
      const response = await fetch('http://localhost:5000/nfts');
      const data = await response.json();
      const validNfts = [];

      for (const nft of data) {
        try {
          const metaResponse = await fetch(`http://localhost:5000/metadata/${nft.tokenid}`);
          const metadata = await metaResponse.json();
      
          if (metadata && metadata.name) { // Check if metadata is defined
            validNfts.push({ ...nft, metadata });
          }
        } catch (err) {
          console.error(`No valid metadata returned for token ID: ${nft.tokenid}`);
        }
      }
      
      

      setNfts(validNfts);
    };

    fetchNfts();
  }, []);
  

  return (
    <div className="card-grid">
      {nfts.map((nft) => (
        <div
          className="card"
          key={nft.tokenid}
          style={{ backgroundImage: `url(${nft.metadata.image})` }}
        >
          <div className="card-content">
            <h3 className="card-title">Token ID: {nft.tokenid}</h3>
            <div className="card-body">
              <p>All Time High: {parseFloat(nft.alltimehigh).toFixed(4)}</p>
              <p>
                Last Traded Price: {parseFloat(nft.lasttradeprice).toFixed(4)}
              </p>
              <p>Points: {nft.points}</p>
            </div>
            <div className="card-footer">
              <a
                href={`https://testnets.opensea.io/assets/goerli/0xbf093b07f732242fcc1eaa5446877b4495a1c376/${nft.tokenid}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img className="openseaLogo" src={openseaLogo} alt="OpenSea logo" />
              </a>
              <a
                href="https://blur.market/"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                <img className="blurLogo" src={blurLogo} alt="Blur Logo" />
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default NftCards;