// src/components/Header.tsx
import React from 'react';

// Define Phosphor Icons as SVGs
const CarSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M168,104a8,8,0,0,1,8-8h40a8,8,0,0,1,0,16H176A8,8,0,0,1,168,104Zm-32,0a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H144A8,8,0,0,1,136,104Zm-32,0a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H112A8,8,0,0,1,104,104Zm-32,0a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16H80A8,8,0,0,1,72,104Zm-32,0a8,8,0,0,1,8-8H64a8,8,0,0,1,0,16H48A8,8,0,0,1,40,104ZM224,144a16,16,0,0,0-16-16H48a16,16,0,0,0-16,16v40a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16v-8h56v8a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16ZM96,184a8,8,0,0,1-16,0v-8a8,8,0,0,1,16,0ZM216,184a8,8,0,0,1-16,0v-8a8,8,0,0,1,16,0ZM224,152v32h-32v-8a16,16,0,0,0-16-16H96a16,16,0,0,0-16,16v8H48V152Z"/>
    </svg>
);
const UserSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM128,80a32,32,0,1,1-32,32A32,32,0,0,1,128,80Zm-40,96a72.16,72.16,0,0,1,80,0,8,8,0,0,1-13.67-8.83,56,56,0,0,0-66.66,0A8,8,0,0,1,88,176Z"/>
    </svg>
);
const MoneySvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-4,56a48,48,0,1,1-48,48A48.05,48.05,0,0,1,124,80Zm12,128a88.1,88.1,0,0,1-8.5,4A8,8,0,0,1,120,208a8,8,0,0,1-7.5-4A88.1,88.1,0,0,1,136,208ZM124,188a64.06,64.06,0,0,0,11.5-3.37A8,8,0,0,1,144,184a8,8,0,0,1-4.5-15.63A64.06,64.06,0,0,0,124,148a4,4,0,0,0-4,4v8a4,4,0,0,0,8,0v-4a56,56,0,0,1,4-17.65V140a8,8,0,0,1-16,0v-4a8,8,0,0,1,16,0v8a48,48,0,1,0,16,36.54c0,2.1-.25,4.14-.72,6.13A8,8,0,0,1,136,180a8,8,0,0,1-12,8Z"/>
    </svg>
);

interface HeaderProps {
    onBackToHome: () => void;
    onAuthClick: () => void;
    onSellClick: () => void;
    onAdminClick: () => void;
    onFinancingClick: () => void; // NEW PROP for Financing Page
    userEmail: string | null;
    isAdmin: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onBackToHome, 
    onAuthClick, 
    onSellClick, 
    onAdminClick,
    onFinancingClick, // Destructure new prop
    userEmail, 
    isAdmin 
}) => {
    return (
        <header className="fixed top-0 left-0 w-full bg-gray-900/90 backdrop-blur-md z-50 shadow-xl border-b border-red-600/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* Logo/Home Button */}
                    <div className="flex items-center">
                        <button onClick={onBackToHome} className="flex items-center space-x-2">
                            <CarSvg />
                            <span className="text-2xl font-extrabold text-white tracking-widest">
                                DRIVE<span className="text-red-600">LUXE</span>
                            </span>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        <button 
                            onClick={onSellClick} 
                            className="text-white hover:text-red-500 transition font-semibold"
                        >
                            Sell Car
                        </button>
                        
                        {/* NEW: Financing Button */}
                        <button 
                            onClick={onFinancingClick} 
                            className="text-white hover:text-red-500 transition font-semibold flex items-center space-x-1"
                        >
                            <MoneySvg />
                            <span>Financing</span>
                        </button>
                        
                        {isAdmin && (
                            <button 
                                onClick={onAdminClick} 
                                className="text-yellow-400 hover:text-yellow-300 transition font-semibold"
                            >
                                Admin Dashboard
                            </button>
                        )}
                        
                        {/* Auth/Profile Button */}
                        <button
                            onClick={onAuthClick}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 
                                ${userEmail ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                        >
                            <UserSvg />
                            <span className="text-sm font-semibold hidden lg:block">
                                {userEmail ? userEmail.split('@')[0] : 'Sign In'}
                            </span>
                        </button>
                    </nav>

                    {/* Mobile Navigation (Only Auth/Profile Icon) */}
                    <div className="md:hidden">
                        <button
                            onClick={onAuthClick}
                            className={`p-2 rounded-full transition-all duration-200 
                                ${userEmail ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                        >
                            <UserSvg />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
