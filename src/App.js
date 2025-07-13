import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import SurahList from './components/SurahList';
import SurahDetail from './components/SurahDetail';
import './App.css';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  return (
    <Router>
      <div className="App">
        <Header 
          selectedLanguage={selectedLanguage} 
          setSelectedLanguage={setSelectedLanguage} 
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/surahs" element={<SurahList />} />
            <Route path="/surah/:surahNumber" element={
              <SurahDetail selectedLanguage={selectedLanguage} />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 