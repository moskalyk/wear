import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import fetch from 'node-fetch'
import * as openpgp from 'openpgp';

const PORT = process.env.PORT || 3000
const app = express();

const CLIENT_URL = 'http://localhost:3002'
const corsOptions = {
    origin: CLIENT_URL,
};

let db = {}
  
app.use(cors(corsOptions));

const wait = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
}

const getImageDataFromTokenID = async (baseURL: string, tokenID: number) => {
    const res = await fetch(`${baseURL}${tokenID}.json`)
    const data = await res.text()
    const image = JSON.parse(data).image
    const res2 = await fetch(image)
    const buf = await res2.buffer()
    return buf
}

const shieldTokenIdFromCID = async (contractAddress: string, tokenID: number) => {
    let metadata;

    // TODO: deploy contract

    // get baseURL from contract
    const baseURL = 'https://bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou.ipfs.nftstorage.link/'

    // return local clear image metadata using tokenID
    const image = await getImageDataFromTokenID(baseURL, tokenID)
    console.log(image)

    // encrypt image metadata with openpgp public keys

    // package metadata from across collection into CAR

    // write CAR to IPFS

    return image
}

app.use(bodyParser.json())

app.get('/testImage', async (req, res) => {

    const plaintext = await shieldTokenIdFromCID('0x', 0)

    const message = await openpgp.createMessage({ text: (JSON.stringify(plaintext)) });

    const publicKeys = await Promise.all([db['pkey'].publicKey].map(armoredKey => openpgp.readKey({ armoredKey })));

    const encrypted = await openpgp.encrypt({
        message: message, // input as Message object
        encryptionKeys: publicKeys,
        // signingKeys: privateKey // optional
    });

    res.send({encrypted:  encrypted})
});

app.post('/addKey', async (req, res) => {
    res.set('Content-Type', 'json/application');
    db['pkey'] = req.body.pkey
    res.send({status: 200})
});

app.listen(PORT, async () => {
    console.log(`listening on port: ${PORT}`)
})