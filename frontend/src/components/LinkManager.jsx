import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Folder,
  File,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  ExternalLink,
  Image,
  Link as LinkIcon,
} from "lucide-react";

const backendURL = "https://important-links.onrender.com";

function LinkManager() {
  const [view, setView] = useState("saved");
  const [links, setLinks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [url, setUrl] = useState("");
  const [folderName, setFolderName] = useState("");
  const [folderPath, setFolderPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isViewChanging, setIsViewChanging] = useState(false);

  // URL validation helper
  const isValidUrl = (urlString) => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Core data fetching and manipulation functions remain the same
  const fetchFolderContents = async (folderId = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const [foldersResponse, linksResponse] = await Promise.all([
        axios.get(
          `${backendURL}/${view === "saved" ? "savedFolders" : "imageFolders"}`,
          {
            params: { parent: folderId || null },
          }
        ),
        axios.get(
          `${backendURL}/${view === "saved" ? "savedLinks" : "imageLinks"}`,
          {
            params: { folder: folderId || null },
          }
        ),
      ]);
      setFolders(foldersResponse.data);
      setLinks(linksResponse.data);
    } catch (err) {
      setError("Failed to load folder contents");
    } finally {
      setIsLoading(false);
      setIsViewChanging(false);
    }
  };

  // CRUD operations remain the same
  const createFolder = async () => {
    if (!folderName.trim()) return;
    try {
      await axios.post(
        `${backendURL}/${view === "saved" ? "savedFolders" : "imageFolders"}`,
        {
          name: folderName,
          parent: currentFolder?._id || null,
        }
      );
      await fetchFolderContents(currentFolder?._id);
      setFolderName("");
    } catch (err) {
      setError("Failed to create folder");
    }
  };

  const addLink = async () => {
    if (!url.trim() || !isValidUrl(url)) return;
    try {
      await axios.post(
        `${backendURL}/${view === "saved" ? "savedLinks" : "imageLinks"}`,
        {
          url,
          folder: currentFolder?._id || null,
        }
      );
      await fetchFolderContents(currentFolder?._id);
      setUrl("");
    } catch (err) {
      setError("Failed to add link");
    }
  };

  const deleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder and all its contents?")) return;
    try {
      await axios.delete(
        `${backendURL}/${
          view === "saved" ? "savedFolders" : "imageFolders"
        }/${folderId}`
      );
      if (currentFolder?._id === folderId) {
        const newPath = folderPath.slice(0, -1);
        setFolderPath(newPath);
        setCurrentFolder(newPath[newPath.length - 1] || null);
        await fetchFolderContents(newPath[newPath.length - 1]?._id);
      } else {
        await fetchFolderContents(currentFolder?._id);
      }
    } catch (err) {
      setError("Failed to delete folder");
    }
  };

  const deleteLink = async (linkId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this link?")) return;
    try {
      await axios.delete(
        `${backendURL}/${
          view === "saved" ? "savedLinks" : "imageLinks"
        }/${linkId}`
      );
      await fetchFolderContents(currentFolder?._id);
    } catch (err) {
      setError("Failed to delete link");
    }
  };

  // Navigation functions
  const navigateToFolder = (folder) => {
    setCurrentFolder(folder);
    setFolderPath([...folderPath, folder]);
  };

  const navigateToPath = () => {
    if (folderPath.length === 0) return; // Already at root, do nothing
  
    const newPath = folderPath.slice(0, -1); // Remove the last folder in the path
    setCurrentFolder(newPath[newPath.length - 1] || null); // Set the parent folder or null for root
    setFolderPath(newPath); // Update the folder path
  };
  

  const handleViewChange = (newView) => {
    if (newView === view) return;
    setIsViewChanging(true);
    setView(newView);
    setCurrentFolder(null);
    setFolderPath([]);
    setError(null);
  };

  // Effects remain the same
  useEffect(() => {
    if (isViewChanging || (!currentFolder && folderPath.length === 0)) {
      fetchFolderContents(null);
    }
  }, [view, isViewChanging]);

  useEffect(() => {
    if (!isViewChanging && currentFolder) {
      fetchFolderContents(currentFolder._id);
    }
  }, [currentFolder, isViewChanging]);

  // Card Components
  const FolderCard = ({ folder }) => (
    <div
      onClick={() => navigateToFolder(folder)}
      className="card bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <Folder className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
          <h2 className="card-title text-primary">{folder.name}</h2>
        </div>
        <div className="flex justify-between items-end mt-4">
          <span className="text-sm opacity-70">Folder</span>
          <div className="card-actions">
            <button
              className="btn btn-error btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => deleteFolder(folder._id, e)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SavedLinkCard = ({ link }) => (
    <div
      onClick={() => window.open(link.url, "_blank")}
      className="card bg-gradient-to-br from-secondary/20 to-secondary/5 hover:from-secondary/30 hover:to-secondary/10 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="card-body">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-6 h-6 text-secondary group-hover:scale-110 transition-transform duration-300" />
          <h2 className="card-title text-secondary text-sm">
            {new URL(link.url).hostname}
          </h2>
        </div>
        <p className="text-xs truncate opacity-70 mt-2">{link.url}</p>
        <div className="flex justify-between items-end mt-4">
          <span className="text-sm opacity-70">Saved Link</span>
          <div className="card-actions">
            <button
              className="btn btn-error btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => deleteLink(link._id, e)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ImageLinkCard = ({ link }) => (
    <div
      onClick={() => window.open(link.url, "_blank")}
      className="card bg-transparent shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
    >
      <figure className="relative h-48 w-full">
        <img
          src={link.url}
          alt="Link preview"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          className="absolute top-2 right-2 btn btn-error btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click event
            deleteLink(link._id, e);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </figure>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Link Manager
          </h1>

          {/* View Toggle */}
          <div className="tabs tabs-lifted mt-4">
            <button
              className={`tab tab-lg ${view === "saved" ? "tab-active" : ""}`}
              onClick={() => handleViewChange("saved")}
              disabled={isViewChanging}
            >
              <LinkIcon className="w-4 h-4 mr-2" /> Saved Links
            </button>
            <button
              className={`tab tab-lg ${view === "image" ? "tab-active" : ""}`}
              onClick={() => handleViewChange("image")}
              disabled={isViewChanging}
            >
              <Image className="w-4 h-4 mr-2" /> Image Links
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="bg-base-100 rounded-lg p-4 shadow-lg overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-ghost hover:bg-primary/10"
              onClick={() => navigateToPath(-1)}
              disabled={folderPath.length === 0 || isViewChanging}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            {folderPath.map((folder, index) => (
              <div key={folder._id} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-primary" />
                <button
                  className="btn btn-sm btn-ghost hover:bg-primary/10"
                  onClick={() => navigateToPath(index)}
                  disabled={isViewChanging}
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Create Controls */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="join flex-1">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="New folder name"
                className="input input-bordered join-item w-full focus:outline-primary"
                disabled={isViewChanging}
              />
              <button
                onClick={createFolder}
                className="btn btn-primary join-item"
                disabled={!folderName.trim() || isViewChanging}
              >
                <Plus className="w-4 h-4" /> New Folder
              </button>
            </div>

            <div className="join flex-1">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Add link URL"
                className="input input-bordered join-item w-full focus:outline-primary"
                disabled={isViewChanging}
              />
              <button
                onClick={addLink}
                className="btn btn-primary join-item"
                disabled={!isValidUrl(url) || isViewChanging}
              >
                <Plus className="w-4 h-4" /> Add Link
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Content Grid */}
        <div className="min-h-[400px] bg-base-100 rounded-lg p-6 shadow-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder) => (
                <FolderCard key={folder._id} folder={folder} />
              ))}

              {/* Add divider if folders exist and links are also present */}
              {folders.length > 0 && links.length > 0 && (
                <div className="flex w-full flex-col border-opacity-50 col-span-full">
                  <div className="divider">OR</div>
                </div>
              )}
              {links.map((link) =>
                view === "image" ? (
                  <ImageLinkCard key={link._id} link={link} />
                ) : (
                  <SavedLinkCard key={link._id} link={link} />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkManager;
