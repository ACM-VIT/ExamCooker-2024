"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

function ThemeToggleSwitch() {

    const [darkMode, setDarkMode] = useState(true)

    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            setDarkMode(true);
        }
    }, [])

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode])

    return (
        <div 
            onClick={() => setDarkMode(!darkMode)} 
            className="relative overflow-hidden flex items-center justify-center w-14 h-6 dark:bg-[#121B31] border-[1px] border-[#2699E9] dark:border-[#D5D5D5] rounded-full hover:border-1 hover:border-[#3BF4C7] dark:hover:border-[#3BF4C7] transition-all ease-linear duration-150 cursor-pointer"
        >
            <div 
                className="flex justify-center items-center bg-transparent dark:bg-[#0C1120] w-5 h-5 rounded-full -translate-x-3 dark:translate-x-3 transition-transform ease-in-out"
            >
                <Image 
                    src={"/assets/LucideSun.svg"} 
                    alt="Sun" 
                    width={20} 
                    height={20} 
                    className={`${darkMode ? "hidden" : ""}`} 
                />
                <Image 
                    src={"/assets/LucideMoon.svg"} 
                    alt="Moon" 
                    width={20} 
                    height={20} 
                    className={`invert-[.835] ${!darkMode ? "hidden" : ""}`} 
                />
            </div>
        </div>
    );
}

export default ThemeToggleSwitch;
