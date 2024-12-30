import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import SignUp from './pages/signup';
import Dashboard from './pages/dashboard';
import Game from './pages/game';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
           {/* route tanımlamaları */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
