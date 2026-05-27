import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginWithFirebase } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async () => {
    const result = await dispatch(loginWithFirebase(form));
    if (loginWithFirebase.fulfilled.match(result)) {
      navigate("/luxora");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>✦ Luxora</h1>
        <p>Masuk ke akun kamu</p>

        {error && <p className={styles.error}>{error}</p>}

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Memuat..." : "Masuk →"}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;