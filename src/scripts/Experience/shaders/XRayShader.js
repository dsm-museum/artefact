import { ShaderMaterial, Color, DoubleSide, AdditiveBlending } from 'three'

let xRayShader

xRayShader = new ShaderMaterial({
  uniforms: {
    p: { type: 'f', value: 2.0 },
    glowColor: { type: 'c', value: new Color(0x84ccff) },
    opacity: { type: 'f', value: 1.0 },
  },
  vertexShader: `
      uniform float p;
      varying float intensity;
      void main()
      {
          vec3 vNormal = normalize( normalMatrix * normal );
          intensity = pow(1.0 - abs(dot(vNormal, vec3(0, 0, 1))), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }`,
  fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      uniform float opacity;
      void main()
      {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, opacity );
      }
    `,
  side: DoubleSide,
  blending: AdditiveBlending,
  transparent: true,
  depthWrite: false,
})

export { xRayShader }
