"use client";

import { Drawer } from "vaul";
import { ReactNode } from "react";

export default function MobilePlannerDrawer({ children }: { children: ReactNode }) {
  return (
    <div className="md:hidden mt-8 w-full relative z-20">
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <button className="w-full h-14 bg-brand-green text-white font-black text-lg rounded-full flex items-center justify-center gap-2 tap-feedback hover:bg-brand-green-70 transition-colors shadow-float">
            Start Planning
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none shadow-float">
            <div className="p-4 bg-white rounded-t-[24px] flex-1 overflow-y-auto">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border-strong mb-6" />
              {children}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
