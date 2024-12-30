import { useState } from "react";
import { Link } from "react-router";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-5 mt-5 justify-center">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-white text-xs">
          Email
        </label>
        <div className="bg-glass flex px-5 py-2 items-center gap-5">
          <img src="/icons/user.png" alt="Email icon" className="h-4" />
          <input
            type="text"
            id="email"
            className="bg-transparent py-1 w-full focus:outline-none text-xs text-white"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-white text-xs">
          Password
        </label>
        <div className="bg-glass flex px-5 py-2 items-center gap-5">
          <img src="/icons/password.png" alt="Passoword icon" className="h-4" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="bg-transparent py-1 w-full focus:outline-none text-xs text-white"
          />
          {showPassword ? (
            <img
              src="/icons/show.png"
              alt="Password show icon"
              className="h-4 cursor-pointer"
              onClick={toggleShowPassword}
            />
          ) : (
            <img
              src="/icons/hide.png"
              alt="Password hide icon"
              className="h-4 cursor-pointer"
              onClick={toggleShowPassword}
            />
          )}
        </div>
      </div>
      <button className="bg-[#7d75af] hover:bg-[#a39ada] py-2 mt-5 flex items-center justify-center rounded-lg gap-5 text-zinc-900 font-semibold text-sm">
        Login
      </button>
      <div className="text-xs text-white text-center">
        Don't have an account?{" "}
        <Link to='/signup'>
          <span className="text-[#7d75af] cursor-pointer hover:underline">
            Sign up
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Login;
