import axiosConfig from "@/api/axiosConfig";
import { useEffect, useState } from "react";
import { Link } from "react-router";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  async function signup() {
    try {
      const response = await axiosConfig.post(
        "/api/auth/register",
        JSON.stringify({ email, password }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (password.length >= 1 && password.length < 8) {
      setPasswordValid(false);
    } else {
      setPasswordValid(true);
    }
  }, [password]);

  return (
    <div className="flex flex-col gap-5 mt-5 justify-center">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-white text-xs">
          Username
        </label>
        <div className="bg-glass flex px-5 py-2 items-center gap-5">
          <img src="/icons/user.png" alt="Username icon" className="h-4" />
          <input
            type="text"
            id="username"
            className="bg-transparent py-1 w-full focus:outline-none text-xs text-white"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-white text-xs">
          Email
        </label>
        <div className="bg-glass flex px-5 py-2 items-center gap-5">
          <img src="/icons/user.png" alt="Email icon" className="h-4" />
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="bg-transparent py-1 w-full focus:outline-none text-xs text-white"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-white text-xs">
          Password
        </label>
        <div
          className={`${
            !passwordValid && "border-[1px] border-red-400"
          } bg-glass flex px-5 py-2 items-center gap-5`}
        >
          <img src="/icons/password.png" alt="Passoword icon" className="h-4" />
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
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
        <div
          className={`text-xs ${
            passwordValid ? "text-zinc-400" : "text-red-400"
          }`}
        >
          Minimum length is 8 characters
        </div>
      </div>
      <button
        onClick={signup}
        className="bg-[#7d75af] hover:bg-[#a39ada] py-2 mt-5 flex items-center justify-center rounded-lg gap-5 text-zinc-900 font-semibold text-sm"
      >
        Sign up
      </button>
      <div className="text-xs text-white text-center">
        Already have an account?{" "}
        <Link to="/login">
          <span className="text-[#7d75af] cursor-pointer hover:underline">
            Login
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Signup;
