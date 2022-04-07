import { Flex, Text, Input, ThemeUICSSObject } from 'theme-ui'

import { styles } from './styles'

const PerformanceFee = (props) => {
  var { setPerformanceFee } = props

  return (
    <Flex sx={styles.step_two_container as ThemeUICSSObject}>
      <Flex sx={styles.step_two_inner_container as ThemeUICSSObject}>
        <Text sx={styles.step_two_label as ThemeUICSSObject}>Performance Fee</Text>
        <Text sx={styles.step_two_sublabel as ThemeUICSSObject}>Creator Earnings</Text>
      </Flex>
      <Text sx={styles.step_two_text as ThemeUICSSObject}>
        It is a long established fact that a reader will be distracted by the readable content of a page when looking at
        its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as
        opposed to using 'Content here, content here', making it look like readable English.{' '}
      </Text>
      <Input
        onChange={(event) => {
          setPerformanceFee(Number(event.target.value))
        }}
        sx={styles.step_two_input as ThemeUICSSObject}
        maxLength={6}
        placeholder={'15%'}
      />
    </Flex>
  )
}

export default PerformanceFee
