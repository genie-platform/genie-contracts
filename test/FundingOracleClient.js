const FundingContext = require('./helpers/FundingContext')
const PoeChainlinkClient = artifacts.require('PoeChainlinkClient.sol')
const { expectRevert } = require('@openzeppelin/test-helpers')
const { oracle } = require('@chainlink/test-helpers')
const BigNumber = require('bignumber.js')
const jobId = web3.utils.toHex('4c7b7ffb66b344fbaa64995af81e355a')
const level = 90

const payment = web3.utils.toWei('1')

contract('PoeChainlinkClient', accounts => {
  const owner = accounts[0]
  const admin = accounts[1]
  const oracleNode = accounts[1]
  const poolAddress = accounts[3]

  let chainlinkClient, linkToken, oc, request

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    await fundingContext.init()
    linkToken = fundingContext.linkToken
    oc = fundingContext.oracle
    // oracle = fundingContext.oracle
    // oc = await Oracle.new(linkToken.address, { from: owner })

    chainlinkClient = await PoeChainlinkClient.new(linkToken.address, oc.address, jobId, level)

    await oc.setFulfillmentPermission(oracleNode, true, {
      from: admin
    })
  })

  it('constructor params are correct', async () => {
    assert.equal(
      await chainlinkClient.getChainlinkToken(),
      linkToken.address,
      'link is not correct'
    )
    assert.equal(await chainlinkClient.oracle(), oc.address, 'oracle is not correct')
    assert.equal(await chainlinkClient.jobId(), jobId, 'jobId is not correct')
  })

  it('PoeChainlinkClient owner is the oracle creator', async () => {
    assert.equal(await chainlinkClient.owner(), owner)
  })

  // it('toString', async () => {
  //   console.log(await chainlinkClient.turnString(owner))
  //   console.log(web3.utils.asciiToHex(await chainlinkClient.turnString(owner)))
  //   assert.equal(web3.utils.asciiToHex(await chainlinkClient.turnString(owner)), owner)
  // })
  it('uintToString', async () => {
    const response = await chainlinkClient.uintToString(owner)
    const actual = '0x' + new BigNumber(response).toString(16)
    console.log({ actual })
    assert.equal(actual, owner.toLowerCase())
  })

  // it('int', async () => {
  //   // console.log((await chainlinkClient.turnInt('0x665b306c39431e513382c5f641b75e6778f86e95')).toString())
  //   // const res = (await chainlinkClient.turnInt(owner)).toString(16)
  //   const actual = '0x' + (await chainlinkClient.turnInt(owner)).toString(16)
  //   // console.log((await chainlinkClient.turnInt(owner)).toString(16))
  //   // console.log(web3.utils.asciiToHex(await chainlinkClient.turnInt(owner)))
  //   assert.equal(actual, owner.toLowerCase())
  // })

  describe('#requestWinner', async () => {
    context('without LINK', () => {
      it('reverts', async () => {
        await expectRevert.unspecified(
          chainlinkClient.requestWinner(poolAddress, payment)
        )
      })
    })

    context('with LINK', () => {
      beforeEach(async () => {
        await linkToken.transfer(chainlinkClient.address, web3.utils.toWei('1', 'ether'), {
          from: admin
        })
      })

      it('triggers a log event in the new Oracle contract', async () => {
        const tx = await chainlinkClient.requestWinner(poolAddress, payment)

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

  // describe('#fulfill', async () => {
    // const winner = accounts[4]
    // const stranger = accounts[2]
  //   // const response = web3.utils.padRight(web3.utils.toHex(expected), 64)
  //   // const response = web3.utils.padLeft(web3.utils.toHex(winner), 12)
  //   const response = web3.utils.padLeft(winner, 64).toLowerCase()

  //   beforeEach(async () => {
  //     await linkToken.transfer(chainlinkClient.address, web3.utils.toWei('1', 'ether'), {
  //       from: admin
  //     })
  //     const tx = await chainlinkClient.requestWinner(poolAddress, payment)

  //     request = oracle.decodeRunRequest(tx.receipt.rawLogs[3])
  //     await oc.fulfillOracleRequest(
  //       ...oracle.convertFufillParams(request, response, {
  //         from: oracleNode,
  //         gas: 500000
  //       })
  //     )
  //   })

  //   it('records the data given to it by the oracle', async () => {
  //     const actualWinner = await chainlinkClient.data.call()

  //     assert.equal(
  //       response,
  //       actualWinner
  //       // web3.utils.padLeft(web3.utils.toHex(winner), 64),
  //       // web3.utils.padLeft(expected, 64),
  //     )
  //   })

  //   context('when called by anyone other than the oracle contract', () => {
  //     it('does not accept the data provided', async () => {
  //       await expectRevert.unspecified(
  //         chainlinkClient.fulfill(request.requestId, response, { from: stranger })
  //       )
  //     })
  //   })
  // })
})
