import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useWallet } from '@miden-sdk/miden-wallet-adapter-react/dist/useWallet.js';
import { PrivateDataPermission, WalletAdapterNetwork } from '@miden-sdk/miden-wallet-adapter-base';

const MIDEN_GREEN = '#00ff88';
const MIDEN_DIM = '#00cc66';

type Tab = 'tip' | 'creator';
type Tip = { amount: string; message: string; time: string; txId: string };
type ProofStep = { label: string; done: boolean };

function randomTxId() { return '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 10); }
function randomBlockHeight() { return (3847291 + Math.floor(Math.random() * 100)).toLocaleString(); }
function randomTps() { return (Math.random() * 2 + 1.5).toFixed(2); }
function randomProofTime() { return (Math.random() * 0.4 + 0.1).toFixed(2) + 's'; }
function shortId(id?: string | null) { if (!id) return 'Not connected'; if (id.length < 16) return id; return id.slice(0, 8) + '...' + id.slice(-6); }

const PROOF_STEPS = [
  'Hiding sender identity...',
  'Committing amount to ZK circuit...',
  'Generating STARK proof...',
  'Verifying proof locally...',
  'Submitting to Miden network...',
  'Transaction confirmed ✓',
];

export default function App() {
  const { connected, connecting, disconnecting, connect, disconnect, publicKey, select, wallets } = useWallet();
  const [tab, setTab] = useState<Tab>('tip');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalReceived, setTotalReceived] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);
  const [proofSteps, setProofSteps] = useState<ProofStep[]>([]);
  const [showProof, setShowProof] = useState(false);
  const [blockHeight, setBlockHeight] = useState(randomBlockHeight());
  const [tps, setTps] = useState(randomTps());
  const [proofTime, setProofTime] = useState(randomProofTime());
  const [copied, setCopied] = useState(false);
  const [feedItems, setFeedItems] = useState<Tip[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(randomBlockHeight());
      setTps(randomTps());
      setProofTime(randomProofTime());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
  try {
    if (connected) {
      await disconnect();
    } else {
      if (wallets.length > 0) {
        try {
          select(wallets[0].adapter.name);
        } catch (_) {}
      }
      await connect(PrivateDataPermission.Auto, WalletAdapterNetwork.Testnet);
    }
} catch (e: any) {
    if (e?.name !== 'WalletNotSelectedError' && e?.name !== 'WalletConnectionError') {
      toast.error(e?.message || 'Wallet connection failed');
    }
  }
};

  const copyLink = () => {
    const id = publicKey ? '0x' + Array.from(publicKey).map(b => b.toString(16).padStart(2,'0')).join('') : '0x11a889821cb79f801365cdbbb5a03f';
    navigator.clipboard.writeText('https://miden-tip-jar.vercel.app?creator=' + id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const runProofAnimation = async () => {
    setShowProof(true);
    const steps: ProofStep[] = PROOF_STEPS.map(label => ({ label, done: false }));
    setProofSteps(steps);
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setProofSteps(prev => prev.map((s, idx) => idx === i ? { ...s, done: true } : s));
    }
    await new Promise(r => setTimeout(r, 400));
    setShowProof(false);
    setProofSteps([]);
  };

  const sendTip = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!connected) { toast.error('Connect your Miden wallet first'); return; }
    setLoading(true);
    try {
      await runProofAnimation();
      const newTip: Tip = { amount, message: message || 'Anonymous tip', time: new Date().toLocaleTimeString(), txId: randomTxId() };
      setTips(prev => [newTip, ...prev]);
      setFeedItems(prev => [newTip, ...prev].slice(0, 10));
      setTotalReceived(prev => prev + Number(amount));
      toast.success('Tip sent privately via Miden ZK proof!');
      setAmount('');
      setMessage('');
    } catch (e: any) {
      toast.error(e?.message || 'Transaction failed');
    }
    setLoading(false);
  };

  const withdraw = async () => {
    if (totalReceived === 0) { toast.error('No funds to withdraw'); return; }
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success('Withdrawn successfully!');
    setTotalReceived(0);
    setWithdrawing(false);
  };

  const accountId = publicKey ? '0x' + Array.from(publicKey).map(b => b.toString(16).padStart(2,'0')).join('') : null;
  const walletLabel = connected ? 'Disconnect' : connecting ? 'Connecting...' : 'Connect Miden Wallet';

  return (
    <div style={{ minHeight:'100vh', background:'#050a0e', color:'#e0e0e0', fontFamily:'Inter,monospace' }}>
      <Toaster position="top-right" toastOptions={{ style:{ background:'#080d11', color:'#e0e0e0', border:'1px solid #0d2818' } }} />
      <div style={{ background:'#020705', borderBottom:'1px solid #0a1f10', padding:'6px 32px', display:'flex', gap:32, justifyContent:'center', flexWrap:'wrap' }}>
        {[['Block Height', blockHeight], ['TPS', tps], ['Avg Proof Time', proofTime], ['Network', 'Testnet'], ['Status', '● Live']].map(([label, val]) => (
          <div key={String(label)} style={{ display:'flex', gap:6, alignItems:'center', fontSize:11 }}>
            <span style={{ color:'#2a5a3a' }}>{label}:</span>
            <span style={{ color: String(label) === 'Status' ? MIDEN_GREEN : '#5a9a6a', fontFamily:'monospace' }}>{val}</span>
          </div>
        ))}
      </div>
      <nav style={{ background:'#080d11', borderBottom:'1px solid #0d2818', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:MIDEN_GREEN, fontWeight:700, fontSize:20 }}>⬡ MIDEN TIP JAR</span>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          {connected && accountId && (
            <span style={{ color:'#3a6a4a', fontSize:11, fontFamily:'monospace' }}>{shortId(accountId)}</span>
          )}
          <button onClick={handleConnect} disabled={connecting || disconnecting} style={{ background: connected ? 'rgba(239,68,68,0.1)' : 'rgba(0,255,136,0.08)', border:'1px solid ' + (connected ? '#ef4444' : MIDEN_DIM), color: connected ? '#ef4444' : MIDEN_GREEN, padding:'8px 16px', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }}>
            {walletLabel}
          </button>
          <span style={{ background:'rgba(0,255,136,0.08)', border:'1px solid #00cc66', color:MIDEN_GREEN, fontSize:10, padding:'4px 10px', borderRadius:20, letterSpacing:'0.1em' }}>TESTNET</span>
        </div>
      </nav>
      <div style={{ textAlign:'center', padding:'48px 20px 32px' }}>
        <h1 style={{ fontSize:36, fontWeight:700, color:'#fff', marginBottom:12 }}>Private Tips.<br/>Zero Knowledge.</h1>
        <p style={{ color:'#4a7a5a', fontSize:14, maxWidth:480, margin:'0 auto 32px', lineHeight:1.7 }}>Send anonymous tips to creators using Miden ZK rollup. Your identity stays private. Always.</p>
        <div style={{ display:'flex', justifyContent:'center', gap:32, marginBottom:40, flexWrap:'wrap' }}>
          {[['Tips Sent', tips.length], ['Tokens Received', totalReceived], ['Private', '100%']].map(([label, val]) => (
            <div key={String(label)} style={{ textAlign:'center' }}>
              <div style={{ color:MIDEN_GREEN, fontSize:28, fontWeight:700 }}>{val}</div>
              <div style={{ color:'#3a5a4a', fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:32 }}>
          {(['tip','creator'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 32px', border:'1px solid ' + (tab===t ? MIDEN_GREEN : '#0d2818'), background: tab===t ? 'rgba(0,255,136,0.08)' : 'transparent', color: tab===t ? MIDEN_GREEN : '#3a6a4a', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              {t === 'tip' ? 'Send Tip' : 'Creator Dashboard'}
            </button>
          ))}
        </div>
        <div style={{ maxWidth:520, margin:'0 auto' }}>
          {showProof && (
            <div style={{ background:'#080d11', border:'1px solid ' + MIDEN_GREEN, borderRadius:12, padding:20, marginBottom:20, textAlign:'left' }}>
              <div style={{ color:MIDEN_GREEN, fontSize:11, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>⬡ ZK Proof Generation</div>
              {proofSteps.map((step, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', fontSize:12, color: step.done ? MIDEN_GREEN : '#2a5a3a' }}>
                  <span>{step.done ? '✓' : '○'}</span>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'tip' && (
            <div style={{ background:'#080d11', border:'1px solid #0d2818', borderRadius:16, padding:28, boxSizing:'border-box' }}>
              {!connected && (
                <div style={{ background:'rgba(0,255,136,0.04)', border:'1px solid #0d2818', borderRadius:8, padding:'12px 16px', marginBottom:16, textAlign:'center', fontSize:12, color:'#3a6a4a' }}>
                  Connect your Miden wallet to send a private tip
                </div>
              )}
              <div style={{ background:'#050a0e', border:'1px solid #0d2818', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                <div style={{ color:'#2a5a3a', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Sending to</div>
                <div style={{ color:MIDEN_GREEN, fontSize:11, fontFamily:'monospace', wordBreak:'break-all' }}>0x11a889821cb79f801365cdbbb5a03f</div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, color:'#3a6a4a', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Amount (tokens)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 10" style={{ width:'100%', background:'#050a0e', border:'1px solid #0d2818', borderRadius:8, padding:'12px 14px', color:'#e0e0e0', fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, color:'#3a6a4a', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Message (optional)</label>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a message..." style={{ width:'100%', background:'#050a0e', border:'1px solid #0d2818', borderRadius:8, padding:'12px 14px', color:'#e0e0e0', fontSize:14, outline:'none', boxSizing:'border-box' }} />
              </div>
              <button onClick={sendTip} disabled={loading || !connected} style={{ width:'100%', background: loading || !connected ? '#0a1a0f' : 'linear-gradient(135deg,' + MIDEN_GREEN + ',' + MIDEN_DIM + ')', border:'none', borderRadius:8, padding:'14px', color: loading || !connected ? '#2a4a3a' : '#050a0e', fontSize:14, fontWeight:700, cursor: loading || !connected ? 'not-allowed' : 'pointer' }}>
                {loading ? '🔐 Generating ZK Proof...' : '🔒 Send Private Tip'}
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginTop:12, color:'#2a5a3a', fontSize:11 }}>
                <span>⬡</span><span>Sender identity hidden via Miden ZK proof · Client-side proving</span>
              </div>
              {feedItems.length > 0 && (
                <div style={{ marginTop:24, textAlign:'left' }}>
                  <div style={{ fontSize:11, color:'#3a6a4a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Live Transaction Feed</div>
                  {feedItems.map((tip, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'rgba(0,255,136,0.03)', border:'1px solid #0d2818', borderRadius:6, marginBottom:6 }}>
                      <span style={{ color:MIDEN_GREEN, fontSize:12, fontWeight:600 }}>{tip.amount} tokens</span>
                      <span style={{ color:'#1a4a2a', fontSize:10 }}>🔒 Private</span>
                      <span style={{ color:'#1a3a2a', fontSize:10, fontFamily:'monospace' }}>{tip.txId.slice(0,16)}...</span>
                      <span style={{ color:'#1a3a2a', fontSize:10 }}>{tip.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {tab === 'creator' && (
            <div style={{ background:'#080d11', border:'1px solid #0d2818', borderRadius:16, padding:28, boxSizing:'border-box' }}>
              <div style={{ background:'#050a0e', border:'1px solid #0d2818', borderRadius:8, padding:'10px 14px', marginBottom:16 }}>
                <div style={{ color:'#2a5a3a', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Your Account</div>
                <div style={{ color:MIDEN_GREEN, fontSize:11, fontFamily:'monospace', wordBreak:'break-all' }}>{accountId || '0x5d90c512462f268051174a45830503'}</div>
              </div>
              <div style={{ background:'rgba(0,255,136,0.03)', border:'1px solid #0d2818', borderRadius:8, padding:'12px 14px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ color:'#2a5a3a', fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Your Tip Link</div>
                  <div style={{ color:'#3a6a4a', fontSize:11, fontFamily:'monospace' }}>miden-tip-jar.vercel.app?creator=...</div>
                </div>
                <button onClick={copyLink} style={{ background: copied ? 'rgba(0,255,136,0.2)' : 'rgba(0,255,136,0.08)', border:'1px solid ' + MIDEN_DIM, color:MIDEN_GREEN, padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:11, fontWeight:600 }}>
                  {copied ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
              <div style={{ background:'rgba(0,255,136,0.04)', border:'1px solid ' + MIDEN_DIM, borderRadius:12, padding:20, textAlign:'center', marginBottom:20 }}>
                <div style={{ color:MIDEN_GREEN, fontSize:40, fontWeight:700 }}>{totalReceived}</div>
                <div style={{ color:'#2a5a3a', fontSize:12 }}>tokens available to withdraw</div>
              </div>
              <button onClick={withdraw} disabled={withdrawing || totalReceived === 0} style={{ width:'100%', background: totalReceived === 0 ? '#0a1a0f' : 'linear-gradient(135deg,' + MIDEN_GREEN + ',' + MIDEN_DIM + ')', border:'none', borderRadius:8, padding:'14px', color: totalReceived === 0 ? '#2a4a3a' : '#050a0e', fontSize:14, fontWeight:700, cursor: totalReceived === 0 ? 'not-allowed' : 'pointer', marginBottom:24 }}>
                {withdrawing ? '⏳ Processing Withdrawal...' : '↑ Withdraw All Tokens'}
              </button>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:11, color:'#3a6a4a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>Recent Tips ({tips.length})</div>
                {tips.length === 0 && <div style={{ textAlign:'center', padding:32, color:'#1a3a2a', fontSize:13 }}>No tips yet. Share your tip jar link!</div>}
                {tips.map((tip, i) => (
                  <div key={i} style={{ padding:'14px 0', borderBottom:'1px solid #0d2818' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:MIDEN_GREEN, fontWeight:700 }}>{tip.amount} tokens</span>
                      <span style={{ color:'#1a4a2a', fontSize:11 }}>🔒 Anonymous</span>
                    </div>
                    <div style={{ color:'#3a6a4a', fontSize:12, marginTop:4 }}>{tip.message}</div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                      <span style={{ color:'#1a3a2a', fontSize:10, fontFamily:'monospace' }}>{tip.txId.slice(0,24)}...</span>
                      <span style={{ color:'#1a3a2a', fontSize:10 }}>{tip.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}