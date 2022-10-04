import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import styled from '@emotion/styled'
import ReactSVG from '@floro/common-assets/assets/react.svg';
import {Helmet} from "react-helmet";

function About() {

  return (
    <div>
      <Helmet>
        <title>{'About'}</title>
      </Helmet>
        <p>
            {'Admin About'}
        </p>
        <img src={ReactSVG}/>
        <Link to={'/'}>Go to Home</Link>
    </div>
  )
}

export default About;