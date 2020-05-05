const FundingFactory = artifacts.require('FundingFactory.sol')
const BaseFunding = artifacts.require('BaseFunding.sol')
const FundingContext = require('./helpers/FundingContext')
const truffleAssert = require('truffle-assertions')

const createFunding = async (factory, args) => {
  const result = await factory.createFunding(...args)
  let fundingAddress
  truffleAssert.eventEmitted(result, 'FundingCreated', (ev) => {
    fundingAddress = ev.funding
    return true
  })
  const funding = await BaseFunding.at(fundingAddress)
  return { funding, result }
}

contract('FundingFactory', accounts => {
  const owner = accounts[0]
  const operator = accounts[1]

  let factory, moneyMarket

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    factory = await FundingFactory.new(operator)
    await fundingContext.init()
    moneyMarket = fundingContext.moneyMarket
  })

  describe('#createFunding', () => {
    it('User can create funding', async () => {
      const { funding } = await createFunding(factory, [moneyMarket.address, 0, operator])
      assert.equal(await funding.operator(), operator, 'operator initialized')
      assert.equal(await funding.owner(), owner, 'owner initialized')
    })
  })
})
