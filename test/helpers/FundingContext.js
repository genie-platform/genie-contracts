const BN = require('bn.js')
const truffleAssert = require('truffle-assertions')
const {
  SUPPLY_RATE_PER_BLOCK,
  MAX_NEW_FIXED
} = require('./constants')

const jobId = web3.utils.toHex('4c7b7ffb66b344fbaa64995af81e355a')
const level = 90

module.exports = function PoolContext({ web3, artifacts, accounts }) {

  const [owner, admin, user1, user2, user3] = accounts

  const Token = artifacts.require('Token.sol')
  const Funding = artifacts.require('Funding.sol')
  const FundingFactory = artifacts.require('FundingFactory.sol')

  const CErc20Mock = artifacts.require('CErc20Mock.sol')

  const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
  const { Oracle } = require('@chainlink/contracts/truffle/v0.5/Oracle')

  this.init = async () => {
    this.jobId = jobId
    this.level = level
    this.token = await this.newToken()
    this.moneyMarket = await CErc20Mock.new({ from: admin })
    await this.moneyMarket.initialize(this.token.address, new BN(SUPPLY_RATE_PER_BLOCK))
    this.linkToken = await LinkToken.new({ from: admin })
    this.oracle = await Oracle.new(this.linkToken.address, { from: admin })
    await this.token.mint(this.moneyMarket.address, new BN(MAX_NEW_FIXED).add(new BN(web3.utils.toWei('10000000', 'ether'))).toString())
    await this.token.mint(admin, web3.utils.toWei('100000', 'ether'))
  }

  this.newToken = async (decimals = 18) => {
    const token = await Token.new({ from: admin })
    await token.initialize(owner, 'Token', 'TOK', decimals)
    await token.mint(owner, web3.utils.toWei('100000', 'ether'))
    await token.mint(user1, web3.utils.toWei('100000', 'ether'))
    await token.mint(user2, web3.utils.toWei('100000', 'ether'))
    await token.mint(user3, web3.utils.toWei('100000', 'ether'))
    return token
  }

  this.createFactory = async (linkToken) => {
    const factory = await FundingFactory.new()
    await factory.initialize(linkToken.address)
    return factory
  }

  this.createPoeFunding = async (factory, rest) => {
    let args
    if (rest.length < 4) {
      args = [...rest, this.oracle.address, jobId, 100, 0]
    } else if (rest.length < 5) {
      args = [...rest, 100, 0]
    } else if (rest.length < 5) {
      args = [...rest, 0]
    } else {
      args = rest
    }
    // const args = rest.length < 4 ? [...rest, '', '', 100, 0] : rest.length < 5 ? [...rest, 100, 0] : rest
    const result = await factory.createPoeFunding(...args)
    let fundingAddress
    truffleAssert.eventEmitted(result, 'FundingCreated', (ev) => {
      fundingAddress = ev.funding
      return true
    })
    const funding = await Funding.at(fundingAddress)
    return { funding, result }
  }

  this.balance = async (funding) => {
    return (await funding.methods['balance()'].call()).toString()
  }

  this.interestEarned = async (funding) => {
    return (await funding.methods['interestEarned()'].call()).toString()
  }

  this.depositPool = async (amount, options) => {
    if (options) {
      await this.token.approve(this.pool.address, amount, options)
      await this.pool.depositPool(amount, options)
    } else {
      await this.token.approve(this.pool.address, amount)
      await this.pool.depositPool(amount)
    }
  }
}