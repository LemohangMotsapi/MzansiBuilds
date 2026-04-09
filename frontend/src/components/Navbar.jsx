import React from 'react';

export default function Navbar(){
    return(
        <nav className="sticky top-0 z-50 w-full border-b border-border-subtle bg-bg-black/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 items-center justify-between px-6">

                <span className="text-xl font-black tracking-tighter text-mzansi-green">
                MZANSI<span className="text-white font-medium">BUILDS</span>
                </span>

                <div className="flex items-center gap-6">
                    <button className="text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        LOG IN
                    </button>
                </div>
            </div>
        </nav>
    );
}