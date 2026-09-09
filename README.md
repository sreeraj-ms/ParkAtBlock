# ParkAtBlock

Real-time smart parking API for ESP32 distance sensors. The server keeps the latest state in memory, determines occupancy from distance, and publishes state transitions over SignalR.

## Structure

- `ParkAtBlock/Controllers`: parking and health REST endpoints
- `ParkAtBlock/Services`: occupancy rules, validation, offline evaluation, and SignalR publishing
- `ParkAtBlock/Repositories`: thread-safe current-state storage abstraction
- `ParkAtBlock/Hubs`: `/hubs/parking` SignalR hub
- `ParkAtBlock/Configuration`: configurable threshold, offline timeout, and dashboard origins
- `ParkAtBlock.API.Tests`: unit and integration tests

## Run

```sh
dotnet run --project ParkAtBlock.API/ParkAtBlock.csproj
```

In development, Swagger UI is available at `https://localhost:7188/swagger` and the raw OpenAPI document is available at `https://localhost:7188/openapi/v1.json` (or the HTTP URL shown by the app).

## API

Send a sensor event:

```sh
curl -k -X POST https://localhost:7188/api/parking/events \
  -H 'Content-Type: application/json' \
  -d '{"deviceId":"ESP32-001","slotId":1,"distanceCm":32.5}'
```

Read all slots or one slot:

```sh
curl -k https://localhost:7188/api/parking/slots
curl -k https://localhost:7188/api/parking/slots/1
curl -k https://localhost:7188/health
```

A distance below `OccupiedDistanceThresholdCm` is occupied. A distance equal to or above it is available. Events update `LastSeenUtc` and `LastUpdatedUtc`, mark the device online, and return the current `ParkingSlotState`. `ParkingSlotUpdated` is sent to SignalR clients only for a new slot or a meaningful occupancy/status transition.

## SignalR

Connect a dashboard client to `/hubs/parking` and listen for `ParkingSlotUpdated`. The payload is the same JSON shape returned by the slot endpoints. A newly connected client should call `GET /api/parking/slots` to obtain the current snapshot.

## Configuration

`appsettings.json` contains the production-safe defaults:

```json
"ParkingSettings": {
  "OccupiedDistanceThresholdCm": 50,
  "DeviceOfflineTimeoutSeconds": 30,
  "AllowedOrigins": []
}
```

Configure explicit dashboard origins in deployment configuration. The service marks a device offline when its last event is older than the configured timeout, evaluated when slot status is read. No heartbeat endpoint is needed for this first version.

## Deploy the API to Vercel

Vercel does not provide an official ASP.NET Core runtime. This API includes `ParkAtBlock.API/Dockerfile.vercel`, which deploys it as a Vercel container image. Create a separate Vercel project with `ParkAtBlock.API` as its Root Directory, then deploy from that directory:

```sh
cd ParkAtBlock.API
npx vercel link
npx vercel --prod
```

Set these production environment variables in the API Vercel project:

- `ParkingSettings__AllowedOrigins__0`: the deployed UI origin, for example `https://your-ui.vercel.app`
- `ParkingSettings__OccupiedDistanceThresholdCm`: optional occupancy threshold, default `50`
- `ParkingSettings__DeviceOfflineTimeoutSeconds`: optional offline timeout, default `30`
- `WebPush__PublicKey`: VAPID application server public key
- `WebPush__PrivateKey`: VAPID application server private key
- `WebPush__Subject`: administrator contact, for example `mailto:admin@example.com`

After deployment, set the UI's `VITE_API_BASE_URL` to the API deployment URL and redeploy the UI. The API deployment URL must be HTTPS because the dashboard also opens a SignalR connection.

### Push notifications

Generate a stable VAPID key pair once and store both keys as API deployment secrets:

```sh
npx web-push generate-vapid-keys
```

Open the dashboard over HTTPS, install it to the device home screen on iOS, then use **Settings > Parking notifications > Enable**. The button sends a test notification and registers the browser subscription. The API sends a background notification when a slot changes from occupied to available. Do not regenerate the VAPID keys after subscriptions have been created, or users must enable notifications again.

The current repository uses in-memory parking state. A Vercel container can scale down or create multiple instances, so this is appropriate for a single-instance demo or development deployment only. Shared storage and a SignalR backplane are needed for durable multi-instance production behavior.

## Test

```sh
dotnet test ParkAtBlock.API.Tests/ParkAtBlock.Tests.csproj
```

The test suite covers threshold boundaries, transitions, duplicate broadcast suppression, validation, multiple slots/devices, concurrent updates, and REST endpoint integration.

## Packages

The application uses `Microsoft.AspNetCore.OpenApi` for the OpenAPI document and `Swashbuckle.AspNetCore` for Swagger UI. SignalR and the web framework come from the ASP.NET Core shared framework. Tests use `Microsoft.AspNetCore.Mvc.Testing`, xUnit, and the .NET test SDK.

## Frontend dashboard

The React/TypeScript dashboard is in `parking-dashboard/` and consumes only the ASP.NET Core REST API and SignalR hub.

```sh
cd parking-dashboard
npm install
npm run dev
```

Configure the API with `VITE_API_BASE_URL`. Development defaults to `http://localhost:5175`; a physical Android/iOS device must use a reachable LAN IP during development, and production must use a reachable HTTPS URL. The SignalR URL is derived automatically as `${VITE_API_BASE_URL}/hubs/parking`.

The dashboard loads `GET /api/parking/slots` first, then connects to `/hubs/parking` and listens for `ParkingSlotUpdated`. Reconnects trigger a REST resynchronization. It provides `/dashboard`, `/parking/:slotId`, and `/settings` routes, client-side filtering/search/sorting, responsive mobile/desktop navigation, offline handling, and persisted light/dark theme preference.

### Capacitor

Build and synchronize the web app:

```sh
cd parking-dashboard
npm run build
npx cap add android
npx cap add ios
npm run cap:sync
npx cap open android
npx cap open ios
```

The `android/` and `ios/` folders are generated locally by Capacitor and are not required for normal web development. Android builds require Android Studio; iOS builds require Xcode and macOS. Do not use `localhost` in a physical-device production build.
