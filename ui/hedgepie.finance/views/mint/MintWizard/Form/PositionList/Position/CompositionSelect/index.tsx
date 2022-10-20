import React, { useEffect, useState, useContext } from 'react'
import Select from 'react-select'
import MintWizardContext from 'contexts/MintWizardContext'
import CustomOption from './CustomOption'
import CustomValue from './CustomValue'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'react-responsive'

const CompositionSelect = ({ value, onProtocolSelect, onPoolSelect }) => {
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
  const { strategies, formData } = useContext(MintWizardContext)
  const [availableProtocols, setAvailableProtocols] = useState<any>([])
  const [protocol, setProtocol] = useState<any>({ name: 'Protocol' })
  const [pool, setPool] = useState<any>({ name: 'Pool' })

  useEffect(() => {
    var protos = [] as any[]
    if (!strategies) return
    for (let key in strategies) {
      let pools = [] as any[]
      let icon = ''
      for (let p in strategies[key]) {
        if (p === 'icon') icon = strategies[key][p]
        else pools.push({ name: p, address: strategies[key][p] })
      }
      protos.push({ name: key, pools: pools, icon: icon })
    }
    setAvailableProtocols(protos)
  }, [])

  useEffect(() => {
    console.log('DATA:' + JSON.stringify(value))
  }, [])

  const handleProtocolSelect = (option) => {
    if (option !== protocol) {
      setPool({ name: 'Pool' })
    }
    setProtocol(option)
    onProtocolSelect(option)
  }

  const handlePoolSelect = (option) => {
    console.log('pool' + option)
    setPool(option)

    console.log('formData' + JSON.stringify(formData))
    onPoolSelect(option)
  }

  useEffect(() => {
    if (value.pool) {
      setPool({ name: value.pool?.name })
    }
  }, [value])

  return (
    <>
      <td>
        <Select
          instanceId={`composition-${1}`}
          classNamePrefix="select"
          name="color"
          isSearchable={false}
          options={availableProtocols}
          placeholder=""
          value={value.composition ? value.composition : 'Select Protocol'}
          onChange={handleProtocolSelect}
          components={{
            Option: CustomOption,
            ValueContainer: CustomValue,
          }}
          styles={{
            control: () => ({
              height: 60,
              width: isTabletOrMobile ? '100%' : 180,
              borderRadius: 4,
              border: '1px solid #8BCCEE',
              backgroundColor: '#F2F9FD',
              display: 'flex',
              alignItems: 'center',
              paddingRight: 16,
            }),
            indicatorSeparator: () => ({
              display: 'none',
            }),
          }}
        />
        {/* <Box
        sx={{
          display: 'none',
          position: 'absolute',
          top: 30,
          left: 'calc(25% - 14px)',
          height: 2,
          width: 40,
          backgroundColor: '#fff',
          [`@media screen and (min-width: 900px)`]: {
            display: 'block',
          },
        }}
      /> */}
      </td>
      <td>
        <Select
          instanceId={`composition-${1}`}
          classNamePrefix="select"
          name="color"
          isSearchable={false}
          options={protocol ? protocol.pools : []}
          placeholder=""
          value={pool}
          onChange={handlePoolSelect}
          components={{
            Option: CustomOption,
            ValueContainer: CustomValue,
          }}
          styles={{
            control: () => ({
              height: 60,
              width: isTabletOrMobile ? '100%' : 200,
              borderRadius: 4,
              border: '1px solid #8BCCEE',
              backgroundColor: '#F2F9FD',
              display: 'flex',
              alignItems: 'center',
              paddingRight: 16,
            }),
            indicatorSeparator: () => ({
              display: 'none',
            }),
          }}
        />
      </td>
    </>
  )
}

export default CompositionSelect
