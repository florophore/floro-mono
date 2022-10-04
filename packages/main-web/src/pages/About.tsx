import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import ReactSVG from '@floro/common-assets/assets/react.svg';
import NewIcon from '@floro/common-assets/assets/images/new_icon.svg';
import {Helmet} from "react-helmet";

function About() {

  return (
    <div>
      <Helmet>
        <title>{'About'}</title>
      </Helmet>
        <p>
            {'About Test'}
        </p>
        <img src={ReactSVG}/>
        <img src={NewIcon}/>
        <Link to={'/'}>Go to Home</Link>
    </div>
  )
}

export default About;