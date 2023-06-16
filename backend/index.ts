import { create } from 'ipfs-http-client';

async function getLinks(ipfsPath: any) {
  const url = 'https://dweb.link/api/v0';
  const ipfs = create({ url });

  const links: any = [];
  for await (const link of ipfs.ls(ipfsPath)) {
    links.push(link);
  }
  console.log(links);
};

(async () => {
    await getLinks('bafybeicjhdagdccfoh4i3fat6r52vq7tg6w5e4duhbmbzxyz5pbdruveou')
})();