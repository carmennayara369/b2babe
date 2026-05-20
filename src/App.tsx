import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Backoffice from './pages/Backoffice';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import AdminGlobal from './pages/AdminGlobal';
import ClientProfile from './pages/Client/ClientProfile';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/client" element={<ClientProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/backoffice" element={<Backoffice />} />
          <Route path="/admin" element={<AdminGlobal />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
