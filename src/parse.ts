import { Song } from "./models/PlayerStatus";
import { MoodPlayer } from "./services/MoodPlayer";

import { Environment } from "./environment";


import * as Web3 from "web3";

import { Wager } from "tc2017-contract-artifacts";

// import { Contract, Network } from "tc2017-contract-artifacts";

const contract = require("truffle-contract");

const moodPlayer = new MoodPlayer(Environment.moodUri);

const thatConfProvider = new Web3.providers.HttpProvider(Environment.web3Provider);

console.log("Connecting to blockchain...");
// const web3 = new Web3();
const web3 = new Web3();
web3.setProvider(thatConfProvider);

const balance = web3.eth.getBalance(web3.eth.coinbase);
console.log(balance.toString());

const wagerContract = contract(Wager);

wagerContract.setProvider(thatConfProvider);

moodPlayer.onSongChange().subscribe(song => {
    console.log(song);
    wagerContract.deployed()
        .then((instance: any) => {
            web3.personal.unlockAccount(Environment.genesisAddress, Environment.genesisPassword, 2);
            instance.endRound(web3.toHex(song.artist), web3.toHex(JSON.stringify(song)), {
                from: Environment.genesisAddress,
                gas: 4712388
            });
        });

}, err => {
    console.log("ERROR");
    console.log(err);
});
