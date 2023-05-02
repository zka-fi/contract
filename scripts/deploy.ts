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

  let feeData = await ethers.provider.getFeeData()

  const Dai = await ethers.getContractFactory("Dai");
  const daiInitialSupply = ethers.BigNumber.from('1000000000000000000000000');
  const dai = await Dai.connect(singer).deploy((daiInitialSupply));
  console.log(`Dai deployed to ${dai.address}`);

  fs.mkdirSync(`scripts/address/${network}/`, { recursive: true });

  console.log(`Dai deployed to ${dai.address}`);
  const daiJson = {
    [network as string]: dai.address
  }

  if (!fs.existsSync(`scripts/address/${network}`)) {
    fs.mkdirSync(`scripts/address/${network}`);
  }
  fs.writeFileSync(
    `scripts/address/${network}/Dai.json`,
    JSON.stringify(daiJson, null, 2),
    "utf8"
  );
  await dai.deployed();

  feeData = await ethers.provider.getFeeData()

  const Verifier = await ethers.getContractFactory("Verifier");
  const verifier = await Verifier.connect(singer).deploy({
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas,
    gasLimit: 4000000,
  });

  console.log(`Verifier deployed to ${dai.address}`);
  const verifierJson = {
    [network as string]:  verifier.address
  }
  fs.writeFileSync(
    `scripts/address/${network}/Verifier.json`,
    JSON.stringify(verifierJson, null, 2),
    "utf8"
  );
  await verifier.deployed();

  feeData = await ethers.provider.getFeeData()

  const Zkafi = await ethers.getContractFactory('Zkafi')
  const zkafi = await Zkafi.connect(singer).deploy(dai.address, verifier.address, {
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    maxFeePerGas: feeData.maxFeePerGas,
    gasLimit: 4000000,
  })

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
