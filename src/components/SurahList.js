import React from 'react';
import { Link } from 'react-router-dom';
import quranData from '../data/quran.json';
import { Search, BookOpen } from 'lucide-react';

const SurahList = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const allSurahs = quranData.surahs;

  const filteredSurahs = allSurahs.filter(surah => {
    const matchesSearch = surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surah.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         surah.number.toString().includes(searchTerm);
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'meccan' && surah.revelationType === 'mekah') ||
                         (filterType === 'medinan' && surah.revelationType === 'madinah');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '3rem', color: 'white' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          <BookOpen style={{ marginRight: '10px', verticalAlign: 'middle' }} />
          All Surahs
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          Explore all 114 surahs of the Holy Quran
        </p>
      </div>

      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '2rem', 
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="text"
              placeholder="Search surahs by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '2px solid #e1e5e9',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['all', 'meccan', 'medinan'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #1a5f3a',
                  background: filterType === type ? '#1a5f3a' : 'transparent',
                  color: filterType === type ? 'white' : '#1a5f3a',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          <span>Showing {filteredSurahs.length} of {allSurahs.length} surahs</span>
          <span>Total: 114 Surahs</span>
        </div>
      </div>

      <div className="surah-grid">
        {filteredSurahs.map(surah => (
          <Link 
            key={surah.number} 
            to={`/surah/${surah.number}`}
            style={{ textDecoration: 'none' }}
          >
            <div className="surah-card">
              <div className="surah-number">{surah.number}</div>
              <div className="surah-name">{surah.name}</div>
              <div className="surah-info">
                {surah.arabicName}
              </div>
              <div className="surah-info" style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem'
              }}>
                <span style={{ 
                  padding: '4px 8px', 
                  background: surah.revelationType === 'mekah' ? '#e8f5e8' : '#fff3cd',
                  color: surah.revelationType === 'mekah' ? '#2d5a2d' : '#856404',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {surah.revelationType === 'mekah' ? 'Meccan' : 'Medinan'}
                </span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {surah.ayahs.length} ayahs
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredSurahs.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666',
          background: 'white',
          borderRadius: '16px',
          marginTop: '2rem'
        }}>
          <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>No surahs found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default SurahList; 