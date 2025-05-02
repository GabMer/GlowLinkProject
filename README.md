# GlowLinkProject

##Tabla de Contenidos

1. Introduccion

    Bienvenido al proyecto de control de luces vía conexión FireBase, desarrollado en Ionic + Angular.
    Esta aplicación convierte tu celular en una pantalla de luces, útil para espectáculos visuales, fiestas o demostraciones sincronizadas.
    La pantalla cambia de color y brillo en tiempo real, controlado desde Firebase Realtime Database.
    ![Logo](assets/images/logo.svg)

2. Sobre el proyecto
    Este proyecto transforma cualquier smartphone en parte de un show de luces, permitiendo la sincronización de pantallas mediante una fuente común: Firebase.

    Tiene tres modos:

    🔹 Predeterminado: colores y efectos definidos previamente.

    🟡 Personalizado: el usuario elige color y brillo.

    🎵 Sincronizado con música: los efectos se adaptan al ritmo (en versión futura).

3. Tabla de contenidos
    1. Introducción

    2. Sobre el Proyecto

    3. Tabla de Contenidos

    4. Propósito del Proyecto

    5. Tecnologías

    6. Entorno de Desarrollo

    7. Estructura de Archivo

    8. Sobre Su Proyecto

4. Propósito del proyecto
    - Reemplazar la pirotecnia
    - Crear experiencias visuales sincronizadas en múltiples celulares.
    - Simular efectos de luz a través de la pantalla.
    - Aprender sobre sincronización en tiempo real con Firebase.
    - Desarrollar un producto divertido y visual para fiestas o presentaciones.

5. Tecnologías
    - Ionic Framework (v7+)
    - Angular
    - Firebase Realtime Database
    - HTML / SCSS
    - TypeScript
6. Entorno de desarrollo
    - Editor: Visual Studio Code
    - CLI: Ionic CLI
    - Base de Datos: Firebase Realtime Database
    - Plataforma de prueba:Navegador
7. Estructura de archivo
    glowlink-app/
├── src/                      # Código fuente principal
│   ├── app/                  # Lógica de la aplicación
│   │   ├── guards/           # Protección de rutas
│   │   │   └── auth.guard.ts # Guardia para rutas protegidas
│   │   │
│   │   ├── models/           # Interfaces y tipos
│   │   │   └── light.model.ts # Modelos para luces, presets, etc.
│   │   │
│   │   ├── pages/            # Páginas de la aplicación
│   │   │   ├── auth/         # Autenticación (login/registro)
│   │   │   │   ├── auth.page.html
│   │   │   │   ├── auth.page.scss
│   │   │   │   └── auth.page.ts
│   │   │   │
│   │   │   ├── home/
│   │   │   │   ├──home.module.ts
│   │   │   │   ├──home.page.html
│   │   │   │   ├──home.page.scss
│   │   │   │   ├──home.spec.page.ts
│   │   │   │   └──home-routing.module.ts
│   │   │   │
│   │   │   ├── light-control/ # Control principal de luces
│   │   │   │   ├── light-control.page.html
│   │   │   │   ├── light-control.page.scss
│   │   │   │   └── light-control.page.ts
│   │   │   │
│   │   │   ├── selected-lights/ # Vista de luces seleccionadas
│   │   │   │   ├── selected-lights.page.html
│   │   │   │   ├── selected-lights.page.scss
│   │   │   │   └── selected-lights.page.ts
│   │   │   │
│   │   │   └── welcome/      # Página de bienvenida
│   │   │       ├── welcome.page.html
│   │   │       ├── welcome.page.scss
│   │   │       └── welcome.page.ts
│   │   │
│   │   ├── pipes/            # Pipes personalizados
│   │   │   └── filter-by.pipe.ts # Pipe para filtrar colecciones
│   │   │
│   │   ├── services/         # Servicios de la aplicación
│   │   │   ├── auth.service.ts    # Servicio de autenticación con Firebase
│   │   │   ├── light-show.service.spec.ts
│   │   │   └── light.service.ts   # Servicio para gestión de luces
│   │   │
│   │   ├── app-routing.module.ts  # Configuración de rutas
│   │   ├── app.component.html     # Plantilla principal
│   │   ├── app.component.scss     # Estilos principales
│   │   ├── app.component.ts       # Componente raíz
│   │   ├── app.module.ts          # Módulo principal (para componentes no standalone)
│   │   └── app.routes.ts          # Definición de rutas para standalone
│   │
│   ├── assets/               # Recursos estáticos
│   │   ├── icon/             # Iconos de la aplicación
│   │   ├── images/           # Imágenes utilizadas
│   │   │   └── fireworks-bg.jpg # Fondo de pantallas de autenticación
│   │   └── shapes/           # SVGs y formas
│   │
│   ├── environments/         # Configuraciones por entorno
│   │   ├── environment.prod.ts # Configuración de producción
│   │   └── environment.ts    # Configuración de desarrollo
│   │
│   ├── theme/                # Temas y estilos globales
│   │   └── variables.scss    # Variables de Ionic/SCSS
│   │
│   ├── global.scss           # Estilos globales
│   ├── index.html            # Punto de entrada HTML
│   ├── main.ts               # Punto de entrada TypeScript
│   ├── polyfills.ts          # Polyfills para compatibilidad
│   └── zone-flags.ts         # Configuración de Zone.js
│
├── angular.json              # Configuración de Angular
├── capacitor.config.ts       # Configuración de Capacitor (si se usa)
├── ionic.config.json         # Configuración de Ionic
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración de TypeScript
├── tsconfig.app.json         # Configuración específica de la app
├── tsconfig.spec.json        # Configuración para pruebas
└── README.md                 # Documentación del proyecto
9. Sobre Su proyecto
    
        Este proyecto está inspirado en los espectáculos de luces sincronizadas, donde varios celulares pueden mostrar efectos al mismo tiempo.

    Características principales:

    - Modo predeterminado con efectos preconfigurados.
    - Modo personalizado para elegir tu color/brillo.
    - Sincronización en tiempo real con Firebase.
    - Preparado para ser extendido con audio/música.
