import { useState } from 'react';
import axios from 'axios';

function App() {
  const [wallet, setWallet] = useState('');
  const [result, setResult] = useState(null);

  const checkAirdrop = async () => {
    try {
      const res = await axios.post('https://expert-space-carnival-7r4j46xx4973w5qw-5000.app.github.dev/check', { wallet });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Error checking eligibility');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mitosis Airdrop Checker</h1>
      <input
        type="text"
        placeholder="Enter Ethereum wallet"
        value={wallet}
        onChange={e => setWallet(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button onClick={checkAirdrop} className="bg-blue-500 text-white p-2 w-full mb-4">
        Check Eligibility
      </button>

      {result && (
        <div className="border p-4">
          <p><strong>Wallet:</strong> {result.wallet}</p>
          <p><strong>Vault Deposit:</strong> {result.vaultDeposit} ETH</p>
          <p><strong>eETH:</strong> {result.wrappedETH.eETH}</p>
          <p><strong>weETH:</strong> {result.wrappedETH.weETH}</p>
          <p><strong>Referrals:</strong> {result.referrals}</p>
          <p><strong>Twitter Badge:</strong> {result.twitterBadge ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Discord Badge:</strong> {result.discordBadge ? '✅ Yes' : '❌ No'}</p>
          <p><strong>MITO Points:</strong> {result.mitoPoints}</p>
          <p><strong>Eligible:</strong> {result.eligible ? '✅ Yes' : '❌ No'}</p>
        </div>
      )}
    </div>
  );
}

export default App;
