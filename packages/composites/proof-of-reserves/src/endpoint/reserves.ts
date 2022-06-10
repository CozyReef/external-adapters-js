import { Validator } from '@chainlink/ea-bootstrap'
import type { ExecuteWithConfig, InputParameters } from '@chainlink/ea-bootstrap'
import { adapters as indexerAdapters, Indexer, runBalanceAdapter } from '../utils/balance'
import { adapters as protocolAdapters, runProtocolAdapter } from '../utils/protocol'
import { runReduceAdapter } from '../utils/reduce'
import { getValidAddresses } from '../utils/addressValidator'
import { Config } from '../config'

export const supportedEndpoints = ['reserves']

export type TInputParameters = {
  protocol: string
  indexer: string
  confirmations?: number
  addresses?: string[]
  disableAddressValidation?: boolean
  disableDuplicateAddressFiltering?: boolean
}

const inputParameters: InputParameters<TInputParameters> = {
  protocol: {
    required: true,
    type: 'string',
    description: 'The protocol external adapter to use',
    options: [
      ...protocolAdapters.map(({ NAME }) => NAME.toLowerCase()),
      ...protocolAdapters.map(({ NAME }) => NAME.toUpperCase()),
      'list',
      'LIST',
    ],
  },
  indexer: {
    required: true,
    type: 'string',
    description: 'The indexer external adapter to use',
    options: [
      ...indexerAdapters.map(({ NAME }) => NAME.toLowerCase()),
      ...indexerAdapters.map(({ NAME }) => NAME.toUpperCase()),
    ],
  },
  confirmations: {
    required: false,
    type: 'number',
    description:
      'The number of confirmations required for a transaction to be counted when getting an address balance',
    default: 6,
  },
  addresses: {
    required: false,
    type: 'array',
    description: 'An array of addresses to get the balance from, when `protocol` is set to `list`',
  },
  disableAddressValidation: {
    required: false,
    type: 'boolean',
    description: 'Gives the option to disable address validation before the balances are fetched.',
    default: false,
  },
  disableDuplicateAddressFiltering: {
    required: false,
    type: 'boolean',
    description:
      'Gives the option to disabled the filtering of duplicate addresses in a request. ' +
      'If this is set to `true` and a duplicate address is contained in the request, the balance of that address will be counted twice.',
    default: false,
  },
}
export const execute: ExecuteWithConfig<Config> = async (input, context, config) => {
  const validator = new Validator(input, inputParameters, config.options)

  const jobRunID = validator.validated.id
  const protocol = validator.validated.data.protocol.toUpperCase()
  const indexer: Indexer = validator.validated.data.indexer.toUpperCase()
  // TODO: defaults fill as non-nullable
  const confirmations = validator.validated.data.confirmations as number

  // TODO: type input
  const protocolOutput = await runProtocolAdapter(
    jobRunID,
    context,
    protocol,
    input.data as any,
    config,
  )
  const validatedAddresses = getValidAddresses(protocolOutput, validator)
  const balanceOutput = await runBalanceAdapter(
    indexer,
    context,
    confirmations,
    config,
    validatedAddresses,
  )
  const reduceOutput = await runReduceAdapter(indexer, context, balanceOutput)
  return reduceOutput
}
