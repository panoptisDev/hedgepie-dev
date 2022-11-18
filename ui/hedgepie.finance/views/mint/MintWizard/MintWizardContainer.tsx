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
        // backgroundColor: '#fff',
      }}
    >
      {/* <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 10px',
          fontSize: 16,
          backgroundColor: '#14114B',
          height: 0,
          color: '#fff',
          borderRadius: 14,
          [`@media screen and (min-width: 800px)`]: {
            height: 95,
            fontSize: 32,
            padding: '0 46px',
          },
        }}
      >
        Create a Strategy
      </Box> */}
      <Box
        sx={{
          padding: 20,
          [`@media screen and (min-width: 800px)`]: {
            padding: 40,
          },
          width: '100%',
        }}
      >
        {/* <MintWizardNav
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
        /> */}
        <Box sx={{ padding: '2rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box
            sx={{
              height: '1rem',
              borderRadius: '16px',
              width: '40rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E3E3E3',
            }}
          >
            <Box
              sx={{
                height: '1rem',
                borderRadius: '16px',
                width: `${(wizard.order + 1) * 10}rem`,
                backgroundColor: '#1799DE',
                border: '1px solid #E3E3E3',
                boxShadow: '2px 1px 2px rgba(133, 175, 197, 0.4)',
              }}
            ></Box>
          </Box>
        </Box>
        {wizard.order === 0 && <FormInitialStake />}
        {wizard.order === 1 && <FormPosition />}
        {wizard.order === 2 && <FormPerformanceFee />}
        {wizard.order === 3 && <FormArtNameAndSubmit />}
      </Box>
    </Box>
  )
}

export default MintWizard
