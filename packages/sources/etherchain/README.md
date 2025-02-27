# Chainlink External Adapter for Etherchain

![1.3.0](https://img.shields.io/github/package-json/v/smartcontractkit/external-adapters-js?filename=packages/sources/etherchain/package.json)

Base URL https://www.etherchain.org

This document was generated automatically. Please see [README Generator](../../scripts#readme-generator) for more info.

## Environment Variables

| Required? |     Name     | Description |  Type  | Options |           Default            |
| :-------: | :----------: | :---------: | :----: | :-----: | :--------------------------: |
|           | API_ENDPOINT |             | string |         | `https://www.etherchain.org` |

---

## Input Parameters

Every EA supports base input parameters from [this list](../../core/bootstrap#base-input-parameters)

| Required? |   Name   |     Description     |  Type  |            Options             |  Default   |
| :-------: | :------: | :-----------------: | :----: | :----------------------------: | :--------: |
|           | endpoint | The endpoint to use | string | [gasprice](#gasprice-endpoint) | `gasprice` |

## Gasprice Endpoint

`gasprice` is the only supported name for this endpoint.

### Input Params

| Required? | Name  | Aliases |    Description    |  Type  |               Options               |  Default   | Depends On | Not Valid With |
| :-------: | :---: | :-----: | :---------------: | :----: | :---------------------------------: | :--------: | :--------: | :------------: |
|           | speed |         | The desired speed | string | `fast`, `rapid`, `slow`, `standard` | `standard` |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "gasprice",
    "speed": "fast"
  },
  "debug": {
    "cacheKey": "0BJQ6WrEaARtjkqLfBrRVKG+QcE="
  }
}
```

Response:

```json
{
  "jobRunID": "1",
  "data": {
    "code": 200,
    "data": {
      "rapid": 69000000000,
      "fast": 38200000000,
      "standard": 17122906179,
      "slow": 15280244053,
      "timestamp": 1654610878715,
      "priceUSD": 1760.29
    },
    "result": 38200000000
  },
  "result": 38200000000,
  "statusCode": 200,
  "providerStatusCode": 200
}
```

---

MIT License
