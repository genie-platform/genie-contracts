const BN = require('bn.js')
const truffleAssert = require('truffle-assertions')
const {
  SUPPLY_RATE_PER_BLOCK,
  MAX_NEW_FIXED
} = require('./constants')

module.exports = function PoolContext({ web3, artifacts, accounts }) {

  const [owner, admin, user1, user2, user3] = accounts

  const Token = artifacts.require('Token.sol')
  const Funding = artifacts.require('Funding.sol')
  const FundingFactory = artifacts.require('FundingFactory.sol')

  const CErc20Mock = artifacts.require('CErc20Mock.sol')

  const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
  const { Oracle } = require('@chainlink/contracts/truffle/v0.5/Oracle')

  this.init = async () => {
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

  this.createFunding = async (factory, args) => {
    const result = await factory.createFunding(...args)
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

  // this.createPool = async (feeFraction = new BN('0'), cooldownDuration = 1) => {
  //   this.pool = await this.createPoolNoOpenDraw(feeFraction, cooldownDuration)
  //   await this.openNextDraw()
  //   return this.pool
  // }

  // this.createToken = async () => {
  //   this.poolToken = await PoolToken.new()
  //   await this.poolToken.init(
  //     'Prize Dai', 'pzDAI', [], this.pool.address
  //   )

  //   assert.equal(await this.poolToken.pool(), this.pool.address)

  //   await this.pool.setPoolToken(this.poolToken.address)

  //   return this.poolToken
  // }

  // this.newPool = async () => {
  //   return MCDAwarePool.new()
  // }

}