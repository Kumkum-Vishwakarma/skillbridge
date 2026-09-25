import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "My Profile", path: "/profile" },
  { label: "My Skills", path: "/skills" },
  { label: "Find Matches", path: "/matches" },
  { label: "Exchange Requests", path: "/requests" },
];

const Sidebar = () => {
  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-gray-200 bg-white md:block">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;