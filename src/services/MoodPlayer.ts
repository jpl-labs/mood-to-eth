import { Observable } from "rxjs";
import { RxHR, RxHttpRequestResponse, RxCookieJar } from "@akanass/rx-http-request";
import "rxjs/add/operator/mergeMap";

import { PlayerStatus, AudioSong } from "../models/PlayerStatus";

export class MoodPlayer {

    readonly cookieJar: Observable<RxCookieJar>;

    constructor(private uri: string, private pollInterval: number = 1000) {
        this.cookieJar = RxHR.jar();
    }

    public onSongChange = (): Observable<AudioSong> =>
        RxHR.post(`${this.uri}/login`, {
            form: { user: "admin", password: "23646" },
            strictSSL: false,
            jar: this.cookieJar
        }).mergeMap(
            (response: RxHttpRequestResponse): Observable<AudioSong> =>
                Observable
                    .interval(this.pollInterval)
                    .switchMap(this.getStatus)
                    .map((playerStatus: PlayerStatus): AudioSong => playerStatus.data.currentAudioSong)
                    .filter((song: AudioSong): boolean => !!song.artist)
                    .distinctUntilKeyChanged("id")
            );

    public getStatus = (): Observable<PlayerStatus> =>
        RxHR.post(`${this.uri}/cmd?cmd=zone.getStatus`, {
            form: { zoneId: 1 },
            strictSSL: false,
            jar: this.cookieJar,
            json: true
        }).map((response: RxHttpRequestResponse): PlayerStatus => response.body);

}