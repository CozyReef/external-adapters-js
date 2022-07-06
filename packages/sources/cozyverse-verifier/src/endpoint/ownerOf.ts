import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, InputParameters } from '@chainlink/types'
import { Config } from '../config'
import { utils, BigNumber } from 'ethers'

export const supportedEndpoints = ['ownerOf']

export const inputParameters: InputParameters = {
  address: {
    aliases: ['contract'],
    required: true,
    description: 'Address of the contract',
    type: 'string',
  },
  tokenId: {
    required: true,
    description: 'Token ID of the NFT to find owner of',
    type: 'string',
  },
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)

  const jobRunID = validator.validated.id
  const address = validator.validated.data.address

  const tokenId = BigNumber.from(validator.validated.data.tokenId)
  const fnSignature = 'function ownerOf(uint256 tokenId) public view returns (address)'
  const iface = new utils.Interface([fnSignature])
  const encoded = iface.encodeFunctionData('ownerOf', [tokenId])

  const result = await config.provider.call({
    to: address,
    data: encoded,
  })

  const response = {
    jobRunID,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    data: result,
  }

  return Requester.success(jobRunID, Requester.withResult(response, result))
}
