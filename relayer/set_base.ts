import * as dotenv from "dotenv";
import { ethers } from 'ethers'
import { sequence } from '0xsequence'
import { RpcRelayer } from '@0xsequence/relayer'
import { Wallet } from '@0xsequence/wallet'

dotenv.config();

const serverPrivateKey = process.env!.pkey!

// Get a provider
const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai')

// Create your server EOA
const walletEOA = new ethers.Wallet(serverPrivateKey, provider)

// Create your rpc relayer instance with relayer node you want to use
const relayer = new RpcRelayer({url: 'https://mumbai-relayer.sequence.app', provider: provider});

(async () => {
    console.log('txn')

    const wallet = (await Wallet.singleOwner(walletEOA)).connect(provider, relayer)

    const erc721TokenAddress = '0x99AB4d7B127311072e5D159BB30BDf20669aA1a4'

    const erc721Interface = new ethers.utils.Interface([
        'function setBaseURI(string memory baseURI_) onlyMinter public'
    ])

    const data = erc721Interface.encodeFunctionData(
        'setBaseURI', [`https://bafybeibcrci3cgtxzq6i5i2afrq3a2iym2sgytqim4ovps6a5h4nio7l54.ipfs.w3s.link/`]
    )
    
    const txn = {
        to: erc721TokenAddress,
        data
    }
    console.log(txn)

    let txnResponse;
    try {
        txnResponse = await wallet.sendTransaction(txn)
        console.log(txnResponse)
    }catch(err){
        console.log(err)
    }
    // function setBaseURI(string memory baseURI_) onlyMinter public
})()