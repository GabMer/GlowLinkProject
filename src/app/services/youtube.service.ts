import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

export interface YouTubeVideo {
    id: string
    title: string
    artist: string
    duration: number
    thumbnail: string
    url: string
}

@Injectable({
    providedIn: "root",
})
export class YouTubeService {
    private readonly API_KEY = "AIzaSyBDUObVdfk5a25aytkG_Z6_KHaweL2PS_8" 
    private readonly BASE_URL = "https://www.googleapis.com/youtube/v3"

    constructor(private http: HttpClient) { }

    /**
     * Genera un thumbnail por defecto para YouTube
     */
    private getDefaultYouTubeThumbnail(title: string): string {
        const svg = `
      <svg width="120" height="90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ytGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#cc0000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="120" height="90" fill="url(#ytGrad)" rx="4"/>
        <polygon points="45,30 45,60 75,45" fill="white"/>
        <text x="60" y="80" font-family="Arial, sans-serif" font-size="8" 
              text-anchor="middle" fill="white">${title.substring(0, 15)}...</text>
      </svg>
    `

        return `data:image/svg+xml;base64,${btoa(svg)}`
    }

    /**
     * Busca videos de música en YouTube
     */
    searchMusic(query: string, maxResults = 20): Observable<YouTubeVideo[]> {
        const searchUrl = `${this.BASE_URL}/search`
        const params = {
            part: "snippet",
            q: `${query} music`,
            type: "video",
            videoCategoryId: "10", // Categoría de música
            maxResults: maxResults.toString(),
            key: this.API_KEY,
        }

        return this.http.get<any>(searchUrl, { params }).pipe(
            map((response) => {
                return response.items.map((item: any) => this.mapToYouTubeVideo(item))
            }),
        )
    }

    /**
     * Obtiene detalles de un video específico
     */
    getVideoDetails(videoId: string): Observable<YouTubeVideo> {
        const videoUrl = `${this.BASE_URL}/videos`
        const params = {
            part: "snippet,contentDetails",
            id: videoId,
            key: this.API_KEY,
        }

        return this.http.get<any>(videoUrl, { params }).pipe(
            map((response) => {
                if (response.items && response.items.length > 0) {
                    return this.mapToYouTubeVideoDetailed(response.items[0])
                }
                throw new Error("Video no encontrado")
            }),
        )
    }

    /**
     * Obtiene la URL de streaming para un video
     */
    getStreamUrl(videoId: string): string {
        return `https://www.youtube.com/watch?v=${videoId}`
    }

    /**
     * Convierte la respuesta de la API a nuestro formato
     */
    private mapToYouTubeVideo(item: any): YouTubeVideo {
        const title = this.cleanTitle(item.snippet.title)
        return {
            id: item.id.videoId,
            title: title,
            artist: item.snippet.channelTitle,
            duration: 0, // Se obtiene por separado
            thumbnail:
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url ||
                this.getDefaultYouTubeThumbnail(title),
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }
    }

    /**
     * Convierte la respuesta detallada de la API
     */
    private mapToYouTubeVideoDetailed(item: any): YouTubeVideo {
        const title = this.cleanTitle(item.snippet.title)
        return {
            id: item.id,
            title: title,
            artist: item.snippet.channelTitle,
            duration: this.parseDuration(item.contentDetails.duration),
            thumbnail:
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url ||
                this.getDefaultYouTubeThumbnail(title),
            url: `https://www.youtube.com/watch?v=${item.id}`,
        }
    }

    /**
     * Limpia el título del video
     */
    private cleanTitle(title: string): string {
        // Remover texto común de videos musicales
        return title
            .replace(/\[Official Video\]/gi, "")
            .replace(/\[Official Music Video\]/gi, "")
            .replace(/\[Official Audio\]/gi, "")
            .replace(/$$Official Video$$/gi, "")
            .replace(/$$Official Music Video$$/gi, "")
            .replace(/$$Official Audio$$/gi, "")
            .trim()
    }

    /**
     * Convierte duración ISO 8601 a segundos
     */
    private parseDuration(duration: string): number {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
        if (!match) return 0

        let seconds = 0
        if (match[1]) seconds += Number.parseInt(match[1]) * 3600
        if (match[2]) seconds += Number.parseInt(match[2]) * 60
        if (match[3]) seconds += Number.parseInt(match[3])

        return seconds
    }
}
