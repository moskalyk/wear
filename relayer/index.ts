import * as dotenv from "dotenv";
import { ethers } from 'ethers'
import { sequence } from '0xsequence'
import { RpcRelayer } from '@0xsequence/relayer'
import { Wallet } from '@0xsequence/wallet'
import { SequenceIndexerClient } from '@0xsequence/indexer'
import * as openpgp from 'openpgp';

import {fetch} from 'cross-fetch'

import { Web3Storage, File } from 'web3.storage'

import { abi } from './abi'
const fs = require('fs').promises;

function getAccessToken () {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  // return 'paste-your-token-here'

  // In a real app, it's better to read an access token from an
  // environement variable or other configuration that's kept outside of
  // your code base. For this to work, you need to set the
  // WEB3STORAGE_TOKEN environment variable before you run your code.
  return process.env.WEB3STORAGE_TOKEN!
}

function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}

async function storeFiles (files: any) {
    const client = makeStorageClient()
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)
    return cid
}

dotenv.config();

const Corestore = require('corestore')
const store = new Corestore('./contact-book')
const core = store.get({ name: 'core', valueEncoding: 'json' })
const pgpKeys = store.get({ name: 'pgp', valueEncoding: 'json' })

const serverPrivateKey = process.env!.pkey!

// Get a provider
const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai')

// Create your server EOA
const walletEOA = new ethers.Wallet(serverPrivateKey, provider)

// Create your rpc relayer instance with relayer node you want to use
const relayer = new RpcRelayer({url: 'https://mumbai-relayer.sequence.app', provider: provider})

const getAddress = async () => {
    const wallet = (await Wallet.singleOwner(walletEOA)).connect(provider, relayer)
    return await wallet.getAddress()
}

const getBalance = async () => {
    const indexer = new SequenceIndexerClient('https://mumbai-indexer.sequence.app')

    // gets the native token balance
    const balance = await indexer.getEtherBalance({
        accountAddress: await getAddress(),
    })
        
    return balance.balance.balanceWei
}

const auth = async (sequenceWalletAddress: string, ethAuthProofString: string) => {

    const chainId = 'mumbai'
    const walletAddress = sequenceWalletAddress

    const api = new sequence.api.SequenceAPIClient('https://api.sequence.app')
    
    const { isValid } = await api.isValidETHAuthProof({
        chainId, walletAddress, ethAuthProofString
    })

    console.log(isValid)

    if(!isValid) throw new Error('invalid wallet auth')

    return isValid

}

const getWalletKey = async (address: string) => {
    for await (const el of pgpKeys.createReadStream()) {
        if(el.address == address) return el.key
    }
    return null
}

const addWalletKey = async (address: string, key: string) => {
    await pgpKeys.append({address: address, key: key})
}

const addContact = async (address: string, contact: string) => {
    await core.append({address: address, contact: contact})
}

const getContacts = async (address: string) => {
    const contacts = []
    for await (const el of pgpKeys.createReadStream()) {
        console.log(el)
        contacts.push(el.key)
    }
    return contacts
}

function removeLastFiveChars(str: string) {
    return str.substring(0, str.length - (5 + 32));
}

async function generateKeyPair() {
    const res = await openpgp.generateKey({
        userIDs: [{ name: 'tester', email: 'test@example.com' }], // Identity information
        curve: 'ed25519', // Key type and curve
        passphrase: 'testing', // Passphrase to protect the private key
    });
    return res
}

async function readFileAsBuffer(filePath) {
  try {
    const data = await fs.readFile(filePath)
    console.log(data)
    return data
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

const readLocalTokenID = async (tokenID: string) => {
    const image = await readFileAsBuffer(`./imgs/${tokenID}.png`)
    return image
}

const getMetaDataFromTokenID = async (baseURL: string, tokenID: number) => {
    const res = await fetch(`${baseURL}${tokenID}.json`)
    const data = await res.text()
    return JSON.parse(data)
}

const getImageDataFromTokenID = async (baseURL: string, tokenID: number) => {
    console.log(`${baseURL}${tokenID}.json`)
    const res = await fetch(`${baseURL}${tokenID}.json`)
    const data = await res.text()
    const image = JSON.parse(data).image
    const res2 = await fetch(image)
    const buf = await res2.arrayBuffer()
    return buf
}

const executeTx = async (ethAuthProofString: string, walletAddress: string, tokenID: any) => {

    // get public keys from address + and public key from address
    const contacts = await getContacts(walletAddress)

    // create encryption from metadata and public keys
    const publicKeys = await Promise.all(contacts.map(armoredKey => openpgp.readKey({ armoredKey })));

    const contractAddress = '0x99AB4d7B127311072e5D159BB30BDf20669aA1a4'
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const metadata_old = await contract.tokenURI(0)
    console.log(metadata_old)
    const NFTs = 12;
    const priorMetadata = removeLastFiveChars(metadata_old);

    const plaintext = readLocalTokenID(tokenID)
    const message = await openpgp.createMessage({ text: (JSON.stringify(plaintext)) });

    const encrypted = await openpgp.encrypt({
        message, // input as Message object
        encryptionKeys: publicKeys,
    });

    console.log(encrypted)
      
    let files = []

    for(let i = 0; i < NFTs; i++){
        const metadata = await getMetaDataFromTokenID(priorMetadata, i)

        if(i != tokenID) {

            const obj = { 
                name: metadata.name,
                image: metadata.image,
                description: metadata.description,
            }

            const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
            files.push(new File([blob], `${i}.json`))
        } else {
            // encrypt tokenID with publicKey
            console.log(`PROCESSING ${tokenID}`)
            const obj = { 
                name: metadata.name,
                image: encrypted,
                description: metadata.description,
            }

            const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' })
            files.push(new File([blob], `${i}.json`))
        }
    }

    const cid = await storeFiles(files)
    console.log(cid)

    const wallet = (await Wallet.singleOwner(walletEOA)).connect(provider, relayer)

    const erc721TokenAddress = '0x99AB4d7B127311072e5D159BB30BDf20669aA1a4'

    const erc721Interface = new ethers.utils.Interface([
        'function collectNFT(address address_, string memory baseURI, uint id_) onlyMinter external'
    ])

    const data = erc721Interface.encodeFunctionData(
        'collectNFT', [walletAddress, `https://${cid}.ipfs.w3s.link/`, tokenID]
    )
    
    // bafybeieia4q7occi7m7zniyv544u6se4bfmq6lgo4dwxhwebytm7mjtboy

    const txn = {
        to: erc721TokenAddress,
        data
    }

    let txnResponse;
    try {
        txnResponse = await wallet.sendTransaction(txn)
        console.log(txnResponse)
    }catch(err){
        console.log(err)
    }

    return {transactionHash: txnResponse}

}

export {
    addContact,
    getAddress,
    getBalance,
    executeTx,
    addWalletKey,
    getWalletKey
}