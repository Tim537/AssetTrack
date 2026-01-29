import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-xl">AssetTrack</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Anmelden
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Registrieren
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center px-4 md:px-8 mx-auto">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Behalte den Überblick über deine Assets
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              AssetTrack ist die moderne Lösung für effizientes Asset-Management. 
              Verwalte Hardware, Software und Lizenzen an einem Ort.
            </p>
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="h-11 px-8">
                  Jetzt Starten
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="h-11 px-8">
                  Mehr erfahren
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
