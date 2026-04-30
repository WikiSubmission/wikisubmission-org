'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Lightbulb, CheckCircle2, 
  ImageIcon, ArrowRightLeft, User, Mail, Lock, Settings, 
  Search, Plus, Globe, Send, MoreVertical, LayoutGrid, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TutorialSlide = {
  title: string
  content: string | React.ReactNode
  mockupId: string
  mockupSubId?: string
  tip?: string
  success?: string
}

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

const HARDCODED_STEPS: TutorialSlide[] = [
  {
    title: 'Account Creation',
    content: (
      <>
        <p>All contributor accounts must be manually approved by our team.</p>
        <p>Please contact us at <a href="mailto:contact@wikisubmission.org" className="text-primary underline font-bold">contact@wikisubmission.org</a> with your preferred email address.</p>
        <p>Once approved, you will receive an invitation email leading you to the authentication page:</p>
      </>
    ),
    mockupId: 'login',
    tip: 'Make sure to check your spam folder if you don&apos;t see the invitation within 24 hours.',
    success: 'Your request is being processed by our administration team.'
  },
  {
    title: 'Log In & Consent',
    content: (
      <>
        <p>Sign in using the <strong className="text-foreground">exact same email address</strong> you provided for approval.</p>
        <p>You will be asked to accept Sanity&apos;s Terms of Service. Sanity is the secure infrastructure we use to host and manage our research archives.</p>
        <p className="mt-4 font-semibold text-foreground italic">Afterwards, you will be redirected to the WikiSubmission Studio.</p>
      </>
    ),
    mockupId: 'profile-setup',
    tip: 'Using a Google or GitHub account linked to your email is the fastest way to log in.',
    success: 'Secure connection established with Sanity Studio.'
  },
  {
    title: 'Setup Your Profile',
    content: (
      <>
        <p>Inside the Studio, click on the <strong className="text-foreground">My Profile</strong> tab in the sidebar.</p>
        <p>Please fill in your <strong className="text-foreground">First Name</strong> and <strong className="text-foreground">Last Name</strong>. We also recommend adding a short biography to introduce yourself to your readers.</p>
      </>
    ),
    mockupId: 'studio-profile',
    tip: 'A complete profile helps establish your authority as a contributor.',
    success: 'Your author identity is now configured.'
  },
  {
    title: 'Moderator Verification',
    content: (
      <>
        <p>After setting up your profile, our moderators will verify your credentials.</p>
        <p>Once verified, the <strong className="text-foreground">Articles</strong> section will unlock, allowing you to start drafting your work:</p>
      </>
    ),
    mockupId: 'articles-list',
    mockupSubId: 'approved',
    tip: 'This manual step ensures all published research meets our quality standards.',
    success: 'Writing permissions unlocked. Welcome to the team!'
  },
  {
    title: 'Create Your Article',
    content: (
      <>
        <p>Click <strong className="text-foreground">+ New article</strong> to begin. Essential: Use the <strong className="text-foreground">Translations</strong> menu to set the language of your article.</p>
        <p>Setting the correct language ensures your research is indexed correctly for global readers.</p>
      </>
    ),
    mockupId: 'editor',
    mockupSubId: 'language',
    tip: 'You can switch languages at any time to see how your article appears in different locales.',
    success: 'Language metadata configured correctly.'
  },
  {
    title: 'Review & Publish',
    content: (
      <>
        <p>Once your article is ready, click the <strong className="text-foreground">Publish</strong> button in the bottom right corner.</p>
        <p>Congratulations! Your contribution is now live and accessible to the global community on WikiSubmission.</p>
      </>
    ),
    mockupId: 'publish',
    tip: 'Published articles can still be edited; simply make your changes and click Update.',
    success: 'Your research is now part of the global archive!'
  }
]

export function BlogTutorial({ 
  onClose 
}: { 
  onClose: () => void 
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mockupSubId, setMockupSubId] = useState<string | undefined>(HARDCODED_STEPS[0].mockupSubId)

  const slide = HARDCODED_STEPS[currentSlide]
  const progress = ((currentSlide + 1) / HARDCODED_STEPS.length) * 100

  // Reset mockup subId when slide changes
  const handleSlideChange = (newSlideIndex: number) => {
    setCurrentSlide(newSlideIndex)
    setMockupSubId(HARDCODED_STEPS[newSlideIndex].mockupSubId)
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Main Container */}
        <div className="bg-card/98 backdrop-blur-3xl border border-border/80 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[880px] max-h-[96vh] w-[98vw] max-w-6xl">
          
          {/* Window Chrome */}
          <div className="h-12 bg-muted/40 border-b border-border/50 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]/80" />
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground/60 font-bold">
              WikiSubmission // Contributor Onboarding
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/80 text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-muted/20 w-full shrink-0">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            
            {/* Top Section: Text Content */}
            <div className="shrink-0 p-6 md:p-8 bg-background/10 border-b border-border/40">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center"
                >
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-mono text-primary font-bold uppercase tracking-widest">
                        Step {currentSlide + 1}
                      </span>
                    </div>
                    <h2 className="font-headline text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <div className="space-y-3 text-muted-foreground/90 text-base md:text-lg leading-relaxed font-sans max-w-2xl">
                      {slide.content}
                    </div>
                  </div>

                  <div className="w-full md:w-80 shrink-0 space-y-3">
                    {slide.tip && (
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex gap-3 group/tip transition-colors hover:bg-muted/30">
                        <div className="shrink-0 text-muted-foreground/60 mt-0.5 group-hover/tip:text-amber-500/60 transition-colors">
                          <Lightbulb size={16} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold mb-1 text-muted-foreground uppercase tracking-widest">Expert Tip</h4>
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
                            {slide.tip}
                          </p>
                        </div>
                      </div>
                    )}
                    {slide.success && (
                      <div className="p-4 rounded-xl bg-muted/20 border border-border/40 flex gap-3 group/milestone transition-colors hover:bg-muted/30">
                        <div className="shrink-0 text-muted-foreground/60 mt-0.5 group-hover/milestone:text-emerald-500/60 transition-colors">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold mb-1 text-muted-foreground uppercase tracking-widest">Milestone</h4>
                          <p className="text-[11px] text-muted-foreground/80 leading-relaxed font-medium">
                            {slide.success}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Section: CSS Mockup Preview */}
            <div className="flex-1 bg-muted/30 p-4 md:p-10 flex flex-col items-center justify-center min-h-0 relative overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center max-w-5xl mx-auto">
                {/* 
                  VIRTUAL DESKTOP ENGINE
                  We scale the entire mockup to prevent "squishing" of elements.
                  This keeps buttons, text, and inputs at a constant relative size.
                */}
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    key={`${currentSlide}-${mockupSubId}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-[1200px] h-[700px] relative bg-[#0d0e0f] rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden origin-center scale-[0.3] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.85]"
                  >
                    <RenderMockup id={slide.mockupId} subId={mockupSubId} />
                  </motion.div>
                </div>

                {/* Switcher for Step 5 (Language) */}
                {slide.mockupId === 'editor' && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-2xl z-[100]">
                    <button 
                      onClick={() => setMockupSubId(undefined)}
                      className={cn(
                        "size-2.5 rounded-full transition-all",
                        mockupSubId === undefined ? "bg-primary w-6" : "bg-white/20 hover:bg-white/40"
                      )}
                    />
                    <button 
                      onClick={() => setMockupSubId('language')}
                      className={cn(
                        "size-2.5 rounded-full transition-all",
                        mockupSubId === 'language' ? "bg-primary w-6" : "bg-white/20 hover:bg-white/40"
                      )}
                    />
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button 
                      onClick={() => setMockupSubId(prev => (prev === 'language' ? undefined : 'language'))}
                      className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5"
                    >
                      <ArrowRightLeft size={12} />
                      {mockupSubId === 'language' ? 'Hide UI' : 'Open UI'}
                    </button>
                  </div>
                )}
              </div>
              
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground/30 font-mono uppercase tracking-[0.4em] pointer-events-none">
                Hardware Accelerated Preview // {slide.title}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="h-20 bg-muted/20 border-t border-border/40 flex items-center justify-between px-8 shrink-0">
            <button
              onClick={() => handleSlideChange(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            <div className="hidden sm:flex gap-1.5">
              {HARDCODED_STEPS.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => handleSlideChange(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentSlide ? "w-10 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>

            {currentSlide < HARDCODED_STEPS.length - 1 ? (
              <button
                onClick={() => handleSlideChange(Math.min(HARDCODED_STEPS.length - 1, currentSlide + 1))}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all text-sm font-bold"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all text-sm font-bold"
              >
                Start Writing
                <CheckCircle2 size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
