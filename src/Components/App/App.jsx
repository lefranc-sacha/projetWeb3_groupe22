import { Routes, Route } from 'react-router-dom';
import GamePage from '../Game/Game.jsx';
import StartPage from '../StartPage/StartPage.jsx';
import Statistics from '../Statistics/Statistics.jsx';
import GameTraining from '../GameTraining/GameTraining.jsx';
import StatisticPage from '../StatisticPage/StatisticPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/gameTraining" element={<GameTraining />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/statisticPage" element={<StatisticPage />} />
      <Route path="*" element={<StartPage />} />
    </Routes>
  );
}

export default App
