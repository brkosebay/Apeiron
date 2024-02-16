const hre = require("hardhat");

async function main() {
  const Apeiron = await hre.ethers.getContractFactory("Apeiron");

  // Set the royalty receiver address and royalty percentage
  const royaltyReceiver = "wallet_address"; // Replace with the actual address
  const royaltyPercentage = 500; // Set the royalty percentage (50% in this example)

  const apeiron = await Apeiron.deploy(royaltyReceiver, royaltyPercentage);

  await apeiron.deployed();

  console.log("Apeiron deployed to: ", apeiron.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
