import { Song } from "./models/PlayerStatus";
import { MoodPlayer } from "./services/MoodPlayer";

import { Environment } from "./environment";

import { BlobService, TableService, TableUtilities } from "azure-storage";

import * as Web3 from "web3";

import { Wager } from "tc2017-contract-artifacts";
const diacritics = require("diacritics");

// import { Contract, Network } from "tc2017-contract-artifacts";

const contract = require("truffle-contract");
const Filter = require('bad-words');

const filter = new Filter();
const moodPlayer = new MoodPlayer(Environment.moodUri);

const thatConfProvider = new Web3.providers.HttpProvider(Environment.web3Provider);

const entGen = TableUtilities.entityGenerator;

const blobService = new BlobService(Environment.azureStorageConnectionString);
const tableService = new TableService(Environment.azureStorageConnectionString);

console.log("Connecting to blockchain...");
// const web3 = new Web3();
const web3 = new Web3();
web3.setProvider(thatConfProvider);

const balance = web3.eth.getBalance(web3.eth.coinbase);
console.log(balance.toString());

const wagerContract = contract(Wager);

wagerContract.setProvider(thatConfProvider);

moodPlayer.onSongChange().subscribe(playerData => {
    wagerContract.deployed()
        .then((instance: any) => {
            web3.personal.unlockAccount(Environment.genesisAddress, Environment.genesisPassword, 2);

            const key = filter.clean(diacritics.remove(playerData.currentAudioSong.artist).replace(/[^\w\s]/gi, '').toLowerCase());
            console.log(`KEY: ${key}`);

            const payload: any = playerData.currentAudioSong;
            payload.style = playerData.currentAudioStyle.name.replace(" Radio", "");
            console.log(payload);

            const albumArtKey = diacritics.remove(`${playerData.currentAudioSong.artist}${playerData.currentAudioSong.album}`).replace(/[^\w]/gi, "").toLowerCase();
            blobService.startCopyBlob(playerData.currentAudioSong.cover, "albumart", albumArtKey, (error, result, response) => {
                console.log(error);
                console.log(result);
                console.log(response);

                instance.endRound(web3.toHex(key), web3.toHex(JSON.stringify(payload)), {
                    from: Environment.genesisAddress,
                    gas: 4712388
                });
            });



            const song = {
                PartitionKey: entGen.String("songs"),
                RowKey: entGen.String(playerData.currentAudioSong.id),
                artist: entGen.String(playerData.currentAudioSong.artist),
                album: entGen.String(playerData.currentAudioSong.album),
                title: entGen.String(playerData.currentAudioSong.title),
                style: entGen.String(playerData.currentAudioStyle.name)
            };

            tableService.insertOrReplaceEntity("rockchain", song, function (error, result, response) {
                console.log(error);
                console.log(result);
                console.log(response);
            });
        });

}, err => {
    console.log("ERROR");
    console.log(err);
});
