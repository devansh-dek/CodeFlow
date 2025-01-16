import { Link, useLocation } from "react-router";
import {
  Github,
  Home,
  PlusCircle,
  FileQuestion,
  FileText,
  GitBranch,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dash" },
  { icon: PlusCircle, label: "Add Repository", href: "/add-project" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-fit bg-zinc-950 text-gray-100 flex flex-col mt-20">
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.href} className="mx-5">
              <Link
                to={item.href}
                className={`flex items-center gap-2 p-4 my-2 rounded-full hover:bg-zinc-800 transition-colors ${
                  location.pathname === item.href && "bg-zinc-800"
                }`}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
