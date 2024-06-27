//All of the following code is dummy, boilerplate. Replace with relevant material.

// components/SearchComponent.tsx
/*import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-500"
      />
      <button className="absolute top-0 right-0 px-4 py-2 bg-blue-500 text-white rounded-l-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"></button>
    </div>
  );
};

export default SearchBar;
*/
// components/SearchBar.tsx
import React from 'react';

const SearchBar: React.FC = () => {
  return (
    <div className="relative flex items-center w-full max-w-lg">
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 border-0 outline-none text-black shadow-lg rounded-none focus:ring-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-grey pointer-events-none box-shadow-black"></div>
    </div>
  );
};

export default SearchBar;

