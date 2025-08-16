require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors()); // Enable CORS for all origins
app.use(express.json());
app.use(cors({
  origin: 'https://expert-space-carnival-7r4j46xx4973w5qw-5173.app.github.dev/'
}));


// Provider
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

// Contract ABIs
const vaultAbi = ["function balanceOf(address owner) view returns (uint256)"];
const tokenAbi = ["function balanceOf(address owner) view returns (uint256)"];
const referralAbi = ["function getReferralCount(address referrer) view returns (uint256)"];
const socialAbi = ["function hasBadge(address owner, string badge) view returns (bool)"];

// Contracts
const vaultContract = new ethers.Contract(process.env.VAULT_CONTRACT, vaultAbi, provider);
const eETHContract = new ethers.Contract(process.env.EETH_CONTRACT, tokenAbi, provider);
const weETHContract = new ethers.Contract(process.env.WEETH_CONTRACT, tokenAbi, provider);
const referralContract = new ethers.Contract(process.env.REFERRAL_CONTRACT, referralAbi, provider);
const socialContract = new ethers.Contract(process.env.SOCIAL_CONTRACT, socialAbi, provider);

// Utility functions
const checkVaultDeposit = async (address) => {
  try {
    const balance = await vaultContract.balanceOf(address);
    return parseFloat(ethers.formatEther(balance));
  } catch {
    return 0;
  }
};

const checkWrappedETH = async (address) => {
  try {
    const eETHBalance = await eETHContract.balanceOf(address);
    const weETHBalance = await weETHContract.balanceOf(address);
    return {
      eETH: parseFloat(ethers.formatEther(eETHBalance)),
      weETH: parseFloat(ethers.formatEther(weETHBalance))
    };
  } catch {
    return { eETH: 0, weETH: 0 };
  }
};

const checkReferrals = async (address) => {
  try {
    const count = await referralContract.getReferralCount(address);
    return parseInt(count);
  } catch {
    return 0;
  }
};

const checkSocialBadge = async (address, badge) => {
  try {
    const hasBadge = await socialContract.hasBadge(address, badge);
    return hasBadge;
  } catch {
    return false;
  }
};

// API endpoint
app.post('/check', async (req, res) => {
  try {
    const { wallet } = req.body;
    if (!wallet || !ethers.isAddress(wallet)) return res.status(400).json({ error: 'Invalid wallet address' });

    const vaultDeposit = await checkVaultDeposit(wallet);
    const wrappedETH = await checkWrappedETH(wallet);
    const referrals = await checkReferrals(wallet);
    const twitterBadge = await checkSocialBadge(wallet, 'Twitter');
    const discordBadge = await checkSocialBadge(wallet, 'Discord');

    // Calculate MITO points
    let mitoPoints = 0;
    if (vaultDeposit > 0) mitoPoints += 50;
    if (wrappedETH.eETH > 0) mitoPoints += 20;
    if (wrappedETH.weETH > 0) mitoPoints += 20;
    mitoPoints += referrals * 5;
    if (twitterBadge) mitoPoints += 10;
    if (discordBadge) mitoPoints += 10;

    const eligible = mitoPoints >= 50;

    res.json({
      wallet,
      vaultDeposit,
      wrappedETH,
      referrals,
      twitterBadge,
      discordBadge,
      mitoPoints,
      eligible
    });
  } catch (err) {
    console.error("Error checking wallet:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
