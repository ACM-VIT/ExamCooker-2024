

import React from 'react';
import './cards.css';

interface CardProps {
    title: string;
    content: string;
}

const Card: React.FC<CardProps> = ({ title, content }) => {
    return (
        <div className="card">
            <h3 className="card-title">{title}</h3>
            <p className="card-content">{content}</p>
        </div>
    );
};

export default Card;
