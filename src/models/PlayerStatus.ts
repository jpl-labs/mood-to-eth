export interface Song {
    album: string;
    allowFeedback: boolean;
    artist: string;
    cover: string;
    feedback: string;
    id: string;
    sleep: boolean;
    title: string;
}

export interface Zone {
    id: number;
    name: string;
    type: string;
}

export interface AudioStyle {
    allowDelete: boolean;
    allowRename: boolean;
    allowSkip: boolean;
    hasAudio: boolean;
    id: string;
    name: string;
    shared: boolean;
    visible: boolean;
}

export interface PlayerError {
    code: string;
    message: string;
}

export interface PlayerMessage {
    title: string;
    type: string;
}

export interface Status {
    code: string;
    operationId: number;
    timestamp: number;
}

export interface Style {
    allowDelete: boolean;
    allowRename: boolean;
    allowSkip: boolean;
    hasAudio: boolean;
    id: string;
    name: string;
    shared: boolean;
    visible: boolean;
}

export interface Category {
    category: string;
    styles: Style[];
}

export interface GenreStationsData {
    categories: Category[];
    zoneId: number;
}

export interface ZoneData {
    zoneId: number;
}

export interface ZonesData {
    zones: Zone[];
}

export interface StationsData {
    styles: Style[];
    zoneId: number;
}

export interface SongsData {
    songs: Song[];
    zoneId: number;
}

export interface PlayerData {
    allowSkipBackward: boolean;
    allowSkipForward: boolean;
    connected: boolean;
    currentAudioSong: Song;
    currentAudioStyle: AudioStyle;
    currentVisualSong: Song;
    currentVisualStyle?: any;
    disableSkip: boolean;
    error: PlayerError;
    message: PlayerMessage;
    muted: boolean;
    nextStyleTime: string;
    state: string;
    volume: number;
    zoneId: number;
}

export interface MoodResponse<T> {
    data: T;
    status: Status;
}
