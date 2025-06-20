import { useState } from "react";
import "./App.css";
import { fetchRoot } from "./services/api";

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
      <div className="card">
        <button onClick={handleButtonClick}>Root</button>
        <p>Count is {count}</p>
        <p>{message}</p>
      </div>
    </>
  );
}

export default App;
