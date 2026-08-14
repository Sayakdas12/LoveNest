import React, { Component, useEffect, useRef, useState } from 'react';
import p5 from 'p5';

// Disable p5 Friendly Error System for zero overhead and maximum performance
p5.disableFriendlyErrors = true;

/**
 * Class-based Error Boundary to prevent p5 crashes from bubbling up to React
 */
class ForceFieldErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("ForceFieldBackground caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="absolute inset-0 bg-transparent pointer-events-none" />;
    }
    return this.props.children;
  }
}

function ForceFieldCanvas({
  imageUrl = "",
  hue = 345,
  saturation = 90,
  threshold = 255,
  minStroke = 1.5,
  maxStroke = 4.5,
  spacing = 24,
  noiseScale = 0,
  density = 1.2,
  invertImage = false,
  invertWireframe = false,
  magnifierEnabled = true,
  magnifierRadius = 180,
  forceStrength = 18,
  friction = 0.86,
  restoreSpeed = 0.05,
  className = "",
}) {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const propsRef = useRef({
    hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, 
    density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
    forceStrength, friction, restoreSpeed
  });

  useEffect(() => {
    propsRef.current = {
      hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale,
      density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius,
      forceStrength, friction, restoreSpeed
    };
  }, [hue, saturation, threshold, minStroke, maxStroke, spacing, noiseScale, density, invertImage, invertWireframe, magnifierEnabled, magnifierRadius, forceStrength, friction, restoreSpeed]);

  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current) return;

    if (p5InstanceRef.current) {
      try {
        p5InstanceRef.current.remove();
      } catch (e) {}
      p5InstanceRef.current = null;
    }

    const sketch = (p) => {
      // Primitive arrays for ZERO memory allocation during animation frames
      let xArr = new Float32Array(0);
      let yArr = new Float32Array(0);
      let oxArr = new Float32Array(0);
      let oyArr = new Float32Array(0);
      let vxArr = new Float32Array(0);
      let vyArr = new Float32Array(0);
      let pointCount = 0;

      let palette = [];
      let baseStrokeColor = null;
      let highlightedStrokeColor = null;

      let lastHue = -1;
      let lastSaturation = -1;
      let lastSpacing = -1;

      let magnifierX = 0;
      let magnifierY = 0;
      const magnifierInertia = 0.35; // Snappy, instant cursor response

      p.setup = () => {
        if (!isMounted || !containerRef.current) return;
        try {
          const w = containerRef.current.clientWidth || window.innerWidth;
          const h = containerRef.current.clientHeight || window.innerHeight;
          p.createCanvas(w, h);
          
          magnifierX = w / 2;
          magnifierY = h / 2;

          generatePalette(propsRef.current.hue, propsRef.current.saturation);
          generatePoints();
          setIsLoading(false);
        } catch (err) {
          console.warn("p5 setup error:", err);
        }
      };

      p.windowResized = () => {
        if (!isMounted || !containerRef.current) return;
        try {
          const w = containerRef.current.clientWidth || window.innerWidth;
          const h = containerRef.current.clientHeight || window.innerHeight;
          p.resizeCanvas(w, h);
          generatePoints();
        } catch (err) {}
      };

      function generatePalette(h, s) {
        try {
          p.push();
          p.colorMode(p.HSL);
          baseStrokeColor = p.color(h, s, 65, 0.65);
          highlightedStrokeColor = p.color(h, s, 85, 0.95);
          p.pop();
        } catch (e) {}
      }

      function generatePoints() {
        const { spacing, density } = propsRef.current;
        const safeSpacing = Math.max(16, spacing);

        const w = p.width > 0 ? p.width : window.innerWidth;
        const h = p.height > 0 ? p.height : window.innerHeight;

        const cols = Math.ceil(w / safeSpacing);
        const rows = Math.ceil(h / safeSpacing);
        const maxPoints = cols * rows;

        // Temporary arrays
        const tempX = [];
        const tempY = [];

        for (let r = 0; r < rows; r++) {
          const py = r * safeSpacing;
          for (let c = 0; c < cols; c++) {
            if (Math.random() > density) continue;
            const px = c * safeSpacing;
            tempX.push(px);
            tempY.push(py);
          }
        }

        pointCount = tempX.length;
        xArr = new Float32Array(pointCount);
        yArr = new Float32Array(pointCount);
        oxArr = new Float32Array(pointCount);
        oyArr = new Float32Array(pointCount);
        vxArr = new Float32Array(pointCount);
        vyArr = new Float32Array(pointCount);

        for (let i = 0; i < pointCount; i++) {
          xArr[i] = tempX[i];
          yArr[i] = tempY[i];
          oxArr[i] = tempX[i];
          oyArr[i] = tempY[i];
          vxArr[i] = 0;
          vyArr[i] = 0;
        }

        lastSpacing = spacing;
      }

      p.draw = () => {
        if (!isMounted || pointCount === 0) return;

        try {
          p.clear();

          const props = propsRef.current;

          if (props.hue !== lastHue || props.saturation !== lastSaturation) {
            generatePalette(props.hue, props.saturation);
            lastHue = props.hue;
            lastSaturation = props.saturation;
          }

          if (props.spacing !== lastSpacing) {
            generatePoints();
          }

          // Snappy lerp mouse tracking
          const targetMX = p.mouseX || p.width / 2;
          const targetMY = p.mouseY || p.height / 2;
          magnifierX += (targetMX - magnifierX) * magnifierInertia;
          magnifierY += (targetMY - magnifierY) * magnifierInertia;

          const radius = props.magnifierRadius;
          const radiusSq = radius * radius;
          const forceStrength = props.forceStrength;
          const friction = props.friction;
          const restoreSpeed = props.restoreSpeed;
          const minStroke = props.minStroke;
          const defaultStroke = minStroke;

          p.noFill();

          // High-performance single-pass primitive loop (Zero Garbage Collection)
          for (let i = 0; i < pointCount; i++) {
            let x = xArr[i];
            let y = yArr[i];
            let vx = vxArr[i];
            let vy = vyArr[i];
            const ox = oxArr[i];
            const oy = oyArr[i];

            const dx = x - magnifierX;
            const dy = y - magnifierY;
            const distSq = dx * dx + dy * dy;

            let isNear = false;

            // Apply force field ONLY if within radius
            if (distSq < radiusSq && distSq > 0.001) {
              isNear = true;
              const d = Math.sqrt(distSq);
              const force = (forceStrength / (d + 1)) * (1 - d / radius);
              vx += (dx / d) * force;
              vy += (dy / d) * force;
            }

            // Apply friction
            vx *= friction;
            vy *= friction;

            // Apply elastic restoration force back to origin
            vx += (ox - x) * restoreSpeed;
            vy += (oy - y) * restoreSpeed;

            // Update position primitives
            x += vx;
            y += vy;

            xArr[i] = x;
            yArr[i] = y;
            vxArr[i] = vx;
            vyArr[i] = vy;

            // Draw particle with optimized stroke styling
            if (isNear) {
              const d = Math.sqrt(distSq);
              const factor = 1 + (1 - d / radius) * 1.5;
              p.stroke(highlightedStrokeColor || '#ffffff');
              p.strokeWeight(defaultStroke * factor);
            } else {
              p.stroke(baseStrokeColor || '#f43f5e');
              p.strokeWeight(defaultStroke);
            }

            p.point(x, y);
          }
        } catch (err) {
          // Prevent any loop interruption
        }
      };
    };

    try {
      p5InstanceRef.current = new p5(sketch, containerRef.current);
    } catch (e) {
      console.warn("Failed to create p5 instance:", e);
    }

    return () => {
      isMounted = false;
      if (p5InstanceRef.current) {
        try {
          p5InstanceRef.current.remove();
        } catch (e) {}
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden pointer-events-auto ${className}`} 
      ref={containerRef}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-rose-300/40 text-xs tracking-widest uppercase pointer-events-none">
          Initializing Force Field...
        </div>
      )}
    </div>
  );
}

export function ForceFieldBackground(props) {
  return (
    <ForceFieldErrorBoundary>
      <ForceFieldCanvas {...props} />
    </ForceFieldErrorBoundary>
  );
}

export default ForceFieldBackground;
