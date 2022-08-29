import { Web3Storage } from 'web3.storage'
import toast from './toast'

const getAccessToken = () => {
  return process.env.WEB3_STORAGE_API_TOKEN
}

const makeStorageClient = () => {
  return new Web3Storage({ token: getAccessToken() as string })
}

const uploadToIPFS = async (file, name) => {
  try {
    const web3StorageClient = makeStorageClient()
    const cid = await web3StorageClient.put([file], {
      name: name,
      maxRetries: 3,
    })
    return cid
  } catch (e) {
    toast('Error while uploading to IPFS', 'warning')
  }
}

const uploadMetadataToIPFS = async (metadata, name) => {
  const file = makeMetadataFile(metadata, name)
  const ipfsCID = await uploadToIPFS(file, name)
  const fileLink = 'https://' + ipfsCID + '.ipfs.dweb.link/HedgePie_YBNFT_' + name + '.json'
  return fileLink
}

const uploadImageToIPFS = async (imgFile, imgName) => {
  return uploadToIPFS(imgFile, imgName)
}

const makeMetadataFile = (metadata, name) => {
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  const files = new File([blob], 'HedgePie_YBNFT_' + name + '.json')
  return files
}



export default { uploadImageToIPFS, uploadMetadataToIPFS }
