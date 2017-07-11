import { PlayerStatus, AudioSong } from "./models/PlayerStatus"
import { MoodPlayer } from "./services/MoodPlayer"

var mood_uri = 'https://192.168.0.100';

var moodPlayer = new MoodPlayer(mood_uri);

moodPlayer.onSongChange().subscribe(song => {
    console.log(song)
}, err => {
    console.log("ERROR")
    console.log(err)
});