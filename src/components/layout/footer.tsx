export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} svsdmediplaza. All rights reserved.</p>
        <p className="text-sm mt-1">Your health, our priority. Trusted by millions.</p>
      </div>
    </footer>
  );
}
