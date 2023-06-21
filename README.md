# partial-private-collectibles
Allows users to optionally provide read access to NFT content for collectibles on new transfer shared with a list of contacts. 

Using a backend relayer to act as a gateway in front of the transaction call, you can pull from private off-chain data to upload encrypted - via multiple openpgp keys - media content. [ WIP ] With the use of relayed transfer function, allows there to be a state update for encrypted data to match the public keys for new contacts to share with.

## Protocol's (721/1155) Nature of Privacy
Due to the nature and constraints of the protocols tokenURI() return values, the various protocols of ERC721 and ERC1155 exhibit different behaviours when you scale partially private collectible metadata. There are 3 main ways to organize privacy

- *Both ERC721 & ERC1155*
    - _Friends List Privacy_: This privacy allows the metadata of the NFT to only be available to the specific list of friends contained in a central registry of openpgp keys 
    - _Collection Expanding Privacy_: This privacy is currently implemented, which allows users to have access to other collectible metadata post acquisition of their first collectible. It means if you collect a single collectible at the start, you have access to view the people that collect after you based on all prior keys from the collection owners. The later you collect, the less access you have to view the collection. If you come later to the site, those past collected collectibles will be hidden.
- *ERC1155 Only*
    - _Mixed Friend's of Friend's Privacy_: Given how there is a single rendering for metadata per tokenID, it means that when new metadata is added to the collection on each collectible, the prior keys used from the user that collected that collectible, would be appended to the list of public keys for the user that acquire the same tokenID in the collection. 


### Spec: Mixed Friend's of Friend's Keys
Possibility: Instead of restricting the number of people that owns a SFT, you can restrict how many people can view a SFT providing more token mechanism control

#### simple implementation
- get all owners of a tokenID
- get contact public key from db from account address
- check contacts amount matches some onchain state of restriction user count
- encrypt with all keys
- set base