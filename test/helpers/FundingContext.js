const BN = require('bn.js')
const {
  SUPPLY_RATE_PER_BLOCK,
  MAX_NEW_FIXED
} = require('./constants')
// const setupERC1820 = require('./setupERC1820')

const debug = require('debug')('PoolContext.js')

module.exports = function PoolContext({ web3, artifacts, accounts }) {

  const [owner, admin, user1, user2, user3] = accounts

  const Token = artifacts.require('Token.sol')
  const CErc20Mock = artifacts.require('CErc20Mock.sol')
  const CompoundLending = artifacts.require('CompoundLending.sol')

  this.init = async () => {
    this.token = await this.newToken()
    this.moneyMarket = await CErc20Mock.new({ from: admin })
    this.compoundLending = await CompoundLending.new(this.moneyMarket.address)
    await this.moneyMarket.initialize(this.token.address, new BN(SUPPLY_RATE_PER_BLOCK))
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

  this.balance = async (funding) => {
    return (await funding.methods['balance()'].call()).toString()
  }

  this.interestEarned = async (funding) => {
    return (await funding.methods['interestEarned()'].call()).toString()
  }
}
