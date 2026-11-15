import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import {
  FaTachometerAlt,
  FaUserShield,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import { UserContext } from "../App";
import { useAuth } from "../context/AuthProvider";

/**
 * SIIT — UserNavigationPanel
 * Dropdown shown under the navbar avatar when a user is signed in.
 * Links adapt to role (admin link only for admin / super_admin).
 */
const UserNavigationPanel = () => {
  const { userAuth, setUserAuth } = useContext(UserContext);
  const { signOut } = useAuth();
  const isAdmin = ["admin", "super_admin"].includes(userAuth?.role);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (_) {
      /* no-op in dummy mode */
    }
    setUserAuth({ access_token: null });
  };

  const item =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-text_color2 transition hover:bg-body";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl"
    >
      <div className="border-b border-black/5 px-4 py-3">
        <p className="truncate font-semibold text-[#1b2447]">
          {userAuth?.name || "User"}
        </p>
        <p className="truncate text-xs capitalize text-text_color2/60">
          {(userAuth?.role || "student").replace("_", " ")}
        </p>
      </div>

      <Link to={isAdmin ? "/admin" : "/portal"} className={item}>
        <FaTachometerAlt className="text-buttons_1" /> {isAdmin ? "Admin panel" : "Student portal"}
      </Link>

      {isAdmin && (
        <Link to="/admin" className={item}>
          <FaUserShield className="text-buttons_1" /> Admin dashboard
        </Link>
      )}

      <Link to={isAdmin ? "/admin/profile" : "/portal/profile"} className={item}>
        <FaUserCircle className="text-buttons_1" /> My profile
      </Link>

      <button
        onClick={handleSignOut}
        className={`${item} w-full border-t border-black/5 text-left text-buttons_1`}
      >
        <FaSignOutAlt /> Sign out
      </button>
    </motion.div>
  );
};

export default UserNavigationPanel;
