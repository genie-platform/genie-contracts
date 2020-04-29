const Funding = artifacts.require('Funding.sol')
const FundingContext = require('./helpers/FundingContext')
const truffleAssert = require('truffle-assertions')
const chai = require('chai');
const BN = require('bn.js');

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

contract('Funding', accounts => {
  const owner = accounts[0]
  const operator = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]
  const user3 = accounts[4]

  let funding, token, moneyMarket
  let user1BalanceBefore, user2BalanceBefore

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    // factory = await FundingFactory.new(operator)
    await fundingContext.init()
    token = fundingContext.token
    moneyMarket = fundingContext.moneyMarket
    funding = await Funding.new(owner, moneyMarket.address, operator)
    await token.approve(funding.address, 100, { from: user1 })
    await token.approve(funding.address, 100, { from: user2 })
    user1BalanceBefore = await token.balanceOf(user1)
    user2BalanceBefore = await token.balanceOf(user2)
  })

  // describe('#deposit', () => {
  //   it('User can deposit funds', async () => {
  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await funding.accountedBalance()).toString(), '0')
  //     assert.equal(await fundingContext.balance(funding), '0')

  //     await funding.deposit(1, { from: user1 })

  //     assert.equal((await funding.balanceOf(user1)).toString(), '1')
  //     assert.equal((await funding.accountedBalance()).toString(), '1')
  //     assert.equal(await fundingContext.balance(funding), '1')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
  //   })

  //   it('User cannot deposit zero funds', async () => {
  //     await truffleAssert.reverts(funding.deposit(0, { from: user1 }), 'Funding/deposit-zero')
  //   })

  //   it('User can deposit funds twice', async () => {
  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await funding.accountedBalance()).toString(), '0')
  //     assert.equal(await fundingContext.balance(funding), '0')

  //     await funding.deposit(1, { from: user1 })

  //     assert.equal((await funding.balanceOf(user1)).toString(), '1')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '1')
  //     assert.equal(await fundingContext.balance(funding), '1')

  //     await funding.deposit(2, { from: user1 })
  //     assert.equal((await funding.balanceOf(user1)).toString(), '3')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('3')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '3')
  //     assert.equal(await fundingContext.balance(funding), '3')
  //   })

  //   it('multipe users can deposit funds', async () => {
  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await funding.balanceOf(user2)).toString(), '0')
  //     assert.equal((await funding.accountedBalance()).toString(), '0')
  //     assert.equal(await fundingContext.balance(funding), '0')

  //     await funding.deposit(1, { from: user1 })
  //     assert.equal((await funding.balanceOf(user1)).toString(), '1')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '1')
  //     assert.equal(await fundingContext.balance(funding), '1')

  //     await funding.deposit(2, { from: user2 })
  //     assert.equal((await funding.balanceOf(user2)).toString(), '2')
  //     assert.equal((await token.balanceOf(user2)).toString(), user2BalanceBefore.sub(new BN('2')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '3')
  //     assert.equal(await fundingContext.balance(funding), '3')
  //   })
  // })

  // describe('#withdraw', () => {
  //   beforeEach(async () => {
  //     await funding.deposit(5, { from: user1 })
  //     await funding.deposit(10, { from: user2 })

  //     user1BalanceBefore = await token.balanceOf(user1)
  //     user2BalanceBefore = await token.balanceOf(user2)
  //   })

  //   it('User can withdraw his balance', async () => {
  //     assert.equal((await funding.balanceOf(user1)).toString(), '5')
  //     assert.equal((await funding.accountedBalance()).toString(), '15')

  //     await funding.withdraw({ from: user1 })

  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.add(new BN('5')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '10')
  //     assert.equal(await fundingContext.balance(funding), '10')

  //     await funding.withdraw({ from: user1 })
  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await funding.accountedBalance()).toString(), '10')
  //     assert.equal(await fundingContext.balance(funding), '10')
  //   })

  //   it('Multiple User can withdraw their balance', async () => {
  //     assert.equal((await funding.balanceOf(user1)).toString(), '5')
  //     assert.equal((await funding.balanceOf(user2)).toString(), '10')
  //     assert.equal((await funding.accountedBalance()).toString(), '15')
  //     assert.equal(await fundingContext.balance(funding), '15')

  //     await funding.withdraw({ from: user1 })

  //     assert.equal((await funding.balanceOf(user1)).toString(), '0')
  //     assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.add(new BN('5')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '10')
  //     assert.equal(await fundingContext.balance(funding), '10')

  //     await funding.withdraw({ from: user2 })

  //     assert.equal((await funding.balanceOf(user2)).toString(), '0')
  //     assert.equal((await token.balanceOf(user2)).toString(), user2BalanceBefore.add(new BN('10')).toString())
  //     assert.equal((await funding.accountedBalance()).toString(), '0')
  //     assert.equal(await fundingContext.balance(funding), '0')
  //   })

  //   it('User can withdraw zero balance', async () => {
  //     assert.equal((await funding.balanceOf(user3)).toString(), '0')
  //     await funding.withdraw({ from: user3 })

  //     assert.equal((await funding.balanceOf(user3)).toString(), '0')
  //   })
  // })

  describe('interest', () => {
    describe('#interestEarned', () => {
      it('Earning interest is zero if not tokens deposited', async () => {
        assert.equal(await fundingContext.interestEarned(funding), '0')
      })

      it('Earning interest is zero tokens are deposited, but cToken did not mint any', async () => {
        await funding.deposit(5, { from: user1 })
        await funding.deposit(10, { from: user2 })

        assert.equal(await fundingContext.interestEarned(funding), '0')
      })

      it('Earning interest is not zero', async () => {
        await funding.deposit(5, { from: user1 })

        // simulate lending interest
        await moneyMarket.reward(funding.address)

        assert.equal(await fundingContext.interestEarned(funding), '1')
      })

      it('Multiple depostis: earning interest is not zero', async () => {
        await funding.deposit(5, { from: user1 })
        await funding.deposit(15, { from: user2 })

        // simulate lending interest
        await moneyMarket.reward(funding.address)

        assert.equal(await fundingContext.interestEarned(funding), '4')
      })
    })

    describe('#reward', () => {
      it('Cannot reward zero tokens', async () => {
        assert.equal(await fundingContext.interestEarned(funding), '0')
        await truffleAssert.reverts(funding.reward(user1, { from: operator }), 'Funding/reward-zero')
      })

      it('Only operator can reward', async () => {
        assert.equal(await fundingContext.interestEarned(funding), '0')
        await truffleAssert.reverts(funding.reward(user1, { from: user1 }), 'Funding/is-opetator')
      })

      it('User can get his reward', async () => {
        await funding.deposit(10, { from: user1 })
        await funding.deposit(10, { from: user2 })
        user1BalanceBefore = await token.balanceOf(user1)
        user2BalanceBefore = await token.balanceOf(user2)

        assert.equal(await fundingContext.interestEarned(funding), '0')

        // simulate lending interest
        await moneyMarket.reward(funding.address)
        assert.equal(await fundingContext.interestEarned(funding), '4')

        await funding.reward(user1, { from: operator })

        assert.equal(await fundingContext.interestEarned(funding), '0')
        assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.add(new BN('4')).toString())
        assert.equal((await token.balanceOf(user2)).toString(), user2BalanceBefore.toString())
      })
    })
  })
})
