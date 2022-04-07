import { Flex, Button, Text, Input, ThemeUICSSObject } from 'theme-ui'

import { styles } from './styles'

const ArtworkNFTTitle = (props) => {
  var { setChosenFile, setChosenFileName, uploadFile, setYBNFTName } = props

  return (
    <Flex sx={styles.step_three_container as ThemeUICSSObject}>
      <Flex sx={styles.step_three_inner_container as ThemeUICSSObject}>
        <Flex sx={styles.step_three_upload_container as ThemeUICSSObject}>
          <Text sx={styles.step_three_upload_label as ThemeUICSSObject}>Upload Artwork</Text>
          <Text sx={styles.step_three_upload_sublabel as ThemeUICSSObject}>Associate an Illustration or File</Text>
        </Flex>
        <Text sx={styles.step_three_upload_text as ThemeUICSSObject}>
          It is a long established fact that a reader will be distracted by the readable content of a page when looking
          at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as
          opposed to using 'Content here, content here', making it look like readable English.{' '}
        </Text>
        <Input
          sx={{
            width: ['', '', '20rem'],
          }}
          type="file"
          onChange={(e) => {
            if (e?.target?.files?.length) {
              setChosenFileName(e.target.files[0].name)
              setChosenFile(e.target.files[0])
            }
          }}
        />
        <Flex sx={styles.flex_centered as ThemeUICSSObject}>
          <Button sx={styles.step_three_upload_button as ThemeUICSSObject} onClick={uploadFile}>
            UPLOAD
          </Button>
        </Flex>
      </Flex>
      <Flex sx={styles.step_three_nft_name_container as ThemeUICSSObject}>
        <Flex sx={styles.step_three_nft_name_inner_container as ThemeUICSSObject}>
          <Text sx={styles.step_three_nft_name_label as ThemeUICSSObject}>NFT Name</Text>
          <Text sx={styles.step_three_nft_name_sublabel as ThemeUICSSObject}>
            Provide a name you want to give your NFT
          </Text>
        </Flex>

        <Input
          onChange={(event) => {
            setYBNFTName(event.target.value)
          }}
          sx={styles.step_three_nft_name_input as ThemeUICSSObject}
          placeholder={'NFT Title..'}
        />
      </Flex>
    </Flex>
  )
}

export default ArtworkNFTTitle
