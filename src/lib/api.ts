const API_URL = import.meta.env.PROD 
  ? "http://78.46.160.115:3001/api" 
  : "http://localhost:3001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
  signup: async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};

// Likes API
export const likesAPI = {
  getUserLikes: async () => {
    const response = await fetch(`${API_URL}/likes`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch likes");
    return response.json();
  },

  likeTrack: async (trackData: any) => {
    const response = await fetch(`${API_URL}/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(trackData),
    });
    if (!response.ok) throw new Error("Failed to like track");
    return response.json();
  },

  unlikeTrack: async (trackId: string) => {
    const response = await fetch(`${API_URL}/likes/${trackId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to unlike track");
  },

  checkLike: async (trackId: string) => {
    const response = await fetch(`${API_URL}/likes/check/${trackId}`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to check like status");
    return response.json();
  },
};

// Playlists API
export const playlistsAPI = {
  getUserPlaylists: async () => {
    const response = await fetch(`${API_URL}/playlists`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch playlists");
    return response.json();
  },

  createPlaylist: async (name: string, description?: string, isPublic?: boolean) => {
    const response = await fetch(`${API_URL}/playlists`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ name, description, is_public: isPublic }),
    });
    if (!response.ok) throw new Error("Failed to create playlist");
    return response.json();
  },

  getPlaylistTracks: async (playlistId: number) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch playlist tracks");
    return response.json();
  },

  addTrackToPlaylist: async (playlistId: number, trackData: any) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(trackData),
    });
    if (!response.ok) throw new Error("Failed to add track to playlist");
    return response.json();
  },

  removeTrackFromPlaylist: async (playlistId: number, trackId: number) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/tracks/${trackId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to remove track from playlist");
  },

  deletePlaylist: async (playlistId: number) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete playlist");
  },
};

// Comments API
export const commentsAPI = {
  getTrackComments: async (trackId: string) => {
    const response = await fetch(`${API_URL}/comments/track/${trackId}`);
    if (!response.ok) throw new Error("Failed to fetch comments");
    return response.json();
  },

  addComment: async (trackId: string, content: string) => {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ track_id: trackId, content }),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    return response.json();
  },

  deleteComment: async (commentId: number) => {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete comment");
  },
};

// Local history storage helper
const HISTORY_KEY = "discoverly_history";
const MAX_HISTORY_ITEMS = 100;

export const localHistoryAPI = {
  addToHistory: (trackData: {
    track_id: string;
    track_title: string;
    track_artist: string;
    track_image_url: string;
    track_audio_url: string;
    track_duration?: string;
    track_genre?: string;
  }) => {
    const history = localHistoryAPI.getHistory();
    const newItem = {
      ...trackData,
      listened_at: new Date().toISOString(),
      id: Date.now(),
    };
    // Add to beginning, remove duplicates of same track
    const filtered = history.filter(h => h.track_id !== trackData.track_id);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return newItem;
  },

  getHistory: () => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  },
};

// Recommendations API
export const recommendationsAPI = {
  trackListen: async (trackData: {
    track_id: string;
    track_title: string;
    track_artist: string;
    track_image_url: string;
    track_audio_url: string;
    track_duration?: string;
    track_genre?: string;
  }) => {
    // Always save to localStorage first
    localHistoryAPI.addToHistory(trackData);
    
    // Also try to save to backend
    try {
      const response = await fetch(`${API_URL}/recommendations/listen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(trackData),
      });
      if (response.ok) return response.json();
    } catch (error) {
      console.log("Backend history save failed, using localStorage");
    }
    return { success: true, source: "localStorage" };
  },

  getFavoriteGenres: async () => {
    const response = await fetch(`${API_URL}/recommendations/genres`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch favorite genres");
    return response.json();
  },

  getRecommendedTracks: async () => {
    const response = await fetch(`${API_URL}/recommendations/tracks`, {
      headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return response.json();
  },
};

// Shares API
export const sharesAPI = {
  createShareLink: async (trackId: string, trackTitle: string, trackArtist: string) => {
    const response = await fetch(`${API_URL}/shares`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ track_id: trackId, track_title: trackTitle, track_artist: trackArtist }),
    });
    if (!response.ok) throw new Error("Failed to create share link");
    return response.json();
  },

  getSharedTrack: async (token: string) => {
    const response = await fetch(`${API_URL}/shares/${token}`);
    if (!response.ok) throw new Error("Failed to fetch shared track");
    return response.json();
  },
};
