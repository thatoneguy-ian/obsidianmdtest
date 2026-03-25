# Deployment Guide — Power Apps Code App

## Local Development

```bash
cd business-card-capture
npm install
npm run dev
# → http://localhost:3000
```

Mock connectors are active by default. All AI extraction and Dataverse saves
use in-memory stubs — no Power Platform environment needed.

---

## Production Migration Checklist

### 1. Install PAC CLI
```bash
npm install -g @microsoft/powerplatform-cli
pac auth create --environment <your-env-url>
```

### 2. Register the Code App
```bash
pac code-app create --name "BusinessCardCapture" --framework react
```

### 3. Enable Connectors in Power Platform Admin

| Connector | Purpose |
|---|---|
| AI Builder | Business card extraction + OCR |
| Microsoft Dataverse | Lead / Contact / Activity creation |

Grant connector permissions to your environment service principal.

### 4. Swap connector calls

In `src/connectors/aiBuilder.ts` and `src/connectors/dataverse.ts`, set:
```
VITE_USE_MOCK_CONNECTORS=false
```

The production connector bridge (`window.PowerApps.Connectors.*`) is
automatically injected by the Power Apps Code App runtime.

### 5. Build and deploy
```bash
npm run build
pac code-app push --solution-name BusinessCardCapture
```

### 6. Share in Power Apps

In make.powerapps.com → Apps → BusinessCardCapture → Share
with your TFB team or embed in a Model-driven app.

---

## Architecture Reference

```
┌─────────────────────────────────────────────────┐
│  Power Apps Code App Runtime (Managed Host)      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  React App (Vite build)                 │   │
│  │                                         │   │
│  │  Mobile scan  ──► AI Builder (BCR)      │   │
│  │  Desktop scan ──► AI Builder (OCR)      │   │
│  │  Lead form    ──► Dataverse (leads)     │   │
│  │  Activities   ──► Dataverse (tasks)     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Enterprise governance: DLP · Conditional Access│
│  · Environment management · Analytics           │
└─────────────────────────────────────────────────┘
```
