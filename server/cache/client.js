import redis from 'redis'
import config from '../config/server'

const creds = config.database.redis

let client

// connection string
if (typeof creds === 'string') {
  client = redis.createClient({
    url: creds,
    no_ready_check: true
  })
} else {
  const { host, port, password, database } = creds

  client = redis.createClient({
    host,
    port,
    password,
    db: database,
    no_ready_check: true
  })
}

const subClient = client.duplicate()

export { subClient }
export default client
