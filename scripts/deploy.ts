import fs from 'fs'
import { ethers } from 'hardhat'

const main = async () => {
  const [singer] = await ethers.getSigners()
  const contractFactory = await ethers.getContractFactory('Lend')
  // if you mint in constructor, you need to add value in deploy function
  const contract = await contractFactory.connect(singer).deploy()
  console.log(`Lend.sol deployed to ${contract.address}`)
  fs.writeFileSync('scripts/address/contract.txt', contract.address)
  await contract.deployed()
}

main()
  .then()
  .catch((error) => { console.error(error) })
