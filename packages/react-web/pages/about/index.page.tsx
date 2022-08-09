import React from 'react'
import Header from '@floro/storybook/stories/Header';
import Button from '@floro/storybook/stories/Button';

import './code.css'

export { Page }

function Page() {
  return (
    <>
      <h1>About</h1>
      <p>
        Demo using <code>vite-plugin-ssr</code>.
      </p>
      <Button label={"Weird!"} primary={true} backgroundColor={undefined} size={"large"} />
    </>
  )
}