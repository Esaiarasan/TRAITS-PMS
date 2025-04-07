import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Menu = ({ user }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Hamburger */}
            <div className="md:hidden fixed top-0 left-0 w-full bg-white shadow-md z-20 p-4 flex justify-between items-center">
                <img src="/logo.png" alt="Logo" className="w-10" />
                <button onClick={() => setIsOpen(!isOpen)} className="text-2xl">☰</button>
            </div>

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full bg-gray-100 shadow-lg z-10 p-5 transition-transform duration-300 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:w-1/8 w-3/4`}>
                <div className="mb-8 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">{user.username}</h2>
                </div>
                <ul className="space-y-4">
                    {['dashboard', 'lease', 'property', 'tenant', 'rent', 'cheque'].map((route) => (
                        <li
                            key={route}
                            onClick={() => { navigate(`/${route}`); setIsOpen(false); }}
                            className="p-4 text-gray-700 cursor-pointer hover:bg-gray-200 rounded-md transition-colors"
                        >
                            {route.charAt(0).toUpperCase() + route.slice(1)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default Menu;
