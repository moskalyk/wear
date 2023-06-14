import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';

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

import { Box, Text, Button, useTheme, Breadcrumbs, GradientAvatar} from '@0xsequence/design-system'

import hanger from './hanger.png'

const Footer = (props: any) => {
  const [collections, setCollections] = useState<any>([])
  const [collectionView, setCollectionView] = useState<any>('')
  const seeCollection = (id: string) => {
    setCollectionView(id)
  }
  useEffect(() => {
    const collectionsRes = ['#0001', '#0002', ]
    collectionsRes.map((id: string) => {
      setCollections((prev: any) => [...prev, <p className='footer-collection' onClick={() => {console.log('testing');props.setId(id);props.setNav(2)}}>&nbsp; • &nbsp;{id}</p>])
    })
  }, [])

  return (
    <>
      <Marquee className='footer'>collections {collections}</Marquee>
    </>
  )
}

let do_ = true; // singing
const Collection = (props: any) => {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState<any>(null)
  const collectibles: any = [img0,img1,img2,img3,img4,img5,img6,img7,img8,img9,img10,img11];
  const [checkedOut, setCheckedOut] = useState<any>(null)

  useEffect(() => {

    setItems(collectibles.map((item: any, i: number)=> {
      return <div className="grid-item" onClick={() => setSelected(i)}><img className='item' src={item}/></div>
    }))
    console.log(props.id)
  }, [])

  const checkOut = async () => {
    setCheckedOut(true)
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
        selected 
        ? 
          !
            checkedOut 
          ? <div className='checkout' onClick={() => checkOut()}>checkout with: #0001 [{selected}]</div> 
          : 
            <div className='checkout'>✓</div>  
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

    if(connectWallet.connected){
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
const Contacts = () => {
  return(
    <>
      <p className='sub-title'>contacts</p>
    </>
  )
}
const Profile = (props: any) => {
  return(
    <>
      <div className="circle">
        <span className="avi-grad"><GradientAvatar size='xl'/></span>
      </div>
      <div className="circle-line">
        <span className="emoji">🔏</span>
      </div>
    </>
  )
}

function App() {
  const [id, setId] = useState<any>('#0001')
  const [nav, setNav] = useState<any>(1)

  sequence.initWallet('mumbai')

  const Compass = (view: number) => {
    let navigator;
      // like a quilt
      switch(view){
        case 1:
          navigator = <Landing setNav={setNav} setId={setId}/>
          break;
        case 2:
          navigator = <Collection setNav={setNav} id={id}/>
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
      <Profile />
      {Compass(nav)}
    </div>
  );
}

export default App;
