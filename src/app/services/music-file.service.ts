import { Injectable } from "@angular/core"
import { Filesystem, Directory } from "@capacitor/filesystem"
import { Device } from "@capacitor/device"
import { BehaviorSubject } from "rxjs"

export interface MusicFile {
  id: string
  name: string
  title: string
  artist: string
  path: string
  fullPath: string
  size?: number
  type?: string
  duration: number
  thumbnail: string
}

@Injectable({
  providedIn: "root",
})
export class MusicFileService {
  private musicFilesSubject = new BehaviorSubject<MusicFile[]>([])
  public musicFiles$ = this.musicFilesSubject.asObservable()

  constructor() { }

  /**
   * Genera un thumbnail por defecto usando CSS/SVG
   */
  private getDefaultThumbnail(title: string, artist: string): string {
    // Crear un SVG con las iniciales del artista y título
    const initials = this.getInitials(artist, title)
    const colors = this.getColorFromText(artist + title)

    const svg = `
      <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" fill="url(#grad)" rx="8"/>
        <text x="40" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `

    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  /**
   * Obtiene las iniciales del artista y título
   */
  private getInitials(artist: string, title: string): string {
    const artistInitial = artist.charAt(0).toUpperCase()
    const titleInitial = title.charAt(0).toUpperCase()
    return artistInitial + titleInitial
  }

  /**
   * Genera colores basados en el texto
   */
  private getColorFromText(text: string): { primary: string; secondary: string } {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash)
    }

    const hue1 = Math.abs(hash) % 360
    const hue2 = (hue1 + 60) % 360

    return {
      primary: `hsl(${hue1}, 70%, 50%)`,
      secondary: `hsl(${hue2}, 70%, 60%)`,
    }
  }

  /**
   * Solicita permisos de almacenamiento
   */
  async requestStoragePermissions(): Promise<boolean> {
    try {
      const deviceInfo = await Device.getInfo()

      if (deviceInfo.platform === "web") {
        return true // En web no necesitamos permisos
      }

      // En Capacitor, los permisos se manejan automáticamente
      // o se configuran en el archivo de configuración de la plataforma
      return true
    } catch (error) {
      console.error("Error al verificar permisos:", error)
      return false
    }
  }

  /**
   * Busca archivos de música en el dispositivo
   */
  async searchMusicFiles(): Promise<MusicFile[]> {
    const deviceInfo = await Device.getInfo()

    // Si es web, devolver archivos de ejemplo
    if (deviceInfo.platform === "web") {
      return this.getDemoMusicFiles()
    }

    // Verificar permisos primero
    const hasPermissions = await this.requestStoragePermissions()
    if (!hasPermissions) {
      console.error("No se tienen los permisos necesarios para acceder a los archivos")
      return this.getDemoMusicFiles()
    }

    let musicFiles: MusicFile[] = []

    try {
      // Buscar en directorios comunes de música
      const directories = [
        { directory: Directory.ExternalStorage, path: "Music" },
        { directory: Directory.ExternalStorage, path: "Download" },
        { directory: Directory.Documents, path: "" },
      ]

      for (const dir of directories) {
        try {
          console.log(`Buscando en: ${dir.directory}/${dir.path}`)
          const result = await Filesystem.readdir({
            path: dir.path,
            directory: dir.directory,
          })

          // Filtrar solo archivos de audio
          const audioFiles = result.files.filter((file) => file.type === "file" && this.isAudioFile(file.name))

          // Convertir a formato MusicFile
          const dirMusicFiles = await Promise.all(
            audioFiles.map(async (file) => {
              const metadata = await this.getMusicFileMetadata(file.name)
              const filePath = `${dir.directory}/${dir.path}/${file.name}`

              return {
                id: `device_${file.name}_${Date.now()}`,
                name: file.name,
                title: metadata.title,
                artist: metadata.artist,
                path: filePath,
                fullPath: filePath,
                duration: metadata.duration,
                thumbnail: this.getDefaultThumbnail(metadata.title, metadata.artist),
              }
            }),
          )

          musicFiles = [...musicFiles, ...dirMusicFiles]
          console.log(`Encontrados ${dirMusicFiles.length} archivos en ${dir.directory}/${dir.path}`)
        } catch (error) {
          console.warn(`No se pudo acceder al directorio ${dir.directory}/${dir.path}:`, error)
        }
      }
    } catch (error) {
      console.error("Error general buscando archivos:", error)
    }

    // Si no encontramos archivos reales, usar archivos de demo
    if (musicFiles.length === 0) {
      musicFiles = this.getDemoMusicFiles()
    }

    // Actualizar el subject
    this.musicFilesSubject.next(musicFiles)
    return musicFiles
  }

  /**
   * Verifica si un archivo es de audio
   */
  private isAudioFile(fileName: string): boolean {
    const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."))
    return audioExtensions.includes(extension)
  }

  /**
   * Obtiene archivos de música de demostración
   */
  private getDemoMusicFiles(): MusicFile[] {
    const demoFiles = [
      { title: "Canción de Demostración 1", artist: "Artista Demo" },
      { title: "Canción de Demostración 2", artist: "Artista Demo" },
      { title: "Canción de Demostración 3", artist: "Artista Demo" },
      { title: "Rock Clásico", artist: "Rock Band" },
      { title: "Jazz Suave", artist: "Jazz Ensemble" },
      { title: "Música Electrónica", artist: "DJ Demo" },
    ]

    return demoFiles.map((demo, index) => ({
      id: `demo${index + 1}`,
      name: `demo-song-${index + 1}.mp3`,
      title: demo.title,
      artist: demo.artist,
      path: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index + 1}.mp3`,
      fullPath: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index + 1}.mp3`,
      duration: 180 + index * 30,
      thumbnail: this.getDefaultThumbnail(demo.title, demo.artist),
    }))
  }

  /**
   * Obtiene la ruta de un archivo de música
   */
  async getMusicFilePath(fileName: string): Promise<string | null> {
    const musicFiles = this.musicFilesSubject.getValue()
    const file = musicFiles.find((f) => f.name === fileName)

    if (file) {
      return file.path
    }

    return null
  }

  /**
   * Lee los metadatos de un archivo de música
   */
  async getMusicFileMetadata(fileName: string): Promise<any> {
    // Extraer información básica del nombre del archivo
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."))

    // Intentar parsear el formato "Artista - Título"
    let title = nameWithoutExt
    let artist = "Artista Desconocido"

    if (nameWithoutExt.includes(" - ")) {
      const parts = nameWithoutExt.split(" - ")
      if (parts.length >= 2) {
        artist = parts[0].trim()
        title = parts.slice(1).join(" - ").trim()
      }
    }

    return {
      title: title,
      artist: artist,
      album: "Álbum Desconocido",
      duration: 180, // 3 minutos por defecto
      thumbnail: null,
    }
  }

  /**
   * Busca archivos por texto
   */
  searchFiles(query: string): MusicFile[] {
    const allFiles = this.musicFilesSubject.getValue()
    if (!query.trim()) return allFiles

    const searchTerm = query.toLowerCase()
    return allFiles.filter(
      (file) =>
        file.title.toLowerCase().includes(searchTerm) ||
        file.artist.toLowerCase().includes(searchTerm) ||
        file.name.toLowerCase().includes(searchTerm),
    )
  }
}
