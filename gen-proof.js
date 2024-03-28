require("dotenv").config();
const snarkjs = require("snarkjs");
const fs = require("fs");
const circomlib = require("circomlibjs");

async function generateProof(cert, requiredDoses, pubKey) {
  const F = (await circomlib.buildBabyjub()).F;
  const eddsa = await circomlib.buildEddsa();

  const cData = cert.data;

  const sig = eddsa.unpackSignature(Buffer.from(cert.signature, "base64"));

  const inputs = {
    id: F.toObject(Buffer.from(cData.id, "utf-8")),
    name: F.toObject(Buffer.from(cData.name, "utf-8")),
    doses: cData.doses,
    dob: cData.dob,
    issuedOn: cData.issuedOn,

    R8x: F.toObject(sig.R8[0]),
    R8y: F.toObject(sig.R8[1]),
    S: sig.S,

    PubKeyX: F.toObject(pubKey[0]),
    PubKeyY: F.toObject(pubKey[1]),
    requiredDoses,
  };

  console.log(inputs);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    "build/covid-cert_js/covid-cert.wasm",
    "setup/covid-cert_final.zkey"
  );
  return { proof, publicSignals };
}

(async function main() {
  const eddsa = await circomlib.buildEddsa();

  const priv = Buffer.from(process.env.SIGNER_PRIVATE_KEY, `hex`);
  const pubKey = eddsa.prv2pub(priv);

  const proof = await generateProof(
    JSON.parse(fs.readFileSync("cert.json")),
    2, // required doses
    pubKey
  );
  console.log(JSON.stringify(proof));

  fs.writeFileSync("proof.json", JSON.stringify(proof, null, 2));
})().then(() => process.exit(0));
