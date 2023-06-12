import "./style.css";
console.log("Helll");

import * as dapp from "@polkadot/extension-dapp";
import { Keyring } from "@polkadot/ui-keyring";
import {
  mnemonicGenerate,
  cryptoWaitReady,
  signatureVerify,
  decodeAddress,
} from "@polkadot/util-crypto";
import { stringToU8a, u8aToHex, stringToHex, hexToU8a } from "@polkadot/util";

import keyring from "@polkadot/ui-keyring";

import { ApiPromise, WsProvider } from "@polkadot/api";

let payload_hex =
  "0x00001448656c6c6f000000c22400001600000081bf2e35e70dbc700b2b3a189a6ced2a3f4d098aaf08dbdd63089bc714de2c2e81bf2e35e70dbc700b2b3a189a6ced2a3f4d098aaf08dbdd63089bc714de2c2e";

let payload = new Uint8Array([
  0, 0, 20, 72, 101, 108, 108, 111, 0, 0, 0, 194, 36, 0, 0, 22, 0, 0, 0, 129,
  191, 46, 53, 231, 13, 188, 112, 11, 43, 58, 24, 154, 108, 237, 42, 63, 77, 9,
  138, 175, 8, 219, 221, 99, 8, 155, 199, 20, 222, 44, 46, 129, 191, 46, 53,
  231, 13, 188, 112, 11, 43, 58, 24, 154, 108, 237, 42, 63, 77, 9, 138, 175, 8,
  219, 221, 99, 8, 155, 199, 20, 222, 44, 46,
]);
// or let payload = hexToU8a(payload_hex);

let call_hex = "0x00001448656c6c6f";

/*
corresponds to remark extrinsic with remark: "Hello"
callIndex
	0000
remark
	14 48656c6c6f
era
	00 00
nonce
	00
tip
	00
specVersion
	c2240000
transactionVersion
	16000000
genesisHash
	81bf2e35e70dbc700b2b3a189a6ced2a3f4d098aaf08dbdd63089bc714de2c2e
blockHash
	81bf2e35e70dbc700b2b3a189a6ced2a3f4d098aaf08dbdd63089bc714de2c2e

*/

async function main() {
  // start up
  await cryptoWaitReady();
  const allInjected = await dapp.web3Enable("my cool dapp");

  // get alice account
  let all_accounts = await dapp.web3Accounts();
  for (let a of all_accounts) {
    console.log(a);
  }
  let alice = all_accounts.find(
    (e) => e.meta.name == "Alice" && e.meta.source == "polkadot-js"
  );
  if (!alice) {
    console.log("alice not found");
    return;
  }
  console.log("Alice account", alice);

  // create the connection to the node:
  const api = await ApiPromise.create({
    provider: new WsProvider("ws://127.0.0.1:9944"),
  });
  await api.isReady;
  console.log("api is ready");

  let extrinsicPayload = api.createType("ExtrinsicPayload", payload_hex, {
    version: 4,
  });
  console.log("ExtrinsicPayload ", extrinsicPayload);
  console.log(extrinsicPayload.toHuman());
  // note: method seems to be empty?? Parsing wrong??

  try {
    let genericExtrinsic = api.createType("Extrinsic", payload_hex, {
      version: 4,
    });
    console.log("GenericExtrinsic ", genericExtrinsic);
    console.log(genericExtrinsic.toJSON());
  } catch {}

  let signerPayload = api.createType("SignerPayload", payload, {
    version: 4,
  });
  console.log("signerPayload ", signerPayload);
  console.log("signerPayload toPayload", signerPayload.toPayload());

  try {
    const injector = await dapp.web3FromSource(alice.meta.source);
    let { signature } = await injector?.signer?.signPayload(signerPayload);
  } catch {}

  let genesis_hash = api.genesisHash.toHex();
  console.log("genesis_hash", genesis_hash);

  let hand_crafted_signer_payload = {
    // alice account
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    // got these values from a locally started node
    blockHash:
      "0x559440460afd0b06684f4cecced86acdb4a278e0b77fa26b0eb67531523d6f34",
    blockNumber: "0x02",
    era: "0x0000",
    genesisHash:
      "0x81bf2e35e70dbc700b2b3a189a6ced2a3f4d098aaf08dbdd63089bc714de2c2e",
    method: "0x00001448656c6c6f",
    nonce: "0x00",
    specVersion: "0xc2240000",
    tip: "0x00",
    transactionVersion: "0x16000000",
    signedExtensions: [],
    version: 4,
  };

  try {
    const injector = await dapp.web3FromSource(alice.meta.source);
    let { signature } = await injector?.signer?.signPayload(
      hand_crafted_signer_payload
    );
  } catch {}

  const HANDCRAFTED_FROM_A_TEST_IN_POLKADOT_API = {
    address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    blockHash:
      "0xde8f69eeb5e065e18c6950ff708d7e551f68dc9bf59a07c52367c0280f805ec7",
    blockNumber: "0x00231d30",
    era: "0x0703",
    genesisHash:
      "0xdcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025b",
    method: "0x0040001448656c6c6f",
    nonce: "0x00001234",
    signedExtensions: ["CheckNonce", "CheckWeight"],
    specVersion: "0x00000006",
    tip: "0x00000000000000000000000000005678",
    transactionVersion: "0x00000007",
    version: 4,
  };

  try {
    const injector = await dapp.web3FromSource(alice.meta.source);
    let { signature } = await injector?.signer?.signPayload(
      HANDCRAFTED_FROM_A_TEST_IN_POLKADOT_API
    );
  } catch {}
}

main();

// SOME UNUSED CODE SNIPPETS:

// let block = await api.rpc.chain.getBlock(ty.blockHash);

// console.log(block);

// let signer_payload_json = {
//   address: alice.address,
//   blockHash: "0x9f37f93e4c98e7bf61abf67f5e4a743501dc62cb0fcff602f657431aef248953", //ty.blockHash.toHex(),
//   era: ty.era.toHex(),
//   genesisHash: ty.genesisHash.toHex(),
//   method: ty.method.toHex(),
//   nonce: ty.nonce.toHex(),
//   specVersion: ty.specVersion.toHex(),
//   tip: ty.tip.toHex(),
//   transactionVersion: ty.transactionVersion.toHex(),
//   signedExtensions: [],
//   blockNumber: "0x03",
//   version: 4,
// };

// console.log("signer_payload_json", signer_payload_json);

// const signPayload = injector?.signer?.signPayload;

// if (!signPayload) {
//   throw "signPayload undefined";
// }

// console.log("signature", signature);

// let res = signatureVerify(
//   ty.toU8a({ method: true }),
//   signature,
//   alice.address
// );
// console.log(res);

// console.log(hexToU8a(payload_hex));
// const injector = await dapp.web3FromSource(alice.meta.source);
// const singPayload = injector?.signer?.signPayload;
// console.log(!!singPayload);
// if (extensions.length === 0) {
//   console.log("no accounts");
//   // no extension installed, or the user did not accept the authorization
//   // in this case we should inform the use and give a link to the extension
// } else {
//   // we are now informed that the user has at least one extension and that we
//   // will be able to show and use accounts
//   const allAccounts = await polkadot.web3Accounts();
//   console.log(allAccounts);
// }

// async function sign() {
//   const allInjected = await dapp.web3Enable("my cool dapp");
//   const allAccounts = await dapp.web3Accounts();
//   // console.log(allInjected);
//   console.log(allAccounts);

//   const account = allAccounts[0];

//   const injector = await dapp.web3FromSource(account.meta.source);

//   const signRaw = injector?.signer?.signRaw;

//   console.log(stringToHex("message to sign"));

//   if (!!signRaw) {
//     // after making sure that signRaw is defined
//     // we can use it to sign our message
//     try {
//       const { signature } = await signRaw({
//         address: account.address,
//         data: stringToHex("message to sign"),
//         type: "bytes",
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   } else {
//     console.log("no signing available");
//   }
// }

// let result = await signRaw({
//   address: alice.address,
//   data: u8aToHex(payload),
//   type: "bytes",
// });
// console.log(result);

// console.log(
//   decodeAddress("5CSbZ7wG456oty4WoiX6a1J88VUbrCXLhrKVJ9q95BsYH4TZ")
// );

// keyring.loadAll({ ss58Format: 42, type: "sr25519" });

// let string = "Hello";
// let hex = (stringToHexstring);

// console.log(hex);

// const message = stringToU8a("this is our message");
// console.log(message);
// // get an array of wallets which are installed
// const installedWallets = getWallets().filter((wallet) => wallet.installed);
// // get talisman from the array of installed wallets
// const talismanWallet = installedWallets.find(
//   (wallet) => wallet.extensionName === "talisman"
// );
// // enable the wallet
// if (talismanWallet) {
//   talismanWallet.enable("myCoolDapp").then(() => {
//     talismanWallet.subscribeAccounts((accounts) => {
//       for (const a of accounts) {
//         console.log(a);
//         if (a.signer != null) {
//           a.signer.encryptMessage(a.address, message);
//         }
//       }
//       // do anything you want with the accounts provided by the wallet
//       console.log("got accounts", accounts);
//     });
//   });
// }
// await cryptoWaitReady();
// const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
// keyring.loadAll({ ss58Format: 42, type: "sr25519" });
// const mnemonic = mnemonicGenerate(12);
// // add the account, encrypt the stored JSON with an account-specific password
// const { pair, json } = keyring.addUri(mnemonic, "myStr0ngP@ssworD", {
//   name: "mnemonic acc",
// });
// console.log(keyring);

// const message = stringToU8a("this is our message");
// const signature = alice.sign(message);
// // verify the message using Alice's address
// const { isValid } = signatureVerify(message, signature, alice.address);
// // output the result
// console.log(`${u8aToHex(signature)} is ${isValid ? "valid" : "invalid"}`);
// const mnemonic = mnemonicGenerate();
// const MNEMONIC =
//   "sample split bamboo west visual approve brain fox arch impact relief smile";
// const pair = keyring.createFromUri(MNEMONIC);
// console.log(pair.publicKey);
// // 16,178,46,190,137,179,33,55,11,238,141,57,213,197,212,17,218,241,232,252,145,201,209,83,64,68,89,15,31,150,110,188
// console.log(
//   keyring.decodeAddress("5CSbZ7wG456oty4WoiX6a1J88VUbrCXLhrKVJ9q95BsYH4TZ")
// );
// // 16,178,46,190,137,179,33,55,11,238,141,57,213,197,212,17,218,241,232,252,145,201,209,83,64,68,89,15,31,150,110,188
// console.log(
//   keyring.decodeAddress("CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M")
// );
// // 16,178,46,190,137,179,33,55,11,238,141,57,213,197,212,17,218,241,232,252,145,201,209,83,64,68,89,15,31,150,110,188
// console.log(
//   keyring.decodeAddress("1NthTCKurNHLW52mMa6iA8Gz7UFYW5UnM3yTSpVdGu4Th7h")
// );
// // console.log(pair);
// // console.log("Substrate generic", pair.address);
// // // adjust the default ss58Format for Kusama
// // // CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M
// // keyring.setSS58Format(2);
// // console.log("Kusama", pair.address);
// // // adjust the default ss58Format for Polkadot
// // // 1NthTCKurNHLW52mMa6iA8Gz7UFYW5UnM3yTSpVdGu4Th7h
// // keyring.setSS58Format(0);
// // console.log("Polkadot", pair.address);
// // // create an ed25519 pair from the mnemonic
// // const ep = keyring.createFromUri(mnemonic, { name: "ed25519" }, "ed25519");
// // // create an sr25519 pair from the mnemonic (keyring defaults)
// // const sp = keyring.createFromUri(mnemonic, { name: "sr25519" });
// // // log the addresses, different cryptos, different results
// // console.log(ep.meta.name, ep.address);
// // console.log(sp.meta.name, sp.address);
// // 5CSbZ7wG456oty4WoiX6a1J88VUbrCXLhrKVJ9q95BsYH4TZ
// // console.log(pair)
// console.log(keyring.encodeAddress(pair.publicKey, 42));
// // CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M
// console.log(keyring.encodeAddress(pair.publicKey, 2));
// // 1NthTCKurNHLW52mMa6iA8Gz7UFYW5UnM3yTSpVdGu4Th7h
// console.log(keyring.encodeAddress(pair.publicKey, 0));
