import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as openpgp from 'openpgp';
import { Buffer } from 'buffer';
// import fetch from 'node-fetch'

async function generateKeyPair(pass_phrase: string, ppe: string) {
  const res = await openpgp.generateKey({
      userIDs: [{ email: ppe }], // Identity information
      curve: 'ed25519', // Key type and curve
      passphrase: pass_phrase, // Passphrase to protect the private key
  });
  return res
}

const getImageDataFromTokenID = async (baseURL: string, tokenID: number) => {
  const res = await fetch(`${baseURL}${tokenID}.json`)
  const data = await res.text()
  const image = JSON.parse(data).image
  const res2 = await fetch(image)
  const buf = await res2.blob()
  return buf
}

function App() {
  const [img, setImg] = React.useState<any>(null)

  const convertBufferToBase64 = (buffer: any) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  };

  const getImage = async () => {
    console.log('create')

    await create()
    console.log('getting image')
    // const test = await getImageDataFromTokenID('https://bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou.ipfs.nftstorage.link/', 0)
    if(localStorage.getItem('pkey') != null){
      console.log('in pkey')

      const res1 = await fetch('http://localhost:4000/testImage')
      const json: any = await res1.json()

      const publicKey = JSON.parse(localStorage.getItem('pkey')!).publicKey

      const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: JSON.parse(localStorage.getItem('pkey')!).privateKey }),
        passphrase: 'passphrase'
      });

      const rawData = (await openpgp.decrypt({
        message: await openpgp.readMessage({ armoredMessage: json.encrypted }),
        verificationKeys: publicKey,
        decryptionKeys: privateKey
      })).data;

        // Create a data URL for the decrypted image
        const decryptedUrl = URL.createObjectURL(new Blob([Buffer.from(JSON.parse(rawData as string).data)], { type: 'image/png' }));
        console.log(decryptedUrl)

    setImg(decryptedUrl)
  }

  }
  React.useEffect(() => {
    getImage()
  }, [])

  const create = async () => {
    const key = await generateKeyPair('passphrase', 'mm@horizon.io')
    console.log('testing1')
    localStorage.setItem('pkey', JSON.stringify(key))
    console.log('testing2')
    const res1 = await fetch('http://localhost:4000/addKey', {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({pkey: key})
    })
    console.log(res1)
  }
  return (
    <div className="App">
      <button onClick={create}>create key</button>
      <br/> 
      <p>rendering encrypted image</p>
      <img src={img}/>
    </div>
  );
}

export default App;
