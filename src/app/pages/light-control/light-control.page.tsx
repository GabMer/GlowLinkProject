"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonRange,
  IonLabel,
  IonItem,
  IonToggle,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonText,
  IonChip,
  IonSpinner,
  IonList,
  IonFooter,
  IonToast,
} from "@ionic/react"
import {
  bulbOutline,
  bulb,
  saveOutline,
  timerOutline,
  bluetooth,
  bluetoothOutline,
  addOutline,
  closeOutline,
  flashOutline,
  contrastOutline,
  colorWandOutline,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons"
import "./light-control.page.scss"

interface Light {
  id: number
  name: string
  isOn: boolean
  color: string
  brightness: number
  rgb: { r: number; g: number; b: number }
}

interface Preset {
  id: number
  name: string
  colors: string[]
}

const LightControlPage: React.FC = () => {
  // Estado para las luces
  const [lights, setLights] = useState<Light[]>([
    {
      id: 1,
      name: "Luz Principal",
      isOn: false,
      color: "#ff5500",
      brightness: 100,
      rgb: { r: 255, g: 85, b: 0 },
    },
    {
      id: 2,
      name: "Luz Secundaria",
      isOn: false,
      color: "#00aaff",
      brightness: 90,
      rgb: { r: 0, g: 170, b: 255 },
    },
    {
      id: 3,
      name: "Luz de Ambiente",
      isOn: false,
      color: "#ff00ff",
      brightness: 80,
      rgb: { r: 255, g: 0, b: 255 },
    },
  ])

  // Estado para presets guardados
  const [presets, setPresets] = useState<Preset[]>([
    { id: 1, name: "Fiesta", colors: ["#ff0000", "#00ff00", "#0000ff"] },
    { id: 2, name: "Relajación", colors: ["#4a00ff", "#00ffff", "#ff00ff"] },
    { id: 3, name: "Energía", colors: ["#ffff00", "#ff8800", "#ff0088"] },
  ])

  // Estado para el temporizador
  const [timerSettings, setTimerSettings] = useState({
    active: false,
    interval: 5, // segundos
    selectedPreset: 1,
  })

  // Estado para la conexión Bluetooth
  const [bluetoothConnected, setBluetoothConnected] = useState(false)
  const [bluetoothSearching, setBluetoothSearching] = useState(false)

  // Estados para modales
  const [showTimerModal, setShowTimerModal] = useState(false)
  const [showSavePresetModal, setShowSavePresetModal] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")

  // Estado para notificaciones
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Estado para expandir/colapsar controles avanzados
  const [expandedLightId, setExpandedLightId] = useState<number | null>(null)

  // Efecto para el temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timerSettings.active) {
      let colorIndex = 0
      const selectedPreset = presets.find((p) => p.id === timerSettings.selectedPreset)

      if (selectedPreset) {
        interval = setInterval(() => {
          // Cambiar colores de todas las luces encendidas
          setLights((prevLights) =>
            prevLights.map((light) => {
              if (light.isOn) {
                const newColor = selectedPreset.colors[colorIndex]
                const rgb = hexToRgb(newColor)
                return { ...light, color: newColor, rgb }
              }
              return light
            }),
          )

          // Avanzar al siguiente color en el preset
          colorIndex = (colorIndex + 1) % selectedPreset.colors.length
        }, timerSettings.interval * 1000)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerSettings, presets])

  // Función para convertir hex a rgb
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Función para convertir rgb a hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  // Función para cambiar el estado de encendido/apagado
  const toggleLight = (id: number) => {
    setLights(lights.map((light) => (light.id === id ? { ...light, isOn: !light.isOn } : light)))
  }

  // Función para cambiar el color por hex
  const changeColor = (id: number, color: string) => {
    const rgb = hexToRgb(color)
    setLights(lights.map((light) => (light.id === id ? { ...light, color, rgb } : light)))
  }

  // Función para cambiar el color por RGB
  const changeRgbColor = (id: number, channel: "r" | "g" | "b", value: number) => {
    setLights(
      lights.map((light) => {
        if (light.id === id) {
          const newRgb = { ...light.rgb, [channel]: value }
          const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
          return { ...light, rgb: newRgb, color: newHex }
        }
        return light
      }),
    )
  }

  // Función para cambiar el brillo
  const changeBrightness = (id: number, brightness: number) => {
    setLights(lights.map((light) => (light.id === id ? { ...light, brightness } : light)))
  }

  // Función para guardar un nuevo preset
  const saveNewPreset = () => {
    if (newPresetName.trim() === "") {
      setToastMessage("Por favor ingresa un nombre para el preset")
      setShowToast(true)
      return
    }

    const newColors = lights.filter((light) => light.isOn).map((light) => light.color)

    if (newColors.length === 0) {
      setToastMessage("Debes tener al menos una luz encendida para guardar un preset")
      setShowToast(true)
      return
    }

    const newId = Math.max(...presets.map((p) => p.id), 0) + 1
    const newPreset: Preset = {
      id: newId,
      name: newPresetName,
      colors: newColors,
    }

    setPresets([...presets, newPreset])
    setNewPresetName("")
    setShowSavePresetModal(false)

    setToastMessage("Preset guardado correctamente")
    setShowToast(true)
  }

  // Función para aplicar un preset
  const applyPreset = (presetId: number) => {
    const preset = presets.find((p) => p.id === presetId)
    if (!preset || preset.colors.length === 0) return

    // Aplicar colores a las luces encendidas
    let colorIndex = 0
    setLights(
      lights.map((light) => {
        if (light.isOn) {
          const newColor = preset.colors[colorIndex % preset.colors.length]
          colorIndex++
          const rgb = hexToRgb(newColor)
          return { ...light, color: newColor, rgb }
        }
        return light
      }),
    )

    setToastMessage(`Preset "${preset.name}" aplicado`)
    setShowToast(true)
  }

  // Función para simular conexión Bluetooth
  const toggleBluetooth = () => {
    if (bluetoothConnected) {
      setBluetoothConnected(false)
      setToastMessage("Dispositivo Bluetooth desconectado")
      setShowToast(true)
    } else {
      setBluetoothSearching(true)

      // Simular búsqueda y conexión
      setTimeout(() => {
        setBluetoothSearching(false)
        setBluetoothConnected(true)
        setToastMessage("Dispositivo Bluetooth conectado")
        setShowToast(true)
      }, 2000)
    }
  }

  // Función para expandir/colapsar controles avanzados
  const toggleExpandLight = (id: number) => {
    setExpandedLightId(expandedLightId === id ? null : id)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark" className="glowlink-header">
          <IonTitle>
            <span className="app-title">GlowLink</span>
            <span className="app-subtitle">Control de Luces</span>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleBluetooth}>
              {bluetoothSearching ? (
                <IonSpinner name="dots" />
              ) : (
                <IonIcon
                  icon={bluetoothConnected ? bluetooth : bluetoothOutline}
                  color={bluetoothConnected ? "primary" : "medium"}
                />
              )}
            </IonButton>
            <IonButton onClick={() => setShowTimerModal(true)}>
              <IonIcon icon={timerOutline} color={timerSettings.active ? "success" : "medium"} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding glowlink-content">
        <IonGrid>
          {/* Luces */}
          {lights.map((light) => (
            <IonRow key={light.id}>
              <IonCol size="12">
                <IonCard className={`light-card ${light.isOn ? "light-on" : "light-off"}`}>
                  <div
                    className="light-color-indicator"
                    style={{
                      backgroundColor: light.color,
                      opacity: light.isOn ? light.brightness / 100 : 0.2,
                    }}
                  ></div>

                  <IonCardHeader>
                    <IonCardTitle className="light-title">
                      <IonIcon
                        icon={light.isOn ? bulb : bulbOutline}
                        className="light-icon"
                        style={{
                          color: light.isOn ? light.color : "var(--ion-color-medium)",
                          filter: light.isOn ? `brightness(${light.brightness}%)` : "none",
                        }}
                      />
                      {light.name}

                      <IonToggle
                        checked={light.isOn}
                        onIonChange={() => toggleLight(light.id)}
                        className="light-toggle"
                      />
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    {/* Controles básicos siempre visibles */}
                    <div className="basic-controls">
                      <div className="color-preview-container">
                        <div
                          className="color-preview"
                          style={{
                            backgroundColor: light.color,
                            opacity: light.isOn ? light.brightness / 100 : 0.3,
                          }}
                        ></div>
                        <div className="color-hex">{light.color}</div>
                      </div>

                      <IonItem lines="none" className={light.isOn ? "" : "disabled-control"}>
                        <IonRange
                          min={0}
                          max={100}
                          value={light.brightness}
                          onIonChange={(e) => changeBrightness(light.id, e.detail.value as number)}
                          disabled={!light.isOn}
                          className="brightness-slider"
                        >
                          <IonIcon slot="start" icon={contrastOutline} />
                          <IonIcon slot="end" icon={flashOutline} />
                        </IonRange>
                      </IonItem>
                    </div>

                    {/* Botón para expandir/colapsar controles avanzados */}
                    <IonButton
                      fill="clear"
                      size="small"
                      expand="block"
                      className="expand-button"
                      onClick={() => toggleExpandLight(light.id)}
                    >
                      <IonIcon slot="end" icon={expandedLightId === light.id ? chevronUpOutline : chevronDownOutline} />
                      {expandedLightId === light.id ? "Menos opciones" : "Más opciones"}
                    </IonButton>

                    {/* Controles avanzados (expandibles) */}
                    {expandedLightId === light.id && (
                      <div className={`advanced-controls ${light.isOn ? "" : "disabled-control"}`}>
                        {/* Selector de color */}
                        <div className="color-wheel-container">
                          <input
                            type="color"
                            value={light.color}
                            onChange={(e) => light.isOn && changeColor(light.id, e.target.value)}
                            disabled={!light.isOn}
                            className="color-wheel"
                          />
                        </div>

                        {/* Controles RGB */}
                        <div className="rgb-controls">
                          <IonItem lines="none">
                            <IonLabel position="stacked" color="danger">
                              R
                            </IonLabel>
                            <IonRange
                              min={0}
                              max={255}
                              value={light.rgb.r}
                              onIonChange={(e) => light.isOn && changeRgbColor(light.id, "r", e.detail.value as number)}
                              disabled={!light.isOn}
                              color="danger"
                            />
                          </IonItem>

                          <IonItem lines="none">
                            <IonLabel position="stacked" color="success">
                              G
                            </IonLabel>
                            <IonRange
                              min={0}
                              max={255}
                              value={light.rgb.g}
                              onIonChange={(e) => light.isOn && changeRgbColor(light.id, "g", e.detail.value as number)}
                              disabled={!light.isOn}
                              color="success"
                            />
                          </IonItem>

                          <IonItem lines="none">
                            <IonLabel position="stacked" color="primary">
                              B
                            </IonLabel>
                            <IonRange
                              min={0}
                              max={255}
                              value={light.rgb.b}
                              onIonChange={(e) => light.isOn && changeRgbColor(light.id, "b", e.detail.value as number)}
                              disabled={!light.isOn}
                              color="primary"
                            />
                          </IonItem>
                        </div>

                        {/* Presets rápidos */}
                        <div className="quick-colors">
                          {["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffffff"].map(
                            (color) => (
                              <div
                                key={color}
                                className={`quick-color ${light.color === color ? "selected" : ""}`}
                                style={{ backgroundColor: color }}
                                onClick={() => light.isOn && changeColor(light.id, color)}
                              ></div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          ))}

          {/* Presets guardados */}
          <IonRow>
            <IonCol size="12">
              <IonCard className="presets-card">
                <IonCardHeader>
                  <IonCardTitle>
                    <IonIcon icon={colorWandOutline} className="preset-icon" />
                    Presets Guardados
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="presets-container">
                    {presets.map((preset) => (
                      <div key={preset.id} className="preset-item">
                        <div className="preset-colors">
                          {preset.colors.map((color, index) => (
                            <div key={index} className="preset-color" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                        <div className="preset-name">{preset.name}</div>
                        <IonButton fill="clear" size="small" onClick={() => applyPreset(preset.id)}>
                          Aplicar
                        </IonButton>
                      </div>
                    ))}

                    <div className="preset-item add-preset" onClick={() => setShowSavePresetModal(true)}>
                      <div className="add-preset-icon">
                        <IonIcon icon={addOutline} />
                      </div>
                      <div className="preset-name">Nuevo Preset</div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          {/* Botones de control global */}
          <IonRow>
            <IonCol size="12">
              <div className="global-controls">
                <IonButton
                  expand="block"
                  color="success"
                  onClick={() => setLights(lights.map((light) => ({ ...light, isOn: true })))}
                >
                  <IonIcon icon={flashOutline} slot="start" />
                  Encender Todas
                </IonButton>
                <IonButton
                  expand="block"
                  color="medium"
                  onClick={() => setLights(lights.map((light) => ({ ...light, isOn: false })))}
                >
                  <IonIcon icon={contrastOutline} slot="start" />
                  Apagar Todas
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modal de temporizador */}
        <IonModal isOpen={showTimerModal} onDidDismiss={() => setShowTimerModal(false)}>
          <IonHeader>
            <IonToolbar color="dark">
              <IonTitle>Configuración de Temporizador</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowTimerModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel>Activar Temporizador</IonLabel>
                <IonToggle
                  checked={timerSettings.active}
                  onIonChange={(e) =>
                    setTimerSettings({
                      ...timerSettings,
                      active: e.detail.checked,
                    })
                  }
                />
              </IonItem>

              <IonItem>
                <IonLabel>Intervalo (segundos)</IonLabel>
                <IonInput
                  type="number"
                  value={timerSettings.interval}
                  onIonChange={(e) =>
                    setTimerSettings({
                      ...timerSettings,
                      interval: Number.parseInt(e.detail.value || "5", 10),
                    })
                  }
                  min={1}
                  max={60}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Preset a utilizar</IonLabel>
                <IonSelect
                  value={timerSettings.selectedPreset}
                  onIonChange={(e) =>
                    setTimerSettings({
                      ...timerSettings,
                      selectedPreset: e.detail.value,
                    })
                  }
                >
                  {presets.map((preset) => (
                    <IonSelectOption key={preset.id} value={preset.id}>
                      {preset.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              onClick={() => {
                setShowTimerModal(false)
                if (timerSettings.active) {
                  setToastMessage("Temporizador activado")
                  setShowToast(true)
                }
              }}
            >
              Guardar Configuración
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Modal para guardar preset */}
        <IonModal isOpen={showSavePresetModal} onDidDismiss={() => setShowSavePresetModal(false)}>
          <IonHeader>
            <IonToolbar color="dark">
              <IonTitle>Guardar Nuevo Preset</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowSavePresetModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Nombre del Preset</IonLabel>
              <IonInput
                value={newPresetName}
                placeholder="Ej: Fiesta, Relajación, etc."
                onIonChange={(e) => setNewPresetName(e.detail.value || "")}
              />
            </IonItem>

            <div className="preset-preview">
              <IonLabel>Vista previa:</IonLabel>
              <div className="preset-colors-preview">
                {lights
                  .filter((light) => light.isOn)
                  .map((light) => (
                    <div key={light.id} className="preset-color-preview" style={{ backgroundColor: light.color }}></div>
                  ))}

                {lights.filter((light) => light.isOn).length === 0 && (
                  <IonText color="medium">No hay luces encendidas para guardar</IonText>
                )}
              </div>
            </div>

            <IonButton
              expand="block"
              onClick={saveNewPreset}
              disabled={lights.filter((light) => light.isOn).length === 0}
            >
              <IonIcon icon={saveOutline} slot="start" />
              Guardar Preset
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>

      <IonFooter>
        <IonToolbar color="dark" className="footer-toolbar">
          <div className="connection-status">
            {bluetoothConnected ? (
              <IonChip color="success">
                <IonIcon icon={bluetooth} />
                <IonLabel>Conectado</IonLabel>
              </IonChip>
            ) : (
              <IonChip color="medium">
                <IonIcon icon={bluetoothOutline} />
                <IonLabel>Desconectado</IonLabel>
              </IonChip>
            )}

            {timerSettings.active && (
              <IonChip color="primary">
                <IonIcon icon={timerOutline} />
                <IonLabel>Temporizador Activo</IonLabel>
              </IonChip>
            )}
          </div>
        </IonToolbar>
      </IonFooter>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
      />
    </IonPage>
  )
}

export default LightControlPage

