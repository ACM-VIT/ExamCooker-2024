"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function ThemeToggleSwitch() {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setDarkMode(true);
        } else {
            setDarkMode(false);
        }
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div 
            onClick={() => setDarkMode(!darkMode)} 
            className="relative overflow-hidden flex items-center justify-center w-10 h-6 dark:bg-[#121B31] border-[1px] border-[#2699E9] dark:border-[#D5D5D5] rounded-full hover:border-1 hover:border-[#3BF4C7] dark:hover:border-[#3BF4C7] transition-all ease-linear duration-150 cursor-pointer"
        >
            <div 
                className={`flex justify-center items-center bg-[#D0E9ED] dark:bg-[#0C1120] shadow-md w-4 h-4 rounded-full transition-transform ease-in-out ${
                    darkMode ? "translate-x-2" : "-translate-x-2"
                }`}
            >
                {!darkMode && (
                    <Image src={"/assets/LucideSun.svg"} alt="Sun" width={25} height={25} />
                )}
                {darkMode && (
                    <Image src={"/assets/LucideMoon.svg"} alt="Moon" width={25} height={25} className="invert-[.835]" />
                )}
            </div>
        </div>
    );
}

export default ThemeToggleSwitch;
