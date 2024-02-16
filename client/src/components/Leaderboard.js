import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import FlipMove from 'react-flip-move';
import './Leaderboard.css';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState('rank');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const response = await fetch('http://localhost:5000/nfts/sorted');
      const data = await response.json();
      setLeaderboardData(data);
    };

    fetchLeaderboard();

    const socket = socketIOClient('http://localhost:5000');
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });
    socket.on('leaderboardUpdate', (updatedData) => {
      setLeaderboardData(updatedData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortType(e.target.value);
  };

  const sortedData = leaderboardData
    .filter((entry) =>
      entry.tokenid.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortType) {
        case 'rank':
          return a.tokenid - b.tokenid;
        case 'ath':
          return b.alltimehigh - a.alltimehigh;
        case 'ltp':
          return b.lasttradeprice - a.lasttradeprice;
        case 'points':
          return b.points - a.points;
        default:
          return 0;
      }
    });

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <div className="search-sort-container">
        <input
          type="text"
          placeholder="Search by Token ID..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <select value={sortType} onChange={handleSort}>
          <option value="rank">Rank</option>
          <option value="ath">All Time High</option>
          <option value="ltp">Last Traded Price</option>
          <option value="points">Points</option>
        </select>
      </div>
      <FlipMove>
        {sortedData.map((entry, index) => (
          <div className="entry" key={entry.tokenid}>
            <div className="rank">Rank: {index + 1}</div>
            <div className="name">Token ID: {entry.tokenid}</div>
            <div className="ath">
              All Time High: {parseFloat(entry.alltimehigh).toFixed(4)}{' '}
            </div>
            <div className="ltp">
              {' '}
              Last Traded Price: {parseFloat(entry.lasttradeprice).toFixed(4)}
            </div>
            <div className="score">Points: {entry.points}</div>
          </div>
        ))}
      </FlipMove>
    </div>
  );
};

export default Leaderboard;
