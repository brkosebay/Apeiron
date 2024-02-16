import './App.css';
import Install from './components/Install';
import Home from './components/Home';
import Admin from './components/Admin';

import Explore from './components/Explore'
import { WalletProvider } from './WalletContext';
import { BrowserRouter, Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/navBar';
import LeaderboardPage from './components/LeaderboardPage';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
      mode: 'dark',
  },
});

function App() {
  if (window.ethereum) {
    return (
      <ThemeProvider theme={darkTheme}>
      <BrowserRouter>
        <WalletProvider>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/explorer" element={<Explore />}/>
          </Routes>
        </WalletProvider>
      </BrowserRouter>
      </ThemeProvider>
    );
  } else {
    return <Install />;
  }
}

export default App;
