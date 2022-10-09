import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Manager } from "socket.io-client";

function Home() {

  //useEffect(() => {
  //  const manager = new Manager('ws://localhost:63403', {
  //    reconnectionDelayMax: 10000
  //  });
  //  const socket = manager.socket("/"); // main namespace
  //  socket.on("connect", () => {
  //    console.log("connected");
  //  })
  //  socket.on("hello", (event) => {
  //    console.log("GOT A MESSAGE", event)
  //  });
  //}, []);

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