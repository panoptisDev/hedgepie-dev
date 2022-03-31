import { Flex, Button, Text, Select, Input, ThemeUICSSObject } from 'theme-ui'
import { useState, useEffect } from 'react'

import { FiUnlock, FiLock } from 'react-icons/fi'
import { RiDeleteBinLine } from 'react-icons/ri'

import { styles } from './styles'

type Position = {
  posType: string
  posQuantity: number
  posWeight: number
}

const Positions = (props) => {
  var { positions, setPositions } = props
  const [locked, setLocked] = useState([] as boolean[])

  const onWeightChange = (event: any) => {
    var newPositions = [...positions]
    newPositions[event.target.dataset.index].posWeight = Number(event.target.value)
    setPositions(newPositions)
  }

  const onTypeChange = (event: any) => {
    var newPositions = [...positions]
    newPositions[event.target.dataset.index].posType = event.target.value
    setPositions(newPositions)
  }

  const onQuantityChange = (event: any) => {
    var newPositions = [...positions]
    newPositions[event.target.dataset.index].posQuantity = Number(event.target.value)
    setPositions(newPositions)
  }

  return (
    <Flex sx={styles.step_one_container as ThemeUICSSObject}>
      {/* Labels */}
      <Flex sx={styles.positions_outer_container as ThemeUICSSObject}>
        <Flex sx={styles.positions_sub_container_one as ThemeUICSSObject}>
          <Flex sx={styles.label_sublabel_container as ThemeUICSSObject}>
            <Text sx={styles.label_text as ThemeUICSSObject}>Composition</Text>
            <Text sx={styles.sublabel_text as ThemeUICSSObject}>Stake Positions</Text>
          </Flex>
          <Flex sx={{ flexDirection: 'column' }}>
            {positions &&
              positions.map((position, index) => (
                <Flex sx={styles.positions_container as ThemeUICSSObject} key={index}>
                  <Select
                    defaultValue="Type"
                    data-index={index}
                    onChange={onTypeChange}
                    sx={styles.strategy_select as ThemeUICSSObject}
                    disabled={locked[index]}
                  >
                    <option>Tako</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                    <option>Option 4</option>
                  </Select>
                  <Input
                    defaultValue={'1.9'}
                    data-index={index}
                    onChange={onQuantityChange}
                    sx={{ ...styles.position_input, opacity: locked[index] ? 0.7 : 1 } as ThemeUICSSObject}
                    disabled={locked[index]}
                    maxLength={5}
                  />
                  <Text sx={styles.strategy_quantity_value as ThemeUICSSObject}>(-1,213.95 USD)</Text>
                </Flex>
              ))}
          </Flex>
        </Flex>
        <Flex sx={styles.positions_sub_container as ThemeUICSSObject}>
          <Flex sx={styles.label_sublabel_container as ThemeUICSSObject}>
            <Text sx={styles.label_text as ThemeUICSSObject}>Weight</Text>
            <Text sx={styles.sublabel_text as ThemeUICSSObject}>Percentage Allocation</Text>
          </Flex>
          <Flex sx={{ flexDirection: 'column', gap: '8px' }}>
            {positions &&
              positions.map((position, index) => (
                <Flex sx={styles.positions_container as ThemeUICSSObject} key={index}>
                  <Input
                    defaultValue={25}
                    data-index={index}
                    type={'number'}
                    onChange={onWeightChange}
                    sx={{ ...styles.strategy_percent_value, opacity: locked[index] ? 0.7 : 1 } as ThemeUICSSObject}
                    disabled={locked[index]}
                  />

                  <Flex
                    sx={
                      {
                        ...styles.position_icons_container,
                        opacity: locked[index] ? 0.7 : 1,
                      } as ThemeUICSSObject
                    }
                  >
                    {locked[index] ? (
                      <FiLock
                        style={styles.icon}
                        onClick={() => {
                          var toSet = [...locked]
                          toSet[index] = false
                          setLocked(toSet)
                        }}
                      />
                    ) : (
                      <FiUnlock
                        style={styles.icon}
                        onClick={() => {
                          var toSet = [...locked]
                          toSet[index] = true
                          setLocked(toSet)
                        }}
                      />
                    )}
                    <RiDeleteBinLine
                      style={styles.icon}
                      onClick={() => {
                        var toSet = [...positions]
                        toSet.splice(index, 1)
                        setPositions(toSet)
                      }}
                    />
                  </Flex>
                </Flex>
              ))}
          </Flex>
        </Flex>
      </Flex>

      <Button
        sx={styles.add_position_button as ThemeUICSSObject}
        onClick={() => {
          setPositions((prevState) => [
            ...prevState,
            {
              posWeight: 0,
              posQuantity: 0,
              posType: 'Tako',
            } as Position,
          ])
          setLocked((prevState) => [...prevState, false])
        }}
      >
        Add Position
      </Button>
    </Flex>
  )
}

export default Positions
