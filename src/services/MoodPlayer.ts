import { Observable } from "rxjs";
import { RxHR, RxHttpRequestResponse } from "@akanass/rx-http-request";
import "rxjs/add/operator/mergeMap";

import { PlayerStatus, AudioSong } from "../models/PlayerStatus";

export class MoodPlayer {


    constructor(private uri: string) {
    }

    public onSongChange(): Observable<AudioSong> {
        const j = RxHR.jar();

        return RxHR.post(`${this.uri}/login`, {
            form: { user: "admin", password: "23646" },
            strictSSL: false,
            jar: j
        }).mergeMap(
            (response: RxHttpRequestResponse): Observable<AudioSong> =>
                Observable
                    .interval(1000)
                    .switchMap(() => RxHR.post(`${this.uri}/cmd?cmd=zone.getStatus`, {
                        form: { zoneId: 1 },
                        strictSSL: false,
                        jar: j,
                        json: true
                    }))
                    .map((response: RxHttpRequestResponse): PlayerStatus => response.body)
                    .map((playerStatus: PlayerStatus): AudioSong => playerStatus.data.currentAudioSong)
                    .distinctUntilKeyChanged("id")
            );
    }

}