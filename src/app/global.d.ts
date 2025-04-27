// src/global.d.ts
import { Provider } from '@metamask/providers';

declare global {
  interface Window {
    ethereum: Provider;
  }
}
