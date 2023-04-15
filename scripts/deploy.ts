import fs from "fs";
import { ethers, hardhatArguments } from "hardhat";

const main = async () => {
  const [singer] = await ethers.getSigners();
  let network;
  if (!hardhatArguments.network) {
    network = 'hardhat'
  } else {
    network = hardhatArguments.network
  }

  const Dai = await ethers.getContractFactory("Dai");
  const daiInitialSupply = 1000000;
  const dai = await Dai.connect(singer).deploy(daiInitialSupply);
  console.log(`Dai deployed to ${dai.address}`);

  const daiJson = {
    [network as string]:  dai.address
  }
  fs.writeFileSync(
    `scripts/address/${network}/Dai.json`,
    JSON.stringify(daiJson, null, 2),
    "utf8"
  );
  await dai.deployed();

  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.connect(singer).deploy();
  console.log(`Verifier deployed to ${verifier.address}`);

  const verifierJson = {
    [network as string]:  verifier.address
  }
  fs.writeFileSync(
    `scripts/address/${network}/Verifier.json`,
    JSON.stringify(verifierJson, null, 2),
    "utf8"
  );
  await verifier.deployed();

  const Zkafi = await ethers.getContractFactory('Zkafi')
  const zkafi = await Zkafi.connect(singer).deploy(dai.address, verifier.address)
  console.log(`Zkafi deployed to ${zkafi.address}`)

  const zkafiJson = {
    [network as string]:  zkafi.address
  }
  fs.writeFileSync(
    `scripts/address/${network}/Zkafi.json`,
    JSON.stringify(zkafiJson, null, 2),
    "utf8"
  );
  await zkafi.deployed();
};

main()
  .then()
  .catch((error) => {
    console.error(error);
  });
