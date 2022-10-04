import React from 'react'
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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
    </div>
  )
}

export default Home;