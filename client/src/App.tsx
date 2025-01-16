import Home from "./pages/Home";
import { Route, Routes } from "react-router";
import Signup from "./pages/Signup";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProject from "./pages/AddProject";
import DashLayout from "./components/DashLayout";
import Project from "./pages/Project";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<DashLayout />}>
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/project/:title" element={<Project />} />
      </Route>
    </Routes>
  );
};

export default App;
