import { Injectable } from "@angular/core"
import { File } from "@awesome-cordova-plugins/file/ngx"
import { Platform } from "@ionic/angular"
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx"
import { BehaviorSubject } from "rxjs"

export interface MusicFile {
  name: string
  path: string
  fullPath: string
  size?: number
  type?: string
}

@Injectable({
  providedIn: "root",
})
export class MusicFileService {
  private musicFilesSubject = new BehaviorSubject<MusicFile[]>([])
  public musicFiles$ = this.musicFilesSubject.asObservable()

  constructor(
    private file: File,
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
  ) { }

  /**
   * Solicita permisos de almacenamiento
   */
  async requestStoragePermissions(): Promise<boolean> {
    try {
      const permissions = [
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
        this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
      ]

      for (const permission of permissions) {
        const result = await this.androidPermissions.checkPermission(permission)
        if (!result.hasPermission) {
          const requestResult = await this.androidPermissions.requestPermission(permission)
          if (!requestResult.hasPermission) {
            console.error(`Permiso denegado: ${permission}`)
            return false
          }
        }
      }
      return true
    } catch (error) {
      console.error("Error al solicitar permisos:", error)
      return false
    }
  }

  /**
   * Busca archivos de música en el dispositivo
   */
  async searchMusicFiles(): Promise<MusicFile[]> {
    await this.platform.ready()

    // Verificar permisos primero
    const hasPermissions = await this.requestStoragePermissions()
    if (!hasPermissions) {
      console.error("No se tienen los permisos necesarios para acceder a los archivos")
      return []
    }

    // Directorios comunes donde buscar música
    const directories = [
      { path: "Music/", directory: this.file.externalRootDirectory },   // Ruta real: /storage/emulated/0/Music
      { path: "Download/", directory: this.file.externalRootDirectory }, // Ruta real: /storage/emulated/0/Download
      { path: "", directory: this.file.dataDirectory }, // Directorio privado de la app
      { path: "", directory: this.file.externalRootDirectory }, // Carpeta raíz externa
    ]

    let musicFiles: MusicFile[] = []

    for (const dir of directories) {
      if (!dir.directory) continue

      try {
        console.log(`Buscando en: ${dir.directory}${dir.path}`)
        const entries = await this.file.listDir(dir.directory, dir.path)

        // Filtrar solo archivos de audio
        const audioFiles = entries.filter(
          (entry) =>
            entry.isFile &&
            (entry.name.endsWith(".mp3") ||
              entry.name.endsWith(".wav") ||
              entry.name.endsWith(".ogg") ||
              entry.name.endsWith(".m4a")),
        )

        // Convertir a formato MusicFile
        const dirMusicFiles = audioFiles.map((entry) => ({
          name: entry.name,
          path: entry.nativeURL,
          fullPath: `${dir.directory}${dir.path}${entry.name}`,
        }))

        musicFiles = [...musicFiles, ...dirMusicFiles]
        console.log(`Encontrados ${dirMusicFiles.length} archivos en ${dir.directory}${dir.path}`)
      } catch (error) {
        console.warn(`No se pudo acceder al directorio ${dir.directory}${dir.path}:`, error)
        // Continuamos con el siguiente directorio
      }
    }

    // Actualizar el subject
    this.musicFilesSubject.next(musicFiles)
    return musicFiles
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
   * Lee los metadatos de un archivo de música (simulado)
   * En una implementación real, usaríamos un plugin como cordova-plugin-media-metadata
   */
  async getMusicFileMetadata(filePath: string): Promise<any> {
    // Simulación de metadatos
    const fileName = filePath.substring(filePath.lastIndexOf("/") + 1)
    const title = fileName.substring(0, fileName.lastIndexOf("."))

    return {
      title: title,
      artist: "Artista desconocido",
      album: "Álbum desconocido",
      duration: 180, // 3 minutos por defecto
    }
  }
}
