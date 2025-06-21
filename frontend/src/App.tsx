import { StagewiseToolbar } from "@stagewise/toolbar-react";
import { ReactPlugin } from "@stagewise-plugins/react";
import { useState } from "react";
import "./styles/App.css";
import { fetchRoot } from "./services/api";
import { Button } from "./components/Button/Button";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); //for testing

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

  return (
    <>
      {import.meta.env.DEV && (
        <StagewiseToolbar config={{ plugins: [ReactPlugin] }} />
      )}
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
