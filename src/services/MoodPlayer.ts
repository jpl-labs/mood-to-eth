import { Observable } from "rxjs";
import { RxHR, RxHttpRequestResponse, RxCookieJar } from "@akanass/rx-http-request";
import "rxjs/add/operator/mergeMap";

import { PlayerData, MoodResponse, Song, GenreStationsData, ZoneData, StationsData, ZonesData, SongsData } from "../models/PlayerStatus";

export class MoodPlayer {

    readonly cookieJar: Observable<RxCookieJar>;

    constructor(private uri: string, private user = "admin", private password = "23646") {
        this.cookieJar = RxHR.jar();
    }

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

    public login = (): Observable<RxHttpRequestResponse> =>
        RxHR.post(`${this.uri}/login`, {
            form: { user: this.user, password: this.password },
            strictSSL: false,
            jar: this.cookieJar
        })

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

    public giveTrackFeedback = ( positive: boolean, songId: string): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.feedback", { isPositive: positive, songId: songId })

    public resume = (): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.resume")

    public pause = (): Observable<MoodResponse<ZoneData>> =>
        this.sendCommand<ZoneData>("zone.track.pause")

    public getStationHistory = (): Observable<MoodResponse<SongsData>> =>
        this.sendCommand<SongsData>("zone.station.getHistory")

    public sendCommand = <T>(command: string, data = {}): Observable<MoodResponse<T>> =>
        RxHR.post(`${this.uri}/cmd?cmd=${command}`, {
            form: Object.assign({ zoneId: 1 }, data),
            strictSSL: false,
            jar: this.cookieJar
        }).map((response: RxHttpRequestResponse): MoodResponse<T> => response.body)
}