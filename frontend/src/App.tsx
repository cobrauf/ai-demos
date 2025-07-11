import { StagewiseToolbar } from "@stagewise/toolbar-react"; //for dev
import { ReactPlugin } from "@stagewise-plugins/react"; //for dev

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/App.css";
import SideMenu from "./components/SideMenu/SideMenu";
import { useTheme } from "./hooks/useTheme";
import MysteryItemView from "./views/MysteryItemView/MysteryItemView";
import PlaceholderView from "./views/PlaceholderView/PlaceholderView";
import ExplainModal from "./components/SharedModal/ExplainModal";
import MysteryItemExplainContent from "./components/SharedModal/MysteryItemExplainContent";
import PlaceholderExplainContent from "./components/SharedModal/PlaceholderExplainContent";

// Component to handle the routing and modal content
function AppContent() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleExplainClick = () => {
    setIsExplainModalOpen(true);
  };

  const handleExplainModalClose = () => {
    setIsExplainModalOpen(false);
  };

  const getExplainContent = () => {
    switch (location.pathname) {
      case "/demos/mystery-item":
        return <MysteryItemExplainContent />;
      case "/demos/placeholder":
        return <PlaceholderExplainContent />;
      default:
        return <PlaceholderExplainContent />;
    }
  };

  return (
    <>
      <main className="main-content">
        <SideMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          theme={theme}
          setTheme={setTheme}
        />

        {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}

        <Routes>
          <Route
            path="/"
            element={<Navigate to="/demos/mystery-item" replace />}
          />
          <Route
            path="/demos/mystery-item"
            element={
              <MysteryItemView
                onMenuClick={toggleMenu}
                onExplainClick={handleExplainClick}
              />
            }
          />
          <Route
            path="/demos/placeholder"
            element={
              <PlaceholderView
                onMenuClick={toggleMenu}
                onExplainClick={handleExplainClick}
              />
            }
          />
        </Routes>
      </main>

      <ExplainModal
        isOpen={isExplainModalOpen}
        onClose={handleExplainModalClose}
      >
        {getExplainContent()}
      </ExplainModal>
    </>
  );
}

function App() {
  return (
    <Router>
      {/* {import.meta.env.DEV && (
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} /> //for dev
      )} */}
      <AppContent />
    </Router>
  );
}

export default App;
