# CampusConnect — Knowledge Institute of Technology (KIOT)

CampusConnect is a modern digital campus community platform designed specifically for **Knowledge Institute of Technology (KIOT), Kakapalayam, Salem, Tamil Nadu, India**.

---

## 🏛️ Institutional Identity
- **Institution**: Knowledge Institute of Technology (KIOT)
- **Campus Reference**: KIOT-Campus, NH544, Kakapalayam, Salem, Tamil Nadu – 637504
- **Official Email Domain**: `@kiot.ac.in`
- **Institutional Branding**: Crimson/Maroon (`#800000`), Navy Slate (`#0F172A`), Amber Gold (`#F59E0B`)

---

## 🚀 Key Functional Modules & Architecture

### 1. Two-Layer Authentication & Institutional Security
- **Layer 1 — Google Identity Services**: Server-side token verification with `@kiot.ac.in` email domain restriction.
- **Layer 2 — CampusConnect Authorized User Database**: Even with a valid Google email, accounts must be pre-authorized and in `active` status in the CMS database.
- **Rapid Persona Switcher**: Pre-configured testing accounts enabling instant evaluation of all roles without third-party setup.

### 2. Student Experience
- **Moving / Sliding Hero Section**: Auto-rotating promotional carousel (Campus Hackathons, CodeSprint 4.0, Innovation Challenges, Workshops) with pause on hover, manual slide dots, and CTA links.
- **Live Campus Presence Card**: Quick visual status (`🟢 IN: Seminar Hall A` / `⚪ OUT`).
- **Events & Contests Hub**: Category filters, capacity progress bar, anti-double registration, and 1-click registration with celebration effects.
- **Clubs Mini-Communities**: Dedicated spaces for Coding Club, Robotics & IoT, GDSC KIOT, EDC, and Fine Arts.
- **Friend System**: Search by Register Number (e.g. `2K24CSE167`), send/accept requests, and view mutual live presence.

### 3. Privacy-Preserving QR Campus Presence System
- **Single-QR IN/OUT Mechanism**: Scanning once marks the student `IN` with a timestamp; scanning the same QR code again marks them `OUT`.
- **Zero-Tracking Privacy Guarantee**: When a student is `OUT`, their location is completely cleared (`null`). Zero background GPS tracking and zero historical location display to peers.
- **Future IoT/RFID Extensibility**: Presence abstraction supports `'QR' | 'RFID' | 'NFC' | 'IoT'`.
- **Interactive Simulator**: Allows testing QR check-in and check-out on desktop without camera permissions, in addition to HTML5 webcam scanning.

### 4. Interactive Leaflet Campus Map
- Centered on KIOT Campus (Kakapalayam, Salem) with custom markers for approved monitored locations (Seminar Hall A, Computer Lab 3, Central Auditorium, Library, Innovation Centre, Main Entrance).
- Displays real-time room occupancy and avatars of accepted friends who are currently `IN`.

### 5. Scoped Faculty & Mentor Portal
- Mentors are strictly restricted to their designated mentee cohort.
- Lookup by Register Number (e.g. `2K24CSE167`) returns presence only for assigned mentees. Non-mentees return `403 Forbidden`.

### 6. Developer CMS ("CampusConnect System Control Center")
- Privileged control center (accessible by Admin / Developer roles):
  - Live analytics (total students, active accounts, current presence sessions).
  - Authorized Users CRUD with activation/suspension toggles.
  - Mentor Assignment Wizard (assign faculty to student lists).
  - Monitored QR Location generator with printable QR placards.
  - Hero Slide manager.
  - Broadcast notification center.
  - Security audit logs.
  - 1-Click "Sync / Reset KIOT Demo Data".

---

## 👥 Demo Personas for Evaluation

| Persona | Name | Register Number | Role / Cohort | Email |
| :--- | :--- | :--- | :--- | :--- |
| 🎓 **Student** | Sachin V | `2K24CSE167` | 2nd Year B.E. CSE | `sachin.24cse167@kiot.ac.in` |
| 👨‍🏫 **Senior Mentor** | Dr. K. Rajesh | — | CSE Faculty Mentor | `mentor.rajesh@kiot.ac.in` |
| 👩‍💼 **Club Leader** | Priya Dharshini S | `2K23CSE089` | President, Coding Club | `priya.club@kiot.ac.in` |
| ⚙️ **Developer / Admin** | Dr. P. Rajendran | — | Super Admin / System Architect | `admin@kiot.ac.in` |

---

## 💻 Local Execution Instructions

### 1. Backend Server
```bash
cd backend
npm install
npm run seed     # Seeds realistic KIOT dataset
npm start        # Runs Express REST API on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev      # Runs Vite React App on http://localhost:5173
```

### 3. Run Automated End-to-End Verification Suite
```bash
cd backend
node src/utils/verifyAll.js
```
