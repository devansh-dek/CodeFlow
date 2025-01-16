import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Search } from "lucide-react";

const DashLayout = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex flex-col h-dvh w-dvw bg-zinc-950">
      <div className="h-fit py-5 pb-7 px-3 w-full border-b flex items-center gap-10 border-zinc-800">
        <img src="/icons/codeflow-logo.png" alt="Logo" className="h-20" />
        <div className="w-[300px]">
          <div
            className={`
          flex items-center gap-3 px-4 py-3 
          bg-zinc-900 border rounded-full
          transition-all duration-300 ease-in-out
          ${
            isFocused
              ? "border-[#7d6add] shadow-lg shadow-blue-500/20"
              : "border-zinc-700"
          }
        `}
          >
            <Search
              className={`
            w-5 h-5 transition-colors duration-300
            ${isFocused || searchValue ? "text-[#7d6add]" : "text-zinc-400"}
          `}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="
            w-full bg-transparent text-zinc-100 
            placeholder-zinc-400 outline-none
            text-sm
          "
            />
          </div>
        </div>
      </div>
      <div className="flex h-full bg-custom-bg text-zinc-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
