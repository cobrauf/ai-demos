import React from "react";

const MysteryItemExplainContent: React.FC = () => {
  return (
    <>
      <h4 style={{ marginBottom: "20px", color: "var(--text-color)" }}>
        How to Play
      </h4>
      <div style={{ textAlign: "left", lineHeight: "1.6" }}>
        <p>
          <strong>🎯 Goal:</strong> Guess the SECRET ANSWER
        </p>

        <p>
          <strong>💡 How to Play:</strong>
        </p>
        <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
          <li>Ask questions to narrow down the answer</li>
          <li>Request hints if you get stuck</li>
          <li>You can tell the AI to restart or end the game anytime</li>
        </ul>
        <hr style={{ margin: "20px 0" }} />
      </div>
      <div>
        <h4 style={{ marginBottom: "20px", color: "var(--text-color)" }}>
          How this game was built
        </h4>
        <div style={{ textAlign: "left", lineHeight: "1.6" }}>
          <ul
            style={{
              paddingLeft: "20px",
              marginBottom: "15px",
            }}
          >
            <li>
              Built with{" "}
              <strong>
                <u>LangGraph</u>
              </strong>
              , a framework for stateful, multi-step applications
            </li>
            <li>
              The agent chooses specialized{" "}
              <strong>
                <u>tools</u>
              </strong>{" "}
              such as check guesses, answer questions, give hints etc
            </li>
            <li>
              Maintains game state and conversation history using{" "}
              <strong>
                <u>memory</u>
              </strong>
            </li>
          </ul>

          <div style={{ marginTop: "20px" }}>
            <h5 style={{ marginBottom: "10px", color: "var(--text-color)" }}>
              Agent Flow:
            </h5>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <img
                src="/mysteryItem/mystery-item-chart-1.jpg"
                alt="Mystery Item Game Chart 1"
                style={{
                  width: "80%",
                  minWidth: "200px",
                  height: "auto",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              />
              <img
                src="/mysteryItem/mystery-item-chart-2.jpg"
                alt="Mystery Item Game Chart 2"
                style={{
                  width: "80%",
                  minWidth: "200px",
                  height: "auto",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MysteryItemExplainContent;
