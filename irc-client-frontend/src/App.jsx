import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthPage from "./pages/AuthPage";
import ChatLayout from "./components/Chat/ChatLayout";
import useStore from "./store/useStore";
import { useEffect } from "react";
import { authAPI } from "./services/api";

function App() {
  const { token, setUser, isAuthenticated } = useStore();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token && !isAuthenticated) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          useStore.getState().logout();
        }
      }
    };

    checkAuth();
  }, [token, isAuthenticated, setUser]);

  // ULTIMATE drag and drop prevention
  useEffect(() => {
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent all drag events on document
    document.addEventListener('dragenter', preventDefaults, false);
    document.addEventListener('dragover', preventDefaults, false);
    document.addEventListener('dragleave', preventDefaults, false);
    document.addEventListener('drop', preventDefaults, false);

    // Cleanup
    return () => {
      document.removeEventListener('dragenter', preventDefaults, false);
      document.removeEventListener('dragover', preventDefaults, false);
      document.removeEventListener('dragleave', preventDefaults, false);
      document.removeEventListener('drop', preventDefaults, false);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#374151",
              color: "#fff",
            },
          }}
        />

        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/chat" element={<ChatLayout />} />
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/chat" replace /> : <Navigate to="/auth" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
