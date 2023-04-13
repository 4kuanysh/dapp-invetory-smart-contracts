require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: ["0x1764169b720b1f2bbf05720fae001685832b8e91451daab75e905b40be1a2c58"],
    },
  },
};