import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Repertoire from './pages/Repertoire';
import ScrollToHash from './components/ScrollToHash';

function App() {
  return (
    <HelmetProvider>
      <Router basename="/">
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/repertoire" element={<Repertoire />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
