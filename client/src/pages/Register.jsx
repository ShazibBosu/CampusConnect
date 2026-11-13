/** Frontend owner: AHSAS ZAIDI. Authentication API owner: NIHAL AHMED. */
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; import Notice from "../components/Notice.jsx";

export default function Register() {
  const { user, register } = useAuth(); const navigate = useNavigate();
  const [form,setForm]=useState({name:"",email:"",password:""}); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  if(user) return <Navigate to="/dashboard" replace />;
  async function submit(e){e.preventDefault();setBusy(true);setError("");try{await register(form.name,form.email,form.password);navigate("/profile");}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <div className="auth-page"><section className="auth-intro"><div className="brand large"><span className="brand-mark">C</span>CampusConnect</div><h1>Build your campus community.</h1><p>Create a free student account, complete your academic profile, and begin collaborating.</p></section>
  <section className="auth-card"><div><p className="eyebrow">Join CampusConnect</p><h2>Create your account</h2><Notice type="error">{error}</Notice>
  <form onSubmit={submit}><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label><label>Password<input type="password" minLength="8" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /><small>Use at least 8 characters.</small></label><button className="primary full" disabled={busy}>{busy?"Creating account...":"Create account"}</button></form><p className="form-footer">Already registered? <Link to="/login">Log in</Link></p></div></section></div>;
}
