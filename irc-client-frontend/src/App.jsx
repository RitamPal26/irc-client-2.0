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
