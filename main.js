import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Renderer
const canvas = document.getElementById('solarSystemCanvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
camera.position.set(0, 30, 100);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius = 0;
composer.addPass(renderPass);
composer.addPass(bloomPass);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Background Galaxy
const loader = new THREE.TextureLoader();
const bg = loader.load('/textures/milky_way_dark.jpg');
const bgMesh = new THREE.Mesh(
  new THREE.SphereGeometry(1000, 64, 64).scale(-1, 1, 1),
  new THREE.MeshBasicMaterial({ map: bg })
);
scene.add(bgMesh);

// Stars
const starsGeo = new THREE.BufferGeometry();
const starVertices = [];
for (let i = 0; i < 2000; i++) {
  starVertices.push((Math.random() - 0.5) * 2000);
  starVertices.push((Math.random() - 0.5) * 2000);
  starVertices.push((Math.random() - 0.5) * 2000);
}
starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
const stars = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1 }));
scene.add(stars);

// Ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

// Audio
const music = new Audio('/audio/space_theme.mp3');
music.loop = true;
music.volume = 0.5;
document.body.addEventListener('click', () => music.play().catch(() => {}), { once: true });

let isMuted = false;
document.getElementById('muteBtn').onclick = () => {
  isMuted = !isMuted;
  music.muted = isMuted;
  document.getElementById('muteBtn').textContent = isMuted ? '🔇' : '🔊';
};

// Planets
const planetData = [
  { name: "Sun", file: "sun.jpg", size: 6, distance: 0, speed: 0 },
  { name: "Mercury", file: "mercury.jpg", size: 1.5, distance: 12, speed: 0.02 },
  { name: "Venus", file: "venus.jpg", size: 2, distance: 16, speed: 0.015 },
  { name: "Earth", file: "earth.jpg", size: 2.2, distance: 20, speed: 0.012 },
  { name: "Mars", file: "mars.jpg", size: 1.8, distance: 25, speed: 0.01 },
  { name: "Jupiter", file: "jupiter.jpg", size: 6, distance: 33, speed: 0.007 },
  { name: "Saturn", file: "saturn.jpg", size: 4.5, distance: 42, speed: 0.005 },
  { name: "Uranus", file: "uranus.jpg", size: 3.5, distance: 50, speed: 0.003 },
  { name: "Neptune", file: "neptune.jpg", size: 3.5, distance: 56, speed: 0.002 }
];

const orbitAngles = {}, speedControl = {}, planets = [];

planetData.forEach(p => {
  const tex = loader.load(`/textures/${p.file}`);
  const material = new THREE.MeshPhongMaterial({
    map: tex,
    emissive: p.name === "Sun" ? 0xfdb813 : 0x111111,
    emissiveIntensity: p.name === "Sun" ? 1.5 : 0.2
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 64, 64), material);
  mesh.name = p.name;
  scene.add(mesh);

  if (p.name === "Saturn") {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(p.size * 1.3, p.size * 1.8, 64),
      new THREE.MeshBasicMaterial({ color: 0xc2b280, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = -Math.PI / 2.3;
    ring.rotation.z = 0.2;
    mesh.add(ring);
  }

  orbitAngles[p.name] = Math.random() * Math.PI * 2;
  speedControl[p.name] = p.speed;
  planets.push({ ...p, mesh });
});

// Hover label
let planetInfo = {};
const tooltip = document.getElementById('hover-label');
fetch('/planet-info.json').then(res => res.json()).then(data => planetInfo = data);

window.addEventListener('mousemove', e => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (hits.length > 0) {
    const name = hits[0].object.name;
    tooltip.style.display = 'block';
    tooltip.style.left = e.clientX + 10 + 'px';
    tooltip.style.top = e.clientY + 10 + 'px';
    tooltip.innerHTML = `<strong>${name}</strong><br>${(planetInfo[name] || '').replace(/\n/g, '<br>')}`;
  } else {
    tooltip.style.display = 'none';
  }
});

// Click-to-show slider
const panel = document.getElementById('planet-controls');
const nameEl = document.getElementById('planet-name');
const sliderEl = document.getElementById('speed-slider');
canvas.addEventListener('click', e => {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(planets.map(p => p.mesh));
  if (hits.length > 0) {
    const name = hits[0].object.name;
    nameEl.textContent = name;
    sliderEl.value = speedControl[name];
    panel.style.display = 'block';
    sliderEl.oninput = () => {
      speedControl[name] = parseFloat(sliderEl.value);
    };
  } else {
    panel.style.display = 'none';
  }
});

// Reset button
document.getElementById('resetCameraBtn').onclick = () => {
  camera.position.set(0, 30, 100);
  controls.target.set(0, 0, 0);
  controls.update();
};

// Pause logic
let isPaused = false;
document.getElementById('pauseBtn').onclick = () => {
  isPaused = !isPaused;
  document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
};

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (!isPaused) {
    planets.forEach(p => {
      if (p.distance > 0) {
        orbitAngles[p.name] += speedControl[p.name];
        p.mesh.position.x = Math.cos(orbitAngles[p.name]) * p.distance;
        p.mesh.position.z = Math.sin(orbitAngles[p.name]) * p.distance;
      }
    });
  }
  controls.update();
  composer.render();
}
animate();
