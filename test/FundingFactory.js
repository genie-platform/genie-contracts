const FundingFactory = artifacts.require('FundingFactory.sol')
const Funding = artifacts.require('Funding.sol')
const FundingContext = require('./helpers/FundingContext')
const truffleAssert = require('truffle-assertions')

const createFunding = async (factory, args) => {
  const result = await factory.createFunding(...args)
  let fundingAddress
  truffleAssert.eventEmitted(result, 'FundingCreated', (ev) => {
    fundingAddress = ev.funding
    return true
  })
  const funding = await Funding.at(fundingAddress)
  return { funding, result }
}

contract('FundingFactory', accounts => {
  const owner = accounts[0]
  const operator = accounts[1]

  let factory, token, moneyMarket

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    factory = await FundingFactory.new(operator)
    await fundingContext.init()
    token = fundingContext.token
    moneyMarket = fundingContext.moneyMarket
  })

  describe('#createFunding', () => {
    it('User can create funding', async () => {
      const { funding } = await createFunding(factory, [moneyMarket.address, operator])
      assert.equal(await funding.operator(), operator)
      assert.equal(await funding.owner(), owner)
    })
  })
})
