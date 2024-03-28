const snarkjs = require("snarkjs");
const fs = require("fs");
const ethers = require("ethers");

const DEPLOYED_ADDRESS = "0xfa494625b1229664bc59687f328adf70aed13575";
const provider = new ethers.JsonRpcProvider(
  `https://polygon-mumbai.blockpi.network/v1/rpc/public`
);
async function verifyProof({ proof, publicSignals }) {
  const abi = new ethers.Interface(
    fs.readFileSync("solidity/abi.json", "utf-8")
  );
  const verifierContract = new ethers.Contract(DEPLOYED_ADDRESS, abi, provider);

  const callData = await snarkjs.groth16.exportSolidityCallData(
    proof,
    publicSignals
  );
  const args = JSON.parse(`[${callData}]`);

  const res = await verifierContract.verifyProof(...args);

  if (res) {
    console.log("Evaluation successful!");
  } else console.log("Evaluation failed!");
}

verifyProof(JSON.parse(fs.readFileSync("proof.json"))).then(() =>
  process.exit(0)
);
