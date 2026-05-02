import type { Component } from "../../types/technology";
import { motion } from "framer-motion";

interface Props {
  component: Component;
}

export function ComponentCard({ component }: Props) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-white/10 bg-codex-card/50 p-6 backdrop-blur-md transition-all hover:border-codex-gold/30 hover:shadow-2xl">
      {/* High-contrast Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-codex-text group-hover:text-codex-gold transition-colors">
          {component.name}
        </h3>
        <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold text-codex-muted tracking-widest">
          UNIT_{component.id.toUpperCase()}
        </span>
      </div>

      {/* Material Flow Visualizer (Micro) */}
      <div className="mt-8 flex items-center gap-3">
         <div className="flex flex-col items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-codex-gold/40 group-hover:bg-codex-gold transition-colors shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            <div className="w-px h-12 bg-gradient-to-b from-codex-gold/40 to-transparent" />
         </div>
         <div className="flex-1 space-y-4">
            {/* Input Phase */}
            <div className="relative pl-4">
               <div className="absolute -left-1 top-2 h-1.5 w-1.5 rounded-full border border-codex-gold/50 bg-codex-bg" />
               <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-codex-gold/60">Input Material</p>
               <p className="mt-1 text-sm font-medium text-codex-text leading-tight">{component.madeFrom}</p>
            </div>

            {/* Processing Phase */}
            <div className="relative pl-4">
               <div className="absolute -left-1 top-2 h-1.5 w-1.5 rounded-full border border-white/20 bg-codex-bg" />
               <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-codex-muted">System Function</p>
               <p className="mt-1 text-sm text-codex-secondary leading-tight italic">{component.function}</p>
            </div>
         </div>
      </div>

      {/* Deployment Metadata */}
      <div className="mt-8 border-t border-white/5 pt-4">
        <div className="flex justify-between items-center font-mono text-[10px] uppercase tracking-tighter">
          <span className="text-codex-muted">Installation Position</span>
          <span className="text-codex-text font-bold">{component.position}</span>
        </div>
      </div>

      {component.criticalNote && (
        <motion.div 
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
          className="mt-4 rounded border border-red-500/20 bg-red-500/5 p-3"
        >
          <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-red-400">Critical Failure Protocol</p>
          <p className="mt-1 text-xs text-red-200/80 leading-relaxed">{component.criticalNote}</p>
        </motion.div>
      )}

      {/* Decorative Blueprint Background Grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
    </article>
  );
}
