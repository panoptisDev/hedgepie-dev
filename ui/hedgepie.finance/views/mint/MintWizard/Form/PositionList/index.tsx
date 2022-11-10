import React, { useEffect } from 'react'
import { Box, Button } from 'theme-ui'
import MintWizardContext from 'contexts/MintWizardContext'
import Head from './Head'
import Position from './Position'

const PositionList = () => {
  const { formData, setFormData, strategies } = React.useContext(MintWizardContext)

  const handleAdd = () => {
    setFormData({
      ...formData,
      allocated: formData.allocated + 1,
      positions: [
        ...formData.positions,
        {
          composition: { name: 'Protocol' },
          weight: 1,
          locked: false,
        },
      ],
    })
  }

  useEffect(() => {
    if (Object.keys(strategies)?.length && !formData?.positions.length) {
      handleAdd()
    }
  }, [strategies])

  const handleUpdate = (index, newData) => {
    const newPositions = formData.positions.map((d, i) => (i === index ? newData : d))
    const allocated = newPositions.reduce((p, c) => p + parseInt(c.weight), 0)
    setFormData({
      ...formData,
      allocated,
      positions: newPositions,
    })
  }

  const handleLock = (index) => {
    setFormData({
      ...formData,
      positions: formData.positions.map((d, i) => (i === index ? { ...d, locked: !d.locked } : d)),
    })
  }

  const handleDelete = (index) => {
    setFormData({
      ...formData,
      positions: formData.positions.filter((d, i) => i !== index),
    })
  }

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#FFFFFF',
        border: '2px solid #BAB9C5',
        borderRadius: 8,
        marginRight: '-10px',
        [`@media screen and (min-width: 500px)`]: {
          padding: 20,
        },
      }}
    >
      <Head />
      <table
        style={{ width: '100%', marginTop: '20px', marginLeft: '10px', borderSpacing: '20px', marginRight: '10px' }}
      >
        <thead>
          <tr style={{ color: '#1A1A1A', fontWeight: '600', fontSize: '20px' }}>
            <td>Protocol</td>
            <td>Pool</td>
            <td>Weight</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {formData.positions.map((d, i) => {
            return (
              <Position
                data={d}
                onUpdate={(composition) => handleUpdate(i, composition)}
                onLock={() => handleLock(i)}
                onDelete={() => handleDelete(i)}
                allocated={formData.allocated}
              />
            )
          })}
        </tbody>
      </table>

      <Box mt={4}>
        <Button
          variant="info"
          sx={{
            cursor: 'pointer',
          }}
          onClick={handleAdd}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                fontSize: '32px',
                backgroundColor: '#D1EBF8',
                paddingRight: '5px',
                paddingLeft: '5px',
                borderRadius: 60,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '30px',
                height: '30px',
              }}
            >
              +
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '14px',
                textAlign: 'center',
                letterSpacing: '1px',
                color: '#000',
                fontFamily: 'Plus Jakarta Sans',
              }}
            >
              Add position
            </div>
          </div>
        </Button>
      </Box>
    </Box>
  )
}

export default PositionList
