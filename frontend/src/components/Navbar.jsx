import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import the "Broadcast Station"
import { Link } from 'react-router-dom';

export default function Navbar() {
  // Pull 'user' and 'logout' from our Global Memory
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        
        <span className="text-xl font-black tracking-tighter text-mzansi-green">
          MZANSI<span className="text-white font-medium">BUILDS</span>
        </span>

        <div className="flex items-center gap-6">
          {/* LOGIC: If user exists, show username and Logout. Otherwise, show Login. */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Dev: {user.username}
              </span>
              <button 
                onClick={logout}
                className="text-xs font-bold text-gray-400 hover:text-mzansi-green transition-colors uppercase"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase">
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}