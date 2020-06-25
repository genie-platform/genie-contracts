const NaivePaymaster = artifacts.require('NaivePaymaster')

module.exports = async function (deployer) {
  await deployer.deploy(NaivePaymaster).then(naivePaymaster => {
    const kovanRelayHub = '0x2E0d94754b348D208D64d52d78BcD443aFA9fa52'
    naivePaymaster.setRelayHub(kovanRelayHub)
    console.log(naivePaymaster.address)
  })
}
