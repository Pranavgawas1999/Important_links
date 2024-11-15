import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [link, setLink] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // Fetch existing links from server
    const fetchLinks = async () => {
      const response = await axios.get('http://localhost:5000/api/links');
      setLinks(response.data);
    };
    fetchLinks();
  }, []);

  const handleAddLink = async () => {
    if (link.trim() !== '') {
      const response = await axios.post('http://localhost:5000/api/links', { url: link });
      setLinks([...links, response.data]);
      setLink('');
    }
  };

  const handleDeleteLink = async (id) => {
    await axios.delete(`http://localhost:5000/api/links/${id}`);
    setLinks(links.filter((link) => link._id !== id));
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <input
        type="text"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Enter a link"
        className="input input-bordered w-full max-w-xs mb-2"
      />
      <button
        onClick={handleAddLink}
        className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg mt-2"
      >
        Add
      </button>

      <div className="mt-4">
        <ol className="list-decimal list-inside space-y-2">
          {links.map((link) => (
            <li key={link._id} className="flex items-center space-x-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-primary break-all"
              >
                {link.url}
              </a>
              <button
                onClick={() => window.open(link.url, '_blank')}
                className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
              >
                Visit
              </button>
              <button
                onClick={() => handleDeleteLink(link._id)}
                className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg btn-error"
              >
                Delete
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default App;
