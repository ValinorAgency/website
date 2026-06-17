import Link from "next/link";
import SpriteParticleProbe from "@/components/SpriteParticleProbe";

export const metadata = {
  title: "Sprite Probe",
  description: "Prototipo aislado para probar el hero de partículas con sprites WebGPU.",
};

export default function SpriteProbePage() {
  return (
    <main className="relative overflow-x-clip">
      <section className="section-shell pb-4 pt-4 sm:pb-6 sm:pt-6">
        <div className="section-inner flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium tracking-[-0.01em] text-[var(--ink-muted)]">
              Sprite probe
            </span>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--ink)]">
              Particles con area real
            </h1>
          </div>
          <Link href="/" className="pill-button-light">
            Volver al home
          </Link>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto w-full max-w-[96rem]">
          <SpriteParticleProbe />
        </div>
      </section>
    </main>
  );
}
