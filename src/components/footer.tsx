export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} GitBlog. Powered by Next.js and GitHub.
      </div>
    </footer>
  );
}
