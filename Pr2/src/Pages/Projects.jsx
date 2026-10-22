import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRepos = () => {
    setLoading(true);
    setError(null);
    fetch('https://api.github.com/users/Het-Unreal/repos')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => setRepos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <section style={{ textAlign: 'center' }}>
        <ErrorMessage message={error} />
        <button 
          onClick={fetchRepos}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            borderRadius: '20px',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2>My GitHub Repositories</h2>
      
      <input 
        type="text" 
        placeholder="Search repositories..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '400px'
        }}
      />

      <ul>
        {filteredRepos.map((repo) => (
          <li key={repo.id} style={{ marginBottom: '10px' }}>
            <strong>{repo.name}</strong> 
            <span style={{ marginLeft: '8px', marginRight: '8px', color: '#fbbf24' }}>
              ⭐ {repo.stargazers_count}
            </span>
            - <a href={repo.html_url} target="_blank" rel="noreferrer">View Code</a>
          </li>
        ))}
      </ul>
      {filteredRepos.length === 0 && <p>No repositories found.</p>}
    </section>
  );
}