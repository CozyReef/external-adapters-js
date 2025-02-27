import process from 'process'
import nock from 'nock'
import { DEV_BASE_URL } from '../../src/config'
import { locationTests } from './location'
import { currentConditionsTests } from './current-conditions'
import { locationCurrentConditionsTests } from './location-current-conditions'
import { server as startServer } from '../../src'
import request, { SuperTest, Test } from 'supertest'
import { AddressInfo } from 'net'

let oldEnv: NodeJS.ProcessEnv

export interface SuiteContext {
  fastify: FastifyInstance
  req: SuperTest<Test>
}

beforeAll(() => {
  oldEnv = JSON.parse(JSON.stringify(process.env))
  process.env.API_KEY = 'test_api_key'
  process.env.API_VERBOSE = 'true'
  process.env.API_ENDPOINT = DEV_BASE_URL
  process.env.CACHE_ENABLED = 'false'
  if (process.env.RECORD) {
    nock.recorder.rec()
  }
})

afterAll(() => {
  process.env = oldEnv
  if (process.env.RECORD) {
    nock.recorder.play()
  }
  nock.restore()
  nock.cleanAll()
  nock.enableNetConnect()
})

describe('execute', () => {
  const context: SuiteContext = {
    server: null,
    req: null,
  }

  beforeEach(async () => {
    context.fastify = await startServer()
    context.req = request(`localhost:${(context.fastify.server.address() as AddressInfo).port}`)
  })

  afterEach((done) => {
    context.fastify.close(done)
  })

  describe('location endpoint', () => locationTests(context))
  describe('current-conditions endpoint', () => currentConditionsTests(context))
  describe('location-current-conditions endpoint', () => locationCurrentConditionsTests(context))
})
