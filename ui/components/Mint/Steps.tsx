import { Flex, Button, Text, ThemeUICSSObject } from 'theme-ui'

import { styles } from './styles'

const Steps = (props) => {
  var { step, setStep } = props

  return (
    <Flex sx={styles.steps_container as ThemeUICSSObject}>
      <Flex sx={styles.step_one_column_container as ThemeUICSSObject}>
        <Text sx={{ ...styles.step_title, color: step === 1 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}>
          Choose Positions and Weights
        </Text>
        <Button
          sx={{ ...styles.step_button, color: step === 1 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}
          onClick={() => {
            setStep(1)
          }}
        >
          1
        </Button>
      </Flex>
      <Flex sx={styles.step_line_one}></Flex>
      <Flex sx={styles.step_two_column_container as ThemeUICSSObject}>
        <Text sx={{ ...styles.step_title, color: step === 2 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}>
          Set Performance Fee
        </Text>
        <Button
          sx={{ ...styles.step_button, color: step === 2 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}
          onClick={() => {
            setStep(2)
          }}
        >
          2
        </Button>
      </Flex>
      <Flex sx={styles.step_line_two}></Flex>
      <Flex sx={styles.step_three_column_container as ThemeUICSSObject}>
        <Text sx={{ ...styles.step_title, color: step === 3 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}>
          Optional Art & Name
        </Text>
        <Button
          sx={{ ...styles.step_button, color: step === 3 ? '#16103A' : '#8E8DA0' } as ThemeUICSSObject}
          onClick={() => {
            setStep(3)
          }}
        >
          3
        </Button>
      </Flex>
    </Flex>
  )
}

export default Steps
