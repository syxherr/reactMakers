import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/index.css";
import React from "react";
import { useUser } from "../post/context/useUser";

const NAV_ITEMS = [
  { to: "/todo", label: "Todo App" },
  { to: "/weather", label: "Weather App" },
  { to: "/post", label: "Post App" },
  { to: "/luxora", label: "Luxora Shop" },
];

function NameForm() {
  const { saveUser } = useUser();
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    if (!input.trim()) return;
    saveUser(input.trim());
  };

  return (
    <div className="nameFormWrapper">
      <p className="nameFormTitle">What's Your Name?</p>
      <p className="nameFormSub">
        Enter your name to start reading and writing travel stories.
      </p>
      <div className="nameFormRow">
        <input
          className="nameInput"
          placeholder="Your name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
        />
        <button className="nameSubmitBtn" onClick={handleSubmit}>
          Enter
        </button>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useUser();

  return (
    <div className="containerHome">
      {!user.isLoggedIn ? (
        <NameForm />
      ) : (
        <>
          <h1 className="welcomeMessage">
            Halo, <span style={{ color: "var(--accent)" }}>{user.name}</span>!
          </h1>
          <p className="welcomeSub">What would you like to explore today?</p>

          <div className="button-row">
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <Link to={to} key={to} style={{ textDecoration: "none" }}>
                <button className="button">
                  <span className="btn-icon">{icon}</span>
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default React.memo(Home);
