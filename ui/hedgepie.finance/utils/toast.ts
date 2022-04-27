import { toast as Toastify } from 'react-toastify'

const toast = (message: string) => {
  Toastify(message, {
    position: Toastify.POSITION.BOTTOM_RIGHT,
    style: {
      backgroundColor: '#1799DE',
      borderRadius: '10px',
      padding: '10px',
      fontFamily: 'Noto Sans',
      color: '#FFF',
      fontSize: '16px',
      width: 'fit-content',
    },
  })
}

export default toast
