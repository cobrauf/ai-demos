import { StagewiseToolbar } from "@stagewise/toolbar-react"; //for dev
import { ReactPlugin } from "@stagewise-plugins/react"; //for dev
import { fetchRoot } from "./services/api"; //for dev
import { Button } from "./components/Button/Button"; //for dev
//Don't remove above imports during development

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./styles/App.css";
import SideMenu from "./components/SideMenu/SideMenu";
import { useTheme } from "./hooks/useTheme";
import MysteryItemView from "./views/MysteryItemView/MysteryItemView";
import PlaceholderView from "./views/PlaceholderView/PlaceholderView";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); //for testing
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  //test button, don't remove during development----------
  const handleButtonClick = async () => {
    try {
      setCount((count) => count + 1);
      const rootMessage = await fetchRoot();
      setMessage(JSON.stringify(rootMessage));
      // console.log("Root message: ", rootMessage);
    } catch (error) {
      console.log("Error: ", error);
    }
  };
  //---------------------------------------------------------

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Router>
      {import.meta.env.DEV && (
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      )}
      {!isMenuOpen && (
        <div className="menu-trigger" onClick={toggleMenu}>
          ☰
        </div>
      )}

      <SideMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        theme={theme}
        setTheme={setTheme}
      />

      {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/demos/mystery-item" replace />}
          />
          <Route path="/demos/mystery-item" element={<MysteryItemView />} />
          <Route path="/demos/placeholder" element={<PlaceholderView />} />
        </Routes>
      </div>
      <Button variant="gradient" onClick={handleButtonClick}>
        Action
      </Button>
      <p>Count is {count}</p>
      <p>{message}</p>
    </Router>
  );
}

export default App;
