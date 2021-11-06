import React, { useContext, useEffect } from 'react';
import { IDemoSectionProps } from './types';
import { Web3Context } from 'context';

const DemoSectionProps: React.FC<IDemoSectionProps> = () => {
  const { web3, requestAccess, hasPerm } = useContext(Web3Context)

  return (
    <div>
      <h1>Hello, Rubi!</h1>
      <h2>{hasPerm ? 'Connected' : 'Disconnected'}</h2>
      <button onClick={requestAccess}>
        {hasPerm ? `You're already connected` : 'Connect'}
      </button>
    </div>
  )
}

export default DemoSectionProps
