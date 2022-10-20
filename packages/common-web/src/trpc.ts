import { createReactQueryHooks } from '@trpc/react';
import { createTRPCClient } from '@trpc/client';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'

import { TRPCRouter } from 'floro/src/router';
import { ProtectedTRPCRouter } from 'floro/src/protectedrouter';
import fetch from 'isomorphic-fetch';

// aws-sdk requires global to exist
if (typeof window !== 'undefined') {
    (window as any).global = window;
}
if (global as any) {
    const globalAny = global as any; 
    globalAny.AbortController = AbortController; 
    globalAny.fetch = fetch; 
}
export const trpc = createReactQueryHooks<TRPCRouter>();
export const trpcClient = createTRPCClient<TRPCRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:63403/trpc',
      }),
    ],
  });

export const protectedTrpc = createReactQueryHooks<ProtectedTRPCRouter>();
export const protectedTrpcClient = createTRPCClient<ProtectedTRPCRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:63403/protectedtrpc',
      }),
    ],
  });