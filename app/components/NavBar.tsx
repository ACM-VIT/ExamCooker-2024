"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Loading from "../loading";

const NavBar: React.FC = () => {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    const RenderMenuItem = ({ svgSource, alt, href }: { svgSource: string, alt: string, href: string }) => {
        const [showTooltip, setShowTooltip] = useState(false);
        const isActive = pathname === href;

        return (
            <Link href={href} passHref className={'w-full p-1 flex justify-center items-center'}>
                <div 
                    className="relative group"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setLoading(true)}
                >
                    <div className={`flex items-center justify-center m-2 cursor-pointer`}>
                        <Image
                            src={svgSource}
                            alt={alt}
                            width={24}
                            height={25}
                            className={`dark:invert-[.835] transition-all transform-gpu group-hover:scale-110 ${!isActive ? "group-hover:-translate-y-1 group-hover:rotate-[-5deg]" : ""}`}
                        />
                    </div>
                    {showTooltip && (
                        <div 
                            className={`
                                absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 px-3 py-2 
                                bg-gradient-to-r from-[#5fc4e7] to-[#4db3d6] dark:from-[#3BF4C7] dark:to-[#2ad3a7] 
                                text-white dark:text-[#232530] rounded-md text-sm
                                shadow-lg backdrop-blur-sm backdrop-filter
                                transition-all duration-300 ease-in-out
                                opacity-100 visible translate-x-0
                                whitespace-nowrap
                            `}
                        >
                            <span className="font-medium">{alt}</span>
                            <div className="absolute w-0 h-0 
                                border-t-[6px] border-b-[6px] border-r-[6px] 
                                border-transparent border-r-[#5fc4e7] dark:border-r-[#3BF4C7] 
                                -left-[6px] top-1/2 -translate-y-1/2 
                                transition-transform duration-300 ease-in-out">
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        );
    };

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            {loading && <Loading />}
            <nav
                className={`fixed top-0 left-0 flex flex-col items-center h-screen w-fit
                    bg-[#5fc4e7] dark:bg-[#232530] dark:border-[#3BF4C7] dark:border-r
                    text-white transition-all duration-300 ease-in-out`}
            >
                <div className="w-full flex flex-col items-center justify-center h-full justify-center p-0.5">
                    <RenderMenuItem svgSource="/assets/Home.svg" alt="Home" href="/"/>
                    <RenderMenuItem svgSource="/assets/NotesIcon.svg" alt="Notes" href="/notes"/>
                    <RenderMenuItem svgSource="/assets/PastPapersIcon.svg" alt="Papers" href="/past_papers"/>
                    <RenderMenuItem svgSource="/assets/ForumIcon.svg" alt="Forum" href="/forum"/>
                    <RenderMenuItem svgSource="/assets/BookIcon.svg" alt="Resources" href="/resources"/>
                    <RenderMenuItem svgSource="/assets/NavFavouriteIcon.svg" alt="Favourites" href="/favourites"/>
                </div>
            </nav>
        </>
    );
};

export default NavBar;