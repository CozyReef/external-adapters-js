import { AdapterRequest } from '@chainlink/types'
import request, { SuperTest, Test } from 'supertest'
import * as process from 'process'
import { server as startServer } from '../../src'
import * as nock from 'nock'
import { AddressInfo } from 'net'
import {
  mockForexSingleSuccess,
  mockLiveSuccess,
  mockResponseFailure,
  mockSubscribeResponse,
  mockUnsubscribeResponse,
} from './fixtures'
import {
  mockWebSocketProvider,
  mockWebSocketServer,
  MockWsServer,
  mockWebSocketFlow,
} from '@chainlink/ea-test-helpers'
import { WebSocketClassProvider } from '@chainlink/ea-bootstrap/dist/lib/middleware/ws/recorder'
import { DEFAULT_WS_API_ENDPOINT } from '../../src/config'
import { util } from '@chainlink/ea-bootstrap'

describe('execute', () => {
  const id = '1'
  let fastify: FastifyInstance
  let req: SuperTest<Test>

  beforeAll(async () => {
    process.env.API_KEY = process.env.API_KEY || 'fake-api-key'
    if (process.env.RECORD) {
      nock.recorder.rec()
    }
    fastify = await startServer()
    req = request(`localhost:${(fastify.server.address() as AddressInfo).port}`)
  })

  afterAll((done) => {
    if (process.env.RECORD) {
      nock.recorder.play()
    }

    nock.restore()
    nock.cleanAll()
    nock.enableNetConnect()
    fastify.close(done)
  })

  describe('forex  api', () => {
    it('should return success for single base/quote pair', async () => {
      const data: AdapterRequest = {
        id,
        data: {
          endpoint: 'forex',
          base: 'ETH',
          quote: 'USD',
        },
      }

      mockForexSingleSuccess()
      const response = await req
        .post('/')
        .send(data)
        .set('Accept', '*/*')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body).toMatchSnapshot()
    })

    // NOTE: batching currently disabled, awaiting service agreement
    //   it('should return success for batched base/quote pairs', async () => {
    //     const data: AdapterRequest = {
    //       id,
    //       data: {
    //         endpoint: 'forex',
    //         base: ['ETH', 'BTC'],
    //         quote: ['USD', 'JPY'],
    //       },
    //     }

    //     mockForexBatchedSuccess()
    //     const response = await req
    //       .post('/')
    //       .send(data)
    //       .set('Accept', '*/*')
    //       .set('Content-Type', 'application/json')
    //       .expect('Content-Type', /json/)
    //       .expect(200)
    //     expect(response.body).toMatchSnapshot()
    //   })
  })

  describe('live  api', () => {
    const data: AdapterRequest = {
      id,
      data: {
        endpoint: 'live',
        base: 'AAPL',
      },
    }

    it('should return success', async () => {
      mockLiveSuccess()

      const response = await req
        .post('/')
        .send(data)
        .set('Accept', '*/*')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
      expect(response.body).toMatchSnapshot()
    })
  })

  describe('live  api with invalid base', () => {
    const data: AdapterRequest = {
      id,
      data: {
        endpoint: 'live',
        base: 'NON-EXISTING',
      },
    }

    it('should return failure', async () => {
      mockResponseFailure()

      const response = await req
        .post('/')
        .send(data)
        .set('Accept', '*/*')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(502)
      expect(response.body).toMatchSnapshot()
    })
  })
})

describe('websocket', () => {
  let mockedWsServer: InstanceType<typeof MockWsServer>
  let fastify: FastifyInstance
  let req: SuperTest<Test>

  let oldEnv: NodeJS.ProcessEnv
  beforeAll(async () => {
    if (!process.env.RECORD) {
      process.env.API_KEY = 'fake-api-key'
      process.env.WS_API_KEY = 'fake-api-key'
      mockedWsServer = mockWebSocketServer(DEFAULT_WS_API_ENDPOINT)
      mockWebSocketProvider(WebSocketClassProvider)
    }

    oldEnv = JSON.parse(JSON.stringify(process.env))
    process.env.WS_ENABLED = 'true'
    process.env.WS_SUBSCRIPTION_TTL = '100'

    fastify = await startServer()
    req = request(`localhost:${(fastify.server.address() as AddressInfo).port}`)
  })

  afterAll((done) => {
    process.env = oldEnv
    nock.restore()
    nock.cleanAll()
    nock.enableNetConnect()
    fastify.close(done)
  })

  describe('forex endpoint', () => {
    const jobID = '1'

    it('should return success', async () => {
      const data: AdapterRequest = {
        id: jobID,
        data: {
          endpoint: 'forex',
          base: 'ETH',
          quote: 'USD',
        },
      }

      let flowFulfilled: Promise<boolean>
      if (!process.env.RECORD) {
        mockForexSingleSuccess() // For the first response

        flowFulfilled = mockWebSocketFlow(mockedWsServer, [
          mockSubscribeResponse,
          mockUnsubscribeResponse,
        ])
      }

      const makeRequest = () =>
        req
          .post('/')
          .send(data)
          .set('Accept', '*/*')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)

      // We don't care about the first response, coming from http request
      // This first request will start both batch warmer & websocket
      await makeRequest()

      // This final request should disable the cache warmer, sleep is used to make sure that the data is  pulled from the websocket
      // populated cache entries.
      await util.sleep(100)
      const response = await makeRequest()

      expect(response.body).toEqual({
        jobRunID: '1',
        result: 2797.835,
        statusCode: 200,
        maxAge: 30000,
        data: { result: 2797.835 },
      })

      await flowFulfilled
    }, 30000)
  })
})
