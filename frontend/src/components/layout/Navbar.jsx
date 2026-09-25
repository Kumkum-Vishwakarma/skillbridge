import { useAuth } from "../../hooks/useAuth.js";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-blue-600">SkillBridge</span>
        <span className="hidden text-sm text-gray-400 sm:inline">
          Peer-to-Peer Skill Exchange
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className="hidden text-sm font-medium text-gray-700 sm:inline">
            {user?.name}
          </span>
        </div>

        <button
          onClick={logout}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;