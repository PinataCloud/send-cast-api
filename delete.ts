import {
  Message,
  NobleEd25519Signer,
  FarcasterNetwork,
  CastRemoveBody,
  makeCastRemove,
} from "@farcaster/core";
import { hexToBytes } from "@noble/hashes/utils";

const FID = process.env.FID ? parseInt(process.env.FID) : 0;
const SIGNER = process.env.PRIVATE_KEY || "";

async function deleteHash(hashString: string) {
  const hex = hexToBytes(hashString.slice(2))
  try {

    const dataOptions = {
      fid: FID,
      network: FarcasterNetwork.MAINNET,
    };

    const privateKeyBytes = hexToBytes(SIGNER.slice(2));
    const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

    const removeBody: CastRemoveBody = { 
      targetHash: hex
    }

    const castRemoveReq =  await makeCastRemove(removeBody, dataOptions, ed25519Signer)
    const castRemove: any = castRemoveReq._unsafeUnwrap()
    const messageBytes = Buffer.from(Message.encode(castRemove).finish())

    const castRequest = await fetch(
      "https://hub.pinata.cloud/v1/submitMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: messageBytes,
      },
    );

    const castResult = await castRequest.json();
    console.log(castResult);
    return castResult
  } catch (error) {
    console.log("problem sending cast:", error);
  }
}

deleteHash("0xae6c4a4622b6ad5b8ebe5594e8445fb9ee7ccaf1");
