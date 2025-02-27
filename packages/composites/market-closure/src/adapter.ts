import { AdapterRequest, AdapterResponse, Execute, InputParameters } from '@chainlink/types'
import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { getLatestAnswer } from '@chainlink/ea-reference-data-reader'
import { Config, makeConfig, DEFAULT_NETWORK } from './config'
import { getCheckImpl, getCheckProvider } from './checks'

const inputParameters: InputParameters = {
  check: true,
  source: true,
  referenceContract: ['referenceContract', 'contract'],
  multiply: true,
  network: false,
}

export const execute = async (input: AdapterRequest, config: Config): Promise<AdapterResponse> => {
  const validator = new Validator(input, inputParameters)

  const jobRunID = validator.validated.id
  const referenceContract = validator.validated.data.referenceContract
  const multiply = validator.validated.data.multiply
  const check = validator.validated.data.check
  const source = validator.validated.data.source

  const network = validator.validated.data.network || DEFAULT_NETWORK

  const halted = await getCheckImpl(getCheckProvider(check))(input)
  if (halted) {
    const result = await getLatestAnswer(network, referenceContract, multiply, input.meta)
    return Requester.success(jobRunID, { data: { result }, status: 200 })
  }

  return await config.getPriceAdapter(source)(input)
}

export const makeExecute = (config?: Config): Execute => {
  return async (request: AdapterRequest) => execute(request, config || makeConfig())
}
