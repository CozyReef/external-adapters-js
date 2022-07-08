# Example Source Adapter

![0.0.13](https://img.shields.io/github/package-json/v/smartcontractkit/external-adapters-js?filename=packages/sources/cozyverse-verifier/package.json)

Example Source Adapter (this title and description were pulled from source/schemas/env.json)

This document was generated automatically. Please see [README Generator](../../scripts#readme-generator) for more info.

## Environment Variables

| Required? |  Name   |  Description   |  Type  | Options | Default |
| :-------: | :-----: | :------------: | :----: | :-----: | :-----: |
|    ✅     | API_KEY | API key to use | string |         |         |

---

## Input Parameters

Every EA supports base input parameters from [this list](../../core/bootstrap#base-input-parameters)

| Required? |   Name   |     Description     |  Type  |                                                                   Options                                                                    |  Default  |
| :-------: | :------: | :-----------------: | :----: | :------------------------------------------------------------------------------------------------------------------------------------------: | :-------: |
|           | endpoint | The endpoint to use | string | [axolittles](#axolittles-endpoint), [ownerOf](#ownerof-endpoint), [sappySeals](#sappyseals-endpoint), [squishiverse](#squishiverse-endpoint) | `ownerOf` |

## Axolittles Endpoint

`axolittles` is the only supported name for this endpoint.

### Input Params

| Required? |  Name   | Aliases |             Description              |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :-----: | :-----: | :----------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | tokenId |         | Token ID of the NFT to find owner of | string |         |         |            |                |

### Example

There are no examples for this endpoint.

---

## OwnerOf Endpoint

`ownerOf` is the only supported name for this endpoint.

### Input Params

| Required? |  Name   |  Aliases   |             Description              |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :-----: | :--------: | :----------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | address | `contract` |       Address of the contract        | string |         |         |            |                |
|    ✅     | tokenId |            | Token ID of the NFT to find owner of | string |         |         |            |                |

### Example

There are no examples for this endpoint.

---

## SappySeals Endpoint

`sappySeals` is the only supported name for this endpoint.

### Input Params

| Required? |     Name     | Aliases |             Description              |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----------: | :-----: | :----------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | ownerAddress |         |         Address of the owner         | string |         |         |            |                |
|    ✅     |   tokenId    |         | Token ID of the NFT to find owner of | string |         |         |            |                |

### Example

There are no examples for this endpoint.

---

## Squishiverse Endpoint

`squishiverse` is the only supported name for this endpoint.

### Input Params

| Required? |     Name     | Aliases |             Description              |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----------: | :-----: | :----------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | ownerAddress |         |         Address of the owner         | string |         |         |            |                |
|    ✅     |   tokenId    |         | Token ID of the NFT to find owner of | string |         |         |            |                |

### Example

There are no examples for this endpoint.

---

MIT License
