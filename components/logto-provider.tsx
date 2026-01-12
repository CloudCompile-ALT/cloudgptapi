'use client';

import { LogtoProvider, LogtoConfig } from '@logto/react';
import { ReactNode } from 'react';

const config: LogtoConfig = {
  endpoint: process.env.NEXT_PUBLIC_LOGTO_ENDPOINT!,
  appId: process.env.NEXT_PUBLIC_LOGTO_APP_ID!,
};

export const LogtoClientProvider = ({ children }: { children: ReactNode }) => {
  return <LogtoProvider config={config}>{children}</LogtoProvider>;
};
