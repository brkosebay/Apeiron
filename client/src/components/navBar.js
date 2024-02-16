import React from 'react';
import './navBar.css';
import ConnectToMetamask from './connectToMetamask';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className='navbar-item'>
        <span className='navbar-link'><ConnectToMetamask /></span>
        </li>
        <li className="navbar-item">
          <a href="/" className="navbar-link">Home</a>
        </li>
        <li className="navbar-item">
          <a href="leaderboard" className="navbar-link">Leaderboard</a>
        </li>
        <li className="navbar-item">
          <a href="explorer" className="navbar-link">Explorer</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
