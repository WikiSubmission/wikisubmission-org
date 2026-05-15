// auth.jsx — sign-in + verify screens (desktop & mobile-ready inside frames)

function AuthSignIn({ density = 'comfy' }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-mast">
          <img src="assets/logo-transparent.png" alt="" />
          <div className="auth-eyebrow">Sign in</div>
          <h1>Read what you can <em>of the scripture</em>.</h1>
          <p>Save bookmarks, write notes in the margin, and keep your reading streak across devices.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="auth-eyebrow" style={{ color: 'var(--ed-fg-muted)' }}>By email</div>
          <input className="auth-input" placeholder="you@example.com" defaultValue="" />
          <button className="auth-primary">
            <IMail size={14} />
            Send a six-digit code
          </button>
        </div>

        <div className="auth-divider">or continue with</div>

        <div className="auth-providers">
          <button className="auth-provider">
            <span className="glyph"><IGoogle size={16} /></span>
            Google
            <span className="arrow">→</span>
          </button>
          <button className="auth-provider">
            <span className="glyph"><IApple size={16} /></span>
            Apple
            <span className="arrow">→</span>
          </button>
          <button className="auth-provider">
            <span className="glyph" style={{ color: '#5865F2' }}><IDiscord size={16} /></span>
            Discord
            <span className="arrow">→</span>
          </button>
        </div>

        <p className="auth-foot">
          We will never email you anything other than what you ask for. Read the <a href="#">privacy note</a>.
        </p>
      </div>
    </div>
  );
}

function AuthVerify() {
  const code = ['4', '7', '2', '0', '', ''];
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-mast">
          <img src="assets/logo-transparent.png" alt="" />
          <div className="auth-eyebrow">Check your email</div>
          <h1><em>A six-digit</em> code is on the way.</h1>
          <p>We sent it to <b style={{ color: 'var(--ed-fg)', fontWeight: 500 }}>a47@wikisubmission.org</b>. It expires in ten minutes.</p>
        </div>

        <div className="otp-row">
          {code.map((d, i) => {
            const isFilled = d !== '';
            const isActive = !isFilled && code.findIndex(x => x === '') === i;
            return (
              <div key={i} className={'otp-box ' + (isFilled ? 'filled' : '') + (isActive ? ' active' : '')}>
                {d}
              </div>
            );
          })}
        </div>

        <div className="otp-resend">
          Didn’t receive it? <a href="#">Resend</a> or <a href="#">use a different method</a>.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AuthSignIn, AuthVerify });
