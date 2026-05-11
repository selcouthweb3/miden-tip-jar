import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { MidenWalletAdapter } from '@miden-sdk/miden-wallet-adapter-miden';
import { WalletProvider } from '@miden-sdk/miden-wallet-adapter-react/dist/WalletProvider.js';
import { AllowedPrivateData, PrivateDataPermission, WalletAdapterNetwork } from '@miden-sdk/miden-wallet-adapter-base';

const wallets = [new MidenWalletAdapter({ appName: 'Miden Tip Jar' })];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider
      wallets={wallets}
      network={WalletAdapterNetwork.Testnet}
      privateDataPermission={PrivateDataPermission.Auto}
      allowedPrivateData={AllowedPrivateData.All}
      autoConnect
    >
      <App />
    </WalletProvider>
  </StrictMode>
);