import { Requester, Validator } from '@chainlink/ea-bootstrap'
import { ExecuteWithConfig, InputParameters } from '@chainlink/types'
import { Config } from '../config'
import { utils, BigNumber, ethers } from 'ethers'

export const supportedEndpoints = ['squishiverse']

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

  const nftAddress = '0x67421c8622f8e38fe9868b4636b8dc855347d570'
  const ownerOfSignature = 'function ownerOf(uint256 tokenId) public view returns (address)'
  const stakingAddress = '0x8d8a3e7eada138523c2dcb78fdbbf51a63a3faad'
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
