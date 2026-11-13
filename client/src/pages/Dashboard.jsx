/** Frontend and dashboard owner: AHSAS ZAIDI. */
import { useEffect, useState } from "react"; import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; import { api } from "../services/api.js";

export default function Dashboard(){const{user}=useAuth();const[data,setData]=useState({groups:[],events:[]});
useEffect(()=>{Promise.all([api("/groups"),api("/events")]).then(([g,e])=>setData({groups:g.groups,events:e.events}));},[]);
const joined=data.groups.filter(g=>g.joined).length, attending=data.events.filter(e=>e.attending).length;
return <div className="page"><section className="hero"><div><p className="eyebrow">Student dashboard</p><h1>Welcome, {user?.name?.split(" ")[0]}</h1><p>Organize your academic connections and upcoming campus activities.</p></div><div className="hero-actions"><Link className="button primary" to="/groups/new">Create study group</Link><Link className="button secondary" to="/events/new">Create event</Link></div></section>
<section className="stat-grid"><article><strong>{data.groups.length}</strong><span>Available groups</span></article><article><strong>{joined}</strong><span>Groups joined</span></article><article><strong>{data.events.length}</strong><span>Upcoming events</span></article><article><strong>{attending}</strong><span>Your RSVPs</span></article></section>
<div className="two-column"><section><div className="section-heading"><h2>Upcoming study groups</h2><Link to="/groups">View all</Link></div><div className="compact-list">{data.groups.slice(0,3).map(g=><article key={g.id}><span className="course-tag">{g.course_code}</span><div><h3>{g.title}</h3><p>{g.meeting_date} at {g.meeting_time} · {g.location}</p></div></article>)}</div></section>
<section><div className="section-heading"><h2>Campus events</h2><Link to="/events">View all</Link></div><div className="compact-list">{data.events.slice(0,3).map(e=><article key={e.id}><span className="date-tile">{new Date(e.event_date+"T00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</span><div><h3>{e.title}</h3><p>{e.event_time} · {e.location}</p></div></article>)}</div></section></div></div>}
