import axios from 'axios'

export const setupBackend = () => {
  const client = axios.create({
    // baseURL: 'http://localhost:4000',
    baseURL: 'https://texter-server.now.sh',
  })

  return client
}
