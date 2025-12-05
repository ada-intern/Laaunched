/* ===================================
   WEBGL ANIMATED GRADIENT MESH
   Creates a stunning 3D animated background
=================================== */

const canvas = document.getElementById('webgl-bg');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

if (!gl) {
    console.warn('WebGL not supported, falling back to CSS background');
    canvas.style.display = 'none';
} else {
    // Vertex shader - defines the geometry
    const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

    // Fragment shader - creates the animated gradient effect
    const fragmentShaderSource = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Smooth noise function for organic movement
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // Smooth interpolated noise
    float smoothNoise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      f = f * f * (3.0 - 2.0 * f); // Smoothstep
      
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Fractal Brownian Motion for complex patterns
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 5; i++) {
        value += amplitude * smoothNoise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      // Normalized coordinates
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
      // Aspect ratio correction
      vec2 st = uv;
      st.x *= u_resolution.x / u_resolution.y;
      
      // Mouse influence (normalized)
      vec2 mouse = u_mouse / u_resolution.xy;
      mouse.x *= u_resolution.x / u_resolution.y;
      float mouseDist = length(st - mouse);
      
      // Time-based animation
      float t = u_time * 0.15;
      
      // Create flowing organic patterns
      vec2 q = vec2(0.0);
      q.x = fbm(st + vec2(t * 0.3, t * 0.2));
      q.y = fbm(st + vec2(t * 0.2, -t * 0.3));
      
      vec2 r = vec2(0.0);
      r.x = fbm(st + 4.0 * q + vec2(1.7, 9.2) + t * 0.15);
      r.y = fbm(st + 4.0 * q + vec2(8.3, 2.8) + t * 0.2);
      
      float f = fbm(st + r);
      
      // Color palette - cosmic neon theme
      vec3 color1 = vec3(0.1, 0.15, 0.35);  // Deep blue
      vec3 color2 = vec3(0.25, 0.15, 0.50); // Deep purple
      vec3 color3 = vec3(0.4, 0.2, 0.65);   // Purple
      vec3 color4 = vec3(0.55, 0.15, 0.55); // Magenta
      vec3 color5 = vec3(0.35, 0.25, 0.70); // Bright purple
      
      // Mix colors based on pattern
      vec3 color = mix(color1, color2, smoothstep(0.0, 0.3, f));
      color = mix(color, color3, smoothstep(0.3, 0.6, f));
      color = mix(color, color4, smoothstep(0.6, 0.8, f));
      color = mix(color, color5, smoothstep(0.8, 1.0, f));
      
      // Add some brightness variation
      color += 0.1 * vec3(
        fbm(st + q + t * 0.5),
        fbm(st + q + t * 0.6),
        fbm(st + q + t * 0.7)
      );
      
      // Subtle mouse interaction - create a glow
      float mouseGlow = smoothstep(0.6, 0.0, mouseDist);
      color += mouseGlow * 0.15 * vec3(0.4, 0.6, 1.0);
      
      // Add slight vignette for depth
      float vignette = smoothstep(1.0, 0.3, length(uv - 0.5));
      color *= 0.7 + 0.3 * vignette;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

    // Compile shader
    function compileShader(source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    // Create program
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    // Create full-screen quad
    const positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        1, 1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

    // Mouse tracking
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = window.innerHeight - e.clientY; // WebGL Y is inverted
    });

    // Touch support for mobile
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = window.innerHeight - e.touches[0].clientY;
        }
    });

    // Resize handler
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resize);
    resize();

    // Animation loop
    let startTime = Date.now();

    function render() {
        const currentTime = (Date.now() - startTime) / 1000;

        gl.uniform1f(timeLocation, currentTime);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform2f(mouseLocation, mouseX, mouseY);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    render();
}
