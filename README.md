# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## 3D

# 1️⃣ Installer Expo GL (WebGL dans Expo)

npx expo install expo-gl

# 2️⃣ Installer Three.js version compatible avec expo-three

npm install three@0.168.0

# 3️⃣ Installer expo-three (en ignorant les peer deps pour éviter le conflit)

npm install expo-three --legacy-peer-deps

# 4️⃣ Installer les types TypeScript pour Three.js

npm install --save-dev @types/three --legacy-peer-deps

# 🤔 Pourquoi

- expo-gl : nécessaire pour GLView

- three@0.168.0 : version downgradée pour être compatible avec expo-three@8.0.0

- expo-three --legacy-peer-deps : wrapper pour créer un renderer WebGL Expo, bypass du conflit de versions

- @types/three : pour le typage TypeScript
