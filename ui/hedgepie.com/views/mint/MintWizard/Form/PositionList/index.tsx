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
        backgroundColor: '#E5F6FF',
        borderRadius: 8,
        [`@media screen and (min-width: 500px)`]: {
          padding: 20,
        },
      }}
    >
      <Head />
      <Box
        sx={{
          mt: 4,
          minHeight: 300,
        }}
      >
        {formData.positions.map((d, i) => (
          <Box key={i} mt={3}>
            <Position
              data={d}
              onUpdate={(composition) => handleUpdate(i, composition)}
              onLock={() => handleLock(i)}
              onDelete={() => handleDelete(i)}
              allocated={formData.allocated}
            />
          </Box>
        ))}
      </Box>
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
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '14px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#1380B9',
              }}
            >
              ADD POSITION
            </div>
            <div
              style={{
                fontSize: '32px',
                backgroundColor: '#D1EBF8',
                paddingRight: '5px',
                paddingLeft: '5px',
                borderRadius: 4,
              }}
            >
              +
            </div>
          </div>
        </Button>
      </Box>
    </Box>
  )
}

export default PositionList
