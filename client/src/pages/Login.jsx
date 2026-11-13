/** Frontend owner: AHSAS ZAIDI. Authentication API owner: NIHAL AHMED. */
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Notice from "../components/Notice.jsx";

export default function Login() {
  const { user, login } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState("student@campusconnect.edu"); const [password, setPassword] = useState("Student123!");
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(e) { e.preventDefault(); setError(""); setBusy(true); try { await login(email, password); navigate("/dashboard"); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <div className="auth-page"><section className="auth-intro"><div className="brand large"><span className="brand-mark">C</span>CampusConnect</div>
    <h1>Study together.<br />Stay connected.</h1><p>Find course-based study groups and campus events through one student-centered platform.</p>
    <ul><li>Search and join study groups</li><li>Create sessions for your courses</li><li>Discover and RSVP to events</li></ul></section>
    <section className="auth-card"><div><p className="eyebrow">Welcome back</p><h2>Log in to your account</h2><Notice type="error">{error}</Notice>
      <form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <button className="primary full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</button></form>
      <p className="form-footer">New to CampusConnect? <Link to="/register">Create an account</Link></p>
      <div className="demo-box"><strong>Demo accounts</strong><span>Student: student@campusconnect.edu / Student123!</span><span>Admin: admin@campusconnect.edu / Admin123!</span></div>
    </div></section></div>;
}
