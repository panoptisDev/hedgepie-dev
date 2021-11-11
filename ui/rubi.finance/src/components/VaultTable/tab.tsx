import React, { useEffect, useState } from 'react';
import styles from './style';
import { Heading, Flex } from 'theme-ui';
import { View } from './types'

interface ITab {
  view?: View
  setActiveTab: (view: View) => void
}

const tabs: View[] = [
  'STAKED VAULTS', 'ALL VAULTS', 'NORMAL VAULTS', 'BURNING VAULTS', 'INACTIVE VAULTS', 'MY COLLECTION'
]

const Tab: React.FC<ITab> = ({ view, setActiveTab }) => {
  const [active, setActive] = useState(view || tabs[1])

  useEffect(() => {
    setActiveTab(active)
  }, [active])
  
  return (
    <Flex 
      sx={{
        padding: '1em 2em',
        borderRadius: '10px',
        background: '#6551da',
        justifyContent: active === 'MY COLLECTION' ? 'left' : 'space-evenly'
      }}
    >
      {tabs.map((tab, index) => {
        if (active === 'MY COLLECTION' && tab !== 'MY COLLECTION') {
          return
        }
        if (active !== 'MY COLLECTION' && tab === 'MY COLLECTION') {
          return
        }
        return (
          <Heading
            key={tab + index}
            sx={{
              fontSize: '12px',
              color: 'white',
              cursor: 'pointer',
              borderBottom: active === tab ? '1px solid white' : 'none'
            }}
            onClick={() => setActive(tab)}
          >
            {tab}
          </Heading>
        )
      })}
    </Flex>
  );
};

export default Tab;
