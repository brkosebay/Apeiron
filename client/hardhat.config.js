require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  paths:{
    artifacts: "./src/artifacts"
  },
  networks: {
    goerli:{
      url: "https://eth-goerli.g.alchemy.com/v2/m5drdpIP7V0YHhCyQsj3F29pmdr6RTLb",
      accounts: ["1230d8981c74f4b7b3a549cd0fd7dd366e445d5c2a41a6e66b536e086be863d9",
    "1230d8981c74f4b7b3a549cd0fd7dd366e445d5c2a41a6e66b536e086be863d9"]
    },
    hardhat:{
      chainId: 1337,
    }
  }
};
