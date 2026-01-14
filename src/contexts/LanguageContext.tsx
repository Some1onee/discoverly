import { createContext, useContext, ReactNode } from "react";

interface LanguageContextType {
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, string> = {
    // Navigation
    "nav.discover": "Discover",
    "nav.search": "Search",
    "nav.favorites": "Favorites",
    "nav.playlists": "Playlists",
    "nav.history": "History",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",
    
    // Home
    "home.title": "Discover new artists",
    "home.subtitle": "Explore trending tracks from independent artists around the world",
    "home.trendingTitle": "Current Trends",
    "home.yourGenres": "Your favorite genres",
    "home.basedOnListening": "Based on your listening history",
    "home.loading": "Loading music...",
    "home.error": "Unable to load music",
    
    // Search
    "search.title": "Music Search",
    "search.subtitle": "Find your favorite artists and tracks",
    "search.placeholder": "Search for an artist, track...",
    "search.button": "Search",
    "search.searching": "Searching...",
    "search.noResults": "No results for",
    "search.tryOther": "Try with other keywords",
    "search.results": "result",
    "search.resultsPlural": "results",
    "search.searchPrompt": "Search for music",
    "search.searchDesc": "Use the search bar above to find tracks",
    "search.filters": "Filters",
    "search.genre": "Genre",
    "search.sortBy": "Sort by",
    "search.clearFilters": "Clear filters",
    "search.for": "for",
    
    // Profile
    "profile.title": "My Profile",
    "profile.edit": "Edit my profile",
    "profile.editDesc": "Customize your profile with a photo, bio and more",
    "profile.likesCount": "Liked Songs",
    "profile.playlistsCount": "Playlists",
    "profile.commentsCount": "Comments",
    "profile.fullName": "Full name",
    "profile.fullNamePlaceholder": "Your full name",
    "profile.bio": "Bio",
    "profile.bioPlaceholder": "Tell us about yourself and your musical tastes...",
    "profile.location": "Location",
    "profile.locationPlaceholder": "City, Country",
    "profile.website": "Website",
    "profile.websitePlaceholder": "https://your-site.com",
    "profile.changePhoto": "Click the icon to change your photo",
    "profile.save": "Save changes",
    "profile.saving": "Saving...",
    "profile.stats": "Statistics",
    "profile.totalListens": "Total listens",
    "profile.totalLikes": "Liked songs",
    "profile.totalPlaylists": "Playlists created",
    "profile.totalComments": "Comments posted",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.username": "Username",
    "auth.loginButton": "Sign in",
    "auth.signupButton": "Create account",
    "auth.noAccount": "No account?",
    "auth.hasAccount": "Already have an account?",
    
    // Playlists
    "playlists.title": "My Playlists",
    "playlists.create": "Create playlist",
    "playlists.createButton": "Create",
    "playlists.name": "Playlist name",
    "playlists.description": "Description",
    "playlists.public": "Public",
    "playlists.empty": "No playlists",
    "playlists.emptyDesc": "Create your first playlist to organize your favorite music",
    "playlists.tracks": "tracks",
    "playlists.count": "playlist",
    "playlists.countPlural": "playlists",
    "playlists.delete": "Delete",
    
    // Likes
    "likes.title": "My Favorites",
    "likes.subtitle": "All your favorite songs in one place",
    "likes.empty": "No liked songs",
    "likes.emptyDesc": "Start liking songs to find them here",
    "likes.count": "song",
    "likes.countPlural": "songs",
    
    // Track
    "track.play": "Play",
    "track.pause": "Pause",
    "track.like": "Like",
    "track.unlike": "Unlike",
    "track.addToPlaylist": "Add to playlist",
    "track.share": "Share",
    "track.comments": "Comments",
    "track.duration": "Duration",
    
    // Comments
    "comments.title": "Comments",
    "comments.add": "Add a comment",
    "comments.placeholder": "Your comment...",
    "comments.post": "Post",
    "comments.delete": "Delete",
    "comments.empty": "No comments",
    "comments.emptyDesc": "Be the first to comment on this track",
    
    // Messages
    "msg.loginRequired": "Please log in to access this feature",
    "msg.liked": "Added to favorites!",
    "msg.unliked": "Removed from favorites",
    "msg.error": "An error occurred",
    "msg.success": "Operation successful",
    "msg.profileUpdated": "Profile updated successfully!",
    "msg.playlistCreated": "Playlist created!",
    "msg.commentAdded": "Comment added!",
    "msg.imageTooLarge": "Image must not exceed 2MB",
    "msg.enterSearch": "Enter a search term",
    
    // History
    "history.title": "Listening History",
    "history.subtitle": "Your recently played tracks",
    "history.empty": "No history",
    "history.emptyDesc": "Start listening to music to see your history here",
    "history.clear": "Clear history",
    "history.today": "Today",
    "history.yesterday": "Yesterday",
    "history.thisWeek": "This Week",
    "history.earlier": "Earlier",
    
    // Player
    "player.queue": "Queue",
    "player.queueEmpty": "Queue is empty",
    "player.queueEmptyDesc": "Add tracks to play next",
    "player.addToQueue": "Add to Queue",
    "player.addedToQueue": "Added to queue",
    
    // Home sections
    "home.newReleases": "New Releases",
    "home.recommendedForYou": "Recommended for You",
    "home.basedOnLikes": "Based on your likes",
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
