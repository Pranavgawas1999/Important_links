import React, { useState, useEffect } from 'react';
import axios from 'axios';

const backendURL = "https://bug-free-dollop-g45prw4wv4xvc7rq-5000.app.github.dev";

function LinkManager() {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");

  // Fetch Links from Backend
  const fetchLinks = async () => {
    try {
      const response = await axios.get(`${backendURL}/Links`);
      setLinks(response.data);
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  // Add a New Link
  const addLink = async () => {
    if (!url) return;
    try {
      const response = await axios.post(`${backendURL}/Links`, { url });
      setLinks([...links, response.data]);
      setUrl("");
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  // Delete a Link
  const deleteLink = async (id) => {
    try {
      await axios.delete(`${backendURL}/Links/${id}`);
      setLinks(links.filter((link) => link._id !== id));
    } catch (error) {
      console.error("Error deleting link:", error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Link Manager</h1>
      <div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          style={{ marginRight: "10px" }}
        />
        <button onClick={addLink}>Add Link</button>
      </div>
      <ul>
        {links.map((link) => (
          <li key={link._id}>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.url}
            </a>
            <button onClick={() => deleteLink(link._id)} style={{ marginLeft: "10px" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LinkManager;
