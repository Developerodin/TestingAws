import mongoose from 'mongoose'
const user ="developer"
const pass="NMui9KRX1wal0JFU"
const url="mongodb+srv://developer:NMui9KRX1wal0JFU@cluster0.rmhd1of.mongodb.net/?retryWrites=true&w=majority";
const connection = async () => {
  try {
    mongoose.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )
    console.log('DB CONNECTION ESTABLISHED')
  } catch (err) {
    console.log(err)
  }
}

export default connection
