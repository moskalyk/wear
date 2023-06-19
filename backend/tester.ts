import {fetch} from 'cross-fetch'
import * as openpgp from 'openpgp';

const getImageDataFromTokenID = async (CID: string, tokenID: number) => {
    const res = await fetch(`https://${CID}.ipfs.nftstorage.link/${tokenID}.json`)
    const data = await res.text()
    const image = JSON.parse(data).image
    const res2 = await fetch(image)
    return await res2.arrayBuffer()
}

const shieldTokenIdFromCID = async (contractAddress: string, tokenID: number) => {
    let metadata;

    // get baseURL from contract

    // return local clear image metadata using tokenID
    const image = await getImageDataFromTokenID('bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou', tokenID)
    console.log(image)
    // test in frontend

    // encrypt image metadata with openpgp public keys

    // package metadata from across collection into CAR

    // write CAR to IPFS

    return metadata
}


async function generateKeyPair(pass_phrase: string, ppe: string) {
    const res = await openpgp.generateKey({
        userIDs: [{ email: ppe }], // Identity information
        curve: 'ed25519', // Key type and curve
        passphrase: pass_phrase, // Passphrase to protect the private key
    });
    return res
}

async function isEncryptedMessage(encrypted) {
    try {
        const encryptedMessage = await openpgp.readMessage({
            armoredMessage: encrypted // parse encrypted bytes
        });
      return true;
    } catch (error) {
      return false;
    }
  }

(async () => {

    // shieldTokenIdFromCID('0x', 0)

    // user 1
    const user1 = await generateKeyPair('tester', 'mm@horizon.io')

    // encrypt
    const message = await openpgp.createMessage({ text: 'plaintext' });

    const publicKeys = await Promise.all([user1.publicKey].map(armoredKey => openpgp.readKey({ armoredKey })));

    const encrypted = await openpgp.encrypt({
        message: message, // input as Message object
        encryptionKeys: publicKeys,
        // signingKeys: privateKey // optional
    });

    console.log(await isEncryptedMessage('encrypted'))
    // user 2
    const user2 = await generateKeyPair('tester', 'mm@horizon.io')

    // decrypt with try / catch

    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: user2.privateKey}),
        passphrase: 'tester'
      });

    try {
        const rawData = (await openpgp.decrypt({
            message: await openpgp.readMessage({ armoredMessage: encrypted }),
            verificationKeys: user2.publicKey as any,
            decryptionKeys: privateKey
          })).data;
    
        console.log(rawData)
    }catch(e){
        console.log(e)
    }   


    // for(let i = 0; i < 12; i++){
    //     const ipfsGatewayURL = `https://bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou.ipfs.nftstorage.link/${i}.json`;

    //     fetch(ipfsGatewayURL)
    //         .then(response => response.text())
    //         .then(content => {
    //             // Process and use the content as needed
    //             console.log(JSON.parse(content).image);
    //             fetch(JSON.parse(content).image)
    //                 .then(response => response.text())
    //                 .then(content => {
    //                     console.log(content)
    //                 })
    //         })
    //         .catch(error => {
    //             // Handle any errors that occurred during fetching
    //             console.error(error);
    //         });
    // }
})();