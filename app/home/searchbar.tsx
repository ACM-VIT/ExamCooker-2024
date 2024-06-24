

import React from 'react';
import './SearchBar.css';

const SearchBar = () => {
    return (
        <div className="search-container">
            <input type="text" className="search-bar" placeholder="Search..." />
            <button className="search-button">
                <img src="https://cdn-icons-png.flaticon.com/512/622/622669.png" alt="Search" />
            </button>
        </div>
    );
};

export default SearchBar;
