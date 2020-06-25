
const FundingContext = require('./helpers/FundingContext')
const FundingOracleClient = artifacts.require('FundingOracleClient.sol')
const truffleAssert = require('truffle-assertions')
const { expectRevert } = require('@openzeppelin/test-helpers')
const BN = require('bn.js')
const { oracle } = require('@chainlink/test-helpers')

contract('Funding', accounts => {
  const owner = accounts[0]
  const operator = accounts[1]
  const user1 = accounts[2]
  const user2 = accounts[3]
  const user3 = accounts[4]

  const userId1 = 'coolUser'
  const userId2 = 'neatUser'

  let funding, token, moneyMarket, linkToken, factory
  let user1BalanceBefore, user2BalanceBefore

  const fundingContext = new FundingContext({ web3, artifacts, accounts })

  beforeEach(async () => {
    await fundingContext.init()
    token = fundingContext.token
    moneyMarket = fundingContext.moneyMarket
    linkToken = fundingContext.linkToken
    factory = await fundingContext.createFactory(linkToken)

    const response = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
    funding = response.funding
    await token.approve(funding.address, 100, { from: user1 })
    await token.approve(funding.address, 100, { from: user2 })
    user1BalanceBefore = await token.balanceOf(user1)
    user2BalanceBefore = await token.balanceOf(user2)
  })

  it('Funding owner is the funding creator', async () => {
    assert.equal(await funding.owner(), owner)
  })

  describe('#deposit', () => {
    it('User can deposit funds', async () => {
      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await funding.accountedBalance()).toString(), '0')
      assert.equal(await fundingContext.balance(funding), '0')

      await funding.deposit(1, userId1, { from: user1 })

      assert.equal((await funding.balanceOf(user1)).toString(), '1')
      assert.equal((await funding.accountedBalance()).toString(), '1')
      assert.equal(await fundingContext.balance(funding), '1')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
    })

    it('User cannot deposit zero funds', async () => {
      await truffleAssert.reverts(funding.deposit(0, userId1, { from: user1 }), 'Funding/deposit-zero')
    })

    context('with ticket price', () => {
      const ticketPrice = 5
      beforeEach(async () => {
        const response = await fundingContext.createFunding(factory, [moneyMarket.address, operator, fundingContext.oracle.address, fundingContext.jobId, 10, ticketPrice, fundingContext.forwarder.address])
        funding = response.funding
        await token.approve(funding.address, 100, { from: user1 })
      })

      it('ticket price is correct', async () => {
        assert.equal(await funding.ticketPrice(), ticketPrice)
      })

      it('User cannot deposit less than ticket price', async () => {
        await truffleAssert.reverts(funding.deposit(1, userId1, { from: user1 }), 'Funding/small-amount')
      })

      it('User can deposit the ticket price', async () => {
        await funding.deposit(ticketPrice, userId1, { from: user1 })
      })
    })

    it('User can deposit funds twice', async () => {
      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await funding.accountedBalance()).toString(), '0')
      assert.equal(await fundingContext.balance(funding), '0')

      await funding.deposit(1, userId1, { from: user1 })

      assert.equal((await funding.balanceOf(user1)).toString(), '1')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '1')
      assert.equal(await fundingContext.balance(funding), '1')

      await funding.deposit(2, userId2, { from: user1 })
      assert.equal((await funding.balanceOf(user1)).toString(), '3')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('3')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '3')
      assert.equal(await fundingContext.balance(funding), '3')
    })

    it('multipe users can deposit funds', async () => {
      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await funding.balanceOf(user2)).toString(), '0')
      assert.equal((await funding.accountedBalance()).toString(), '0')
      assert.equal(await fundingContext.balance(funding), '0')

      await funding.deposit(1, userId1, { from: user1 })
      assert.equal((await funding.balanceOf(user1)).toString(), '1')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.sub(new BN('1')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '1')
      assert.equal(await fundingContext.balance(funding), '1')

      await funding.deposit(2, userId2, { from: user2 })
      assert.equal((await funding.balanceOf(user2)).toString(), '2')
      assert.equal((await token.balanceOf(user2)).toString(), user2BalanceBefore.sub(new BN('2')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '3')
      assert.equal(await fundingContext.balance(funding), '3')
    })
  })

  describe('#withdraw', () => {
    beforeEach(async () => {
      await funding.deposit(5, userId1, { from: user1 })
      await funding.deposit(10, userId2, { from: user2 })

      user1BalanceBefore = await token.balanceOf(user1)
      user2BalanceBefore = await token.balanceOf(user2)
    })

    it('User can withdraw his balance', async () => {
      assert.equal((await funding.balanceOf(user1)).toString(), '5')
      assert.equal((await funding.accountedBalance()).toString(), '15')

      await funding.withdraw({ from: user1 })

      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.add(new BN('5')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '10')
      assert.equal(await fundingContext.balance(funding), '10')

      await funding.withdraw({ from: user1 })
      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await funding.accountedBalance()).toString(), '10')
      assert.equal(await fundingContext.balance(funding), '10')
    })

    it('Multiple User can withdraw their balance', async () => {
      assert.equal((await funding.balanceOf(user1)).toString(), '5')
      assert.equal((await funding.balanceOf(user2)).toString(), '10')
      assert.equal((await funding.accountedBalance()).toString(), '15')
      assert.equal(await fundingContext.balance(funding), '15')

      await funding.withdraw({ from: user1 })

      assert.equal((await funding.balanceOf(user1)).toString(), '0')
      assert.equal((await token.balanceOf(user1)).toString(), user1BalanceBefore.add(new BN('5')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '10')
      assert.equal(await fundingContext.balance(funding), '10')

      await funding.withdraw({ from: user2 })

      assert.equal((await funding.balanceOf(user2)).toString(), '0')
      assert.equal((await token.balanceOf(user2)).toString(), user2BalanceBefore.add(new BN('10')).toString())
      assert.equal((await funding.accountedBalance()).toString(), '0')
      assert.equal(await fundingContext.balance(funding), '0')
    })

    it('User can withdraw zero balance', async () => {
      assert.equal((await funding.balanceOf(user3)).toString(), '0')
      await funding.withdraw({ from: user3 })

      assert.equal((await funding.balanceOf(user3)).toString(), '0')
    })
  })

  context('interest', () => {
    describe('#interestEarned', () => {
      it('Earning interest is zero if not tokens deposited', async () => {
        assert.equal(await fundingContext.interestEarned(funding), '0')
      })

      it('Earning interest is zero tokens are deposited, but cToken did not mint any', async () => {
        await funding.deposit(5, userId1, { from: user1 })
        await funding.deposit(10, userId2, { from: user2 })

        assert.equal(await fundingContext.interestEarned(funding), '0')
      })

      it('Earning interest is not zero', async () => {
        await funding.deposit(5, userId1, { from: user1 })

        // simulate lending interest
        await moneyMarket.reward(funding.address)

        assert.equal(await fundingContext.interestEarned(funding), '1')
      })

      it('Multiple depostis: earning interest is not zero', async () => {
        await funding.deposit(5, userId1, { from: user1 })
        await funding.deposit(15, userId2, { from: user2 })

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
        await funding.deposit(10, userId1, { from: user1 })
        await funding.deposit(10, userId2, { from: user2 })
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

  context('winner', () => {
    const oracleNode = accounts[1]
    const admin = accounts[1]

    const jobId = web3.utils.toHex('4c7b7ffb66b344fbaa64995af81e355a')
    const payment = web3.utils.toWei('1')

    let oracleClientAddress, linkToken, oc, request
    beforeEach(async () => {
      const response = await fundingContext.createFunding(factory, [moneyMarket.address, operator, fundingContext.oracle.address, fundingContext.jobId, 100, 10, fundingContext.forwarder.address])
      funding = response.funding
      oracleClientAddress = await funding.oracle()
      linkToken = fundingContext.linkToken
      oc = fundingContext.oracle

      await token.approve(funding.address, 100, { from: user1 })
      await linkToken.transfer(oracleClientAddress, web3.utils.toWei('1', 'ether'), {
        from: admin
      })

      await oc.setFulfillmentPermission(oracleNode, true, {
        from: admin
      })
    })

    it('oracle owner should be the funding', async () => {
      // const { funding } = await fundingContext.createFunding(factory, [moneyMarket.address, operator])
      const oracle = await FundingOracleClient.at(await funding.oracle())
      assert.equal(await oracle.owner(), funding.address, 'oracle owner initialized')
    })

    describe('#requestWinner', () => {
      it('triggers a log event in the new Oracle contract', async () => {
        const tx = await funding.requestWinner(payment, { from: owner })

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

    describe('#fulfill', async () => {
      const winner = user1
      const stranger = accounts[2]
      let oracleClient

      // const response = web3.utils.padRight(web3.utils.toHex(expected), 64)
      // const response = web3.utils.padLeft(web3.utils.toHex(winner), 12)
      const response = web3.utils.padLeft(winner, 64).toLowerCase()

      beforeEach(async () => {
        oracleClient = await FundingOracleClient.at(await funding.oracle())

        await linkToken.transfer(oracleClient.address, web3.utils.toWei('1', 'ether'), {
          from: admin
        })
        // const tx = await oracleClient.requestWinner(funding.address, payment)
        await funding.deposit(await funding.ticketPrice(), userId1, { from: winner })
        user1BalanceBefore = await token.balanceOf(user1)

        await moneyMarket.reward(funding.address)
        assert.equal(await fundingContext.interestEarned(funding), '2')

        const tx = await funding.requestWinner(payment, { from: owner })

        request = oracle.decodeRunRequest(tx.receipt.rawLogs[3])
        await oc.fulfillOracleRequest(
          ...oracle.convertFufillParams(request, response, {
            from: oracleNode,
            gas: 500000
          })
        )
        assert.equal(await fundingContext.interestEarned(funding), '0')
        // assert.equal(await token.balanceOf(winner), '12')
        assert.equal((await token.balanceOf(winner)).toString(), user1BalanceBefore.add(new BN('2')).toString())
      })

      // it('to address from bytes should work', async () => {
      //   const bytes = '0x000000000000000000000000d418c5d0c4a3d87a6c555b7aa41f13ef87485ec6'
      //   assert.equal('0xD418c5d0c4a3D87a6c555B7aA41f13EF87485Ec6', await funding.toAddress(bytes))
      // })

      it('records the data given to it by the oracle', async () => {
        const actualWinner = await oracleClient.data.call()

        assert.equal(
          response,
          actualWinner
          // web3.utils.padLeft(web3.utils.toHex(winner), 64),
          // web3.utils.padLeft(expected, 64),
        )
      })

      it('sends the reward to the winner', async () => {
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
})
