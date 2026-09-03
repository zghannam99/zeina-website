"use client";

import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext,
} from "ogl";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface GalleryItem {
  image: string;
  text: string;
}

interface CircularGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  /** Curvature of the arc. Higher bends harder. @default 3 */
  bend?: number;
  /** Corner radius as a fraction of the tile, 0 to 0.5. @default 0.06 */
  borderRadius?: number;
  /** Easing on the drift toward the target position. Lower is smoother. @default 0.05 */
  scrollEase?: number;
}

/** Tile size in CSS pixels at a 1500px-tall container, scaled from there.
 *  Equal values because these are software marks, not photographs — a
 *  portrait frame left every logo floating in dead space. */
const TILE = 800;
/** Caption height as a fraction of the tile. */
const LABEL_SCALE = 0.12;
/** Gap between tiles, as a fraction of tile width. Proportional rather than a
 *  flat world-unit value, which stayed the same size as the tiles shrank and so
 *  pushed the neighbours off a phone screen entirely. */
const GAP_RATIO = 0.14;
/** Width at which `bend` is applied in full. Narrower screens get a gentler
 *  arc — see the note in App.onResize. */
const FULL_BEND_WIDTH = 900;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Draws `text` to a canvas texture.
 *
 *  The size is read out of the font shorthand with a regex rather than
 *  parseInt: a shorthand starts with the weight, so parseInt("700 30px Outfit")
 *  returns 700 and every caption came out a fraction of its intended size in a
 *  canvas eight hundred pixels tall. Drawn at twice the size and scaled down by
 *  the mesh, so the glyphs survive being mapped onto a plane. */
function createTextTexture(gl: OGLRenderingContext, text: string, font: string, color: string) {
  const size = Number(font.match(/(\d+(?:\.\d+)?)px/)?.[1] ?? 30);
  const density = 2;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  context.font = font;
  const width = Math.ceil(context.measureText(text).width);
  const height = Math.ceil(size * 1.2);

  canvas.width = (width + 20) * density;
  canvas.height = (height + 20) * density;
  context.scale(density, density);
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.fillText(text, (width + 20) / 2, (height + 20) / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  mesh!: Mesh;

  constructor(
    private gl: OGLRenderingContext,
    private plane: Mesh,
    text: string,
    textColor: string,
    font: string
  ) {
    const { texture, width, height } = createTextTexture(gl, text, font, textColor);
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });

    this.mesh = new Mesh(gl, { geometry: new Plane(gl), program });
    const textHeight = plane.scale.y * LABEL_SCALE;
    this.mesh.scale.set(textHeight * (width / height), textHeight, 1);
    this.mesh.position.y = -plane.scale.y * 0.5 - textHeight * 0.5 - 0.1;
    this.mesh.setParent(plane);
  }
}

class Media {
  program!: Program;
  plane!: Mesh;
  extra = 0;
  widthTotal = 0;
  width = 0;
  x = 0;
  scale = 1;
  speed = 0;

  constructor(
    private gl: OGLRenderingContext,
    geometry: Plane,
    private scene: Transform,
    private image: string,
    text: string,
    private index: number,
    private length: number,
    private screen: { width: number; height: number },
    private viewport: { width: number; height: number },
    public bend: number,
    textColor: string,
    borderRadius: number,
    font: string,
    private reducedMotion: boolean
  ) {
    this.createShader(borderRadius);
    this.plane = new Mesh(gl, { geometry, program: this.program });
    this.plane.setParent(scene);
    new Title(gl, this.plane, text, textColor, font);
    this.onResize();
  }

  private createShader(borderRadius: number) {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: borderRadius },
      },
      transparent: true,
    });

    const img = new Image();
    img.decoding = "async";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  update(scroll: { current: number; last: number }, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const bend = Math.abs(this.bend);
      const R = (H * H + bend * bend) / (2 * bend);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      const sign = this.bend > 0 ? -1 : 1;
      this.plane.position.y = sign * arc;
      this.plane.rotation.z = -sign * Math.sign(x) * Math.asin(effectiveX / R);
    }

    this.speed = scroll.current - scroll.last;
    // The ripple is the one part of this that moves on its own.
    if (!this.reducedMotion) this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.reducedMotion ? 0 : this.speed;

    const half = this.plane.scale.x / 2;
    const edge = this.viewport.width / 2;
    if (direction === "right" && this.plane.position.x + half < -edge) this.extra -= this.widthTotal;
    if (direction === "left" && this.plane.position.x - half > edge) this.extra += this.widthTotal;
  }

  onResize(next?: {
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
  }) {
    if (next) {
      this.screen = next.screen;
      this.viewport = next.viewport;
    }
    if (!this.screen.height || !this.screen.width) return;

    // TILE is in CSS pixels at a 1500px-tall container; viewport/screen is the
    // same world-units-per-pixel on both axes, so this lands the tile at
    // exactly TILE * (containerHeight / 1500) pixels on screen.
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (TILE * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (TILE * this.scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];

    this.width = this.plane.scale.x * (1 + GAP_RATIO);
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  private renderer: Renderer;
  private gl: OGLRenderingContext;
  private camera: Camera;
  private scene = new Transform();
  private geometry!: Plane;
  private medias: Media[] = [];
  private screen = { width: 0, height: 0 };
  private viewport = { width: 0, height: 0 };
  private scroll = { ease: 0.05, current: 0, target: 0, last: 0, position: 0 };
  private isDown = false;
  private start = 0;
  private raf = 0;

  constructor(
    private container: HTMLElement,
    items: GalleryItem[],
    private baseBend: number,
    textColor: string,
    borderRadius: number,
    font: string,
    scrollEase: number,
    private reducedMotion: boolean
  ) {
    this.scroll.ease = scrollEase;

    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    container.appendChild(this.gl.canvas);

    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;

    this.onResize();
    this.geometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });

    // Doubled so the belt can wrap without a gap.
    const doubled = [...items, ...items];
    this.medias = doubled.map(
      (item, index) =>
        new Media(
          this.gl,
          this.geometry,
          this.scene,
          item.image,
          item.text,
          index,
          doubled.length,
          this.screen,
          this.viewport,
          baseBend,
          textColor,
          borderRadius,
          font,
          reducedMotion
        )
    );

    // Again, now that the medias exist: the first call ran against an empty
    // list, so nothing had picked up the width-scaled bend yet.
    this.onResize();
    this.addListeners();
  }

  private onResize = () => {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    if (!this.screen.width || !this.screen.height) return;
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const height = 2 * Math.tan((this.camera.fov * Math.PI) / 180 / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };

    // A fixed bend is not a fixed-looking arc. How far a tile turns is
    // asin(halfViewport / radius), and the radius grows with the square of the
    // viewport — so the same number that reads as a gentle curve on a laptop
    // turns the neighbouring tiles nearly edge-on at 375px. Easing it back on
    // narrow screens keeps the tilt at the edges roughly constant instead.
    const bend = this.baseBend * Math.min(1, this.screen.width / FULL_BEND_WIDTH);
    this.medias.forEach((m) => {
      m.bend = bend;
      m.onResize({ screen: this.screen, viewport: this.viewport });
    });
  };

  private onDown = (e: MouseEvent | TouchEvent) => {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = "touches" in e ? e.touches[0].clientX : e.clientX;
  };

  private onMove = (e: MouseEvent | TouchEvent) => {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    this.scroll.target = this.scroll.position + (this.start - x) * 0.05;
  };

  private onUp = () => {
    this.isDown = false;
  };

  /** Only horizontal intent. A vertical wheel belongs to the page — the
   *  original bound this to `window`, so every scroll anywhere spun the
   *  gallery, including while it was off screen. */
  private onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    this.scroll.target += e.deltaX * 0.05;
  };

  private addListeners() {
    window.addEventListener("resize", this.onResize);
    this.container.addEventListener("wheel", this.onWheel, { passive: true });
    this.container.addEventListener("mousedown", this.onDown);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("mouseup", this.onUp);
    // pan-y on the container means the browser keeps vertical scrolling and
    // hands us the horizontal, so neither has to be cancelled.
    this.container.addEventListener("touchstart", this.onDown, { passive: true });
    window.addEventListener("touchmove", this.onMove, { passive: true });
    window.addEventListener("touchend", this.onUp, { passive: true });
    window.addEventListener("touchcancel", this.onUp, { passive: true });
  }

  private update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = requestAnimationFrame(this.update);
  };

  /** Driven by an IntersectionObserver in the component: a WebGL loop that
   *  never stops is a real cost on a phone, and this sits far down a long page. */
  play() {
    if (!this.raf) this.raf = requestAnimationFrame(this.update);
  }

  pause() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  destroy() {
    this.pause();
    window.removeEventListener("resize", this.onResize);
    this.container.removeEventListener("wheel", this.onWheel);
    this.container.removeEventListener("mousedown", this.onDown);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("mouseup", this.onUp);
    this.container.removeEventListener("touchstart", this.onDown);
    window.removeEventListener("touchmove", this.onMove);
    window.removeEventListener("touchend", this.onUp);
    window.removeEventListener("touchcancel", this.onUp);
    this.gl.canvas.parentNode?.removeChild(this.gl.canvas);
  }
}

export function CircularGallery({
  items,
  bend = 3,
  borderRadius = 0.06,
  scrollEase = 0.05,
  className,
  ...props
}: CircularGalleryProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const style = getComputedStyle(el);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;

    const app = new App(
      el,
      items,
      bend,
      style.color,
      borderRadius,
      font,
      scrollEase,
      reducedMotion
    );

    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? app.play() : app.pause()),
      { rootMargin: "200px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      app.destroy();
    };
  }, [items, bend, borderRadius, scrollEase]);

  return (
    <div
      ref={containerRef}
      style={{ touchAction: "pan-y" }}
      className={cn(
        "w-full h-full overflow-hidden cursor-grab active:cursor-grabbing",
        "text-foreground font-medium text-[26px]",
        className
      )}
      {...props}
    />
  );
}

export default CircularGallery;
