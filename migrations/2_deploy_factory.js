const FundingFactory = artifacts.require('FundingFactory')
const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle } = require('@chainlink/contracts/truffle/v0.5/Oracle')
const TrustedForwarder = artifacts.require('TrustedForwarder')

module.exports = function (deployer, network, [defaultAccount]) {
  if (network === 'development') {
    LinkToken.setProvider(deployer.provider)
    Oracle.setProvider(deployer.provider)
    return deployer.deploy(LinkToken, { from: defaultAccount }).then(async (link) => {
      await deployer.deploy(TrustedForwarder)
      await deployer.deploy(Oracle, link.address, { from: defaultAccount })
      return deployer
        .deploy(Oracle, link.address, { from: defaultAccount })
        .then(async () => {
          const factory = await deployer.deploy(FundingFactory)
          await factory.initialize(link.address)
        })
    })
  } else {
    deployer.deploy(FundingFactory)
  }
}
