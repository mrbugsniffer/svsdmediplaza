export function Footer() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} PharmaFlow. All rights reserved.</p>
        <p className="text-sm mt-1">Your health, our priority.</p>
      </div>
    </footer>
  );
}
