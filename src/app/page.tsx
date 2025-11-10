import { Footer, FOOTER_POSITIONS } from "@/features/footer/footer";

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-96">
        <h1 className="text-4xl font-display font-semibold">
          Movie Recommendations App
        </h1>
        <p className="text-lg font-body">Know what movies to watch next</p>
      </div>
      <Footer position={FOOTER_POSITIONS.BOTTOM_FORCED} />
    </>
  );
}
