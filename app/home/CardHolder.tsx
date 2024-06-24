// src/CardHolder.tsx

import React from 'react';
import Card from './cards';
import './CardHolder.css';

const CardHolder = () => {
    return (
        <div className="card-holder">
            <Card title="Card 1" content="This is the content of card 1." />
            <Card title="Card 2" content="This is the content of card 2." />
            <Card title="Card 3" content="This is the content of card 3." />
        </div>
    );
};

export default CardHolder;
