import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Hero3DScene() {
  const containerRef = useRef(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth < 768) {
      setWebglError(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    let scene, camera, renderer, animationFrameId;
    let cupGroup, beansGroup, steamParticles;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0.2, targetRotationY = -0.3;

    try {
      const width = container.clientWidth;
      const height = container.clientHeight;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 1.8, 4.5);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xffeedd, 2.2);
      mainLight.position.set(4, 6, 4);
      mainLight.castShadow = true;
      scene.add(mainLight);

      const rimLight = new THREE.PointLight(0xe9b44c, 2.5, 10);
      rimLight.position.set(-3, 2, -2);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0xd65a3a, 1.8, 8);
      fillLight.position.set(2, -1, 3);
      scene.add(fillLight);

      // --- 3D OBJECTS: COFFEE CUP & SAUCER ---
      cupGroup = new THREE.Group();

      // Ceramic material
      const cupMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff9f5,
        roughness: 0.18,
        metalness: 0.05,
      });

      // Gold rim material
      const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xe9b44c,
        roughness: 0.3,
        metalness: 0.85,
      });

      // Coffee Liquid material
      const coffeeMaterial = new THREE.MeshStandardMaterial({
        color: 0x24120c,
        roughness: 0.15,
        metalness: 0.1,
      });

      // Cup Body
      const cupGeom = new THREE.CylinderGeometry(0.7, 0.48, 0.85, 32, 1, true);
      const cupMesh = new THREE.Mesh(cupGeom, cupMaterial);
      cupMesh.position.y = 0.42;
      cupGroup.add(cupMesh);

      // Cup Bottom
      const bottomGeom = new THREE.CircleGeometry(0.48, 32);
      const bottomMesh = new THREE.Mesh(bottomGeom, cupMaterial);
      bottomMesh.rotation.x = Math.PI / 2;
      cupGroup.add(bottomMesh);

      // Gold Rim
      const rimGeom = new THREE.TorusGeometry(0.7, 0.025, 16, 40);
      const rimMesh = new THREE.Mesh(rimGeom, goldMaterial);
      rimMesh.position.y = 0.84;
      rimMesh.rotation.x = Math.PI / 2;
      cupGroup.add(rimMesh);

      // Liquid Surface
      const liquidGeom = new THREE.CircleGeometry(0.66, 32);
      const liquidMesh = new THREE.Mesh(liquidGeom, coffeeMaterial);
      liquidMesh.rotation.x = -Math.PI / 2;
      liquidMesh.position.y = 0.75;
      cupGroup.add(liquidMesh);

      // Saucer Plate
      const saucerGeom = new THREE.CylinderGeometry(1.25, 0.75, 0.08, 32);
      const saucerMesh = new THREE.Mesh(saucerGeom, cupMaterial);
      saucerMesh.position.y = -0.04;
      cupGroup.add(saucerMesh);

      // Saucer Gold Rim
      const saucerRimGeom = new THREE.TorusGeometry(1.25, 0.02, 16, 48);
      const saucerRimMesh = new THREE.Mesh(saucerRimGeom, goldMaterial);
      saucerRimMesh.rotation.x = Math.PI / 2;
      saucerRimMesh.position.y = 0.0;
      cupGroup.add(saucerRimMesh);

      // Cup Handle
      const handleGeom = new THREE.TorusGeometry(0.32, 0.08, 16, 32, Math.PI);
      const handleMesh = new THREE.Mesh(handleGeom, cupMaterial);
      handleMesh.position.set(0.72, 0.42, 0);
      handleMesh.rotation.z = -Math.PI / 2;
      cupGroup.add(handleMesh);

      scene.add(cupGroup);

      // --- FLOATING COFFEE BEANS & SPICES ---
      beansGroup = new THREE.Group();
      const beanMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b1c14,
        roughness: 0.6,
      });

      const beanGeom = new THREE.SphereGeometry(0.12, 12, 12);
      beanGeom.scale(1.4, 0.8, 1);

      const beanCount = 8;
      const beans = [];
      for (let i = 0; i < beanCount; i++) {
        const bean = new THREE.Mesh(beanGeom, beanMaterial);
        const angle = (i / beanCount) * Math.PI * 2;
        const radius = 1.6 + Math.random() * 0.7;
        bean.position.set(
          Math.cos(angle) * radius,
          -0.2 + Math.random() * 1.6,
          Math.sin(angle) * radius
        );
        bean.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        beans.push({
          mesh: bean,
          initialY: bean.position.y,
          speed: 0.008 + Math.random() * 0.012,
          rotSpeed: 0.015 + Math.random() * 0.02,
        });
        beansGroup.add(bean);
      }
      scene.add(beansGroup);

      // --- STEAM PARTICLES ---
      const steamCount = 24;
      const steamGeom = new THREE.BufferGeometry();
      const steamPositions = new Float32Array(steamCount * 3);
      const steamVelocities = [];

      for (let i = 0; i < steamCount; i++) {
        steamPositions[i * 3] = (Math.random() - 0.5) * 0.35;
        steamPositions[i * 3 + 1] = 0.8 + Math.random() * 0.9;
        steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
        steamVelocities.push({
          x: (Math.random() - 0.5) * 0.003,
          y: 0.006 + Math.random() * 0.006,
          z: (Math.random() - 0.5) * 0.003,
        });
      }
      steamGeom.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

      const steamMaterial = new THREE.PointsMaterial({
        color: 0xffeedd,
        size: 0.12,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });

      steamParticles = new THREE.Points(steamGeom, steamMaterial);
      scene.add(steamParticles);

      // --- MOUSE PARALLAX ---
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
        mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
        targetRotationY = -0.3 + mouseX * 0.4;
        targetRotationX = 0.2 + mouseY * 0.25;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Resize observer
      const handleResize = () => {
        if (!container) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };
      window.addEventListener('resize', handleResize);

      // --- ANIMATION LOOP ---
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Smooth damping on cup tilt
        cupGroup.rotation.y += (targetRotationY - cupGroup.rotation.y) * 0.05;
        cupGroup.rotation.x += (targetRotationX - cupGroup.rotation.x) * 0.05;

        // Floating gentle breathing
        cupGroup.position.y = Math.sin(time * 1.5) * 0.06;

        // Animate floating beans
        beans.forEach((b, idx) => {
          b.mesh.position.y = b.initialY + Math.sin(time * 2 + idx) * 0.12;
          b.mesh.rotation.x += b.rotSpeed;
          b.mesh.rotation.y += b.rotSpeed * 0.7;
        });
        beansGroup.rotation.y = time * 0.15;

        // Animate steam particles
        const pos = steamParticles.geometry.attributes.position.array;
        for (let i = 0; i < steamCount; i++) {
          pos[i * 3 + 1] += steamVelocities[i].y;
          pos[i * 3] += steamVelocities[i].x + Math.sin(time * 2 + i) * 0.001;
          pos[i * 3 + 2] += steamVelocities[i].z;

          // Recycle particles that rise too high
          if (pos[i * 3 + 1] > 2.2) {
            pos[i * 3] = (Math.random() - 0.5) * 0.35;
            pos[i * 3 + 1] = 0.8;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
          }
        }
        steamParticles.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn("ThreeJS initialization fallback:", err);
      setWebglError(true);
    }
  }, []);

  if (webglError) {
    return (
      <div className="bab-hero-3d-fallback">
        <div className="bab-hero-3d-fallback__glow" />
        <img
          src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
          alt="Artisan Coffee & Culinary Delight"
          className="bab-hero-3d-fallback__img"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bab-hero-3d-container"
      style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}
      aria-label="Interactive 3D Coffee Art"
    />
  );
}
