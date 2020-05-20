const FundingContext = require('./helpers/FundingContext')
const FundingOracleClient = artifacts.require('FundingOracleClient.sol')
const { Oracle } = require('@chainlink/contracts/truffle/v0.5/Oracle')
const { expectRevert } = require('@openzeppelin/test-helpers')
const { oracle } = require('@chainlink/test-helpers')

const jobId = web3.utils.toHex('4c7b7ffb66b344fbaa64995af81e355a')
const url =
  'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD,EUR,JPY'
const path = 'USD'
const level = 90

const payment = web3.utils.toWei('1')

contract('FundingOracleClient', accounts => {
  const owner = accounts[0]
  const admin = accounts[1]
  const oracleNode = accounts[1]
  const stranger = accounts[2]
  const poolAddress = accounts[3]
  const winner = accounts[4]

  let oracleClient, linkToken, oc, request

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    await fundingContext.init()
    linkToken = fundingContext.linkToken
    oc = fundingContext.oracle
    // oracle = fundingContext.oracle
    // oc = await Oracle.new(linkToken.address, { from: owner })

    oracleClient = await FundingOracleClient.new(url, path, level, linkToken.address)

    await oc.setFulfillmentPermission(oracleNode, true, {
      from: admin
    })
  })

  it('constructor params are correct', async () => {
    assert.equal(
      await oracleClient.getChainlinkToken(),
      linkToken.address,
      'url is not correct'
    )
    assert.equal(await oracleClient.url(), url, 'url is not correct')
    assert.equal(await oracleClient.path(), path, 'path is not correct')
  })

  it('FundingOracleClient owner is the oracle creator', async () => {
    assert.equal(await oracleClient.owner(), owner)
  })

  describe('#requestWinner', async () => {
    context('without LINK', () => {
      it('reverts', async () => {
        await expectRevert.unspecified(
          oracleClient.requestWinner(poolAddress, oc.address, jobId, payment)
        )
      })
    })

    context('with LINK', () => {
      beforeEach(async () => {
        await linkToken.transfer(oracleClient.address, web3.utils.toWei('1', 'ether'), {
          from: admin
        })
      })

      it('triggers a log event in the new Oracle contract', async () => {
        const tx = await oracleClient.requestWinner(poolAddress, oc.address, jobId, payment)

        request = oracle.decodeRunRequest(tx.receipt.rawLogs[3])
        assert.equal(oc.address, tx.receipt.rawLogs[3].address)
        assert.equal(
          request.topic,
          web3.utils.keccak256(
            'OracleRequest(bytes32,address,bytes32,uint256,address,bytes4,uint256,uint256,bytes)',
          )
        )
      })
    })
  })

  describe('#fulfill', async () => {
    // const response = web3.utils.padRight(web3.utils.toHex(expected), 64)
    // const response = web3.utils.padLeft(web3.utils.toHex(winner), 12)
    const response = web3.utils.padLeft(winner, 64).toLowerCase()

    beforeEach(async () => {
      await linkToken.transfer(oracleClient.address, web3.utils.toWei('1', 'ether'), {
        from: admin
      })
      const tx = await oracleClient.requestWinner(poolAddress, oc.address, jobId, payment)

      request = oracle.decodeRunRequest(tx.receipt.rawLogs[3])
      await oc.fulfillOracleRequest(
        ...oracle.convertFufillParams(request, response, {
          from: oracleNode,
          gas: 500000
        })
      )
    })

    it('records the data given to it by the oracle', async () => {
      const actualWinner = await oracleClient.data.call()

      assert.equal(
        response,
        actualWinner
        // web3.utils.padLeft(web3.utils.toHex(winner), 64),
        // web3.utils.padLeft(expected, 64),
      )
    })

    context('when called by anyone other than the oracle contract', () => {
      it('does not accept the data provided', async () => {
        await expectRevert.unspecified(
          oracleClient.fulfill(request.requestId, response, { from: stranger })
        )
      })
    })
  })
})
