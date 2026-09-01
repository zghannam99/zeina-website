import { SiteMenu } from "@/components/ui/site-menu";

// The menu lives on the sub-pages rather than in the root layout: the home
// page navigates by its own numbered cards, and a fixed button there would sit
// on top of the hero animation.
export default function AboutLayout({ children }: LayoutProps<"/about">) {
  return (
    <>
      <SiteMenu />
      {children}
    </>
  );
}
