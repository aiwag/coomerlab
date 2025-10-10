import React from "react";
import DragWindowRegion from "@/components/DragWindowRegion";
import NavigationMenu from "@/components/template/NavigationMenu";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DragWindowRegion title="CoomerLabs: Funtimes" />
      <NavigationMenu />
       {/* <div className="flex p-2 justify-between items-center gap-2 bg-neutral-900 text-white">
              <div className="flex flex-row items-center gap-2">
                <InitialIcons /> <span>Chaturbate</span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <LangToggle />
                <ToggleTheme />
              </div>
            </div> */}
      <main className="h-screen p-2 pb-20">{children}</main>
    </>
  );
}
