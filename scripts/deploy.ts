import fs from "fs";
import { ethers, hardhatArguments } from "hardhat";

const main = async () => {
  const [singer] = await ethers.getSigners();
  const Dai = await ethers.getContractFactory("Dai");
  const daiInitialSupply = 1000000;
  const dai = await Dai.connect(singer).deploy(daiInitialSupply);
  console.log(`Dai.sol deployed to ${dai.address}`);

  let network;
  if (!hardhatArguments.network) {
    network = 'hardhat'
  }
  const daiJson = {
    [network as string]:  dai.address
  }
  fs.writeFileSync(
    "scripts/address/Dai.json",
    JSON.stringify(daiJson, null, 2),
    "utf8"
  );
  await dai.deployed();

  const Lend = await ethers.getContractFactory('Dai')
  const lend = await Lend.connect(singer).deploy(dai.address)
  console.log(`Lend.sol deployed to ${lend.address}`)

  const lendJson = {
    [network as string]:  lend.address
  }
  fs.writeFileSync(
    "scripts/address/Lend.json",
    JSON.stringify(lendJson, null, 2),
    "utf8"
  );
  await lend.deployed();
};

main()
  .then()
  .catch((error) => {
    console.error(error);
  });
