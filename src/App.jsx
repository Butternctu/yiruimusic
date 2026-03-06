import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Repertoire from './pages/Repertoire';
import ScrollToHash from './components/ScrollToHash';
import Layout from './components/Layout';

function App() {
  return (
    <HelmetProvider>
      <Router basename="/">
        <ScrollToHash />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="repertoire" element={<Repertoire />} />
          </Route>
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
