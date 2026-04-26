import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../lib/api";

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isRegister ? form : { email: form.email, password: form.password };
      const data = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSession(data);
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">{isRegister ? "Register" : "Login"}</p>
        <h1>{isRegister ? "Buat akun KloudBox" : "Masuk ke KloudBox"}</h1>
        {isRegister ? (
          <label>
            Nama
            <input name="name" value={form.name} onChange={updateField} required minLength={2} />
          </label>
        ) : null}
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} required />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateField}
            required
            minLength={6}
          />
        </label>
        {error ? <div className="error">{error}</div> : null}
        <button className="button full" disabled={loading}>
          {loading ? <Loader2 className="spin" size={18} /> : null}
          {isRegister ? "Register" : "Login"}
        </button>
        <p className="auth-switch">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </main>
  );
}
