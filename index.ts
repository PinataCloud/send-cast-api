import {
  Message,
  NobleEd25519Signer,
  FarcasterNetwork,
  makeCastAdd,
} from "@farcaster/core";
import { hexToBytes } from "@noble/hashes/utils";

const FID = process.env.FID ? parseInt(process.env.FID) : 0;
const SIGNER = process.env.PRIVATE_KEY || "";

async function sendCast(message: string, parentUrl: string) {
  try {
    const dataOptions = {
      fid: FID,
      network: FarcasterNetwork.MAINNET,
    };

    const privateKeyBytes = hexToBytes(SIGNER.slice(2));
    const ed25519Signer = new NobleEd25519Signer(privateKeyBytes);

    const castBody = {
      text: message,
      embeds: [],
      embedsDeprecated: [],
      mentions: [],
      mentionsPositions: [],
      parentUrl: parentUrl,
    };

    const castAddReq = await makeCastAdd(castBody, dataOptions, ed25519Signer);
    const castAdd: any = castAddReq._unsafeUnwrap();

    const messageBytes = Buffer.from(Message.encode(castAdd).finish());

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

sendCast("Hello World from Bun.sh", "https://warpcast.com/~/channel/pinata");
