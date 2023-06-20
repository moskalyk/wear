import express from 'express'
import bodyParser from 'body-parser'
import {executeTx, getAddress, getBalance, addContact, addWalletKey, getWalletKey } from '.';
import { getWallet } from '0xsequence';
import cors from 'cors'
import async from 'async'

// const async = require('async');

const PORT = process.env.PORT || 3000
const app = express();

const CLIENT_URL = 'http://localhost:3000'
const corsOptions = {
    origin: CLIENT_URL,
};
  
app.use(cors(corsOptions));

const wait = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
}

app.use(bodyParser.json())

const processTransaction = async (transaction: any, callback: any) => {
    // Process the transaction logic here
    console.log('Running Tx in Queue...')
    console.log(transaction)

    // const contacts = await getContactsByKey(transaction.wallet)
    // console.log(contacts)

    const tx = await executeTx(
        transaction.sig,
        transaction.wallet, 
        transaction.tokenID
        // contacts
    )
    // ...
    // await wait(1000)
    // Call the callback function to signal completion
    callback(tx);
};

const transactionQueue = async.queue(processTransaction, 1);

app.post('/transaction', (req: any, res: any) => {
    const transactionData = req.body;
    console.log(req.body)
    transactionQueue.push(transactionData, (tx: any, err: any) => {
        console.log(err)
        console.log(tx)
      if (err) {
        console.error('Error processing transaction:', err);
        res.status(500).send('Error processing transaction.');
      } else {
        console.log('Transaction processed successfully.');
        console.log(tx)
        res.status(200).send({tx: tx.transactionHash })
      }
    });
});

// app.post('/transaction', async (req: any, res: any) => {
//     try{
//         const tx = await executeTx(
//                             req.body.sequenceWallet, 
//                             req.body.sig,
//                             req.body.tokenID
//                         )
//         res.send({tx: tx.transactionHash, status: 200})
//     }catch(e){
//         res.send({msg: e, status: 500})
//     }
// })

// app.post('/addContact', async (req, res) => {
//     await addContact(req.body.wallet, req.body.contact)
//     res.status(200).send({contacts: await getContactsByKey(req.body.wallet)})
// })

app.post('/addKey', async (req: any, res: any) => {
    console.log('-----')
    console.log(req.body)
    console.log('-----')
    await addWalletKey(req.body.wallet, req.body.key)
    res.status(200).send({key: await getWalletKey(req.body.wallet)})
})

app.post('/getKey', async (req: any, res: any) => {
    res.status(200).send({key: await getWalletKey(req.body.wallet)})
})

app.get('/queue/position', async (req: any, res: any) => {
    const transaction = req.body;
    const transactionPosition = (transactionQueue as any).indexOf(transaction);
    res.status(200).json({ position: transactionPosition });
});

app.listen(PORT, async () => {
    console.log(`listening on port: ${PORT}`)
    console.log(`relaying from this sequence wallet: ${await getAddress()}`)
})