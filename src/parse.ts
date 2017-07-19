import { PlayerStatus, AudioSong } from "./models/PlayerStatus";
import { MoodPlayer } from "./services/MoodPlayer";

import { Environment } from "./environment";

const Web3 = require("web3");

import * as wagerArtifacts from "../node_modules/tc2017-contract-artifacts/Wager.json";

// import { Contract, Network } from "tc2017-contract-artifacts";

// const wagerContract: Contract = wagerArtifacts as any;

const contract = require("truffle-contract");

const moodPlayer = new MoodPlayer(Environment.moodUri);

const thatConfProvider = new Web3.providers.HttpProvider(Environment.web3Provider);

console.log("Connecting to blockchain...");
// const web3 = new Web3();
const web3 = new Web3(thatConfProvider);
web3.setProvider(thatConfProvider);
const balance = web3.eth.getBalance(web3.eth.coinbase);
console.log(balance.toString());

const Wager = contract(wagerArtifacts);

Wager.setProvider(thatConfProvider);

moodPlayer.onSongChange().subscribe(song => {
    console.log(song);
    Wager.deployed()
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
