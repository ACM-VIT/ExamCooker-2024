"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import NavBar from "@/app/components/NavBar";
import Header from "@/app/components/header";
import Image from "next/image";
import Loading from "@/app/(portal)/loading";

export default function ClientSide({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isNavOn, setIsNavOn] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const navbarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedNavState = localStorage.getItem("isNavOn");
        const savedDarkMode = localStorage.getItem("darkMode");
        if (savedNavState !== null) {
            setIsNavOn(savedNavState === "true");
        }
        if (savedDarkMode !== null) {
            setDarkMode(savedDarkMode === "true");
        }
    }, []);

    const toggleNavbar = () => {
        setIsNavOn((prevState) => {
            const newState = !prevState;
            localStorage.setItem("isNavOn", newState.toString());
            return newState;
        });
    };

    const toggleTheme = () => {
        setDarkMode((prevState) => {
            const newState = !prevState;
            localStorage.setItem("darkMode", newState.toString());
            return newState;
        });
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            navbarRef.current &&
            !navbarRef.current.contains(event.target as Node)
        ) {
            setIsNavOn(false);
            localStorage.setItem("isNavOn", "false");
        }
    };

    useEffect(() => {
        if (isNavOn) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNavOn]);

    return (
        <div
            className={`relative flex`}>
            {!isNavOn && (
                    <Image
                        src="/assets/HamburgerIcon.svg"
                        alt="Menu"
                        width={30}
                        height={30}
                        className="dark:invert-[.835] transition-transform transform-gpu hover:scale-110 hover:-translate-y-1"
                    />
            )}
            <div ref={navbarRef}>
                <NavBar isNavOn={isNavOn} toggleNavbar={toggleNavbar} />
            </div>
            {isNavOn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300"></div>
            )}
            <main
                className={`flex-grow transition-all duration-300 ease-in-out ${
                    isNavOn ? "lg:w-[95vw] md:w-[92vw]" : "w-[100vw]"
                }`}
            >
                <div className={darkMode ? "dark" : ""}>
                    <Header toggleTheme={toggleTheme} darkMode={darkMode} />
                    {/* <Suspense fallback={<Loading />}>{children}</Suspense> */}
                    {children}
                </div>
            </main>
        </div>
    );
}
