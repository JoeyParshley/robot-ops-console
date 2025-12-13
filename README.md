# Robot Ops Console (Proof of Concept)

A React + TypeScript proof-of-concept exploring UI patterns for robotics operator dashboards — including fleet monitoring, robot status visualization, and control interfaces.  
This POC was built using **test-driven development (TDD)** and inspired by the challenges of designing clear, reliable UIs for **Alert Venture Foundry**–style zero-to-one robotics products.

---

## 🚀 Project Overview

The **Robot Ops Console** demonstrates early ideas for a monitoring and control interface for a small fleet of robots.  
The goals of this POC are to explore:

- Real-time, data-driven UI architecture  
- Operator-focused workflows and clarity  
- Navigation between fleet-level and per-robot detail views  
- UI patterns suitable for **local desktop deployment** (Electron) or web environments  

All data is currently mocked; live telemetry and desktop deployment are planned next.

---

## 🎯 Motivation & Context

This project blends my background in **R&D mechanical engineering at Velcro**—where I worked with real-time UIs for monitoring temperatures, pressures, and plastic hook processing—with my passion for building **human-centered software interfaces**.

Working with industrial operator consoles is what originally sparked my interest in UI design: their clarity, or lack thereof, had direct impact on process quality, safety, and decision-making.

This POC mirrors the interface challenges present in early-stage robotics environments:

- Telemetry visualization  
- Operator safety and workflow  
- Diagnostics and control panels  
- Rapid iteration under uncertainty  

It also serves as preparation for the **Frontend Software Engineer (Web & Local UI)** role at **Alert Venture Foundry**.

---

## 🧰 Tech Stack

### **Core Technologies**
- React + TypeScript (Vite)
- MUI (Material UI)
- React Router v7
- Vitest + React Testing Library (TDD)
- JSDOM test environment

### **Planned Enhancements**
- Node/WebSocket telemetry simulator  
- `useTelemetry(robotId)` streaming hook  
- Electron-based local deployment  
- Diagnostics dashboard (health, alerts, logs)

---

## 📦 Features (Current POC)

### **Fleet Overview**
- Table of robots with:
  - Status  
  - Battery  
  - Location  
  - Last heartbeat  
  - Current task  
- Clicking a row navigates to that robot’s detail page

### **Robot Detail**
- Status & health summary  
- Battery, last heartbeat, active task  
- Stubbed operator controls:
  - Start  
  - Pause  
  - Resume  
  - Return to Dock  
  - Emergency Stop  

_All data is mocked for this early POC._

---

## 🧪 Test-Driven Development (TDD)

Key UI components were developed test-first.

Current test coverage includes:

- Rendering of the fleet overview  
- Click-through navigation to detail pages  
- Robot detail rendering from URL route  
- Handling of invalid robot IDs  
- Navigation behavior  

Run tests with:

```bash
npm run test
npm run test:watch
