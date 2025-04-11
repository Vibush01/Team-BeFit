import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  useEffect(() => {
    // Test API connection
    fetch(import.meta.env.VITE_API_URL)
      .then((res) => res.text())
      .then((data) => console.log(data))
      .catch((err) => console.error('API connection error:', err));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-blue-600">Welcome to BeFit</h1>
    </div>
  );
}

export default App;