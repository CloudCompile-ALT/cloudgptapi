'use client';

import { LogtoProvider, LogtoConfig } from '@logto/react';
import { ReactNode } from 'react';

const config: LogtoConfig = {
  endpoint: process.env.NEXT_PUBLIC_LOGTO_ENDPOINT || 'https://ethical-incident-barbara-proceedings.trycloudflare.com',
  appId: process.env.NEXT_PUBLIC_LOGTO_APP_ID || 'qcma8qo4f4req96mhc5kl',
};

export const LogtoClientProvider = ({ children }: { children: ReactNode }) => {
  return <LogtoProvider config={config}>{children}</LogtoProvider>;
};
