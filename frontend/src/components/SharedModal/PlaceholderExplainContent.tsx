import React from "react";

const PlaceholderExplainContent: React.FC = () => {
  return (
    <>
      <h4 style={{ marginBottom: "20px", color: "var(--text-color)" }}>
        How to Play
      </h4>
      <div style={{ textAlign: "left", lineHeight: "1.6" }}>
        <p>
          <strong>🎯 Goal:</strong> Placeholder
        </p>

        <p>
          <strong>💡 How to Play:</strong>
        </p>
        <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
          <li>Placeholder ------------------------</li>
        </ul>
        {/* <hr style={{ margin: "20px 0" }} /> */}
      </div>
    </>
  );
};

export default PlaceholderExplainContent;
