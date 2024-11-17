import React, { useState, useEffect } from "react";
import axios from "axios";

const backendURL = "http://localhost:5000";

function LinkManager() {
  const [savedLinks, setSavedLinks] = useState([]);
  const [imageLinks, setImageLinks] = useState([]);
  const [savedUrl, setSavedUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Fetch Saved Links
  const fetchSavedLinks = async () => {
    try {
      const response = await axios.get(`${backendURL}/SavedLinks`);
      setSavedLinks(response.data);
    } catch (error) {
      console.error("Error fetching saved links:", error);
    }
  };

  // Fetch Image Links
  const fetchImageLinks = async () => {
    try {
      const response = await axios.get(`${backendURL}/ImageLinks`);
      setImageLinks(response.data);
    } catch (error) {
      console.error("Error fetching image links:", error);
    }
  };

  // Add a New Saved Link
  const addSavedLink = async () => {
    if (!savedUrl) return;
    try {
      const response = await axios.post(`${backendURL}/SavedLinks`, { url: savedUrl });
      setSavedLinks([...savedLinks, response.data]);
      setSavedUrl("");
    } catch (error) {
      console.error("Error adding saved link:", error);
    }
  };

  // Add a New Image Link
  const addImageLink = async () => {
    if (!imageUrl) return;
    try {
      const response = await axios.post(`${backendURL}/ImageLinks`, { url: imageUrl });
      setImageLinks([...imageLinks, response.data]);
      setImageUrl("");
    } catch (error) {
      console.error("Error adding image link:", error);
    }
  };

  // Delete a Saved Link
  const deleteSavedLink = async (id) => {
    try {
      await axios.delete(`${backendURL}/SavedLinks/${id}`);
      setSavedLinks(savedLinks.filter((link) => link._id !== id));
    } catch (error) {
      console.error("Error deleting saved link:", error);
    }
  };

  // Delete an Image Link
  const deleteImageLink = async (id) => {
    try {
      await axios.delete(`${backendURL}/ImageLinks/${id}`);
      setImageLinks(imageLinks.filter((link) => link._id !== id));
    } catch (error) {
      console.error("Error deleting image link:", error);
    }
  };

  useEffect(() => {
    fetchSavedLinks();
    fetchImageLinks();
  }, []);

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="container mx-auto">
        {/* Saved Links Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Saved Links</h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={savedUrl}
              onChange={(e) => setSavedUrl(e.target.value)}
              placeholder="Enter Saved URL"
              className="input input-bordered w-full mr-2"
            />
            <button onClick={addSavedLink} className="btn btn-primary">
              Add Link
            </button>
          </div>
          <ul>
            {savedLinks.map((link) => (
              <li key={link._id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
                <button onClick={() => deleteSavedLink(link._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Image Links Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Image Links</h2>
          <div className="flex mb-4">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter Image URL"
              className="input input-bordered w-full mr-2"
            />
            <button onClick={addImageLink} className="btn btn-primary">
              Add Image
            </button>
          </div>
          <ul>
            {imageLinks.map((link) => (
              <li key={link._id}>
                <img src={link.url} alt="Image Link" className="w-16 h-16" />
                <button onClick={() => deleteImageLink(link._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LinkManager;
