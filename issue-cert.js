const fs = require("fs");
require("dotenv").config();
const circomlib = require("circomlibjs");

async function issueCert(id, name, doses, dob) {
  const mimc = await circomlib.buildMimc7();
  const eddsa = await circomlib.buildEddsa();
  const F = (await circomlib.buildBabyjub()).F;

  const issuedOn = Math.floor(Date.now() / 1000); // to Unix EPOCH

  const priv = Buffer.from(process.env.SIGNER_PRIVATE_KEY, `hex`); // Govt. private key to sign certs

  const certInputs = [
    F.toObject(Buffer.from(id, "utf-8")),
    F.toObject(Buffer.from(name, "utf-8")),
    doses,
    dob,
    issuedOn,
  ];
  console.log(certInputs);
  const hash = mimc.multiHash(certInputs); // create data hash

  const sig = eddsa.signMiMC(priv, hash); // sign the hash

  return {
    data: {
      id,
      name,
      doses,
      dob,
      issuedOn,
    },
    signature: Buffer.from(eddsa.packSignature(sig)).toString("base64"),
  };
}

issueCert("3210263000943", "Humayun Javed", 2, 931892400).then((cert) => {
  console.log(JSON.stringify(cert));
  fs.writeFileSync("cert.json", JSON.stringify(cert, null, 2));
});
