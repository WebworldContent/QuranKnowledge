import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, Heart, Lightbulb, Users, Star } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <BookOpen />,
      title: "Complete Quran",
      description: "Access all 114 surahs with their complete text, translations, and interpretations."
    },
    {
      icon: <Globe />,
      title: "Multiple Languages",
      description: "Study in English, Hinglish, Arabic, and access detailed Tafsir explanations."
    },
    {
      icon: <Heart />,
      title: "Beautiful Design",
      description: "Modern, responsive design that makes your Quran study experience enjoyable."
    },
    {
      icon: <Lightbulb />,
      title: "Easy Navigation",
      description: "Intuitive interface to quickly find and study any surah or ayah."
    },
    {
      icon: <Users />,
      title: "Community Focused",
      description: "Designed for students, scholars, and anyone seeking Quranic knowledge."
    },
    {
      icon: <Star />,
      title: "Authentic Content",
      description: "Reliable translations and interpretations from trusted Islamic sources."
    }
  ];

  return (
    <div className="container">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Quran Study</h1>
        <p className="hero-subtitle">
          Explore the Holy Quran with complete translations, interpretations, and beautiful design
        </p>
        <div className="hero-buttons">
          <Link to="/surahs" className="btn btn-primary">
            Start Reading
          </Link>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white' }}>
            Learn More
          </button>
        </div>
      </section>

      <section className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </section>

      <section style={{ textAlign: 'center', padding: '4rem 0', color: 'white' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Begin Your Journey?</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
          Start exploring the Quran today and deepen your understanding of Islamic teachings
        </p>
        <Link to="/surahs" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '15px 30px' }}>
          Explore All Surahs
        </Link>
      </section>
    </div>
  );
};

export default Home; 