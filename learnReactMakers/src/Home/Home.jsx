import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../style/index.css";
import React from "react";
import { useUser } from "../hooks/useUser";

const NAV_ITEMS = [
  { to: "/todo", label: "Todo App" },
  { to: "/weather", label: "Weather App" },
  { to: "/post", label: "Post App" },
  { to: "/luxora", label: "Luxora Shop" },
  { to: "/dashboard", label: "Task Dashboard" },
];

//5. useUser dipakai di Home
function NameForm() {
  const { saveUser } = useUser();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!input.trim()) {
      setError("Name cannot be empty.");
      inputRef.current?.focus();
      return;
    }

    setError("");
    saveUser(input.trim());
  };

  return (
    <section className="nameFormWrapper" aria-labelledby="form-heading">
      <h1 id="form-heading" className="nameFormTitle">
        What&apos;s Your Name?
      </h1>

      <p className="nameFormSub" id="form-desc">
        Enter your name to start reading and writing travel stories.
      </p>

      <div className="nameFormRow" aria-describedby="form-desc">
        <input
          ref={inputRef}
          className={`nameInput${error ? " nameInput--error" : ""}`}
          placeholder="Your name..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);

            if (error) setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          aria-label="Enter your name"
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "name-error" : "form-desc"}
          autoComplete="given-name"
        />

        <button
          className="nameSubmitBtn"
          onClick={handleSubmit}
          aria-label="Submit name and continue"
        >
          Enter
        </button>
      </div>

      {error && (
        <p
          id="name-error"
          className="nameFormError"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </section>
  );
}

function Home() {
  const { user } = useUser();
  const headingRef = useRef(null);

  useEffect(() => {
    if (user.isLoggedIn) {
      headingRef.current?.focus();
    }
  }, [user.isLoggedIn]);

  // Lifecycle
  useEffect(() => {
    console.log("Home mounted");

    return () => {
      console.log("Home unmounted");
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        console.log("Shortcut pressed");
      }
    };

    // MOUNT
    window.addEventListener("keydown", handleKeyDown);

    // UNMOUNT
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [user.isLoggedIn]);

  return (
    <main className="containerHome" id="main-content">
      <Helmet>
        <title>Home</title>
        <meta
          name="description"
          content="Explore Todo, Weather, Post, and Luxora Shop applications from one page."
        />

        <meta property="og:title" content="Home" />

        <meta
          property="og:description"
          content="Explore Todo, Weather, Post, and Luxora Shop applications."
        />

        <meta property="og:type" content="website" />
      </Helmet>
      
      
      {/* 6. nama tampil */}
      {!user.isLoggedIn ? (
        <NameForm />
      ) : (
        <>
          <h1 className="welcomeMessage" ref={headingRef} >
            Hello,{" "}
            <span
              style={{ color: "var(--accent)" }}
              aria-label={`your name: ${user.name}`}
            >
              {user.name}
            </span>
            !
          </h1>

          <h2 className="welcomeSub">What would you like to explore today?</h2>

          <nav aria-label="Application navigation">
            <ul className="button-row">
              {NAV_ITEMS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="button" aria-label={`Open ${label}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </main>
  );
}

export default React.memo(Home);
