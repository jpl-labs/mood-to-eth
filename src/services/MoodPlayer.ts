import { Observable } from "rxjs";
import { RxHR, RxHttpRequestResponse, RxCookieJar } from "@akanass/rx-http-request";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";
import "rxjs/add/observable/interval";

import { PlayerData, MoodResponse, Song, GenreStationsData, ZoneData, StationsData, ZonesData, SongsData } from "../models/PlayerStatus";

export class MoodPlayer {

    readonly cookieJar: Observable<RxCookieJar>;

    constructor(private uri: string, private user = "admin", private password = "23646") {
        this.cookieJar = RxHR.jar();
    }

    public sendPost = (path: string, data: any): Observable<RxHttpRequestResponse> =>
        RxHR.post(`${this.uri}/${path}`, {
            form: data,
            strictSSL: false,
            jar: this.cookieJar,
            json: true
        })

    public sendCommand = <T>(command: string, data = {}): Observable<T> =>
        this.sendPost(`cmd?cmd=${command}`, Object.assign({ zoneId: 1 }, data))
            .map((response: RxHttpRequestResponse): MoodResponse<T> => response.body).map(x => x.data)

    public login = (): Observable<RxHttpRequestResponse> =>
        this.sendPost("login", { user: this.user, password: this.password })

    public onSongChange = (pollInterval: number = 1000): Observable<PlayerData> =>
        this.login().mergeMap(
            (response: RxHttpRequestResponse): Observable<PlayerData> =>
                Observable
                    .interval(pollInterval)
                    .switchMap(this.getStatus)
                    // .filter((playerStatus: MoodResponse<PlayerData>): boolean => !!playerStatus.data)
                    // .map((playerStatus: PlayerData): Song => playerStatus.currentAudioSong)
                    // .filter((song: Song): boolean => !!song.artist)
                    .distinct((playerStatus: PlayerData): any => playerStatus.currentAudioSong.id)
        );

    public getStatus = (): Observable<PlayerData> =>
        this.sendCommand<PlayerData>("zone.getStatus")

    public getGenreStations = (): Observable<GenreStationsData> =>
        this.sendCommand<GenreStationsData>("zone.station.getGenre")

    public getStations = (): Observable<StationsData> =>
        this.sendCommand<StationsData>("zone.station.audio.getAll")

    public getZones = (): Observable<ZonesData> =>
        this.sendCommand<ZonesData>("zone.getList")

    public setStation = (stationId: number): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.station.audio.set", { styleId: stationId })

    public setVolume = (volume: number): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.volume.set", { volume: volume })

    public skipTrack = (): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.track.skip", { step: 1 })

    public giveTrackFeedback = (positive: boolean, songId: string): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.track.feedback", { isPositive: positive, songId: songId })

    public resume = (): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.track.resume")

    public pause = (): Observable<ZoneData> =>
        this.sendCommand<ZoneData>("zone.track.pause")

    public getStationHistory = (): Observable<SongsData> =>
        this.sendCommand<SongsData>("zone.station.getHistory")
}
