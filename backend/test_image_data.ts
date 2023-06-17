import {fetch} from 'cross-fetch'

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

(async () => {

    shieldTokenIdFromCID('0x', 0)
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