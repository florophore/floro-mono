import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import ReactSVG from '../assets/react.svg';

function Home() {

  return (
    <div>
        <p>
            {'Home'}
        </p>
        <Link to={'/about'}>Go to About</Link>
    </div>
  )
}

export default Home;