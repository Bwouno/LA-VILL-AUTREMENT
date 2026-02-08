import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Team from './pages/Team/Team.jsx';
import Events from './pages/Events/Events.jsx';
import EventDetail from './pages/Events/EventDetail.jsx';
import Contact from './pages/Contact/Contact.jsx';
import AdminApp from './pages/Admin/AdminApp.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/" element={<Home />} />
        <Route path="/equipe" element={<Team />} />
        <Route path="/evenements" element={<Events />} />
        <Route path="/evenements/:slug" element={<EventDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
