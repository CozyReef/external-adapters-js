import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, InputParameters } from '@chainlink/types'
import { Config } from '../config'
import { utils, BigNumber, constants } from 'ethers'

export const supportedEndpoints = ['axolittles']

export const inputParameters: InputParameters = {
  tokenId: {
    required: true,
    description: 'Token ID of the NFT to find owner of',
    type: 'string',
  },
}

export const execute: ExecuteWithConfig<Config> = async (request, _, config) => {
  const validator = new Validator(request, inputParameters)
  const jobRunID = validator.validated.id
  const tokenId = BigNumber.from(validator.validated.data.tokenId)

  // V2 -> V2 -> NFT Contract
  const iterations = [
    {
      address: '0xbfca4318f4d47f8a8e49e16c0f2b466c46eac184',
      signature: 'function stakedAxos(uint256 tokenId) public view returns (address)',
    },
    {
      address: '0x1ca6e4643062e67ccd555fb4f64bee603340e0ea',
      signature: 'function stakeOwner(uint256 tokenId) public view returns (address)',
    },
    {
      address: '0xf36446105ff682999a442b003f2224bcb3d82067',
      signature: 'function ownerOf(uint256 tokenId) public view returns (address)',
    },
  ]

  let result = constants.HashZero

  for (const contract of iterations) {
    const iface = new utils.Interface([contract.signature])
    const fnName = iface.functions[Object.keys(iface.functions)[0]].name
    const encoded = iface.encodeFunctionData(fnName, [tokenId])

    result = await config.provider.call({
      to: contract.address,
      data: encoded,
    })

    if (result !== constants.HashZero) {
      break
    }
  }

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
