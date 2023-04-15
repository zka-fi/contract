import fs from 'fs'
import { ethers } from 'hardhat'

const main = async () => {
  const [singer] = await ethers.getSigners()
  const Dai = await ethers.getContractFactory('Dai')
  const daiInitialSupply = 1000000;
  const dai = await Dai.connect(singer).deploy(daiInitialSupply)
  console.log(`Dai.sol deployed to ${dai.address}`)
  fs.writeFileSync('scripts/address/Dai.txt', dai.address)
  await dai.deployed()

  const Lend = await ethers.getContractFactory('Dai')
  const lend = await Lend.connect(singer).deploy(dai.address)
  console.log(`Lend.sol deployed to ${lend.address}`)
  fs.writeFileSync('scripts/address/Lend.txt', lend.address)
  await lend.deployed()
}

main()
  .then() 
  .catch((error) => { console.error(error) })
