import React from 'react'
import { hydrateRoot, render as renderTo } from 'react-dom/client'
import { PageShell } from './PageShell'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client'

export { render }

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const { Page, pageProps } = pageContext
  if (pageContext.isHydration) {
  }

  hydrateRoot(
    document.getElementById('page-view')!,
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>,
  )
}

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */


// Enable Client Routing
export const clientRouting = true

//// See `Link prefetching` section below. Default value: `{ when: 'HOVER' }`.
//export const prefetchStaticAssets = { when: 'VIEWPORT' }
//
//// Create custom page transition animations
export { onPageTransitionStart }
export { onPageTransitionEnd }
//
//import { renderTo}
//
function onPageTransitionStart() {
  console.log('Page transition start')
  // For example:
  document.body.classList.add('page-transition')
}
function onPageTransitionEnd() {
  console.log('Page transition end')
  // For example:
  document.body.classList.remove('page-transition')
}