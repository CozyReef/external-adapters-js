import { Requester } from '@chainlink/ea-bootstrap'
import { assertError, assertSuccess } from '@chainlink/ea-test-helpers'
import { AdapterRequest } from '@chainlink/types'
import { execute } from '../../src/method/write'
import { makeConfig } from '../../src/config'
import * as IPFS from 'ipfs'

describe('execute', () => {
  const jobID = '1'
  const config = makeConfig()

  describe('successful calls @integration', () => {
    const requests = [
      {
        name: 'simple text',
        testData: { id: jobID, data: { data: 'some simple text' } },
      },
      {
        name: 'dag-cbor codec',
        testData: { id: jobID, data: { data: { name: 'my object', id: 123 }, codec: 'dag-cbor' } },
      },
      {
        name: 'dag-cbor codec with link',
        testData: {
          id: jobID,
          data: {
            data: {
              name: 'my object',
              id: 123,
              link: new IPFS.CID('QmXLpPi3yorJmGe6NsdBfyWSFvLnkX12EJR5zitwv4q8Tf'),
            },
            codec: 'dag-cbor',
          },
        },
      },
      {
        name: 'json codec',
        testData: { id: jobID, data: { data: { name: 'my object', id: 123 }, codec: 'json' } },
      },
      {
        name: 'json codec CID v1',
        testData: {
          id: jobID,
          data: { data: { name: 'my object', id: 123 }, codec: 'json', cidVersion: 1 },
        },
      },
      {
        name: 'dag',
        testData: { id: jobID, data: { data: { name: 'my object', id: 123 }, type: 'dag' } },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        const data = await execute(req.testData as AdapterRequest, config)
        console.log(data)
        assertSuccess({ expected: 200, actual: data.statusCode }, data, jobID)
      })
    })
  })

  describe('error calls @integration', () => {
    const requests = [
      {
        name: 'missing data',
        testData: { id: jobID, data: {} },
      },
    ]

    requests.forEach((req) => {
      it(`${req.name}`, async () => {
        try {
          await execute(req.testData as AdapterRequest, config)
        } catch (error) {
          const errorResp = Requester.errored(jobID, error)
          assertError({ expected: 400, actual: errorResp.statusCode }, errorResp, jobID)
        }
      })
    })
  })
})
