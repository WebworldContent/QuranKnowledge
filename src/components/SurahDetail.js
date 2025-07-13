import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Volume2, Play, Pause, ChevronDown, ChevronUp, BookOpen, Users, Sparkles, VolumeX } from 'lucide-react';
import quranData from '../data/quran.json';
import InfiniteScroll from 'react-infinite-scroll-component';

const SurahDetail = () => {
  const { surahNumber } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});
  const audioRefs = useRef({});
  const surahAudioRef = useRef(null);
  const [surahAudioProgress, setSurahAudioProgress] = useState(0);
  const [tafsirData, setTafsirData] = useState({});
  const [expandedTafsir, setExpandedTafsir] = useState({});
  const [loadingTafsir, setLoadingTafsir] = useState({});
  const [selectedAuthor, setSelectedAuthor] = useState({});
  const [playingEnglish, setPlayingEnglish] = useState(null);
  const [englishAudioProgress, setEnglishAudioProgress] = useState({});
  const englishAudioRefs = useRef({});

  const surah = quranData.surahs.find(s => s.number === parseInt(surahNumber));
  const ayahs = surah ? surah.ayahs : [];
  const [hasMore, setHasMore] = useState(ayahs.length > 10);

  const fetchMoreAyahs = () => {
    if (ayahs.length > displayCount) {
      setDisplayCount(prev => Math.min(prev + 10, ayahs.length));
      if (displayCount + 10 >= ayahs.length) setHasMore(false);
    } else {
      setHasMore(false);
    }
  };

  const fetchTafsir = async (ayahNumber) => {
    if (tafsirData[ayahNumber]) return; // Already loaded
    
    setLoadingTafsir(prev => ({ ...prev, [ayahNumber]: true }));
    
    try {
      const response = await fetch(`https://quranapi.pages.dev/api/tafsir/${surahNumber}_${ayahNumber}.json`);
      if (response.ok) {
        const data = await response.json();
        setTafsirData(prev => ({ ...prev, [ayahNumber]: data }));
        
        // Set default selected author to the shortest tafsir
        if (data.tafsirs && data.tafsirs.length > 0) {
          const shortestTafsir = data.tafsirs.reduce((shortest, current) => 
            current.content.length < shortest.content.length ? current : shortest
          );
          setSelectedAuthor(prev => ({ ...prev, [ayahNumber]: shortestTafsir.author }));
        }
      }
    } catch (error) {
      console.error('Error fetching tafsir:', error);
    } finally {
      setLoadingTafsir(prev => ({ ...prev, [ayahNumber]: false }));
    }
  };

  const toggleTafsir = (ayahNumber) => {
    if (!tafsirData[ayahNumber]) {
      fetchTafsir(ayahNumber);
    }
    setExpandedTafsir(prev => ({
      ...prev,
      [ayahNumber]: !prev[ayahNumber]
    }));
  };

  const selectAuthor = (ayahNumber, author) => {
    setSelectedAuthor(prev => ({ ...prev, [ayahNumber]: author }));
  };

  const getSelectedTafsir = (ayahNumber) => {
    if (!tafsirData[ayahNumber] || !selectedAuthor[ayahNumber]) return null;
    return tafsirData[ayahNumber].tafsirs.find(tafsir => tafsir.author === selectedAuthor[ayahNumber]);
  };


  // Play/Pause whole surah audio
  const handlePlayAudio = () => {
    // Pause any ayah audio if playing
    if (playingAyah && audioRefs.current[playingAyah]) {
      audioRefs.current[playingAyah].pause();
      setPlayingAyah(null);
    }
    // Pause any English audio if playing
    if (playingEnglish && englishAudioRefs.current[playingEnglish]) {
      speechSynthesis.cancel();
      setPlayingEnglish(null);
    }
    if (!surahAudioRef.current) {
      const audio = new Audio();
      audio.src = `https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/1/${surahNumber}.mp3`;
      audio.addEventListener('timeupdate', () => {
        setSurahAudioProgress((audio.currentTime / audio.duration) * 100);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setSurahAudioProgress(0);
      });
      surahAudioRef.current = audio;
    }
    const audio = surahAudioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(error => {
        alert('Audio recitation is not available for this surah.');
      });
      setIsPlaying(true);
    }
  };

  const handleAyahAudio = (ayahNumber) => {
    // Pause surah audio if playing
    if (isPlaying && surahAudioRef.current) {
      surahAudioRef.current.pause();
      setIsPlaying(false);
    }
    // Pause English audio if playing
    if (playingEnglish === ayahNumber) {
      speechSynthesis.cancel();
      setPlayingEnglish(null);
    }
    const audioRef = audioRefs.current[ayahNumber];
    
    if (!audioRef) {
      // Create audio element if it doesn't exist
      const audio = new Audio();
      // Use the Quran Audio project URL pattern
      audio.src = `https://the-quran-project.github.io/Quran-Audio/Data/1/${surahNumber}_${ayahNumber}.mp3`;
      
      audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(prev => ({
          ...prev,
          [ayahNumber]: progress
        }));
      });

      audio.addEventListener('ended', () => {
        setPlayingAyah(null);
        setAudioProgress(prev => ({
          ...prev,
          [ayahNumber]: 0
        }));
      });

      audioRefs.current[ayahNumber] = audio;
    }

    const audio = audioRefs.current[ayahNumber];
    
    if (playingAyah === ayahNumber) {
      // Pause current audio
      audio.pause();
      setPlayingAyah(null);
    } else {
      // Stop any currently playing audio
      if (playingAyah && audioRefs.current[playingAyah]) {
        audioRefs.current[playingAyah].pause();
      }
      
      // Play new audio
      audio.play().catch(error => {
        console.log('Audio playback failed:', error);
        // Fallback: show a message that audio is not available
        alert('Audio recitation is not available for this ayah.');
      });
      setPlayingAyah(ayahNumber);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${surah?.name} - Quran Study`,
        text: `Reading ${surah?.name} (${surah?.arabicName})`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!surah) {
    return (
      <div className="container">
        <div className="error">
          <h2>Surah not found</h2>
          <p>The requested surah could not be found.</p>
          <Link to="/surahs" className="btn btn-primary">
            Back to All Surahs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '2rem', 
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Link to="/surahs" style={{ marginRight: '1rem' }}>
            <ArrowLeft size={24} color="#1a5f3a" />
          </Link>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#333' }}>
              {surah.name} ({surah.arabicName})
            </h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#666' }}>
              <span>Surah {surah.number}</span>
              <span>•</span>
              <span>{surah.revelationType === 'mekah' ? 'Meccan' : 'Medinan'}</span>
              <span>•</span>
              <span>{ayahs.length} ayahs</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            onClick={handlePlayAudio}
            className="btn"
            style={{ 
              background: isPlaying ? '#e74c3c' : '#1a5f3a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Volume2 size={16} />
            {isPlaying ? 'Stop' : 'Play Audio'}
          </button>
          {isPlaying && (
            <div style={{ 
              width: '200px', 
              height: '4px', 
              background: '#e0e0e0', 
              borderRadius: '2px',
              overflow: 'hidden',
              marginLeft: '1rem'
            }}>
              <div style={{
                width: `${surahAudioProgress}%`,
                height: '100%',
                background: '#1a5f3a',
                transition: 'width 0.1s ease'
              }} />
            </div>
          )}
          <button 
            onClick={handleShare}
            className="btn"
            style={{ 
              background: 'transparent',
              color: '#1a5f3a',
              border: '2px solid #1a5f3a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>

      {/* Ayahs Infinite Scroll */}
      <InfiniteScroll
        dataLength={Math.min(displayCount, ayahs.length)}
        next={fetchMoreAyahs}
        hasMore={hasMore}
        loader={<div className="loading">Loading more ayahs...</div>}
        endMessage={<div style={{ textAlign: 'center', color: '#666', margin: '2rem 0' }}>All ayahs loaded.</div>}
      >
        {ayahs.slice(0, displayCount).map((ayah, idx) => (
          <div key={ayah.number || idx} className="ayah-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="ayah-number">
                Ayah {ayah.number}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleAyahAudio(ayah.number)}
                  className="btn"
                  style={{
                    background: playingAyah === ayah.number ? '#e74c3c' : '#1a5f3a',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {playingAyah === ayah.number ? <Pause size={14} /> : <Play size={14} />}
                  {playingAyah === ayah.number ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => toggleTafsir(ayah.number)}
                  className="btn"
                  style={{
                    background: expandedTafsir[ayah.number] ? '#2d7a4d' : 'transparent',
                    color: expandedTafsir[ayah.number] ? 'white' : '#1a5f3a',
                    border: '2px solid #1a5f3a',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <BookOpen size={14} />
                  {expandedTafsir[ayah.number] ? 'Hide Tafsir' : 'Show Tafsir'}
                  {expandedTafsir[ayah.number] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Audio Progress Bars */}
            {(playingAyah === ayah.number || playingEnglish === ayah.number) && (
              <div style={{ marginBottom: '1rem' }}>
                {playingAyah === ayah.number && (
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#e0e0e0', 
                    borderRadius: '2px',
                    marginBottom: '0.5rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${audioProgress[ayah.number] || 0}%`,
                      height: '100%',
                      background: '#1a5f3a',
                      transition: 'width 0.1s ease'
                    }} />
                  </div>
                )}
                {playingEnglish === ayah.number && (
                  <div style={{ 
                    width: '100%', 
                    height: '4px', 
                    background: '#e0e0e0', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${englishAudioProgress[ayah.number] || 0}%`,
                      height: '100%',
                      background: '#2d7a4d',
                      transition: 'width 0.1s ease'
                    }} />
                  </div>
                )}
              </div>
            )}

            <div className="ayah-text">
              <div className="arabic-text" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                {ayah.arabic}
              </div>
              <div className="translation-text" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {ayah.translation}
              </div>
              {ayah.meaning && (
                <div className="meaning-text" style={{ 
                  fontSize: '1rem', 
                  marginBottom: '0.5rem',
                  color: '#1a5f3a',
                  fontWeight: '500',
                  padding: '0.75rem',
                  background: 'rgba(26, 95, 58, 0.05)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #1a5f3a'
                }}>
                  <strong>Meaning:</strong> {ayah.meaning}
                </div>
              )}
              <div 
                className="transliteration-text" 
                style={{ color: '#888', fontSize: '1rem' }}
                dangerouslySetInnerHTML={{ __html: ayah.transliteration }}
              />
            </div>

            {/* Tafsir Section */}
            {expandedTafsir[ayah.number] && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(26, 95, 58, 0.1)',
                animation: 'slideDown 0.3s ease-out'
              }}>
                {loadingTafsir[ayah.number] ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #1a5f3a',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading Tafsir...</p>
                  </div>
                ) : tafsirData[ayah.number] ? (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                      padding: '0.75rem',
                      background: 'rgba(26, 95, 58, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <Sparkles size={20} color="#1a5f3a" />
                      <h3 style={{ 
                        margin: 0, 
                        color: '#1a5f3a', 
                        fontSize: '1.2rem',
                        fontWeight: '600'
                      }}>
                        Tafsir - {tafsirData[ayah.number].surahName} (Ayah {ayah.number})
                      </h3>
                    </div>

                    {/* Authors Row */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      {tafsirData[ayah.number].tafsirs.map((tafsir, index) => (
                        <button
                          key={index}
                          onClick={() => selectAuthor(ayah.number, tafsir.author)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            border: '2px solid',
                            background: selectedAuthor[ayah.number] === tafsir.author 
                              ? '#1a5f3a' 
                              : 'transparent',
                            color: selectedAuthor[ayah.number] === tafsir.author 
                              ? 'white' 
                              : '#1a5f3a',
                            borderColor: '#1a5f3a',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            minWidth: 'fit-content'
                          }}
                        >
                          <Users size={14} />
                          {tafsir.author}
                        </button>
                      ))}
                    </div>

                    {/* Selected Author's Tafsir */}
                    {getSelectedTafsir(ayah.number) && (
                      <div style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(26, 95, 58, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '4px',
                          height: '100%',
                          background: 'linear-gradient(180deg, #1a5f3a 0%, #2d7a4d 100%)'
                        }}></div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '1rem',
                          padding: '0.5rem 1rem',
                          background: 'rgba(26, 95, 58, 0.05)',
                          borderRadius: '20px',
                          width: 'fit-content'
                        }}>
                          <Users size={16} color="#1a5f3a" />
                          <span style={{
                            color: '#1a5f3a',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                          }}>
                            {getSelectedTafsir(ayah.number).author}
                          </span>
                        </div>
                        
                        {getSelectedTafsir(ayah.number).groupVerse && (
                          <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(255, 193, 7, 0.1)',
                            borderRadius: '8px',
                            borderLeft: '3px solid #ffc107'
                          }}>
                            <strong style={{ color: '#856404' }}>Group Verse:</strong> {getSelectedTafsir(ayah.number).groupVerse}
                          </div>
                        )}
                        
                        <div style={{
                          lineHeight: '1.8',
                          color: '#333',
                          fontSize: '0.95rem',
                          textAlign: 'justify'
                        }}>
                          {getSelectedTafsir(ayah.number).content.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex} style={{ marginBottom: '1rem' }}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    <BookOpen size={48} color="#ccc" style={{ marginBottom: '1rem' }} />
                    <p>Tafsir not available for this ayah.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </InfiniteScroll>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '3rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {surah.number > 1 && (
          <Link 
            to={`/surah/${surah.number - 1}`}
            className="btn"
            style={{ 
              background: 'transparent',
              color: '#1a5f3a',
              border: '2px solid #1a5f3a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            Previous Surah
          </Link>
        )}
        
        <Link 
          to="/surahs"
          className="btn btn-primary"
        >
          All Surahs
        </Link>
        
        {surah.number < 114 && (
          <Link 
            to={`/surah/${surah.number + 1}`}
            className="btn"
            style={{ 
              background: 'transparent',
              color: '#1a5f3a',
              border: '2px solid #1a5f3a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Next Surah
            <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
          </Link>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SurahDetail; 