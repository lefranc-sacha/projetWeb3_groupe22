import React from 'react';
import { Link } from 'react-router-dom';

const App = () => (
  <div>
    <h1>Welcome to the Country-Capital Game</h1>
    <Link to="/game">Start Game</Link>
  </div>
);

export default App;