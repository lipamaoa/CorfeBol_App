import { Github, Twitter, Mail, Instagram, Facebook } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8">
       

        {/* Social Media Icons - Centered */}
        <div className="flex justify-center gap-6">
          <a
            href="mailto:info@korfballmanager.com"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com/korfballmanager"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/korfballmanager"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://facebook.com/korfballmanager"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://github.com/korfballmanager"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>

        {/* Copyright - Centered */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          &copy; {currentYear} Korfball Manager. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

