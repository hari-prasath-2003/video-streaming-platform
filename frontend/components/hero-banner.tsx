import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="overflow-hidden rounded-3xl border">
      <div className="relative h-[320px]">
        <img
          src="https://picsum.photos/1400/600"
          alt="banner"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative flex h-full flex-col justify-center p-10">
          <span className="mb-3 text-sm text-white/80">Featured Creator</span>

          <h2 className="max-w-2xl text-5xl font-bold text-white">
            Building YouTube Scale Systems from Scratch
          </h2>

          <p className="mt-4 max-w-xl text-white/70">
            Learn backend engineering, distributed systems, caching, messaging
            queues, and cloud architecture.
          </p>

          <div className="mt-6 flex gap-3">
            <Button>Watch Now</Button>
            <Button variant="secondary">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
