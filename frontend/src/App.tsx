import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { useState } from "react";
import "./styles/App.css";
import SideMenu from "./components/SideMenu/SideMenu";
import { useTheme } from "./hooks/useTheme";
import { fetchRoot } from "./services/api";
import { Button } from "./components/Button/Button";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); //for testing
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme(); //understand this <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //test button
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {import.meta.env.DEV && (
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      )}
      <div className="menu-trigger" onClick={toggleMenu}>
        ☰
      </div>

      <SideMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        theme={theme}
        setTheme={setTheme}
      />

      {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className="card">
        <Button variant="gradient" onClick={handleButtonClick}>
          Root
        </Button>
        <p>Count is {count}</p>
        <p>{message}</p>
      </div>
    </>
  );
}

export default App;
