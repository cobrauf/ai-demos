import { useState } from "react";
import "./App.css";
import { fetchRoot } from "./services/api";

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(""); //for testing

  const handleButtonClick = async () => {
    try {
      const message = fetchRoot();
      console.log("Root message: ", message);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  return (
    <>
      <div className="card">
        {/* <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button> */}
        <button onClick={handleButtonClick}>Root</button>
      </div>
    </>
  );
}

export default App;
