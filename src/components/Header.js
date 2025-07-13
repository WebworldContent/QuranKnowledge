import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe } from 'lucide-react';

const Header = ({ selectedLanguage, setSelectedLanguage }) => {
  const languages = [
    { key: 'english', label: 'English' },
    // { key: 'hinglish', label: 'Hinglish' },
    // { key: 'arabic', label: 'Arabic' },
    // { key: 'tafsir', label: 'Tafsir' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <BookOpen style={{ marginRight: '8px' }} />
          Quran Study
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/surahs" className="nav-link">All Surahs</Link>
          
          <div className="language-selector">
            <Globe size={16} />
            {languages.map(lang => (
              <button
                key={lang.key}
                className={`language-btn ${selectedLanguage === lang.key ? 'active' : ''}`}
                onClick={() => setSelectedLanguage(lang.key)}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 