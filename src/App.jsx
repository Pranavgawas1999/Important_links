import { useState } from 'react'
import './App.css'

function App() {
  const [link, setLink] = useState('');
  const [links, setLinks] = useState([]);

  const handleAddLink = () => {
    if (link.trim() !== '') {
      setLinks([...links, link]);
      setLink(''); // Clear input field after adding
    }
  };

  const handleDeleteLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
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
          {links.map((link, index) => (
            <li key={index} className="flex items-center space-x-2">
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="link link-primary break-all"
              >
                {link}
              </a>
              <button 
                onClick={() => window.open(link, '_blank')}
                className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg"
              >
                Visit
              </button>
              <button 
                onClick={() => handleDeleteLink(index)}
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
