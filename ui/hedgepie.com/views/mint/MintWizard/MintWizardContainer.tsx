import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import MintWizardNav from './MintWizardNav'
import MintWizardNavVertical from './MintWizardNavVertical'
import FormPosition from './Form/FormPosition'
import FormPerformanceFee from './Form/FormPerformanceFee'
import FormArtNameAndSubmit from './Form/FormArtNameAndSubmit'
import FormInitialStake from './Form/FormInitialStake'

const MintWizard = () => {
  const { wizard } = React.useContext(MintWizardContext)

  return (
    <Box
      sx={{
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 0,
          padding: '0 10px',
          fontSize: 16,
          backgroundColor: '#14114B',
          color: '#fff',
          borderRadius: 14,
          [`@media screen and (min-width: 800px)`]: {
            height: 95,
            fontSize: 32,
            padding: '0 46px',
          },
        }}
      >
        YB NFT Minting
      </Box>
      <Box
        sx={{
          padding: 20,
          [`@media screen and (min-width: 800px)`]: {
            padding: 40,
          },
        }}
      >
        <MintWizardNav
          sx={{
            display: 'none',
            [`@media screen and (min-width: 800px)`]: {
              display: 'block',
            },
          }}
        />
        <MintWizardNavVertical
          sx={{
            display: 'block',
            [`@media screen and (min-width: 800px)`]: {
              display: 'none',
            },
          }}
        />
        {wizard.order === 0 && <FormInitialStake />}
        {wizard.order === 1 && <FormPosition />}
        {wizard.order === 2 && <FormPerformanceFee />}
        {wizard.order === 3 && <FormArtNameAndSubmit />}
      </Box>
    </Box>
  )
}

export default MintWizard
