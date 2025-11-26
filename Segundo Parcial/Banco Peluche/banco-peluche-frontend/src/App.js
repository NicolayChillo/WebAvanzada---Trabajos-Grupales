import './App.css';
import { Routes, Route } from 'react-router-dom';
import ClientsPage from './components/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ClientsPage />} />
        <Route path="/cliente/:id" element={<ClientDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;
