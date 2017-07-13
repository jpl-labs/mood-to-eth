import { PlayerStatus, AudioSong } from "./models/PlayerStatus";
import { MoodPlayer } from "./services/MoodPlayer";

import * as Web3 from "web3";

import * as wagerArtifacts from "../node_modules/tc2017-contract-artifacts/Wager.json";

import { Contract, Network } from "tc2017-contract-artifacts"

const wagerContract : Contract = wagerArtifacts as any;

const contract = require("truffle-contract");

const mood_uri = "https://192.168.0.100";

const moodPlayer = new MoodPlayer(mood_uri);

const thatConfProvider = new Web3.providers.HttpProvider("http://bcjl3x55m.eastus.cloudapp.azure.com:8545");

console.log("Connecting to blockchain...");
const web3 = new Web3();
web3.setProvider(thatConfProvider);
const balance = web3.eth.getBalance(web3.eth.coinbase);
console.log(balance.toString());

const Wager = contract(wagerArtifacts);

Wager.setProvider(thatConfProvider);

moodPlayer.onSongChange().subscribe(song => {
    console.log(song);
    //console.log(web3.toHex(JSON.stringify(song)));
    Wager.deployed()
        .then((instance: any) => {
            instance.setWinningArtist(web3.toHex(song.artist), web3.toHex(JSON.stringify(song)), {
                from: "0x72e98c3c1be92b3195fa3a6dc62ca90e77e6f9be",
                gas: 1000000
            });
        });

}, err => {
    console.log("ERROR");
    console.log(err);
});
