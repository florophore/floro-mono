import React, { useState } from 'react'
import { Helmet } from 'react-helmet';

function NotFound() {

  return (
    <div>
        <Helmet>
          <title>{'Not Found'}</title>
        </Helmet>
        <p>
            {'Page not found'}
        </p>
    </div>
  )
}

export default NotFound;