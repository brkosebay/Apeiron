const hre = require("hardhat");

async function main() {
  const Apeiron = await hre.ethers.getContractFactory("Apeiron");
  const apeiron = await Apeiron.deploy();

  await apeiron.deployed();

  console.log("Apeiron deployed to: ", apeiron.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
