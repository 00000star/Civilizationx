import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from 'three';

function CameraController() {
  const { camera, gl } = useThree();
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    // Mouse down
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2 || e.button === 1) { // Right or middle click
        isDragging.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
    };

    // Mouse move (pan)
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current && camera instanceof OrthographicCamera) {
        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        // Adjust pan speed based on zoom
        const panSpeed = 1 / camera.zoom;

        camera.position.x -= deltaX * panSpeed;
        camera.position.y += deltaY * panSpeed;

        previousMouse.current = { x: e.clientX, y: e.clientY };
      }
    };

    // Mouse up
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Mouse wheel (zoom)
    const handleWheel = (e: WheelEvent) => {
      if (camera instanceof OrthographicCamera) {
        const zoomSpeed = 0.1;
        const newZoom = camera.zoom - e.deltaY * zoomSpeed * 0.01;
        camera.zoom = Math.max(0.5, Math.min(10, newZoom));
        camera.updateProjectionMatrix();
        e.preventDefault();
      }
    };

    // Context menu (disable right-click menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, gl]);

  return null;
}

export default CameraController;
