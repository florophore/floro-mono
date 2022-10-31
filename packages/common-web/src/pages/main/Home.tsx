import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Manager } from "socket.io-client";

function Home() {

  return (
    <div>
        <Helmet>
          <title>{'Floro'}</title>
        </Helmet>
        <p>
            {'Home'}
        </p>
        <Link to={'/about'}>Go to About</Link>
        <p>Testing the waters</p>
    </div>
  )
}

export default Home;