const FundingContext = require('./helpers/FundingContext')
const FundingOracle = artifacts.require('FundingOracle.sol')
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
    assert.notEqual(await factory.link(), ZERO_ADDRESS, 'link initialized')
  })


  describe('#createFunding', () => {
    it('User can create funding', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      assert.equal(await funding.operator(), operator, 'operator initialized')
      assert.equal(await funding.owner(), owner, 'owner initialized')
    })

    it('oracle should be not zero', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await funding.oracle()
      assert.notEqual(oracle, ZERO_ADDRESS, 'oracle initialized')
    })

    it('oracle owner should be the funding', async () => {
      const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await FundingOracle.at(await funding.oracle())
      assert.notEqual(await oracle.owner(), funding.address, 'oracle owner initialized')
    })
  })
})
