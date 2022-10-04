import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Button from '@floro/storybook/stories/Button';

function Home() {

  return (
    <div>
        <Helmet>
          <title>{'Floro'}</title>
        </Helmet>
        <p>
            {'Admin Home Testing more'}
        </p>
        <Link to={'/about'}>Go to About</Link>
        <Button label='test' bg={
          'purple'
        } />
    </div>
  )
}

export default Home;