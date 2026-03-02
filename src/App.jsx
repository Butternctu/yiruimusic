import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import ScrollToHash from './components/ScrollToHash';

function App() {
  return (
    <Router basename="/">
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
