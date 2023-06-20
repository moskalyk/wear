import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import { ethers } from 'ethers'

import { sequence } from '0xsequence'
import Marquee from "react-fast-marquee"

import img0 from './imgs/0.png'
import img1 from './imgs/1.png'
import img2 from './imgs/2.png'
import img3 from './imgs/3.png'
import img4 from './imgs/4.png'
import img5 from './imgs/5.png'
import img6 from './imgs/6.png'
import img7 from './imgs/7.png'
import img8 from './imgs/8.png'
import img9 from './imgs/9.png'
import img10 from './imgs/10.png'
import img11 from './imgs/11.png'

import * as openpgp from 'openpgp';

import noise from './static_noise.gif'
import blackout from './black_out.png'
import whiteout from './whiteout.png'

import { abi } from './abi'

import { Box, Card, Text, Button, useTheme, Spinner, Breadcrumbs, GradientAvatar} from '@0xsequence/design-system'

import hanger from './hanger.png'

import {random} from './treenames'

const provider = new ethers.providers.JsonRpcProvider('https://nodes.sequence.app/mumbai')

const Footer = (props: any) => {
  const [collections, setCollections] = useState<any>([])
  const [collectionView, setCollectionView] = useState<any>('')
  const seeCollection = (id: string) => {
    setCollectionView(id)
  }
  useEffect(() => {
    const collectionsRes = ['#0001', '#0002', ]
    collectionsRes.map((id: string) => {
      setCollections((prev: any) => [...prev, <p className='footer-collection' onClick={() => {console.log('testing');props.setId(id);props.setNav(3)}}>&nbsp; • &nbsp;{id}</p>])
    })
  }, [])

  return (
    <>
      <Marquee className='footer'>collections {collections}</Marquee>
    </>
  )
}

function removeLastFiveChars(str: string) {
  return str.substring(0, str.length - (5+32));
}

const getMetaDataFromTokenID = async (baseURL: string, tokenID: number) => {
  const res = await fetch(`${baseURL}${tokenID}.json`)
  const data = await res.text()
  return JSON.parse(data)
}

let do_ = true; // singing
const collectiblesOld: any = [img0,img1,img2,img3,img4,img5,img6,img7,img8,img9,img10,img11]
// let enabled = [0,1,2,2,0,2,0,1,0,2,1,0] // 0=seen,1=friendly,2=noise 
let enabled: any = [] // 0=seen,1=friendly,2=noise 

const checkForDecryptable = async (encryptedMaybe: any) => {
  console.log(encryptedMaybe)
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: JSON.parse(localStorage.getItem('pkey')!).privateKey }),
    passphrase: 'test'
  });

  await openpgp.decrypt({
    message: await openpgp.readMessage({ armoredMessage: encryptedMaybe }),
    verificationKeys: JSON.parse(localStorage.getItem('pkey')!).publicKey,
    decryptionKeys: privateKey
  })
  return true;
}

const Collection = (props: any) => {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState<any>(null)
  const [collectibles, setCollectibles]: any = useState<any>([]);
  const [checkedOut, setCheckedOut] = useState<any>(null)
  const [init, setInit] = useState<any>(false)
  const [hovering, setHovering] = useState<any>(false)
  const [loading, setLoading] = useState<any>(false)

  const getMetadata = async () => {
    const contractAddress = '0x99AB4d7B127311072e5D159BB30BDf20669aA1a4'
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const metadata_old = await contract.tokenURI(0)
    const NFTs = 12;
    // // get new metadata CID hash
    const priorMetadata = removeLastFiveChars(metadata_old);
    let collectiblesNu: any = []
    for(let i = 0; i< 12; i++){
      const plaintext = await getMetaDataFromTokenID(priorMetadata,i)
      try{
        console.log(plaintext.image.substring(0, 3))
        if(plaintext.image.substring(0, 3) == 'htt'){
          enabled.push(1)
          collectiblesNu.push(collectiblesOld[i])
        } else{
          const isEncrypted = await checkForDecryptable(plaintext.image)
          enabled.push(2)
          collectiblesNu.push(collectiblesOld[i])
        }
      }catch(err){
        enabled.push(0)
        collectiblesNu.push(blackout)
      }
    }



    setCollectibles(collectiblesNu.map((collectible: any, i: any) => {
      if(enabled[i] == 1) return collectible
      else if(enabled[i] == 2) return whiteout
      else return blackout
    }))
  }

  useEffect(() => {
    getMetadata()
    // testDecrypt()
  }, [enabled])

  useEffect(() => {

      setItems(collectibles.map((item: any, i: number)=> {
        return <div className={`grid-item`} onClick={() => {
          if(localStorage.getItem('pkey')! != null && props.address){
            if(enabled[i] == 1 ){
              setSelected(i)
            }
          } else {
            props.setNav(1)
          }

        }}>
          <>
        { 
          enabled[i] == 1 
          ? (
            <img className='item' src={item}
              onMouseLeave={() => {
            }} 
            onMouseEnter={()=> {
            }}
            />
        )
        : (
          <img className={`item`} src={item}
            onMouseLeave={() => {
            const tempArray = collectibles
            if(enabled[i] == 2)
              tempArray[i] = whiteout
            else
             tempArray[i] = blackout

            setCollectibles(tempArray)
            setHovering(false)
          }} 
          onMouseEnter={()=> {

            const tempArray = collectibles
            try {
              if(enabled[i] == 0){
                throw new Error(i.toString())
              } 
              tempArray[i] = collectiblesOld[i]
              setCollectibles(tempArray)
              setHovering(true)
            }catch(err){
              tempArray[i] = noise
              setCollectibles(tempArray)
            }
          }}
          />
      ) }
        </>
          </div>
      }))

  }, [collectibles, items, props.address])

  const checkOut = async () => {
    setCheckedOut(true)
    setLoading(true)
    const res = await fetch('http://localhost:4000/transaction', {
        method: "post",
        headers: {
            "content-type": "application/json",
          },
        //make sure to serialize your JSON body
        body: JSON.stringify({
          wallet: props.address,
          sig: '0x',
          tokenID: selected
        })
    })
    console.log(await res.json())
    enabled = []
    getMetadata()
    window.location.reload()
    setLoading(false)
  }

  return(
    <>
      <br/>
      <br/>
      <br/>
      <br/>
      <Box>
        <span style={{cursor: 'pointer'}}onClick={() => props.setNav(1)}>🛡</span> / collection / {props.id}
      </Box>
      <br/>
      <br/>
      <br/>
      <div className='grid-container'>
        {items}
      </div>
      <br/>
      <img src={'https://docs.sequence.xyz/img/icons/sequence-composite-dark.svg'}/>
      <br/>
      <br/>
      {
        selected != null
        ? 
          !
            checkedOut 
          ? <div className='checkout' onClick={() => checkOut()}>checkout with: #0001 [{selected}]</div> 
          : 
            ( loading ? <div className='checkout'><Spinner /></div>: <div className='checkout'>✓</div> )
          : 
            null 
      }
    </>
  )
}

const Landing = (props: any) => {

  const login = async () => {
    const wallet = sequence.getWallet()
    const connectWallet = await wallet.connect({
      networkId: 80001,
      app: 'wear',
      authorize: true,
      settings: {
        theme: 'dark'
      }
    })

    if(connectWallet.connected && localStorage.getItem('pkey')! != null){
      props.setAddress(connectWallet.session?.accountAddress)
      props.setIsLoggedIn(true)
      props.setNav(3)
    }else if(connectWallet.connected) {
      props.setAddress(connectWallet.session?.accountAddress)
      props.setIsLoggedIn(true)
      props.setNav(2)
    }
  }

  return(
    <>
      <br/>
      <br/>
      <br/>
      <img src={hanger} className='landing'/>
      <h1 className='title'>wear</h1>
      <br/>
      <p className='sub-title'>private collectible fashion</p>
      <br/>
      <p className='sub-title'>powered by Sequence 🛡</p>
      <br/>
      <br/>
      <Box>
        <Button variant="primary" label="Login" onClick={() => login()} />
      </Box>
      <Footer setNav={props.setNav} setId={props.setId}/>
    </>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(function() {
      console.log('Text copied to clipboard');
    })
    .catch(function(error) {
      console.error('Unable to copy to clipboard:', error);
    });
}

const Contacts = (props: any) => {
  const [contacts, setContacts] = React.useState<any>([])
  const [publicKey, setPublicKey] = React.useState<any>()
  const [privateKey, setPrivateKey] = React.useState<any>()

  // const [copied, copy, setCopied] = useCopy("https://logrocket.com, this is the text to copy");

  const getContacts = async () => {
    console.log('getting contacts')
    // await 

    setContacts([{name: random(), key: '0x'},{name: random(), key: '0x'}, {name: random(), key: '0x'}])
  }
     
  React.useEffect(() => {
    getContacts()
  }, [])

  const remove = async (contact: string) => {
    console.log(`removing ${contact}`)
    // send remove contacts
    // get contacts

    // const newContacts = (await res.json()).contacts
    // setContacts()
  }

  const addContact = async () => {
    console.log('adding contact')
    const user = await generateKeyPair('tester', 'test@horizon.io')
    setContacts((prev: any) => [...prev, {name: random(), key: user.publicKey}])
  }

  const copy = (text: string) => {
    copyToClipboard(text)
  }

  const initKeys = () => {
    setPublicKey(JSON.parse(localStorage.getItem('pkey')!).publicKey)
    setPrivateKey(JSON.parse(localStorage.getItem('pkey')!).privateKey)
  }

  React.useEffect(() => {
    initKeys()
  }, [])

  return(
    <>
      <br/>
      <br/>
      <br/>
      <p><span style={{cursor: 'pointer'}} onClick={() => copy(publicKey)}>🔑 public key</span>&nbsp;&nbsp;|&nbsp;&nbsp;<span style={{cursor: 'pointer'}} onClick={() => copy(privateKey)}>🗝️ private key</span></p>
      <br/>
      <p className='sub-title'>contacts</p>
      <br/>
      <br/>
      <hr className='white-hr-div'/>
      <div className="scrollable-window">
        <div className="content">
            {contacts.map((contact: any) => {
              return <Box width="full" gap='2' padding={'4'}><Card style={{margin: 'auto', width: '400px'}}><p className='contact'><span style={{cursor: 'pointer'}} onClick={() => copy(contact.key)}>🔑</span>&nbsp;&nbsp;&nbsp;&nbsp;{contact.name} <span onClick={() => remove(contact.name)}style={{cursor: 'pointer', textAlign: 'right'}}>&nbsp;&nbsp;&nbsp;&nbsp;{'❌'}</span></p></Card></Box>
            })}
        </div>
      </div>
      <br/>
      <br/>
      <Button label="create test key" onClick={() => addContact()}/> 
      <br/>
      <br/>
      <br/>
      <br/>
    </>
  )
}
const Profile = (props: any) => {


  const seeContacts = () => {
    if(props.nav == 4){
      props.setNav(1)
    }else {
      props.setNav(4)
    }

  }

  React.useEffect(() => {

    const listener = () => {
      if(localStorage.getItem('pkey')! != null){
        props.setHasOpenPGPKey(true)
      }
    };
    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("storage", listener);
    };
  })

  return(
    <>
      {props.isLoggedIn ? <div className="circle">
        <span className="avi-grad"><GradientAvatar size='xl'/></span>
      </div> : null }

      { props.hasOpenPGPKey ? <div className="circle-line" onClick={() => seeContacts()}>
        <span className="emoji">🔏</span> 
      </div> : null }
    </>
  )
}

async function generateKeyPair(pass_phrase: string, ppe: string) {
  const res = await openpgp.generateKey({
      userIDs: [{ email: ppe }], // Identity information
      curve: 'ed25519', // Key type and curve
      passphrase: pass_phrase, // Passphrase to protect the private key
  });
  return res
}

const OpenPGP = (props: any) => {
  const [passphrase, setPassphrase] = React.useState<any>(null)

  const create = async () => {
    const key = await generateKeyPair(passphrase, props.ppe)
    console.log(key)
    localStorage.setItem('pkey', JSON.stringify(key))
    const res1 = await fetch('http://localhost:4000/addKey', {
        method: "post",
        headers: {
            "content-type": "application/json",
          },
        //make sure to serialize your JSON body
        body: JSON.stringify({
          wallet: props.address,
          key: key.publicKey
        })
    })
    window.dispatchEvent(new Event("storage"))
    props.setNav(3)
  }
  
  const login = async () => {
    
    const pkey = JSON.parse(localStorage.getItem('pkey')!)
    console.log(pkey)
    try {
      await openpgp.readPrivateKey({ armoredKey: pkey.privateKey })
      props.handleNext()
    }catch(e){
      alert('error')
    }
  }

  React.useEffect(() => {
    if(localStorage.getItem('pkey') != null){
      // setHasKey(true) 
    }
    // setInterval(() => )
  }, [])

  return(
  <>
    <br/>
    <br/>
    <br/>
    <br/>
    <p className='sub-title'>Create Contactbook</p>
    <p className='sub-title'>OpenPGP Key</p>
    <br/>
    <p>looks like you need to create an OpenPGP key for your contacts</p>
    <br/>
    <br/>
    <textarea placeholder='passphrase, or, poem' className='passphrase' onChange={(evt) => setPassphrase(evt.target.value)}></textarea>
    <br/>
    <br/>
    <Button label="create key" onClick={() => create()}/> 
  </>
  )
}

function App() {
  const [id, setId] = useState<any>('#0001')
  const [nav, setNav] = useState<any>(1)
  const [isLoggedIn, setIsLoggedIn] = useState<any>(false)
  const [address, setAddress] = useState<any>(null)
  const [hasOpenPGPKey, setHasOpenPGPKey] = useState<any>(false)

  sequence.initWallet('mumbai')

  React.useEffect(() => {
    if(localStorage.getItem('pkey')! != null){
      setHasOpenPGPKey(true)
    }
  }, [])

  const Compass = (view: number) => {
    let navigator;
      // like a quilt
      switch(view){
        case 1:
          navigator = <Landing setAddress={setAddress} setIsLoggedIn={setIsLoggedIn} setNav={setNav} setId={setId}/>
          break;
        case 2:
          navigator = <OpenPGP address={address} setHasOpenPGPKey={setHasOpenPGPKey} setNav={setNav}/>
          break;
        case 3:
          navigator = <Collection address={address} setNav={setNav} id={id}/>
          break;
        default:
          navigator = <Contacts/>
      }
    return(
      <>
        {
          navigator
        }
      </>
    )
  }

  useEffect(() => {}, [nav])

  return (
    <div className="App">
      <Profile isLoggedIn={isLoggedIn} setHasOpenPGPKey={setHasOpenPGPKey} hasOpenPGPKey={hasOpenPGPKey} setNav={setNav} nav={nav} />
      {Compass(nav)}
    </div>
  );
}

export default App;
