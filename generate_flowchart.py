import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

fig, ax = plt.subplots(1, 1, figsize=(28, 40))
ax.set_xlim(0, 28)
ax.set_ylim(0, 40)
ax.axis('off')
fig.patch.set_facecolor('#0F172A')

# ─── colour palette ───────────────────────────────────────────────
C = {
    'bg':      '#0F172A',
    'blue':    '#3B82F6',
    'indigo':  '#6366F1',
    'purple':  '#8B5CF6',
    'teal':    '#14B8A6',
    'green':   '#22C55E',
    'amber':   '#F59E0B',
    'red':     '#EF4444',
    'slate':   '#334155',
    'card':    '#1E293B',
    'text':    '#F8FAFC',
    'muted':   '#94A3B8',
    'border':  '#475569',
    'orange':  '#F97316',
    'pink':    '#EC4899',
}

def box(ax, x, y, w, h, label, sublabel=None,
        bg='#1E293B', fg='#F8FAFC', radius=0.25,
        fontsize=10, subfontsize=8, border=None, bold=True):
    border_col = border or bg
    rect = FancyBboxPatch((x - w/2, y - h/2), w, h,
                          boxstyle=f"round,pad=0.05,rounding_size={radius}",
                          fc=bg, ec=border_col, lw=1.8, zorder=3)
    ax.add_patch(rect)
    if sublabel:
        ax.text(x, y + h*0.12, label, ha='center', va='center',
                color=fg, fontsize=fontsize,
                fontweight='bold' if bold else 'normal',
                zorder=4, wrap=True)
        ax.text(x, y - h*0.22, sublabel, ha='center', va='center',
                color=C['muted'], fontsize=subfontsize,
                fontweight='normal', zorder=4)
    else:
        ax.text(x, y, label, ha='center', va='center',
                color=fg, fontsize=fontsize,
                fontweight='bold' if bold else 'normal',
                zorder=4)

def diamond(ax, x, y, w, h, label, bg='#F59E0B', fg='#0F172A', fontsize=9):
    xs = [x, x+w/2, x, x-w/2, x]
    ys = [y+h/2, y, y-h/2, y, y+h/2]
    ax.fill(xs, ys, color=bg, zorder=3)
    ax.plot(xs, ys, color=bg, lw=1.5, zorder=3)
    ax.text(x, y, label, ha='center', va='center',
            color=fg, fontsize=fontsize, fontweight='bold', zorder=4)

def arrow(ax, x1, y1, x2, y2, color='#475569', lw=1.5, label=None):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=lw),
                zorder=2)
    if label:
        mx, my = (x1+x2)/2, (y1+y2)/2
        ax.text(mx+0.1, my, label, color=C['muted'], fontsize=7,
                va='center', zorder=4)

def section_bg(ax, x, y, w, h, color, alpha=0.08, label=None, label_color=None):
    rect = FancyBboxPatch((x, y), w, h,
                          boxstyle="round,pad=0.1,rounding_size=0.3",
                          fc=color, ec=color, lw=0, alpha=alpha, zorder=1)
    ax.add_patch(rect)
    if label:
        ax.text(x + w/2, y + h - 0.3, label, ha='center', va='top',
                color=label_color or color, fontsize=9, fontweight='bold',
                alpha=0.9, zorder=2)

# ══════════════════════════════════════════════════════════════════
#  TITLE
# ══════════════════════════════════════════════════════════════════
ax.text(14, 39.3, 'EduBridge', ha='center', va='center',
        color=C['blue'], fontsize=32, fontweight='bold', zorder=5)
ax.text(14, 38.7, 'Platform Architecture & User-Flow Diagram',
        ha='center', va='center', color=C['muted'], fontsize=13, zorder=5)
ax.axhline(38.3, color=C['border'], lw=1, xmin=0.02, xmax=0.98, zorder=2)

# ══════════════════════════════════════════════════════════════════
#  LAYER 0 — USER TYPES  (y ~37)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 35.6, 27.4, 1.9, C['blue'], alpha=0.07, label='USER LAYER', label_color=C['blue'])

box(ax, 5,   36.55, 3.4, 1.0, '🎓  Student',     'Underserved learner', C['indigo'], fontsize=10)
box(ax, 14,  36.55, 3.4, 1.0, '🧑‍🏫  Mentor',       'Domain expert',       C['teal'],   fontsize=10)
box(ax, 23,  36.55, 3.4, 1.0, '🏢  Sponsor',      'Org / donor',         C['amber'],  fontsize=10, fg='#0F172A')

# ══════════════════════════════════════════════════════════════════
#  LAYER 1 — FRONTEND  (y ~32-35)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 30.8, 27.4, 4.5, C['indigo'], alpha=0.07, label='FRONTEND  —  Next.js 15 + React 19 + Tailwind CSS + Framer Motion', label_color=C['indigo'])

pages = [
    (2.2,  33.4, 'Landing /\nDashboard'),
    (5.5,  33.4, 'Auth\nLogin/Register'),
    (8.8,  33.4, 'AI\nAssistant'),
    (12.1, 33.4, 'Community\nGroups'),
    (15.4, 33.4, 'Mentor\nBooking'),
    (18.7, 33.4, 'Sponsor\nOpportunities'),
    (22.0, 33.4, 'Forum\nDiscussion'),
    (25.3, 33.4, 'Profile /\nSettings'),
]
for px, py, lbl in pages:
    box(ax, px, py, 2.9, 0.9, lbl, bg=C['card'], border=C['indigo'], fontsize=7.5)

# Context providers row
ctx = [
    (4.5,  31.6, 'HybridAuthContext\n(user, token, login, logout)'),
    (10.5, 31.6, 'Socket.IO Client\n(real-time events)'),
    (16.5, 31.6, 'React Hook Form\n(form validation — yup)'),
    (22.5, 31.6, 'Axios HTTP Client\n(API requests + JWT header)'),
]
for cx, cy, lbl in ctx:
    box(ax, cx, cy, 5.2, 0.85, lbl, bg='#162032', border=C['purple'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LAYER 2 — AUTH GATEWAY  (y ~29-30.5)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 28.5, 27.4, 1.9, C['amber'], alpha=0.07, label='AUTH GATEWAY', label_color=C['amber'])

diamond(ax, 8,  29.45, 4.2, 1.2, 'Firebase\nConfigured?', C['amber'], fontsize=8.5)
box(ax, 14, 29.45, 4.2, 0.85, 'Firebase Auth\n(email/password + Firestore)', C['orange'], fontsize=8, fg=C['bg'])
box(ax, 20, 29.45, 4.2, 0.85, 'Demo JWT Auth\n(bcrypt + MongoDB/in-memory)', C['slate'], border=C['amber'], fontsize=8)
box(ax, 2.5,29.45, 3.8, 0.85, 'JWT Token\n(7-day, Bearer header)', C['green'], fontsize=8, fg=C['bg'])

arrow(ax, 8, 29.05, 2.5+1.9, 29.45-0.0, C['green'], label='always issued')
arrow(ax, 8+2.1, 29.45, 14-2.1, 29.45, C['orange'], label='YES')
arrow(ax, 8, 29.05-0.0, 20-2.1, 29.45, C['muted'], label='NO')

# ══════════════════════════════════════════════════════════════════
#  LAYER 3 — BACKEND API  (y ~22-28)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 21.3, 27.4, 6.9, C['teal'], alpha=0.07, label='BACKEND  —  Express.js + Node.js  |  Helmet · CORS · Rate-Limit · express-validator', label_color=C['teal'])

# API gateway bar
box(ax, 14, 27.5, 26.0, 0.75, 'API Gateway  /api/*  —  JWT Middleware (auth.js) + Role Guard',
    C['teal'], fontsize=9.5, fg=C['bg'])

# Route boxes
routes = [
    (2.5,  25.9, '/api/auth',          'Register · Login\nProfile · Password'),
    (6.5,  25.9, '/api/community',     'Groups · Join/Leave\nMessages · Reactions'),
    (10.5, 25.9, '/api/forum',         'Posts · Replies\nLikes · Categories'),
    (14.5, 25.9, '/api/mentor',        'Sessions · Booking\nAvailability'),
    (18.5, 25.9, '/api/sponsor',       'Opportunities\nApplications · Review'),
    (22.5, 25.9, '/api/notifications', 'Read · Unread\nDelete · Count'),
    (25.8, 25.9, '/api/ai',            'Study · Summarize\nTranslate · Reco'),
]
route_colors = [C['blue'], C['indigo'], C['purple'], C['teal'], C['amber'], C['slate'], C['pink']]
for (rx, ry, rt, rs), rc in zip(routes, route_colors):
    box(ax, rx, ry, 3.6, 1.1, rt, rs, rc, border=rc, fontsize=8.5, subfontsize=7)

# Middleware strip
mid = [
    (4.0,  24.2, 'express-rate-limit\n(100 req/15 min)'),
    (9.5,  24.2, 'helmet\n(secure HTTP headers)'),
    (14.5, 24.2, 'express-validator\n(input sanitise)'),
    (19.5, 24.2, 'multer\n(file upload)'),
    (24.5, 24.2, 'node-cron\n(scheduled tasks)'),
]
for mx, my, ml in mid:
    box(ax, mx, my, 4.2, 0.75, ml, '#1A2540', border=C['border'], fontsize=7.5)

# Socket.IO
box(ax, 14, 22.75, 8.0, 0.9,
    'Socket.IO Server  —  join-group · group-message · reactions · typing · user-online · mentor-session',
    C['purple'], fontsize=8, fg=C['text'])

# AI service
box(ax, 25, 22.75, 5.0, 0.9,
    'Google Gemini 1.5 Flash\nstudy-assist · summarise · translate · moderate · recommend',
    '#1A1040', border=C['pink'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LAYER 4 — DATA  (y ~17-21)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 17.0, 27.4, 4.6, C['green'], alpha=0.07, label='DATA LAYER', label_color=C['green'])

box(ax, 5.5,  20.1, 8.0, 0.9,  'MongoDB  (Mongoose ODM)',  C['green'], fontsize=10, fg=C['bg'])
box(ax, 18.0, 20.1, 8.0, 0.9,  'Firebase Firestore',       C['orange'], fontsize=10, fg=C['bg'])

models = [
    (2.2,  18.5, 'User\nstudent · mentor\nsponsor profiles'),
    (5.5,  18.5, 'MentorSession\nschedule · booking\nrecording · AI insights'),
    (8.8,  18.5, 'Message\nreactions · mentions\nmoderation · readBy'),
    (12.1, 18.5, 'Group\nmembers · admins\nsettings · stats'),
    (15.4, 18.5, 'ForumPost\nlikes · replies\nAI tags · sentiment'),
    (18.7, 18.5, 'SponsorOpportunity\neligibility · budget\napplications · AI match'),
    (22.0, 18.5, 'Notification\ntype · read\nactionUrl · metadata'),
    (25.3, 18.5, 'Donation\nCampaign\nimpact metrics'),
]
for mx, my, ml in models:
    box(ax, mx, my, 2.9, 1.15, ml, bg=C['card'], border=C['green'], fontsize=7, subfontsize=None)

# Firestore schema note
box(ax, 14, 17.55, 10.5, 0.75, 'Firestore: video-calls  {from, to, roomId, status, createdAt}  — signalling only',
    '#111820', border=C['orange'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LAYER 5 — VIDEO CALL WEBRTC  (y ~12.5-16.5)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 12.2, 27.4, 4.5, C['purple'], alpha=0.07, label='VIDEO CALL  —  WebRTC + Firebase Signalling', label_color=C['purple'])

webrtc = [
    (2.8,  15.4, '① Caller\nSends Invitation',      C['blue']),
    (7.0,  15.4, '② Firebase\nStores Call Doc',      C['orange']),
    (11.2, 15.4, '③ Receiver\nNotified (real-time)', C['indigo']),
    (15.4, 15.4, '④ Accept /\nDecline',              C['amber']),
    (19.6, 15.4, '⑤ SDP Offer\n& Answer Exchange',  C['teal']),
    (23.8, 15.4, '⑥ ICE Candidates\nvia Firestore',  C['purple']),
]
for wx, wy, wl, wc in webrtc:
    box(ax, wx, wy, 3.6, 0.9, wl, wc, fontsize=8, fg=C['text'] if wc!=C['amber'] else C['bg'])

for i in range(len(webrtc)-1):
    x1 = webrtc[i][0] + 1.8
    x2 = webrtc[i+1][0] - 1.8
    arrow(ax, x1, 15.4, x2, 15.4, C['border'], lw=1.8)

controls = [
    (3.5,  13.5, 'Camera Toggle\nisVideoEnabled'),
    (7.5,  13.5, 'Mic Toggle\nisAudioEnabled'),
    (11.5, 13.5, 'Screen Share\nisScreenSharing'),
    (15.5, 13.5, 'Call Timer\ncallDuration'),
    (19.5, 13.5, 'Connection\nStatus'),
    (23.5, 13.5, 'End Call\nCleanup + Firestore'),
]
for cx, cy, cl in controls:
    box(ax, cx, cy, 3.6, 0.85, cl, bg=C['card'], border=C['purple'], fontsize=7.5)

box(ax, 14, 12.65, 26, 0.7,
    'STUN: stun.l.google.com:19302  ·  Auto-expire 5 min  ·  Cleanup cron every 2 min  ·  RTCPeerConnection teardown on disconnect',
    '#120E1F', border=C['border'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LAYER 6 — AI FEATURES  (y ~7.8-12)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 7.5, 27.4, 4.3, C['pink'], alpha=0.07, label='AI FEATURES  —  Google Gemini 1.5 Flash + OpenAI (optional)', label_color=C['pink'])

ai_features = [
    (2.8,  10.85, '🤖 Study\nAssistant', 'Q&A · step-by-step\nsubject-aware'),
    (7.3,  10.85, '📝 Content\nSummarizer', 'Sessions · forum\nthread recap'),
    (11.8, 10.85, '🌐 Multi-lang\nTranslator', '10+ languages\nformat-preserving'),
    (16.3, 10.85, '⭐ Recommendation\nEngine', 'Mentor · scholarship\ncollaborative filter'),
    (20.8, 10.85, '🛡 Content\nModerator', 'Spam · offensive\nconfidence score'),
    (25.3, 10.85, '📊 Session\nAnalytics', 'Engagement · KPIs\nfollow-up suggest'),
]
for ax2, ay, al, asl in ai_features:
    box(ax, ax2, ay, 4.0, 1.1, al, asl, bg=C['card'], border=C['pink'], fontsize=8.5, subfontsize=7.5)

# AI pipeline
box(ax, 14, 9.35, 26.0, 0.75,
    'AI Pipeline:  User Input  →  Prompt Engineering  →  Gemini API  →  JSON Response  →  UI Render',
    '#1A0F20', border=C['pink'], fontsize=8.5)

forum_ai = [
    (3.5,  8.35, 'Auto-tagging\n(Gemini suggests tags)'),
    (8.5,  8.35, 'Sentiment Analysis\n(post tone / emotion)'),
    (13.5, 8.35, 'Accepted Answers\n(highlight mentor reply)'),
    (18.5, 8.35, 'AI Summaries\n(long thread TL;DR)'),
    (23.5, 8.35, 'Multilingual Posts\n(translate on demand)'),
]
for fx, fy, fl in forum_ai:
    box(ax, fx, fy, 4.4, 0.75, fl, bg='#0F1820', border=C['purple'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LAYER 7 — USER JOURNEYS  (y ~1.5-7.2)
# ══════════════════════════════════════════════════════════════════
section_bg(ax, 0.3, 1.3, 27.4, 5.8, C['blue'], alpha=0.06, label='USER JOURNEY FLOWS', label_color=C['blue'])

# Student
sj = [(1.4,5.9),(1.4,5.0),(1.4,4.1),(1.4,3.2),(1.4,2.3)]
sl = ['Register\n(student)',
      'Explore\nMentors',
      'Book\nSession',
      'Apply\nScholarship',
      'AI\nAssistant']
sc = [C['indigo'],C['blue'],C['teal'],C['amber'],C['pink']]
ax.text(1.4, 6.55, '🎓 Student Flow', ha='center', color=C['indigo'], fontsize=9, fontweight='bold')
for (sx, sy), sla, sco in zip(sj, sl, sc):
    box(ax, sx, sy, 2.2, 0.72, sla, sco, fontsize=7.5, fg=C['text'] if sco!=C['amber'] else C['bg'])
for i in range(len(sj)-1):
    arrow(ax, sj[i][0], sj[i][1]-0.36, sj[i+1][0], sj[i+1][1]+0.36, C['indigo'])

# Mentor
mj = [(7.0,5.9),(7.0,5.0),(7.0,4.1),(7.0,3.2),(7.0,2.3)]
ml2 = ['Register\n(mentor)',
       'Set\nAvailability',
       'Create\nSessions',
       'Lead\nGroups',
       'Track\nImpact']
mc = [C['teal'],C['blue'],C['indigo'],C['purple'],C['green']]
ax.text(7.0, 6.55, '🧑‍🏫 Mentor Flow', ha='center', color=C['teal'], fontsize=9, fontweight='bold')
for (mx2, my2), mla, mco in zip(mj, ml2, mc):
    box(ax, mx2, my2, 2.2, 0.72, mla, mco, fontsize=7.5, fg=C['text'])
for i in range(len(mj)-1):
    arrow(ax, mj[i][0], mj[i][1]-0.36, mj[i+1][0], mj[i+1][1]+0.36, C['teal'])

# Sponsor
spj = [(12.6,5.9),(12.6,5.0),(12.6,4.1),(12.6,3.2),(12.6,2.3)]
spl = ['Register\n(sponsor)',
       'Create\nOpportunity',
       'Review\nApplications',
       'Select\nWinners',
       'Track\nImpact']
spc = [C['amber'],C['orange'],C['red'],C['green'],C['teal']]
ax.text(12.6, 6.55, '🏢 Sponsor Flow', ha='center', color=C['amber'], fontsize=9, fontweight='bold')
for (spx, spy), spla, spco in zip(spj, spl, spc):
    box(ax, spx, spy, 2.2, 0.72, spla, spco, fontsize=7.5, fg=C['text'] if spco!=C['amber'] else C['bg'])
for i in range(len(spj)-1):
    arrow(ax, spj[i][0], spj[i][1]-0.36, spj[i+1][0], spj[i+1][1]+0.36, C['amber'])

# Data flow summary
df_items = [
    (18.5, 5.9, 'HTTP Request\n+ JWT header',         C['blue']),
    (18.5, 5.0, 'Route Handler\n+ Validation',        C['teal']),
    (18.5, 4.1, 'Business Logic\n+ DB Query',         C['indigo']),
    (18.5, 3.2, 'AI Enhancement\n(optional)',          C['pink']),
    (18.5, 2.3, 'JSON Response\n→ UI Update',         C['green']),
]
ax.text(18.5, 6.55, '⚡ Data Flow', ha='center', color=C['blue'], fontsize=9, fontweight='bold')
for (dfx, dfy, dfl, dfc) in df_items:
    box(ax, dfx, dfy, 3.2, 0.72, dfl, dfc, fontsize=7.5, fg=C['text'] if dfc!=C['amber'] else C['bg'])
for i in range(len(df_items)-1):
    arrow(ax, df_items[i][0], df_items[i][1]-0.36,
               df_items[i+1][0], df_items[i+1][1]+0.36, C['blue'])

# Security summary
sec_items = [
    (24.2, 5.9, 'Helmet\nHTTP headers'),
    (24.2, 5.0, 'Rate Limit\n100 req/15 min'),
    (24.2, 4.1, 'CORS\norigin whitelist'),
    (24.2, 3.2, 'bcrypt\n12 salt rounds'),
    (24.2, 2.3, 'JWT\nBearer + expiry'),
]
ax.text(24.2, 6.55, '🔒 Security', ha='center', color=C['red'], fontsize=9, fontweight='bold')
for (scx, scy, scl) in sec_items:
    box(ax, scx, scy, 3.2, 0.72, scl, bg=C['card'], border=C['red'], fontsize=7.5)

# ══════════════════════════════════════════════════════════════════
#  LEGEND
# ══════════════════════════════════════════════════════════════════
ax.axhline(1.15, color=C['border'], lw=0.8, xmin=0.02, xmax=0.98, zorder=2)
legend_items = [
    (C['indigo'], 'Frontend / Pages'),
    (C['teal'],   'Backend / API'),
    (C['green'],  'Database'),
    (C['purple'], 'Real-time / WebRTC'),
    (C['pink'],   'AI / Gemini'),
    (C['amber'],  'Auth / Security'),
]
ax.text(0.5, 0.75, 'Legend:', color=C['muted'], fontsize=8, va='center')
for i, (lc, lt) in enumerate(legend_items):
    lx = 2.2 + i * 4.3
    rect = FancyBboxPatch((lx-0.3, 0.45), 0.6, 0.55,
                          boxstyle="round,pad=0.05,rounding_size=0.1",
                          fc=lc, ec=lc, lw=0, zorder=3)
    ax.add_patch(rect)
    ax.text(lx + 0.5, 0.72, lt, color=C['muted'], fontsize=7.5, va='center')

ax.text(14, 0.15, 'EduBridge  ·  Full-Stack Educational Platform  ·  Next.js · Express · MongoDB · Firebase · Gemini AI · WebRTC',
        ha='center', color=C['border'], fontsize=7.5)

plt.tight_layout(pad=0.3)
plt.savefig(
    r'C:\Users\Admin\Desktop\Sanjay vit stuff\hackthegap\edubridge\public\architecture.png',
    dpi=130, bbox_inches='tight',
    facecolor=fig.get_facecolor()
)
print("Saved architecture.png")
