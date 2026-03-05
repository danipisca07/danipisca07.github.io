import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  @ViewChild('heroCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId!: number;
  private particles!: THREE.Points;
  private lines!: THREE.LineSegments;
  private mouseX = 0;
  private mouseY = 0;

  private readonly PARTICLE_COUNT = 120;
  private readonly CONNECTION_DISTANCE = 28;
  private readonly ACCENT_COLOR = new THREE.Color('#E63946');
  private readonly WHITE = new THREE.Color('#ffffff');

  private positions: Float32Array = new Float32Array(0);
  private velocities: { x: number; y: number; z: number }[] = [];

  ngOnInit(): void {
    this.initScene();
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }

  private initScene(): void {
    const canvas = this.canvasRef.nativeElement;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 1);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    this.camera.position.z = 80;

    this.buildParticles();
    this.buildLines();
  }

  private buildParticles(): void {
    const count = this.PARTICLE_COUNT;
    this.positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.velocities = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 40;
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: 0,
      });
      // default white
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 1;
      colors[i * 3 + 2] = 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  private buildLines(): void {
    // pre-allocate max possible line segments
    const maxSegs = this.PARTICLE_COUNT * (this.PARTICLE_COUNT - 1) / 2;
    const linePositions = new Float32Array(maxSegs * 6);
    const lineColors = new Float32Array(maxSegs * 6);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    geo.setDrawRange(0, 0);

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
    });

    this.lines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.lines);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  };

  private onResize = (): void => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.update();
    this.renderer.render(this.scene, this.camera);
  };

  private update(): void {
    const count = this.PARTICLE_COUNT;
    const pos = this.positions;
    const particleColors = this.particles.geometry.attributes['color'].array as Float32Array;

    // Move particles
    for (let i = 0; i < count; i++) {
      pos[i * 3] += this.velocities[i].x;
      pos[i * 3 + 1] += this.velocities[i].y;

      // Wrap around
      if (pos[i * 3] > 80) pos[i * 3] = -80;
      if (pos[i * 3] < -80) pos[i * 3] = 80;
      if (pos[i * 3 + 1] > 50) pos[i * 3 + 1] = -50;
      if (pos[i * 3 + 1] < -50) pos[i * 3 + 1] = 50;

      // Mouse proximity highlight
      const mx = this.mouseX * 80;
      const my = this.mouseY * 50;
      const dx = pos[i * 3] - mx;
      const dy = pos[i * 3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = Math.max(0, 1 - dist / 30);
      const col = this.WHITE.clone().lerp(this.ACCENT_COLOR, proximity);
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    this.particles.geometry.attributes['position'].needsUpdate = true;
    this.particles.geometry.attributes['color'].needsUpdate = true;

    // Update lines
    const linePosArr = this.lines.geometry.attributes['position'].array as Float32Array;
    const lineColArr = this.lines.geometry.attributes['color'].array as Float32Array;
    let segCount = 0;

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < this.CONNECTION_DISTANCE) {
          const alpha = (1 - dist / this.CONNECTION_DISTANCE) * 0.5;
          const base = segCount * 6;
          linePosArr[base] = pos[i * 3];
          linePosArr[base + 1] = pos[i * 3 + 1];
          linePosArr[base + 2] = pos[i * 3 + 2];
          linePosArr[base + 3] = pos[j * 3];
          linePosArr[base + 4] = pos[j * 3 + 1];
          linePosArr[base + 5] = pos[j * 3 + 2];

          lineColArr[base] = alpha;
          lineColArr[base + 1] = alpha;
          lineColArr[base + 2] = alpha;
          lineColArr[base + 3] = alpha;
          lineColArr[base + 4] = alpha;
          lineColArr[base + 5] = alpha;

          segCount++;
        }
      }
    }

    this.lines.geometry.setDrawRange(0, segCount * 2);
    this.lines.geometry.attributes['position'].needsUpdate = true;
    this.lines.geometry.attributes['color'].needsUpdate = true;
  }
}
