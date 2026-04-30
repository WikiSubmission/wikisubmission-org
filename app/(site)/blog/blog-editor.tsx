'use client'

import { useState } from 'react'
import { 
  X, 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Plus, 
  Image as ImageIcon,
  Save,
  Send,
  RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function BlogEditor({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: '2000px' }}>
      <motion.div
        initial={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9, translateZ: -200 }}
        animate={{ opacity: 1, rotateY: -8, rotateX: 4, scale: 1, translateZ: 0 }}
        exit={{ opacity: 0, rotateY: 20, rotateX: 10, scale: 0.9, translateZ: -200 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Background Glows (Subtle, matching Editorial palette) */}
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-ed-accent/20 rounded-full blur-[120px] -z-10" />

        {/* Main Editor Container (Glassmorphic) */}
        <div className="bg-card/98 backdrop-blur-3xl border border-border/80 rounded-2xl shadow-[0_60px_150px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[750px]">
        
        {/* Window Decoration Bar */}
        <div className="h-11 bg-muted/30 border-b border-border/40 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]/80" />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            Draft: New Submission
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted/80 text-muted-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary font-bold">
                Article Editor
              </span>
              <div className="h-px grow bg-border/20" />
            </div>
            <h2 className="font-headline text-3xl font-extrabold tracking-tight">
              Proclaim your research.
            </h2>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/80 font-bold ml-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter article title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-muted/20 border border-border/40 rounded-xl px-4 py-4 text-lg font-headline font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/30 transition-all"
            />
          </div>

          {/* Permalink Display */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              Permalink
            </span>
            <div className="h-px w-4 bg-border/20" />
            <span className="text-xs font-mono text-primary underline underline-offset-4 decoration-primary/20 truncate">
              wikisubmission.org/blog/{title.toLowerCase().replace(/\s+/g, '-') || '...'}
            </span>
            <button className="text-[10px] bg-muted/60 hover:bg-muted border border-border/40 text-muted-foreground px-2 py-0.5 rounded transition-colors uppercase tracking-tighter">
              Edit
            </button>
          </div>

          {/* Rich Text Area Container */}
          <div className="flex-1 flex flex-col border border-border/40 rounded-xl overflow-hidden bg-muted/10">
            {/* Toolbar */}
            <div className="bg-muted/40 border-b border-border/40 p-2.5 flex items-center gap-1.5 shrink-0">
              <button className="inline-flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-primary/5">
                <Plus size={14} />
                <span>Add Media</span>
              </button>
              
              <div className="w-px h-5 bg-border/40 mx-2" />
              
              <ToolbarButton icon={<Bold size={15} />} />
              <ToolbarButton icon={<Italic size={15} />} />
              <ToolbarButton icon={<Underline size={15} />} />
              <ToolbarButton icon={<LinkIcon size={15} />} />
              <div className="w-px h-5 bg-border/40 mx-2" />
              <ToolbarButton icon={<ImageIcon size={15} />} />
            </div>

            {/* Editor Area */}
            <textarea
              placeholder="Start writing your article here..."
              value={content}
              onChange={handleContentChange}
              className="w-full flex-1 p-6 bg-transparent text-foreground leading-relaxed font-body text-lg focus:outline-none resize-none placeholder:text-muted-foreground/20"
            />

            {/* Editor Footer */}
            <div className="bg-muted/30 border-t border-border/20 px-4 py-2.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/60">
                <span className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  Words: {wordCount}
                </span>
                <span>Characters: {content.length}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/40 italic">
                <RotateCcw size={10} />
                Draft saved 2 mins ago
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-muted/50 text-sm font-semibold transition-all">
              <Save size={16} />
              Save Draft
            </button>
            <button className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm font-semibold transition-all">
              <Send size={16} />
              Submit Article
            </button>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  )
}

function ToolbarButton({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={cn(
      "p-2 rounded-lg transition-all",
      active ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
    )}>
      {icon}
    </button>
  )
}
