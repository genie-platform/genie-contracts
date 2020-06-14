const FundingContext = require('./helpers/FundingContext')
const FundingOracleClient = artifacts.require('FundingOracleClient.sol')
const { ZERO_ADDRESS } = require('./helpers/constants')

contract('FundingFactory', accounts => {
  const owner = accounts[0]
  const operator = accounts[1]

  let factory, moneyMarket, linkToken

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    await fundingContext.init()
    moneyMarket = fundingContext.moneyMarket
    linkToken = fundingContext.linkToken
    factory = await fundingContext.createFactory(linkToken)
  })

  it('link address is not zero', async () => {
    assert.equal(await factory.link(), fundingContext.linkToken.address, 'link initialized')
  })

  describe('#createFunding', () => {
    it('User can create funding', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      assert.equal(await funding.operator(), operator, 'operator initialized')
      assert.equal(await funding.owner(), owner, 'owner initialized')
      assert.equal(await funding.ticketPrice(), 0, 'ticketPrice default')
    })

    it('oracle should be not zero', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await funding.oracle()
      assert.notEqual(oracle, ZERO_ADDRESS, 'oracle initialized')
    })

    it('oracle owner should be the funding', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await FundingOracleClient.at(await funding.oracle())

      assert.equal(await oracle.owner(), funding.address, 'oracle owner initialized')
    })

    it('oracle address and jobId should be correct', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await FundingOracleClient.at(await funding.oracle())
      assert.equal(await oracle.getChainlinkToken(), linkToken.address, 'token is not correct')
      assert.equal(await oracle.oracle(), fundingContext.oracle.address, 'oracle is not correct')
      assert.equal(await oracle.jobId(), fundingContext.jobId, 'jobId is not correct')
    })

    it('ticket price should be correct', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator, fundingContext.oracle.address, fundingContext.jobId, 100, 10, fundingContext.forwarder.address])
      assert.equal(await funding.ticketPrice(), 10, 'ticket price initialized')
    })
  })
})
