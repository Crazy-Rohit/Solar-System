# Interactive 3D Solar System 

An immersive 3D simulation of the solar system built using **Three.js**, featuring realistic planet textures, orbital motion, bloom effects, background music, and an interactive user interface.

** Developer:** Rohit Manna 

---

## Features 

- Realistic textured planets with orbital motion   
- Glowing Sun using `UnrealBloomPass` post-processing   
- Hover displays planet name and description   
- Click opens speed slider to control orbit speed   
- Saturn ring created using geometry (no texture needed)   
- Full Milky Way galaxy background inside a sphere   
- Random starfield using `THREE.Points`   
- Fully responsive layout for all screen sizes   
- Mute/unmute background music   
- Pause/resume simulation   
- Reset camera to original view   

---

## Tech Stack 

- **Three.js** – WebGL 3D rendering
- **JavaScript (ES Modules)** – Logic and interactions
- **Vite** – Build and development server
- **HTML/CSS** – Interface and styling
- **UnrealBloomPass** – Bloom glow on the Sun
- **OrbitControls** – Camera navigation
- **EffectComposer** – Postprocessing

---

## Project Structure
solar-system/
├── public/
│ ├── textures/ # Planet and background textures
│ ├── audio/ # Background music file
│ └── planet-info.json # Planet descriptions
├── src/
│ ├── main.js # Three.js scene logic
│ └── style.css # Responsive UI styling
├── index.html # Entry point
├── package.json # npm configuration
└── vite.config.js # Vite build configuration 


---

## 🛠️ Local Setup & Development

### Prerequisites 

- Node.js (v16+)
- npm 

### Steps to Run Locally 

```bash
# 1. Clone the repository
git clone https://github.com/your-username/solar-system.git
cd solar-system

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

