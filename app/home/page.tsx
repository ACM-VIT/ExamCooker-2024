
import React from "react";
import Searchbar from './searchbar';
import CardHolder from './CardHolder';
import Link from 'next/link';

const Home= () => {
    return (
        <div >
            <Searchbar />
            <h1>Recently Viewed </h1>
            <CardHolder />
            <h1>Favourites</h1>
            <CardHolder />
            <Link href={"/"}  className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600" >Back</Link>

        </div>
    );
}


export default Home;