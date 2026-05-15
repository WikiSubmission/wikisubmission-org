// icons.jsx — minimal lucide-equivalent SVG glyphs
// All monochrome, currentColor, 1.6px stroke.

const Icon = ({ d, size = 14, fill = 'none', children, style, className = 'icn' }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24"
       fill={fill} stroke="currentColor" strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IBookmark = (p) => <Icon {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></Icon>;
const IBookmarkFill = (p) => (
  <svg className="icn" width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const INote = (p) => <Icon {...p}><path d="M16 4H8a2 2 0 0 0-2 2v14l4-3 4 3 4-3 4 3V6a2 2 0 0 0-2-2z" /></Icon>;
const IFlame = (p) => <Icon {...p}><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-3 2-6 1 1 2 2 3 -4z" /></Icon>;
const IBook = (p) => <Icon {...p}><path d="M4 4h7a3 3 0 0 1 3 3v14"/><path d="M20 4h-7a3 3 0 0 0-3 3v14"/><path d="M4 4v17"/><path d="M20 4v17"/></Icon>;
const ILibrary = (p) => <Icon {...p}><path d="M3 6v14"/><path d="M7 4v18"/><path d="M11 4h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6z"/></Icon>;
const IShare = (p) => <Icon {...p}><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 11l7.6-4.4"/><path d="M8.2 13l7.6 4.4"/></Icon>;
const IPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
const ISearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>;
const IChevR = (p) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>;
const IChevL = (p) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>;
const IArrowR = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>;
const IArrowL = (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6"/></Icon>;
const ICheck = (p) => <Icon {...p}><path d="M5 13l4 4L19 7"/></Icon>;
const IX = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
const IMore = (p) => <Icon {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Icon>;
const ICopy = (p) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="1"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/></Icon>;
const ITrash = (p) => <Icon {...p}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></Icon>;
const IExternal = (p) => <Icon {...p}><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M14 14v6H4V10h6"/></Icon>;
const IMenu = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16"/></Icon>;
const ISettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>;
const IClose = (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>;
const ILogout = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon>;
const IEdit = (p) => <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></Icon>;
const ITag = (p) => <Icon {...p}><path d="M20 12L12 20l-9-9V3h8z"/><circle cx="7" cy="7" r="1"/></Icon>;
const IPlay = (p) => <Icon {...p}><path d="M5 4l14 8-14 8z"/></Icon>;
const IHeadphones = (p) => <Icon {...p}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3z"/><path d="M3 19a2 2 0 0 0 2 2h1v-6H3z"/></Icon>;
const ICompass = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></Icon>;
const IGoogle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.09-1.93 3.22-4.77 3.22-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.52H2.18v2.84A11 11 0 0 0 12 23z"/>
    <path fill="#FBBC05" d="M5.85 14.13a6.6 6.6 0 0 1 0-4.26V7.03H2.18a11 11 0 0 0 0 9.94z"/>
    <path fill="#EA4335" d="M12 5.45c1.62 0 3.07.56 4.21 1.64l3.16-3.16C17.45 2.06 14.97 1 12 1A11 11 0 0 0 2.18 7.03l3.67 2.84C6.72 7.38 9.14 5.45 12 5.45z"/>
  </svg>
);
const IApple = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.4 12.5c0-2.7 2.2-4 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.8 0-3.6 1.1-4.5 2.7-2 3.3-.5 8.3 1.3 11 .9 1.4 2 2.9 3.4 2.8 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.9c1.5 0 2.4-1.4 3.3-2.8 1-1.6 1.5-3.1 1.5-3.2-.1 0-2.7-1-2.7-4.4zM13.7 4.6c.8-.9 1.3-2.2 1.1-3.5-1.1.1-2.4.7-3.2 1.6-.7.8-1.4 2.1-1.2 3.4 1.2.1 2.5-.6 3.3-1.5z"/>
  </svg>
);
const IDiscord = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.6 4.5a17.5 17.5 0 0 0-4.4-1.4l-.2.4c1.6.4 3 1 4.3 1.9a14.6 14.6 0 0 0-13 0 16 16 0 0 1 4.3-1.9l-.2-.4a17.5 17.5 0 0 0-4.4 1.4C2.2 9 1.5 13.4 1.8 17.7c1.7 1.3 3.4 2 5 2.5l.4-.6c-.9-.3-1.7-.7-2.4-1.2.2-.1.4-.3.6-.4 4.6 2.2 9.5 2.2 14 0l.6.4a13 13 0 0 1-2.4 1.2l.4.6c1.6-.5 3.3-1.2 5-2.5.4-5-.7-9.4-3.4-13.2zM8.7 15c-1 0-1.9-1-1.9-2.2 0-1.3.9-2.3 1.9-2.3s1.9 1 1.9 2.3c0 1.3-.9 2.2-1.9 2.2zm6.6 0c-1 0-1.9-1-1.9-2.2 0-1.3.9-2.3 1.9-2.3s1.9 1 1.9 2.3c0 1.3-.8 2.2-1.9 2.2z"/>
  </svg>
);
const IMail = (p) => <Icon {...p}><path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="1"/></Icon>;

Object.assign(window, {
  Icon, IBookmark, IBookmarkFill, INote, IFlame, IBook, ILibrary, IShare,
  IPlus, ISearch, IChevR, IChevL, IArrowR, IArrowL, ICheck, IX, IMore, ICopy,
  ITrash, IExternal, IMenu, ISettings, IClose, ILogout, IEdit, ITag,
  IPlay, IHeadphones, ICompass, IGoogle, IApple, IDiscord, IMail,
});
