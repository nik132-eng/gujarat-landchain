// GL-0602: JuliaOS Wallet Create/Restore Flows Implementation
// Sprint 6: JuliaOS Wallet Integration
// Gujarat LandChain × JuliaOS Project

/*
JuliaOS Wallet Management System
- Objective: Secure wallet management with mnemonic support
- Features: Create new wallets, restore existing wallets, secure key storage
- Integration: Foundation for blockchain interactions and transaction signing
*/

import React, { useState, useEffect } from 'react';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from 'bip39';
import { HDNode } from '@ethersproject/hdnode';
import { Wallet } from '@ethersproject/wallet';
import CryptoJS from 'crypto-js';

// JuliaOS Wallet Component
const JuliaOSWallet = () => {
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, create, restore, backup, complete
  const [mnemonic, setMnemonic] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [walletPassword, setWalletPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Create new wallet with BIP39 mnemonic
  const createNewWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Generate 12-word mnemonic phrase
      const newMnemonic = generateMnemonic(128); // 128 bits = 12 words
      setMnemonic(newMnemonic);

      // Derive wallet from mnemonic
      const wallet = await deriveWalletFromMnemonic(newMnemonic);
      setWalletData(wallet);

      // Move to backup step
      setCurrentStep('backup');
    } catch (err) {
      setError('Failed to create wallet. Please try again.');
      console.error('Wallet creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore wallet from mnemonic
  const restoreWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Validate mnemonic phrase
      const cleanMnemonic = mnemonicInput.trim().toLowerCase();
      
      if (!validateMnemonic(cleanMnemonic)) {
        setError('Invalid mnemonic phrase. Please check your words and try again.');
        setIsLoading(false);
        return;
      }

      // Derive wallet from mnemonic
      const wallet = await deriveWalletFromMnemonic(cleanMnemonic);
      setWalletData(wallet);
      setMnemonic(cleanMnemonic);

      // Move to complete step
      setCurrentStep('complete');
    } catch (err) {
      setError('Failed to restore wallet. Please check your mnemonic phrase.');
      console.error('Wallet restoration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive wallet addresses from mnemonic using BIP44 standard
  const deriveWalletFromMnemonic = async (mnemonicPhrase) => {
    try {
      // Generate seed from mnemonic
      const seed = await mnemonicToSeed(mnemonicPhrase);
      
      // Create HD wallet using BIP44 path
      const hdNode = HDNode.fromSeed(seed);
      
      // Derive addresses for different blockchains
      const wallets = {
        ethereum: {
          path: "m/44'/60'/0'/0/0", // Ethereum BIP44 path
          wallet: hdNode.derivePath("m/44'/60'/0'/0/0"),
          address: '',
          privateKey: ''
        },
        solana: {
          path: "m/44'/501'/0'/0'", // Solana BIP44 path
          wallet: hdNode.derivePath("m/44'/501'/0'/0'"),
          address: '',
          privateKey: ''
        },
        polygon: {
          path: "m/44'/60'/0'/0/1", // Polygon (same as Ethereum with different index)
          wallet: hdNode.derivePath("m/44'/60'/0'/0/1"),
          address: '',
          privateKey: ''
        }
      };

      // Extract addresses and private keys
      wallets.ethereum.address = wallets.ethereum.wallet.address;
      wallets.ethereum.privateKey = wallets.ethereum.wallet.privateKey;
      
      wallets.polygon.address = wallets.polygon.wallet.address;
      wallets.polygon.privateKey = wallets.polygon.wallet.privateKey;
      
      // For Solana, we need to derive the address differently
      wallets.solana.address = await deriveSolanaAddress(wallets.solana.wallet.privateKey);
      wallets.solana.privateKey = wallets.solana.wallet.privateKey;

      return {
        id: generateWalletId(),
        created: new Date().toISOString(),
        networks: wallets,
        metadata: {
          name: 'Gujarat LandChain Wallet',
          version: '1.0.0',
          type: 'HD_WALLET'
        }
      };
    } catch (error) {
      throw new Error('Failed to derive wallet: ' + error.message);
    }
  };

  // Derive Solana address from private key
  const deriveSolanaAddress = async (privateKey) => {
    try {
      // In a real implementation, you would use @solana/web3.js
      // For demo purposes, we'll generate a mock Solana address
      const hash = CryptoJS.SHA256(privateKey).toString();
      return `${hash.substring(0, 44)}`; // Mock Solana address format
    } catch (error) {
      throw new Error('Failed to derive Solana address');
    }
  };

  // Generate unique wallet ID
  const generateWalletId = () => {
    return 'wallet_' + CryptoJS.lib.WordArray.random(16).toString();
  };

  // Securely store wallet data
  const secureWalletStorage = async (walletData, password) => {
    try {
      // Encrypt wallet data with user password
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(walletData),
        password
      ).toString();

      // Store encrypted data in localStorage
      localStorage.setItem('juliaos_wallet', encryptedData);
      localStorage.setItem('wallet_metadata', JSON.stringify({
        id: walletData.id,
        created: walletData.metadata,
        networks: Object.keys(walletData.networks)
      }));

      return true;
    } catch (error) {
      console.error('Failed to store wallet:', error);
      return false;
    }
  };

  // Backup verification - shuffle mnemonic words for user to arrange
  const initiateMnemonicVerification = () => {
    const words = mnemonic.split(' ');
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setSelectedWords([]);
  };

  // Handle word selection during backup verification
  const selectWord = (word) => {
    if (selectedWords.length < 12) {
      setSelectedWords([...selectedWords, word]);
      setShuffledWords(shuffledWords.filter(w => w !== word));
    }
  };

  // Remove selected word
  const removeWord = (index) => {
    const word = selectedWords[index];
    setSelectedWords(selectedWords.filter((_, i) => i !== index));
    setShuffledWords([...shuffledWords, word]);
  };

  // Verify backup completion
  const verifyBackup = () => {
    const userMnemonic = selectedWords.join(' ');
    if (userMnemonic === mnemonic) {
      setBackupConfirmed(true);
      setCurrentStep('complete');
    } else {
      setError('Mnemonic phrase verification failed. Please try again.');
      initiateMnemonicVerification();
    }
  };

  // Complete wallet setup
  const completeWalletSetup = async () => {
    if (walletPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (walletPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Store wallet securely
      const stored = await secureWalletStorage(walletData, walletPassword);
      
      if (stored) {
        // Clear sensitive data from memory
        setMnemonic('');
        setMnemonicInput('');
        setWalletPassword('');
        setConfirmPassword('');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        setError('Failed to save wallet. Please try again.');
      }
    } catch (err) {
      setError('Failed to complete wallet setup.');
      console.error('Wallet setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize mnemonic verification when backup step starts
  useEffect(() => {
    if (currentStep === 'backup' && mnemonic) {
      initiateMnemonicVerification();
    }
  }, [currentStep, mnemonic]);

  // Render different steps
  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">JuliaOS Wallet</h1>
        <p className="text-gray-600">Secure multi-chain wallet for Gujarat LandChain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={createNewWallet}
          disabled={isLoading}
          className="p-6 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create New Wallet</h3>
            <p className="text-sm text-gray-600">Generate a new wallet with secure mnemonic phrase</p>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep('restore')}
          className="p-6 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Restore Existing Wallet</h3>
            <p className="text-sm text-gray-600">Import wallet using your mnemonic phrase</p>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Multi-Chain Support:</strong> Supports Ethereum, Polygon, and Solana networks for seamless cross-chain transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestoreStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Restore Your Wallet</h2>
        <p className="text-gray-600">Enter your 12-word mnemonic phrase to restore your wallet</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mnemonic Phrase (12 words)
        </label>
        <textarea
          value={mnemonicInput}
          onChange={(e) => setMnemonicInput(e.target.value)}
          placeholder="Enter your 12-word mnemonic phrase separated by spaces..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="3"
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Security Note:</strong> Never share your mnemonic phrase with anyone. We will never ask for it.
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep('welcome')}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={restoreWallet}
          disabled={isLoading || !mnemonicInput.trim()}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading || !mnemonicInput.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isLoading ? 'Restoring...' : 'Restore Wallet'}
        </button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Backup Your Wallet</h2>
        <p className="text-gray-600">Secure your wallet by backing up your mnemonic phrase</p>
      </div>

      {!backupConfirmed ? (
        <>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Critical:</strong> Write down these words in order and store them safely. This is the only way to recover your wallet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Your Mnemonic Phrase:</h3>
            <div className="grid grid-cols-3 gap-2">
              {mnemonic.split(' ').map((word, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  <span className="text-xs text-gray-500">{index + 1}.</span>
                  <div className="font-mono font-medium">{word}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={initiateMnemonicVerification}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              I've Written It Down - Verify Now
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Your Backup</h3>
            <p className="text-gray-600">Click the words in the correct order to verify your backup</p>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg min-h-[100px]">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Words:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => removeWord(index)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                  >
                    {index + 1}. {word}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Words:</h4>
              <div className="flex flex-wrap gap-2">
                {shuffledWords.map((word, index) => (
                  <button
                    key={index}
                    onClick={() => selectWord(word)}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={verifyBackup}
            disabled={selectedWords.length !== 12}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedWords.length !== 12
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            Verify Backup
          </button>
        </>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Setup Complete</h2>
        <p className="text-gray-600">Set a password to secure your wallet</p>
      </div>

      {walletData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Your Wallet Addresses:</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Ethereum:</span>
              <span className="font-mono text-xs">{walletData.networks.ethereum.address}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Polygon:</span>
              <span className="font-mono text-xs">{walletData.networks.polygon.address}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Solana:</span>
              <span className="font-mono text-xs">{walletData.networks.solana.address.substring(0, 20)}...</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Password
          </label>
          <input
            type="password"
            value={walletPassword}
            onChange={(e) => setWalletPassword(e.target.value)}
            placeholder="Enter a secure password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={completeWalletSetup}
        disabled={isLoading || !walletPassword || walletPassword !== confirmPassword}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isLoading || !walletPassword || walletPassword !== confirmPassword
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? 'Setting Up Wallet...' : 'Complete Setup'}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'welcome' && renderWelcomeStep()}
      {currentStep === 'restore' && renderRestoreStep()}
      {currentStep === 'backup' && renderBackupStep()}
      {currentStep === 'complete' && renderCompleteStep()}

      <div className="mt-8 text-xs text-gray-500 text-center">
        🔒 Secured by JuliaOS • BIP44 Standard • Multi-Chain Compatible
      </div>
    </div>
  );
};

export default JuliaOSWallet;
