const snarkjs = require("snarkjs");
const fs = require("fs");

async function verifyProof({ proof, publicSignals }) {
  const vKey = JSON.parse(
    fs.readFileSync("setup/covid-cert_verification_key.json")
  );
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

  if (res) {
    console.log("Evaluation successful!");
  } else console.log("Evaluation failed!");
}

verifyProof(JSON.parse(fs.readFileSync("proof.json"))).then(() =>
  process.exit(0)
);
