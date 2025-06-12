import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable, BehaviorSubject } from "rxjs"
import { map, catchError, switchMap } from "rxjs/operators"

export interface SpotifyTrack {
    id: string
    title: string
    artist: string
    album: string
    duration: number
    thumbnail: string
    previewUrl: string | null
    externalUrl: string
}

export interface SpotifyAuthResponse {
    access_token: string
    token_type: string
    expires_in: number
}

@Injectable({
    providedIn: "root",
})
export class SpotifyService {
    private readonly CLIENT_ID = "0b18ec7c53db42289eb5d384032308de" // Reemplaza con tu Client ID
    private readonly CLIENT_SECRET = "8d3bb8bf0be64f2abbb1fd2bb21b6b04" // Reemplaza con tu Client Secret
    private readonly REDIRECT_URI = "myapp://callback"

    private accessToken: string | null = null
    private tokenExpiration = 0

    private authStatusSubject = new BehaviorSubject<boolean>(false)
    public authStatus$ = this.authStatusSubject.asObservable()

    private userProfileSubject = new BehaviorSubject<any>(null)
    public userProfile$ = this.userProfileSubject.asObservable()

    constructor(private http: HttpClient) {
        this.checkStoredToken()
    }

    /**
     * Genera un thumbnail por defecto para Spotify
     */
    private getDefaultSpotifyThumbnail(title: string, artist: string): string {
        const initials = (artist.charAt(0) + title.charAt(0)).toUpperCase()
        const svg = `
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="spotifyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1DB954;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1ed760;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#spotifyGrad)" rx="8"/>
        <text x="40" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `

        return `data:image/svg+xml;base64,${btoa(svg)}`
    }

    /**
     * Verifica si hay un token almacenado
     */
    private checkStoredToken(): void {
        const token = localStorage.getItem("spotify_access_token")
        const expiration = localStorage.getItem("spotify_token_expiration")

        if (token && expiration && Date.now() < Number.parseInt(expiration)) {
            this.accessToken = token
            this.tokenExpiration = Number.parseInt(expiration)
            this.authStatusSubject.next(true)
            this.getUserProfile()
        }
    }

    /**
     * Inicia el proceso de autenticación con Spotify
     */
    authenticate(): void {
        const scopes = [
            "user-read-private",
            "user-read-email",
            "user-library-read",
            "user-top-read",
            "playlist-read-private",
            "playlist-read-collaborative",
        ].join(" ")

        const authUrl =
            `https://accounts.spotify.com/authorize?` +
            `client_id=${this.CLIENT_ID}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
            `scope=${encodeURIComponent(scopes)}`

        // En una app móvil, usarías InAppBrowser
        window.open(authUrl, "_system")
    }

    /**
     * Obtiene el token de acceso usando Client Credentials Flow (para búsquedas públicas)
     */
    getClientCredentialsToken(): Observable<string> {
        const headers = new HttpHeaders({
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`),
        })

        const body = "grant_type=client_credentials"

        return this.http.post<SpotifyAuthResponse>("https://accounts.spotify.com/api/token", body, { headers }).pipe(
            map((response) => {
                this.accessToken = response.access_token
                this.tokenExpiration = Date.now() + response.expires_in * 1000

                localStorage.setItem("spotify_access_token", this.accessToken)
                localStorage.setItem("spotify_token_expiration", this.tokenExpiration.toString())

                return this.accessToken
            }),
        )
    }

    /**
     * Busca tracks en Spotify
     */
    searchTracks(query: string, limit = 20): Observable<SpotifyTrack[]> {
        if (!this.accessToken || Date.now() >= this.tokenExpiration) {
            return this.getClientCredentialsToken()
                .pipe(
                    switchMap(() => this.performSearch(query, limit))
                )
        }

        return this.performSearch(query, limit)
    }

    /**
     * Realiza la búsqueda en Spotify
     */
    private performSearch(query: string, limit: number): Observable<SpotifyTrack[]> {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
        })

        const params = {
            q: query,
            type: "track",
            limit: limit.toString(),
            market: "US",
        }

        return this.http.get<any>("https://api.spotify.com/v1/search", { headers, params }).pipe(
            map((response) => {
                return response.tracks.items.map((track: any) => this.mapToSpotifyTrack(track))
            }),
            catchError((error) => {
                console.error("Error en búsqueda de Spotify:", error)
                return []
            }),
        )
    }

    /**
     * Obtiene el perfil del usuario
     */
    getUserProfile(): Observable<any> {
        if (!this.accessToken) {
            throw new Error("No hay token de acceso")
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
        })

        return this.http.get<any>("https://api.spotify.com/v1/me", { headers }).pipe(
            map((profile) => {
                this.userProfileSubject.next(profile)
                return profile
            }),
        )
    }

    /**
     * Obtiene las playlists del usuario
     */
    getUserPlaylists(limit = 20): Observable<any[]> {
        if (!this.accessToken) {
            throw new Error("No hay token de acceso")
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
        })

        const params = {
            limit: limit.toString(),
        }

        return this.http
            .get<any>("https://api.spotify.com/v1/me/playlists", { headers, params })
            .pipe(map((response) => response.items))
    }

    /**
     * Obtiene los tracks de una playlist
     */
    getPlaylistTracks(playlistId: string): Observable<SpotifyTrack[]> {
        if (!this.accessToken) {
            throw new Error("No hay token de acceso")
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.accessToken}`,
        })

        return this.http.get<any>(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, { headers }).pipe(
            map((response) => {
                return response.items
                    .filter((item: any) => item.track && item.track.type === "track")
                    .map((item: any) => this.mapToSpotifyTrack(item.track))
            }),
        )
    }

    /**
     * Convierte un track de Spotify a nuestro formato
     */
    private mapToSpotifyTrack(track: any): SpotifyTrack {
        const title = track.name
        const artist = track.artists.map((artist: any) => artist.name).join(", ")

        return {
            id: track.id,
            title: title,
            artist: artist,
            album: track.album.name,
            duration: Math.floor(track.duration_ms / 1000),
            thumbnail:
                track.album.images[1]?.url || track.album.images[0]?.url || this.getDefaultSpotifyThumbnail(title, artist),
            previewUrl: track.preview_url,
            externalUrl: track.external_urls.spotify,
        }
    }

    /**
     * Verifica si está autenticado
     */
    isAuthenticated(): boolean {
        return this.authStatusSubject.value && !!this.accessToken && Date.now() < this.tokenExpiration
    }

    /**
     * Cierra sesión
     */
    logout(): void {
        this.accessToken = null
        this.tokenExpiration = 0
        localStorage.removeItem("spotify_access_token")
        localStorage.removeItem("spotify_token_expiration")
        this.authStatusSubject.next(false)
        this.userProfileSubject.next(null)
    }
}
