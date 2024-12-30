import Home from "./pages/Home";
import { Route, Routes } from "react-router";
import Signup from "./pages/Signup";
import AuthLayout from "./components/AuthLayout";
import Login from "./pages/Login";

const App = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Home />
            <div className="h-dvh w-dvw bg-[#120E25]"></div>
          </>
        }
      />
      <Route element={<AuthLayout />}>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
};

export default App;
