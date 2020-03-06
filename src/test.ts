import axios from 'axios'

const doTest = async () => {
  const { data } = await axios.get('http://localhost:3000/order');
  
  console.log(`Transaction :`, data)
}
Promise.all([doTest(), doTest(), doTest(), doTest()])