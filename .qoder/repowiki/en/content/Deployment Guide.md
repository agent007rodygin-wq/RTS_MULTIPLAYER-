# Deployment Guide

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [vite.config.ts](file://vite.config.ts)
- [README.md](file://README.md)
- [deploy.ps1](file://deploy.ps1)
- [deploy.js](file://deploy.js)
- [check_build.mjs](file://check_build.mjs)
- [src/pocketbase.ts](file://src/pocketbase.ts)
- [check_pb.js](file://check_pb.js)
- [firebase-blueprint.json](file://firebase-blueprint.json)
- [firestore.rules](file://firestore.rules)
- [index.tsx](file://index.tsx)
- [App.tsx](file://App.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This deployment guide explains how to build, configure, and deploy the application for production. It covers:
- Build configuration and optimization settings via Vite
- Environment variable configuration and API key management
- Database connection setup using PocketBase
- Step-by-step deployment procedures for cloud and self-hosted environments
- Automated deployment scripts (PowerShell and Node.js)
- Scaling considerations, load balancing, and database optimization
- Troubleshooting, performance tuning, and monitoring approaches

## Project Structure
The repository is a React + TypeScript application built with Vite. Key deployment-relevant files include build configuration, environment handling, client-side PocketBase integration, and deployment automation scripts.

```mermaid
graph TB
A["package.json<br/>scripts and deps"] --> B["vite.config.ts<br/>Vite build config"]
B --> C["dist/<br/>Production bundle"]
D["src/pocketbase.ts<br/>PocketBase client"] --> E["App.tsx<br/>Runtime usage"]
F["deploy.ps1<br/>PowerShell deploy"] --> G["Remote server<br/>/var/www/html"]
H["deploy.js<br/>Node.js deploy"] --> G
I["check_build.mjs<br/>Build validator"] --> B
```

**Diagram sources**
- [package.json:6-11](file://package.json#L6-L11)
- [vite.config.ts:1-29](file://vite.config.ts#L1-L29)
- [src/pocketbase.ts:1-12](file://src/pocketbase.ts#L1-L12)
- [App.tsx:1-10](file://App.tsx#L1-L10)
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)
- [deploy.js:1-20](file://deploy.js#L1-L20)
- [check_build.mjs:1-12](file://check_build.mjs#L1-L12)

**Section sources**
- [package.json:1-31](file://package.json#L1-L31)
- [vite.config.ts:1-29](file://vite.config.ts#L1-L29)
- [README.md:1-21](file://README.md#L1-L21)

## Core Components
- Build and bundling: Vite configuration defines output directory, sourcemaps, chunk warnings, and environment variable exposure.
- Environment variables: API keys are loaded via Vite’s environment loader and exposed to the app at build time.
- Runtime database client: The PocketBase client is initialized with a production endpoint and used throughout the app.
- Deployment automation: PowerShell and Node.js scripts automate building, archiving, and deploying the built assets to a remote server.

**Section sources**
- [vite.config.ts:5-27](file://vite.config.ts#L5-L27)
- [src/pocketbase.ts:1-12](file://src/pocketbase.ts#L1-L12)
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)
- [deploy.js:1-20](file://deploy.js#L1-L20)

## Architecture Overview
The application runs as a static SPA served by a web server. Real-time and persistence are handled by PocketBase. The deployment pipeline builds the SPA and uploads it to the server.

```mermaid
graph TB
subgraph "Local Dev"
NPM["npm scripts<br/>package.json"] --> VITE["Vite build<br/>vite.config.ts"]
VITE --> DIST["dist/"]
end
subgraph "Production"
WEB["Web Server<br/>/var/www/html"] --> BUNDLE["Static assets<br/>dist/*"]
APP["App runtime<br/>App.tsx"] --> PB["PocketBase client<br/>src/pocketbase.ts"]
PB --> PBAPI["PocketBase API<br/>http://185.126.114.231:8090"]
end
DIST --> WEB
APP --> PBAPI
```

**Diagram sources**
- [package.json:6-11](file://package.json#L6-L11)
- [vite.config.ts:22-26](file://vite.config.ts#L22-L26)
- [src/pocketbase.ts:8-11](file://src/pocketbase.ts#L8-L11)
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)

## Detailed Component Analysis

### Vite Build Configuration and Optimization
- Output directory: dist
- Sourcemaps enabled for debugging
- Chunk size warning threshold increased to accommodate larger bundles
- Environment variables exposed at build time for API keys
- React plugin enabled
- Server configured for development (port and host)

```mermaid
flowchart TD
Start(["Build start"]) --> LoadEnv["Load environment<br/>loadEnv(mode, '.', '')"]
LoadEnv --> DefineVars["Expose env vars<br/>define GEMINI_API_KEY"]
DefineVars --> Plugins["Enable React plugin"]
Plugins --> Resolve["Resolve aliases<br/>alias '@' to project root"]
Resolve --> BuildDist["Build to dist/<br/>outDir, sourcemap, chunkSizeWarningLimit"]
BuildDist --> End(["Build complete"])
```

**Diagram sources**
- [vite.config.ts:5-27](file://vite.config.ts#L5-L27)

**Section sources**
- [vite.config.ts:5-27](file://vite.config.ts#L5-L27)

### Environment Variable Configuration and API Key Management
- API key is loaded from the environment and embedded into the build via Vite’s define mechanism.
- Local development requires setting the Gemini API key in a local environment file.
- Production deployments should set the same environment variable on the machine or CI runner performing the build.

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant Vite as "Vite Config"
participant Env as "Environment"
participant App as "Built App"
Dev->>Env : Set GEMINI_API_KEY
Env-->>Vite : loadEnv(mode, '.', '')
Vite->>Vite : define GEMINI_API_KEY
Vite-->>App : Bundle with API key constant
App-->>Dev : Run in browser with API key available
```

**Diagram sources**
- [vite.config.ts:13-16](file://vite.config.ts#L13-L16)
- [README.md:18-18](file://README.md#L18-L18)

**Section sources**
- [vite.config.ts:13-16](file://vite.config.ts#L13-L16)
- [README.md:16-21](file://README.md#L16-L21)

### PocketBase Client Setup and Database Connections
- The PocketBase client is initialized with a production endpoint.
- Authentication and real-time subscriptions are managed through the client.
- The client is used across the application for reads, writes, and subscriptions.

```mermaid
sequenceDiagram
participant App as "App.tsx"
participant PB as "PocketBase Client"
participant API as "PocketBase API"
App->>PB : Initialize with endpoint
App->>PB : Auth operations
PB->>API : Requests
API-->>PB : Responses
PB-->>App : Data snapshots and events
```

**Diagram sources**
- [src/pocketbase.ts:8-11](file://src/pocketbase.ts#L8-L11)
- [App.tsx:4-10](file://App.tsx#L4-L10)

**Section sources**
- [src/pocketbase.ts:1-12](file://src/pocketbase.ts#L1-L12)
- [App.tsx:1-10](file://App.tsx#L1-L10)

### Automated Deployment Scripts

#### PowerShell Script (deploy.ps1)
- Builds the project
- Archives the dist folder
- Copies archive to a remote server
- Extracts and replaces the live site

```mermaid
flowchart TD
PSStart(["Run deploy.ps1"]) --> Build["npm run build"]
Build --> Tar["tar dist.tar dist/"]
Tar --> SCP["scp dist.tar to remote"]
SCP --> SSH["ssh to remote and extract"]
SSH --> PSClear["Cleanup temp archive"]
PSClear --> PSEnd(["Deployment complete"])
```

**Diagram sources**
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)

**Section sources**
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)

#### Node.js Script (deploy.js)
- Similar workflow to the PowerShell script but executed via Node.js
- Uses child_process to run shell commands and stream output

```mermaid
flowchart TD
JSStart(["Run deploy.js"]) --> JSBUILD["execSync npm run build"]
JSBUILD --> JSTAR["execSync tar dist.tar dist/"]
JSTAR --> JSSCP["execSync scp dist.tar to remote"]
JSSCP --> JSSSH["execSync ssh to remote and extract"]
JSSSH --> JSEnd(["Deployment complete"])
```

**Diagram sources**
- [deploy.js:1-20](file://deploy.js#L1-L20)

**Section sources**
- [deploy.js:1-20](file://deploy.js#L1-L20)

### Build Validation Script (check_build.mjs)
- Runs the build command and captures stdout/stderr for diagnostics
- Useful for CI or pre-deploy checks

```mermaid
flowchart TD
CBStart(["Run check_build.mjs"]) --> CBRun["execSync npm run build"]
CBRun --> CBResult{"Build succeeded?"}
CBResult --> |Yes| CBPrint["Print output"]
CBResult --> |No| CBErr["Log errors"]
CBPrint --> CBEnd(["Done"])
CBErr --> CBEnd
```

**Diagram sources**
- [check_build.mjs:1-12](file://check_build.mjs#L1-L12)

**Section sources**
- [check_build.mjs:1-12](file://check_build.mjs#L1-L12)

### Database Schema and Security (Firestore-style blueprint and rules)
- The blueprint defines collections and fields used by the app.
- Firestore rules enforce authentication, ownership, and data validation.

```mermaid
erDiagram
USERS {
string uid PK
string name
number level
number glory
number energy
number reputation
map inventory
number gold
number rubies
number lastSaveTime
number banEndTime
object activeCurse
string role
}
BUILDINGS {
number id
number x
number y
number buildingId
string ownerId
number hp
number maxHp
boolean isConstructing
number constructionEndTime
string workState
number workEndTime
number lastMoveTime
number protectionEndTime
boolean isDestroying
number destructionEndTime
string initiatorId
number pendingDamage
string hostId
}
MAP_RESOURCES {
number x
number y
number hp
string type
}
MAP_STATE {
boolean generated
number seed
}
PRIVATE_MESSAGES {
string id
string chatId
string senderId
string receiverId
string text
number timestamp
boolean read
array participants
}
PRESENCE {
string uid
string name
string activeTab
string clanId
number lastSeen
}
USERS ||--o{ BUILDINGS : "owns"
USERS ||--o{ PRIVATE_MESSAGES : "participants"
USERS ||--o{ PRESENCE : "tracks"
BUILDINGS ||--o{ MAP_RESOURCES : "occupies"
```

**Diagram sources**
- [firebase-blueprint.json:1-191](file://firebase-blueprint.json#L1-L191)

**Section sources**
- [firebase-blueprint.json:1-191](file://firebase-blueprint.json#L1-L191)
- [firestore.rules:1-355](file://firestore.rules#L1-L355)

## Dependency Analysis
- Build-time dependencies: Vite, React plugin, TypeScript, and related tooling.
- Runtime dependencies: React, React DOM, PocketBase client, and UI libraries.
- Environment variable exposure is handled at build time via Vite.

```mermaid
graph LR
Vite["Vite"] --> Dist["dist/"]
TS["TypeScript"] --> Vite
React["@vitejs/plugin-react"] --> Vite
PB["pocketbase"] --> App["App.tsx"]
Dotenv["dotenv"] --> Vite
```

**Diagram sources**
- [package.json:12-29](file://package.json#L12-L29)
- [vite.config.ts:2-3](file://vite.config.ts#L2-L3)
- [src/pocketbase.ts:1-1](file://src/pocketbase.ts#L1-L1)

**Section sources**
- [package.json:12-29](file://package.json#L12-L29)
- [vite.config.ts:2-3](file://vite.config.ts#L2-L3)

## Performance Considerations
- Enable production builds with minification and tree-shaking via Vite.
- Monitor chunk sizes and adjust code splitting to keep initial payloads small.
- Use lazy loading for heavy components and images.
- Optimize asset delivery with a CDN behind a reverse proxy.
- For PocketBase, batch operations and use targeted queries to reduce load.
- Consider enabling HTTP/2 and compression on the web server.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common deployment issues and resolutions:
- Build fails locally or in CI:
  - Use the build validator script to capture detailed logs.
  - Verify environment variables are present during build.
- Remote deployment errors:
  - Confirm SSH access and remote paths.
  - Ensure the remote directory is writable by the deployment user.
- PocketBase connectivity:
  - Verify the PocketBase endpoint is reachable from the deployment server.
  - Check authentication credentials and collections exist.
- Static assets not loading:
  - Confirm the web server serves the dist directory at the correct path.
  - Clear browser cache after deployment.

**Section sources**
- [check_build.mjs:1-12](file://check_build.mjs#L1-L12)
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)
- [deploy.js:1-20](file://deploy.js#L1-L20)
- [src/pocketbase.ts:8-11](file://src/pocketbase.ts#L8-L11)
- [check_pb.js:1-20](file://check_pb.js#L1-L20)

## Conclusion
This guide outlined the complete deployment workflow: configuring environment variables, building with Vite, automating deployment via PowerShell or Node.js, and connecting to PocketBase for real-time data. For production, pair the SPA with a CDN-backed web server, monitor PocketBase performance, and implement robust logging and alerting.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Step-by-Step Deployment Procedures

- Prepare environment
  - Install dependencies and set the Gemini API key in the environment.
  - Build the project locally to validate the build.

- Cloud provider deployment (example steps)
  - Choose a cloud VM or container service.
  - Install Node.js and a web server (e.g., nginx).
  - Configure the web server to serve the dist directory.
  - Copy the built assets to the web server root.
  - Point DNS to the server’s IP address.

- Self-hosted deployment
  - Use the PowerShell or Node.js deployment scripts to automate copying to a remote server.
  - Ensure the remote server has the correct firewall and SSL/TLS configuration.

- Post-deployment verification
  - Open the site in a browser and confirm assets load.
  - Verify PocketBase connectivity and basic operations.

**Section sources**
- [README.md:16-21](file://README.md#L16-L21)
- [deploy.ps1:1-5](file://deploy.ps1#L1-L5)
- [deploy.js:1-20](file://deploy.js#L1-L20)
- [src/pocketbase.ts:8-11](file://src/pocketbase.ts#L8-L11)

### Scaling Considerations
- Horizontal scaling
  - Serve the SPA from multiple instances behind a load balancer.
  - Use sticky sessions only if required by the backend; otherwise, stateless design is preferred.
- Database optimization
  - Use targeted queries and pagination to limit response sizes.
  - Batch writes and use efficient filters to minimize load.
  - Monitor and tune PocketBase indexing and query plans.
- Real-time performance
  - Throttle frequent updates and coalesce events where possible.
  - Use server-side filtering and client-side debouncing to reduce traffic.

[No sources needed since this section provides general guidance]

### Monitoring and Health Checks
- Web server monitoring
  - Track uptime, response times, and error rates.
- Application monitoring
  - Log PocketBase errors and track client-side exceptions.
- Database monitoring
  - Observe query latency and collection sizes; alert on anomalies.

[No sources needed since this section provides general guidance]