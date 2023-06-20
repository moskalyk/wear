import fetch_ from 'cross-fetch';
import * as openpgp from 'openpgp';

import IPFS from 'ipfs-core';

// const IPFS = require('ipfs-core');

async function generateKeyPair() {
    const res = await openpgp.generateKey({
        userIDs: [{ name: 'snoop', email: 'snoop.dog@example.com' }], // Identity information
        curve: 'ed25519', // Key type and curve
        passphrase: 'your-passphrase', // Passphrase to protect the private key
    });
    return res
}

(async () => {

    const user1 = await generateKeyPair()

    // const res1 = await fetch_('http://localhost:3000/addKey', {
    //     method: "post",
    //     headers: {
    //         "content-type": "application/json",
    //       },
    //     //make sure to serialize your JSON body
    //     body: JSON.stringify({
    //       wallet: '0xbabe',
    //       key: user1.publicKey
    //     })
    // })

    // const json = await res1.json();
    // console.log(json)

    // const res2 = await fetch_('http://localhost:3000/getKey', {
    //     method: "post",
    //     headers: {
    //         "content-type": "application/json",
    //       },
    //     //make sure to serialize your JSON body
    //     body: JSON.stringify({
    //       wallet: '0xbabe'
    //     })
    // })

    // const json2 = await res2.json();
    // console.log(json2)

    // const res = await fetch_('http://localhost:3000/transaction', {
    //     method: "post",
    //     headers: {
    //         "content-type": "application/json",
    //       },
    //     //make sure to serialize your JSON body
    //     body: JSON.stringify({
    //       wallet: '0xbabe',
    //       sig: '0x',
    //       tokenID: 0
    //     })
    // })

    // console.log(res)
    // const json = await res.json();
    // console.log(json)

    // const ipfs = IPFS.create({ host: 'ipfs.io', port: 443, protocol: 'https' });
    // async function getFileNamesFromCAR(cid) {
    //     const carFile = await ipfs.get(cid);
        
    //     // Iterate over the files in the CAR
    //     for await (const file of carFile) {
    //       // Get the file name
    //     //   const fileName = file;
    //       console.log(file);
    //     }
    //   }
      // async function readCAR(cid) {
      //   const ipfs = await IPFS.create();
      
      //   try {
      //     const { value } = await ipfs.dag.get(cid);
      
      //     // Assuming the CAR folder is a UnixFS directory node
      //     if (value && value.type === 'directory') {
      //       // Iterate over the links in the directory
      //       for (const link of value.links) {
      //         console.log(link.name); // Output the file name
      //       }
      //     }
      //   } catch (error) {
      //     console.error('Error reading CAR folder:', error);
      //   }
      // }

      const node = await IPFS.create()

      const cid = 'bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou'; // Replace with the actual CID of the CAR folder

const stream = node.cat(cid)
const decoder = new TextDecoder()
let data = ''

for await (const chunk of stream) {
  // chunks of data are returned as a Uint8Array, convert it back to a string
  data += decoder.decode(chunk, { stream: true })
}

console.log(data)
      
      // readCAR(cid);

    // getFileNamesFromCAR();
    // const res = await fetch_('https://bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou.ipfs.nftstorage.link/')

    // const buffer = await res.arrayBuffer()


    // Assuming you have the ArrayBuffer named 'buffer' containing the CAR file content
    // const uint8Array = new Uint8Array(buffer);
    // const carReader = await CarReader.fromIterable(uint8Array as any);
    // const roots = await carReader.getRoots()

    // 'roots' is an array of the root CIDs of the CAR file

    // // Iterate over the roots to get the file names
    // for (const root of roots) {
    //     console.log(root)
    //     const { bytes } = await carReader.get(root);
    //     console.log(bytes)
    // // 'bytes' is the content of a root block

    // // Process the root block to extract file names
    // }

})();