import { Observable } from "rxjs";
import { RxHR, RxHttpRequestResponse, RxCookieJar } from "@akanass/rx-http-request";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";
import "rxjs/add/operator/interval";

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
            jar: this.cookieJar
        })

    public sendCommand = <T>(command: string, data = {}): Observable<MoodResponse<T>> =>
        this.sendPost(`cmd?cmd=${command}`, Object.assign({ zoneId: 1 }, data))
            .map((response: RxHttpRequestResponse): MoodResponse<T> => response.body)

    public login = (): Observable<RxHttpRequestResponse> =>
        this.sendPost("login", { user: this.user, password: this.password })

    public onSongChange = (pollInterval: number = 1000): Observable<Song> =>
        this.login().mergeMap(
            (response: RxHttpRequestResponse): Observable<Song> =>
                Observable
                    .interval(pollInterval)
                    .switchMap(this.getStatus)
                    .filter((playerStatus: MoodResponse<PlayerData>): boolean => !!playerStatus.data)
                    .map((playerStatus: MoodResponse<PlayerData>): Song => playerStatus.data.currentAudioSong)
                    .filter((song: Song): boolean => !!song.artist)
                    .distinctUntilKeyChanged("id")
        );

    public getStatus = (): Observable<MoodResponse<PlayerData>> =>
        this.sendCommand<PlayerData>("zone.getStatus")

    public getGenreStations = (): Observable<MoodResponse<GenreStationsData>> =>
        this.sendCommand<GenreStationsData>("zone.station.getGenre")

    public getStations = (): Observable<MoodResponse<StationsData>> =>
        this.sendCommand<StationsData>("zone.station.audio.getAll")

    public getZones = (): Observable<MoodResponse<ZonesData>> =>
        this.sendCommand<ZonesData>("zone.getList")

    public setStation = (stationId: number): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.station.audio.set", { styleId: stationId })

    public setVolume = (volume: number): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.volume.set", { volume: volume })

    public skipTrack = (): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.skip", { step: 1 })

    public giveTrackFeedback = (positive: boolean, songId: string): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.feedback", { isPositive: positive, songId: songId })

    public resume = (): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.resume")

    public pause = (): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.pause")

    public getStationHistory = (): Observable<MoodResponse<SongsData>> =>
        this.sendCommand<SongsData>("zone.station.getHistory")
}