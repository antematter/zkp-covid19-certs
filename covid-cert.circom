pragma circom 2.0.0;

include "./node_modules/circomlib/circuits/eddsamimc.circom";
include "./node_modules/circomlib/circuits/mimc.circom";
include "./node_modules/circomlib/circuits/comparators.circom";
template CovidCert() {
    // data fields
    signal input id;
    signal input name;
    signal input dob;
    signal input doses;
    signal input issuedOn;

    // signature fields
    signal input R8x;
    signal input R8y;
    signal input S;


    // public key to verify
    signal input PubKeyX;
    signal input PubKeyY;
    
    // predicates
    signal input requiredDoses;

    // evalulate conditions
    component gte = GreaterEqThan(252);
    gte.in[0] <== doses;
    gte.in[1] <== requiredDoses;

    gte.out === 1;
     
    // create hash 
    component msg = MultiMiMC7(5,91);
    msg.in[0] <== id;
    msg.in[1] <== name;
    msg.in[2] <== doses;
    msg.in[3] <== dob;
    msg.in[4] <== issuedOn;

    msg.k <== 0;

    // verify signature
    component verifier = EdDSAMiMCVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== PubKeyX;
    verifier.Ay <== PubKeyY;
    verifier.R8x <== R8x;
    verifier.R8y <== R8y;
    verifier.S <== S;
    verifier.M <== msg.out;

    
}

component main {public [PubKeyX,PubKeyY,requiredDoses]} = CovidCert();