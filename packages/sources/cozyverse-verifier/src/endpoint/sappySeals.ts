import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, InputParameters } from '@chainlink/types'
import { Config } from '../config'
import { utils, BigNumber, ethers } from 'ethers'

export const supportedEndpoints = ['sappySeals']

export const inputParameters: InputParameters = {
  ownerAddress: {
    required: true,
    description: 'Address of the owner',
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
  const tokenId = BigNumber.from(validator.validated.data.tokenId)
  const ownerAddress = validator.validated.data.ownerAddress

  const nftAddress = '0x364c828ee171616a39897688a831c2499ad972ec'
  const ownerOfSignature = 'function ownerOf(uint256 tokenId) public view returns (address)'
  const stakingAddress = '0xdf8a88212ff229446e003f8f879e263d3616b57a'
  const stakingSignature =
    'function depositsOf(address account) external view returns (uint256[] memory)'

  const contractStaking = new ethers.Contract(stakingAddress, [stakingSignature], config.provider)
  const resultStaking = await contractStaking.depositsOf(ownerAddress)

  for (const ownedTokenId of resultStaking) {
    if (ownedTokenId.toString() === validator.validated.data.tokenId) {
      const response = {
        jobRunID,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: ownerAddress,
      }
      return Requester.success(jobRunID, Requester.withResult(response, ownerAddress))
    }
  }

  const ifaceNft = new utils.Interface([ownerOfSignature])
  const encodedNft = ifaceNft.encodeFunctionData('ownerOf', [tokenId])

  const resultNft = await config.provider.call({
    to: nftAddress,
    data: encodedNft,
  })

  const response = {
    jobRunID,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    data: resultNft,
  }
  return Requester.success(jobRunID, Requester.withResult(response, resultNft))
}
