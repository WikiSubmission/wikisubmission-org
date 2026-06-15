'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Lightbulb, CheckCircle2,
  ImageIcon, ArrowRightLeft, User, Mail, Lock,
  Search, Plus, Globe, Send, MoreVertical, LayoutGrid, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mockup Components ──────────────────────────────────────────────────────

const SanityChrome = ({ children, title = "WikiSubmission" }: { children: React.ReactNode, title?: string }) => (
  <div className="w-full h-full bg-[#101112] text-[#ced2d9] flex flex-col font-sans text-sm overflow-hidden rounded-xl border border-[#2a2c2e] selection:bg-blue-500/30">
    {/* Top Bar */}
    <div className="h-10 bg-[#161718] border-b border-[#2a2c2e] flex items-center px-3 justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-[#f03e2f] rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm">W</div>
        <span className="font-bold text-xs tracking-tight text-white">{title}</span>
        <div className="h-4 w-px bg-[#2a2c2e] mx-1" />
        <div className="flex items-center gap-2 text-[#848d96] bg-[#101112] px-2 py-1 rounded border border-[#2a2c2e]">
          <Search size={12} />
          <span className="text-[10px]">Search</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="size-6 rounded-full bg-[#2a2c2e] border border-[#3e4144] flex items-center justify-center overflow-hidden">
          <User size={12} className="text-[#848d96]" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-44 bg-[#161718] border-r border-[#2a2c2e] flex flex-col shrink-0">
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5 rounded bg-blue-500/10 text-blue-400 flex items-center gap-2 font-bold text-[11px] border border-blue-500/20">
            <LayoutGrid size={14} />
            <span>Structure</span>
          </div>
          <div className="px-2 py-1.5 rounded hover:bg-[#2a2c2e] flex items-center gap-2 text-[11px] font-medium text-[#848d96] transition-colors">
            <Send size={14} />
            <span>Vision</span>
          </div>
        </div>
        <div className="mt-4 px-4 text-[9px] uppercase tracking-[0.15em] text-[#555d66] font-black">Content</div>
        <div className="p-2 space-y-0.5">
          <div className="px-2 py-1.5 rounded hover:bg-[#2a2c2e] flex items-center gap-2 cursor-pointer transition-colors group">
            <FileText size={14} className="text-[#555d66] group-hover:text-[#848d96]" />
            <span className="text-[11px] font-medium">Articles</span>
          </div>
          <div className="px-2 py-1.5 rounded hover:bg-[#2a2c2e] flex items-center gap-2 cursor-pointer transition-colors group">
            <User size={14} className="text-[#555d66] group-hover:text-[#848d96]" />
            <span className="text-[11px] font-medium">Authors</span>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 bg-[#101112] flex flex-col overflow-hidden relative">
        {children}
      </div>
    </div>
  </div>
)

const LoginMockup = () => (
  <div className="absolute inset-0 bg-[#0d0e0f] flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-12 font-serif text-4xl font-bold tracking-tight text-white italic">Sanity</div>
    <div className="w-full max-w-sm space-y-8">
      <h3 className="text-2xl font-bold text-white tracking-tight">Log in to your account</h3>
      <div className="space-y-3">
        <div className="w-full h-11 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md flex items-center justify-center gap-3 text-white font-medium hover:bg-[#2a2c2e] transition-all cursor-pointer">
          <div className="size-4 bg-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">G</div>
          <span className="text-[13px]">Continue with Google</span>
        </div>
        <div className="w-full h-11 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md flex items-center justify-center gap-3 text-white font-medium hover:bg-[#2a2c2e] transition-all cursor-pointer">
          <div className="size-4 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
            <User size={10} className="text-white" />
          </div>
          <span className="text-[13px]">Continue with GitHub</span>
        </div>
        <div className="w-full h-11 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md flex items-center justify-center gap-3 text-white font-medium hover:bg-[#2a2c2e] transition-all cursor-pointer">
          <div className="size-5 bg-[#2a2c2e] rounded-full flex items-center justify-center">
            <Mail size={12} className="text-[#848d96]" />
          </div>
          <span className="text-[13px]">Continue with email</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-6 text-[11px] font-medium text-blue-400">
          <span className="hover:underline cursor-pointer">Use SSO</span>
          <span className="hover:underline cursor-pointer">Forgot password?</span>
        </div>
        <div className="text-[12px] text-[#848d96]">
          Don&apos;t have an account? <span className="text-blue-400 hover:underline cursor-pointer font-medium">Create one</span>
        </div>
      </div>
    </div>
  </div>
)

const ProfileSetupMockup = () => (
  <div className="absolute inset-0 bg-[#0d0e0f] flex flex-col items-center justify-center p-12 text-center">
    <div className="w-full max-w-md space-y-10">
      <div className="font-serif text-3xl font-bold text-white italic mb-16 text-left">Sanity</div>
      <h2 className="text-2xl font-bold text-white tracking-tight">Before you continue</h2>
      <div className="space-y-8 text-left">
        <div className="space-y-5">
          <div className="flex gap-4 group cursor-pointer">
            <div className="size-5 border-2 border-[#3e4144] rounded mt-0.5 shrink-0 transition-colors group-hover:border-blue-500" />
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">Help us build a better product</p>
              <p className="text-[12px] text-[#848d96] leading-relaxed mt-1">
                Allow us to collect <span className="text-blue-400">telemetry data</span> on usage and errors.
              </p>
            </div>
          </div>
          <div className="flex gap-4 group cursor-pointer">
            <div className="size-5 border-2 border-[#3e4144] rounded mt-0.5 shrink-0 transition-colors group-hover:border-blue-500" />
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">Subscribe to product updates</p>
              <p className="text-[12px] text-[#848d96] leading-relaxed mt-1">
                Receive occasional emails from Sanity.
              </p>
            </div>
          </div>
          <div className="flex gap-4 group cursor-pointer">
            <div className="size-5 bg-blue-500 border-2 border-blue-500 rounded mt-0.5 shrink-0 flex items-center justify-center">
              <CheckCircle2 size={12} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white leading-tight">I accept the Terms of Service*</p>
              <p className="text-[12px] text-[#848d96] leading-relaxed mt-1">
                To use Sanity you must agree to our <span className="text-blue-400">Terms of Service</span>.
              </p>
            </div>
          </div>
        </div>
        
        <button className="w-full h-12 bg-[#ced2d9] text-black font-bold rounded-md hover:bg-white transition-all shadow-xl shadow-black/20">
          Continue
        </button>
      </div>
    </div>
  </div>
)

const StudioProfileMockup = () => (
  <SanityChrome>
    <div className="flex-1 flex overflow-hidden">
      {/* Inner Sidebar */}
      <div className="w-56 bg-[#101112] border-r border-[#2a2c2e] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#2a2c2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-4 bg-[#f03e2f]/20 rounded flex items-center justify-center text-[#f03e2f]">
              <FileText size={10} />
            </div>
            <span className="font-bold text-[11px] text-white">WikiSubmission</span>
          </div>
          <ChevronLeft size={14} className="text-[#848d96]" />
        </div>
        <div className="p-2 space-y-1">
          <div className="px-2 py-2 rounded hover:bg-[#2a2c2e] flex items-center gap-3 text-[12px] font-medium text-[#848d96] transition-colors">
            <FileText size={16} />
            <span>Articles</span>
          </div>
          <div className="px-2 py-2 rounded bg-blue-500/20 text-blue-400 flex items-center gap-3 text-[12px] font-bold border border-blue-500/10">
            <User size={16} />
            <span>My Profile</span>
          </div>
        </div>
      </div>
      
      {/* Editor Pane */}
      <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
        <div className="flex items-center justify-between border-b border-[#2a2c2e] pb-6">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#848d96] uppercase tracking-widest">My Profile</div>
            <h2 className="text-4xl font-extrabold text-[#ced2d9] tracking-tight">Untitled</h2>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
               <div className="size-2 rounded-full bg-amber-500" />
               <span className="text-[11px] font-bold text-[#848d96]">Draft</span>
             </div>
             <MoreVertical size={16} className="text-[#848d96]" />
          </div>
        </div>
        
        <div className="max-w-2xl space-y-10">
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#848d96]">First name</label>
            <div className="w-full h-11 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md px-4 flex items-center text-white focus-within:border-blue-500 transition-colors">
              <input type="text" className="bg-transparent border-none outline-none w-full text-sm" placeholder="" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#848d96]">Last name</label>
            <div className="w-full h-11 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md px-4 flex items-center text-white focus-within:border-blue-500 transition-colors">
              <input type="text" className="bg-transparent border-none outline-none w-full text-sm" placeholder="" />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#848d96]">Photo</label>
            <div className="w-full h-16 bg-[#1a1c1e] border border-[#2a2c2e] border-dashed rounded-md flex items-center justify-between px-6 group hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4 text-[#848d96]">
                <ImageIcon size={20} />
                <span className="text-xs">Drag or paste image here</span>
              </div>
              <div className="flex gap-4">
                <button className="text-[11px] font-bold text-[#ced2d9] flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2a2c2e]">
                  <Send size={14} className="rotate-90" />
                  Upload
                </button>
                <button className="text-[11px] font-bold text-[#ced2d9] flex items-center gap-2 px-3 py-1.5 rounded hover:bg-[#2a2c2e]">
                  <Search size={14} />
                  Select
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#848d96]">Bio</label>
            <div className="w-full h-40 bg-[#1a1c1e] border border-[#2a2c2e] rounded-md px-4 py-3 flex items-start text-white focus-within:border-blue-500 transition-colors">
              <textarea className="bg-transparent border-none outline-none w-full h-full text-sm resize-none" placeholder="" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bottom bar */}
    <div className="h-14 bg-[#161718] border-t border-[#2a2c2e] flex items-center px-6 justify-between shrink-0">
       <div className="flex items-center gap-2 text-[10px] text-[#848d96]">
          <div className="size-2 rounded-full bg-amber-500/40" />
          <span>Not published</span>
       </div>
       <button className="h-9 px-6 bg-[#1a1c1e] border border-[#2a2c2e] text-[#848d96] rounded-md text-[11px] font-bold hover:text-white hover:border-[#ced2d9] transition-all shadow-lg">Publish</button>
    </div>
  </SanityChrome>
)

const ArticlesListMockup = ({ showArticles = false }: { showArticles?: boolean }) => (
  <SanityChrome>
    <div className="flex-1 flex overflow-hidden">
      {/* Inner Sidebar */}
      <div className="w-48 bg-[#101112] border-r border-[#2a2c2e] flex flex-col shrink-0">
        <div className="p-3 border-b border-[#2a2c2e] flex items-center justify-between">
          <span className="font-bold text-xs">WikiSubmission</span>
          <Plus size={14} className="text-[#848d96]" />
        </div>
        <div className="p-2 space-y-1">
          <div className={cn(
            "px-2 py-1.5 rounded flex items-center gap-2 text-xs font-medium transition-colors",
            showArticles ? "bg-blue-500/20 text-blue-400" : "hover:bg-[#2a2c2e]"
          )}>
            <FileText size={14} />
            <span>Articles</span>
          </div>
          <div className="px-2 py-1.5 rounded hover:bg-[#2a2c2e] flex items-center gap-2 text-xs font-medium transition-colors">
            <User size={14} className="text-[#848d96]" />
            <span>My Profile</span>
          </div>
        </div>
      </div>
      
      {/* Secondary Sidebar */}
      {showArticles && (
        <div className="w-48 bg-[#101112] border-r border-[#2a2c2e] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#2a2c2e]">
            <span className="font-bold text-xs">My Articles</span>
          </div>
          <div className="p-2 space-y-1">
            <div className="px-2 py-1.5 rounded bg-blue-500/20 text-blue-400 text-xs font-medium">All My Articles</div>
            <div className="px-2 py-1.5 rounded hover:bg-[#2a2c2e] text-xs">By Category</div>
          </div>
        </div>
      )}
      
      {/* Empty State / Grid */}
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        {!showArticles ? (
          <div className="space-y-4 max-w-xs opacity-50">
            <div className="size-16 mx-auto rounded-full bg-[#1a1c1e] flex items-center justify-center border border-dashed border-[#2a2c2e]">
              <Lock size={24} className="text-[#848d96]" />
            </div>
            <p className="text-xs text-[#848d96]">Waiting for moderator approval to access the Articles section...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="size-12 mx-auto bg-blue-500/10 rounded flex items-center justify-center text-blue-400">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-white">No articles yet</p>
            </div>
            <button className="px-6 py-2 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Plus size={14} />
              New article
            </button>
          </div>
        )}
      </div>
    </div>
  </SanityChrome>
)

const ArticleEditorMockup = ({ showTranslations = false, isPublished = false }: { showTranslations?: boolean, isPublished?: boolean }) => (
  <SanityChrome>
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Editor Header */}
      <div className="h-12 border-b border-[#2a2c2e] flex items-center px-6 justify-between shrink-0 bg-[#101112]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
             <div className="px-2 py-0.5 rounded-l border-y border-l border-[#2a2c2e] bg-[#1a1c1e] text-[9px] font-bold text-[#848d96]">Published</div>
             <div className={cn(
               "px-2 py-0.5 rounded-r border border-[#2a2c2e] text-[9px] font-bold",
               isPublished ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/20 text-primary"
             )}>
               {isPublished ? 'Live' : 'Draft'}
             </div>
          </div>
          <h2 className="font-bold text-sm">First article</h2>
        </div>
        
        <div className="flex items-center gap-2 relative">
          <button 
            className={cn(
              "px-3 py-1.5 rounded border border-[#2a2c2e] text-[10px] font-bold flex items-center gap-2 transition-colors",
              showTranslations ? "bg-[#2a2c2e] text-white border-white/20" : "bg-[#1a1c1e] text-[#848d96]"
            )}
          >
            <Globe size={14} />
            Translations
          </button>
          
          {showTranslations && (
            <div className="absolute top-10 right-0 w-48 bg-[#1a1c1e] border border-white/10 rounded shadow-2xl z-50 p-1.5 overflow-hidden">
              <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#848d96] border-b border-white/5 mb-1">Manage Translations</div>
              <div className="px-3 py-2 rounded bg-blue-500/20 text-blue-400 flex items-center justify-between text-xs">
                <span>English</span>
                <span className="text-[10px] opacity-50 uppercase">en</span>
              </div>
              <div className="px-3 py-2 rounded hover:bg-[#2a2c2e] text-white flex items-center justify-between text-xs transition-colors">
                <span>Français</span>
                <span className="text-[10px] opacity-50 uppercase">fr</span>
              </div>
              <div className="px-3 py-2 rounded hover:bg-[#2a2c2e] text-white flex items-center justify-between text-xs transition-colors">
                <span>العربية</span>
                <span className="text-[10px] opacity-50 uppercase">ar</span>
              </div>
              <div className="px-3 py-2 rounded hover:bg-[#2a2c2e] text-white flex items-center justify-between text-xs transition-colors">
                <span>Türkçe</span>
                <span className="text-[10px] opacity-50 uppercase">tr</span>
              </div>
            </div>
          )}
          
          <MoreVertical size={14} className="text-[#848d96]" />
        </div>
      </div>
      
      {/* Form Area */}
      <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#848d96]">Title</label>
            <div className="w-full h-10 bg-[#1a1c1e] border border-[#3b82f6] rounded px-4 flex items-center text-white">
              <span>First article</span>
            </div>
            <p className="text-[10px] text-[#848d96]">Title of the article</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#848d96]">Slug</label>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-[#1a1c1e] border border-[#2a2c2e] rounded px-4 flex items-center text-white">
                <span>first-article</span>
              </div>
              <button className="px-4 h-10 bg-[#1a1c1e] border border-[#2a2c2e] rounded text-xs font-bold text-[#848d96]">Generate</button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#848d96]">Body</label>
            <div className="w-full h-64 bg-[#1a1c1e] border border-[#2a2c2e] rounded-lg overflow-hidden flex flex-col">
              <div className="h-10 border-b border-[#2a2c2e] bg-[#161718] flex items-center px-4 gap-4">
                <div className="text-[10px] font-bold text-[#848d96] border-r border-[#2a2c2e] pr-4">No style</div>
                <div className="flex gap-3 text-[#848d96]">
                  <span className="font-serif font-bold">B</span>
                  <span className="font-serif italic">I</span>
                  <span className="underline">U</span>
                  <span className="line-through">S</span>
                </div>
                <div className="h-4 w-px bg-[#2a2c2e]" />
                <div className="flex items-center gap-2 text-[#848d96]">
                  <ImageIcon size={14} />
                  <span className="text-[10px] font-bold">Image</span>
                </div>
              </div>
              <div className="flex-1 p-6 text-sm text-[#848d96]">
                Empty
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="h-14 bg-[#161718] border-t border-[#2a2c2e] flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-2 text-[10px] text-[#848d96]">
          <div className="size-2 rounded-full bg-emerald-500/40" />
          <span>Edited 10 min. ago</span>
        </div>
        <button className={cn(
          "h-9 px-6 rounded font-bold text-xs flex items-center gap-2 transition-all shadow-lg",
          isPublished ? "bg-white text-black hover:bg-white/90" : "bg-[#1a1c1e] border border-[#2a2c2e] text-[#848d96]"
        )}>
          {isPublished ? 'Publish' : 'Update'}
        </button>
      </div>
      
      {/* Success Notification */}
      {isPublished && (
        <div className="absolute bottom-6 right-6 bg-[#1a1c1e] border border-emerald-500/50 rounded-lg p-3 pr-12 shadow-2xl flex items-center gap-3 animate-slide-up">
          <div className="size-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={14} />
          </div>
          <span className="text-xs font-medium text-white">First article was published</span>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#848d96]">
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 w-full rounded-b-lg" />
        </div>
      )}
    </div>
  </SanityChrome>
)

const RenderMockup = ({ id, subId }: { id: string, subId?: string }) => {
  switch (id) {
    case 'login': return <LoginMockup />
    case 'profile-setup': return <ProfileSetupMockup />
    case 'studio-profile': return <StudioProfileMockup />
    case 'articles-list': return <ArticlesListMockup showArticles={subId === 'approved'} />
    case 'editor': return <ArticleEditorMockup showTranslations={subId === 'language'} />
    case 'publish': return <ArticleEditorMockup isPublished={true} />
    default: return null
  }
}

// ── Main Component ─────────────────────────────────────────────────────────

export function BlogTutorial({
  onClose
}: {
  onClose: () => void
}) {
  const t = useTranslations('blog')

  const bold = (chunks: React.ReactNode) => <strong className="text-foreground">{chunks}</strong>
  const link = (chunks: React.ReactNode) => (
    <a href="mailto:contact@wikisubmission.org" className="text-primary underline font-bold">{chunks}</a>
  )

  const STEPS = [
    {
      title: t('tutorialStep1Title'),
      content: (
        <>
          <p>{t('tutorialStep1Content1')}</p>
          <p>{t.rich('tutorialStep1Content2', { link })}</p>
          <p>{t('tutorialStep1Content3')}</p>
        </>
      ),
      mockupId: 'login',
      tip: t('tutorialStep1Tip'),
      success: t('tutorialStep1Success'),
    },
    {
      title: t('tutorialStep2Title'),
      content: (
        <>
          <p>{t.rich('tutorialStep2Content1', { bold })}</p>
          <p>{t('tutorialStep2Content2')}</p>
          <p className="mt-4 font-semibold text-foreground italic">{t('tutorialStep2Content3')}</p>
        </>
      ),
      mockupId: 'profile-setup',
      tip: t('tutorialStep2Tip'),
      success: t('tutorialStep2Success'),
    },
    {
      title: t('tutorialStep3Title'),
      content: (
        <>
          <p>{t.rich('tutorialStep3Content1', { bold })}</p>
          <p>{t.rich('tutorialStep3Content2', { bold })}</p>
        </>
      ),
      mockupId: 'studio-profile',
      tip: t('tutorialStep3Tip'),
      success: t('tutorialStep3Success'),
    },
    {
      title: t('tutorialStep4Title'),
      content: (
        <>
          <p>{t('tutorialStep4Content1')}</p>
          <p>{t.rich('tutorialStep4Content2', { bold })}</p>
        </>
      ),
      mockupId: 'articles-list',
      mockupSubId: 'approved',
      tip: t('tutorialStep4Tip'),
      success: t('tutorialStep4Success'),
    },
    {
      title: t('tutorialStep5Title'),
      content: (
        <>
          <p>{t.rich('tutorialStep5Content1', { bold })}</p>
          <p>{t('tutorialStep5Content2')}</p>
        </>
      ),
      mockupId: 'editor',
      mockupSubId: 'language',
      tip: t('tutorialStep5Tip'),
      success: t('tutorialStep5Success'),
    },
    {
      title: t('tutorialStep6Title'),
      content: (
        <>
          <p>{t.rich('tutorialStep6Content1', { bold })}</p>
          <p>{t('tutorialStep6Content2')}</p>
        </>
      ),
      mockupId: 'publish',
      tip: t('tutorialStep6Tip'),
      success: t('tutorialStep6Success'),
    },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [mockupSubId, setMockupSubId] = useState<string | undefined>(STEPS[0].mockupSubId)
  const [previewOpen, setPreviewOpen] = useState(true)

  const slide = STEPS[currentSlide]
  const progress = ((currentSlide + 1) / STEPS.length) * 100

  const handleSlideChange = (newSlideIndex: number) => {
    setCurrentSlide(newSlideIndex)
    setMockupSubId(STEPS[newSlideIndex].mockupSubId)
  }

  const rootRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)
  const slideRef = useRef<HTMLDivElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)
  const mockupRef = useRef<HTMLDivElement | null>(null)
  const [previewRender, setPreviewRender] = useState(previewOpen)
  const slideKeyRef = useRef(currentSlide)
  const mockupKeyRef = useRef(`${currentSlide}-${mockupSubId}`)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, y: 16, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'expo.out' },
    )
  }, [])

  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    gsap.to(el, {
      width: `${progress}%`,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [progress])

  useEffect(() => {
    const el = slideRef.current
    if (!el) return
    if (slideKeyRef.current === currentSlide) {
      gsap.set(el, { opacity: 1, y: 0 })
    } else {
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      )
    }
    slideKeyRef.current = currentSlide
  }, [currentSlide])

  useEffect(() => {
    const el = mockupRef.current
    if (!el) return
    const key = `${currentSlide}-${mockupSubId}`
    if (mockupKeyRef.current === key) {
      gsap.set(el, { opacity: 1 })
    } else {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    }
    mockupKeyRef.current = key
  }, [currentSlide, mockupSubId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (previewOpen) setPreviewRender(true)
  }, [previewOpen])

  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    if (previewOpen) {
      const target = el.scrollHeight
      gsap.fromTo(
        el,
        { opacity: 0, height: 0 },
        { opacity: 1, height: target, duration: 0.25, ease: 'power2.out', clearProps: 'height' },
      )
    } else if (previewRender) {
      gsap.to(el, {
        opacity: 0,
        height: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => setPreviewRender(false),
      })
    }
  }, [previewOpen, previewRender])

  return (
    <div
      ref={rootRef}
      className="relative z-10 w-full sm:max-w-3xl bg-card border-y sm:border border-border sm:rounded-2xl shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[88vh] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-background/40 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={16} className="text-primary shrink-0" />
          <span className="font-headline font-bold text-sm truncate">{t('tutorialTitle')}</span>
          <span className="text-[10px] font-mono text-muted-foreground/70 shrink-0 ml-1">
            {currentSlide + 1}/{STEPS.length}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 -mr-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="h-0.5 bg-muted shrink-0">
        <div
          ref={progressRef}
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div
          ref={slideRef}
          key={currentSlide}
          className="px-5 sm:px-8 py-6 sm:py-8 space-y-5"
        >
            <div className="space-y-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary font-bold uppercase tracking-widest">
                {t('tutorialStepLabel', { n: currentSlide + 1 })}
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h2>
            </div>

            <div className="space-y-3 text-muted-foreground text-[15px] leading-relaxed">
              {slide.content}
            </div>

            {(slide.tip || slide.success) && (
              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {slide.tip && (
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 flex gap-3">
                    <Lightbulb size={15} className="shrink-0 mt-0.5 text-amber-500/80" />
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold mb-0.5 text-muted-foreground uppercase tracking-widest">{t('tutorialTip')}</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">{slide.tip}</p>
                    </div>
                  </div>
                )}
                {slide.success && (
                  <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 flex gap-3">
                    <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-500/80" />
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold mb-0.5 text-muted-foreground uppercase tracking-widest">{t('tutorialOutcome')}</h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">{slide.success}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/40">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <ImageIcon size={12} />
                  {t('tutorialPreview')}
                </div>
                <button
                  onClick={() => setPreviewOpen((v) => !v)}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                >
                  {previewOpen ? t('tutorialHide') : t('tutorialShow')}
                </button>
              </div>
              {previewRender && (
                <div ref={previewRef} className="overflow-hidden">
                  <div className="p-3 sm:p-5">
                    <div className="relative w-full overflow-hidden rounded-lg bg-[#0d0e0f] border border-white/5" style={{ aspectRatio: '12 / 7' }}>
                      <div
                        ref={mockupRef}
                        key={`${currentSlide}-${mockupSubId}`}
                        className="absolute top-0 left-0 w-[1200px] h-[700px] origin-top-left scale-[0.26] sm:scale-[0.46] md:scale-[0.55]"
                      >
                        <RenderMockup id={slide.mockupId} subId={mockupSubId} />
                      </div>
                    </div>

                    {slide.mockupId === 'editor' && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">View</span>
                        <button
                          onClick={() => setMockupSubId(undefined)}
                          className={cn(
                            'px-3 py-1 rounded-full text-[11px] font-medium border transition-colors',
                            mockupSubId === undefined
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                          )}
                        >
                          {t('tutorialViewEditor')}
                        </button>
                        <button
                          onClick={() => setMockupSubId('language')}
                          className={cn(
                            'px-3 py-1 rounded-full text-[11px] font-medium border transition-colors inline-flex items-center gap-1.5',
                            mockupSubId === 'language'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-muted/60 text-muted-foreground border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                          )}
                        >
                          <ArrowRightLeft size={11} />
                          {t('tutorialViewTranslations')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 bg-background/40 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={() => handleSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-background hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ChevronLeft size={16} className="rtl-flip" />
          <span className="hidden sm:inline">{t('tutorialPrevious')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSlideChange(i)}
              aria-label={`Go to step ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentSlide ? 'w-7 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
              )}
            />
          ))}
        </div>

        {currentSlide < STEPS.length - 1 ? (
          <button
            onClick={() => handleSlideChange(Math.min(STEPS.length - 1, currentSlide + 1))}
            className="inline-flex items-center gap-1.5 h-10 px-4 sm:px-5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
          >
            <span className="hidden sm:inline">{t('tutorialContinue')}</span>
            <span className="sm:hidden">{t('tutorialNext')}</span>
            <ChevronRight size={16} className="rtl-flip" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 h-10 px-4 sm:px-5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold"
          >
            <span className="hidden sm:inline">{t('tutorialDone')}</span>
            <CheckCircle2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

