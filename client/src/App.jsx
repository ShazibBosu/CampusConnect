/** Route composition owner: AHSAS ZAIDI. */
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx"; import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx"; import Groups from "./pages/Groups.jsx";
import GroupForm from "./pages/GroupForm.jsx"; import Events from "./pages/Events.jsx";
import EventForm from "./pages/EventForm.jsx"; import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} /><Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}><Route element={<Layout />}>
      <Route path="/dashboard" element={<Dashboard />} /><Route path="/groups" element={<Groups />} />
      <Route path="/groups/new" element={<GroupForm />} /><Route path="/groups/:id/edit" element={<GroupForm />} />
      <Route path="/events" element={<Events />} /><Route path="/events/new" element={<EventForm />} />
      <Route path="/events/:id/edit" element={<EventForm />} /><Route path="/profile" element={<Profile />} />
    </Route></Route>
    <Route element={<ProtectedRoute admin />}><Route element={<Layout />}><Route path="/admin" element={<Admin />} /></Route></Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>;
}
