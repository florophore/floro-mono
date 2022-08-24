import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import styled from '@emotion/styled'
import ReactSVG from '../assets/react.svg';
import ButtonStory from '@floro/storybook/stories/Button'

const Button = styled.button`
  padding: 32px;
  background-color: blue;
  font-size: 24px;
  border-radius: 4px;
  color: black;
  font-weight: bold;
  &:hover {
    color: white;
  }
`


function About() {

  return (
    <div>
        <p>
            {'About'}
        </p>
        <img src={ReactSVG}/>
        <Link to={'/'}>Go to Home</Link>
    </div>
  )
}

export default About;