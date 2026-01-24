// shared/filters.ts
// COMPREHENSIVE SECURITY FILTER - Enhanced for all LLMs
// Blocks: self-harm, weapons, chemical/biological/physical harm, prompt injection
// Cross-LLM compatible: ChatGPT, Claude, Gemini, Grok
// NOTE: keep dependency-free for extension usage.

export type ForbiddenCategory =
  | 'selfHarm'
  | 'weapons'
  | 'chemicalHarm'
  | 'biologicalHarm'
  | 'physicalHarm'
  | 'enterpriseThreats'
  | 'promptInjection'
  | 'databaseManipulation';

export const forbiddenKeywords: Record<ForbiddenCategory, RegExp[]> = {
  // SELF-HARM & SUICIDAL CONTENT - INSTANT BLOCK
  selfHarm: [
    // Direct suicide terms
    /s[uüū][\s\-_]*[i1ıl!|]+[\s\-_]*c[i1ıl!|]+[\s\-_]*d[e3ēĕė]/i,
    /s[uüū][\s\-_]*[i1ıl!|]+[\s\-_]*c[i1ıl!|]+[\s\-_]*[a4āă@]/i,
    /\bkms\b/i, /\bk[\s\-_]*m[\s\-_]*s\b/i,
    /k[i1ıl!|]+ll[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /[e3ēĕė]nd[\s\-_]*m[yÿý][\s\-_]*l[i1ıl!|]+f[e3ēĕė]/i,
    /[o0ōŏő]ff[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /[uüū]n[\s\-_]*[a4āă@]l[i1ıl!|]+v[e3ēĕė]/i,

    // Self-harm methods
    /s[e3ēĕė]lf[\s\-_]*h[a4āă@]rm/i,
    /s[e3ēĕė]lf[\s\-_]*[i1ıl!|]+nj[uüū]r[yÿý]/i,
    /s[e3ēĕė]lf[\s\-_]*m[uüū]t[i1ıl!|]+l[a4āă@]t[i1ıl!|]+[o0ōŏő]n/i,
    /c[uüū]tt[i1ıl!|]+ng[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /b[uüū]rn[i1ıl!|]+ng[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /sl[i1ıl!|]+t[\s\-_]*wr[i1ıl!|]+sts?/i,
    /sl[i1ıl!|]+t[\s\-_]*thr[o0ōŏő][a4āă@]t/i,
    /r[a4āă@]z[o0ōŏő]r[\s\-_]*bl[a4āă@]d[e3ēĕė]/i,

    // Overdose & poisoning
    /p[i1ıl!|]+ll[\s\-_]*[o0ōŏő]v[e3ēĕė]rd[o0ōŏő]s[e3ēĕė]/i,
    /dr[uüū]g[\s\-_]*[o0ōŏő]v[e3ēĕė]rd[o0ōŏő]s[e3ēĕė]/i,
    /\b[o0ōŏő]\.?d\.?\b/i, /\b[o0ōŏő]d\b/i,
    /p[o0ōŏő][i1ıl!|]+s[o0ōŏő]n[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /sw[a4āă@]ll[o0ōŏő]w[\s\-_]*bl[e3ēĕė][a4āă@]ch/i,
    /dr[i1ıl!|]+nk[\s\-_]*bl[e3ēĕė][a4āă@]ch/i,

    // Hanging & asphyxiation
    /h[a4āă@]ng[\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /n[o0ōŏő][o0ōŏő]s[e3ēĕė]/i,
    /[a4āă@]sph[yÿý]x[i1ıl!|]+[a4āă@]t/i,

    // Jumping & traffic
    /j[uüū]mp[\s\-_]*[o0ōŏő]ff/i,
    /j[uüū]mp[\s\-_]*fr[o0ōŏő]m/i,
    /r[uüū]n[\s\-_]*[i1ıl!|]+nt[o0ōŏő][\s\-_]*tr[a4āă@]ff[i1ıl!|]+c/i,
    /st[e3ēĕė]p[\s\-_]*[i1ıl!|]+n[\s\-_]*fr[o0ōŏő]nt[\s\-_]*[o0ōŏő]f/i,

    // Suicidal ideation
    /w[a4āă@]nt[\s\-_]*t[o0ōŏő][\s\-_]*d[i1ıl!|]+[e3ēĕė]/i,
    /w[i1ıl!|]+sh[\s\-_]*[i1ıl!|]+[\s\-_]*w[a4āă@]s[\s\-_]*d[e3ēĕė][a4āă@]d/i,
    /b[e3ēĕė]tt[e3ēĕė]r[\s\-_]*[o0ōŏő]ff[\s\-_]*d[e3ēĕė][a4āă@]d/i,
    /w[o0ōŏő]rthl[e3ēĕė]ss/i,
    /n[o0ōŏő][\s\-_]*r[e3ēĕė][a4āă@]s[o0ōŏő]n[\s\-_]*t[o0ōŏő][\s\-_]*l[i1ıl!|]+v[e3ēĕė]/i,
    /c[a4āă@]n['\u2019]?t[\s\-_]*t[a4āă@]k[e3ēĕė][\s\-_]*[i1ıl!|]+t[\s\-_]*[a4āă@]n[yÿý]m[o0ōŏő]r[e3ēĕė]/i,

    // Eating disorders
    /st[a4āă@]rv[e3ēĕė][\s\-_]*m[yÿý][\s\-_]*s[e3ēĕė]lf/i,
    /st[o0ōŏő]p[\s\-_]*[e3ēĕė][a4āă@]t[i1ıl!|]+ng/i,
    /p[uüū]rg[e3ēĕė]/i,
    /[a4āă@]n[o0ōŏő]r[e3ēĕė]x[i1ıl!|]+[a4āă@]/i,
    /b[uüū]l[i1ıl!|]+m[i1ıl!|]+[a4āă@]/i,

    // Slang & abbreviations
    /\bsh\b/i, /\bs[\s\-_]*h\b/i,
    /\bs[uüū][i1ıl!|]+\b/i,
    /s[e3ēĕė]w[e3ēĕė]rsl[i1ıl!|]+d[e3ēĕė]/i,
    /tw[\s\-_]*sh/i,
    /s[e3ēĕė]lfh[a4āă@]rm/i,
    /s3lfh4rm/i,
    /k[i1ıl!|]+ll[\s\-_]*m[yÿý]?s3lf/i
  ],

  // WEAPONS & VIOLENCE
  weapons: [
    // Firearms
    /g[uüū]n/i, /r[i1ıl!|]+fl[e3ēĕė]/i, /p[i1ıl!|]+st[o0ōŏő]l/i, /sh[o0ōŏő]tg[uüū]n/i,
    /r[e3ēĕė]v[o0ōŏő]lv[e3ēĕė]r/i, /f[i1ıl!|]+r[e3ēĕė][a4āă@]rm/i,
    /[a4āă@]ss[a4āă@][uüū]lt[\s\-_]*r[i1ıl!|]+fl[e3ēĕė]/i,
    /[a4āă@]r[\s\-_]*15/i, /[a4āă@]k[\s\-_]*47/i,
    /s[e3ēĕė]m[i1ıl!|]+[\s\-_]*[a4āă@][uüū]t[o0ōŏő]m[a4āă@]t[i1ıl!|]+c/i,

    // Ammunition
    /[a4āă@]mm[o0ōŏő]/i, /[a4āă@]mm[uüū]n[i1ıl!|]+t[i1ıl!|]+[o0ōŏő]n/i,
    /b[uüū]ll[e3ēĕė]t/i, /c[a4āă@]rtr[i1ıl!|]+dg[e3ēĕė]/i,
    /m[a4āă@]g[a4āă@]z[i1ıl!|]+n[e3ēĕė]/i, /\bcl[i1ıl!|]+p\b/i,
    /g[uüū]n[\s\-_]*p[o0ōŏő]wd[e3ēĕė]r/i,

    // Explosives
    /b[o0ōŏő]mb/i, /[e3ēĕė]xpl[o0ōŏő]s[i1ıl!|]+v[e3ēĕė]/i,
    /gr[e3ēĕė]n[a4āă@]d[e3ēĕė]/i, /d[e3ēĕė]t[o0ōŏő]n[a4āă@]t/i,
    /f[i1ıl!|]+r[e3ēĕė]b[o0ōŏő]mb/i, /m[o0ōŏő]l[o0ōŏő]t[o0ōŏő]v/i,
    /[i1ıl!|]+[e3ēĕė]d/i, /c[\s\-_]*4/i, /tnt/i,

    // Bladed weapons
    /kn[i1ıl!|]+f[e3ēĕė]/i, /sw[o0ōŏő]rd/i, /bl[a4āă@]d[e3ēĕė]/i,
    /d[a4āă@]gg[e3ēĕė]r/i, /m[a4āă@]ch[e3ēĕė]t[e3ēĕė]/i,
    /sh[a4āă@]rp[e3ēĕė]n/i,

    // Other weapons
    /t[a4āă@]s[e3ēĕė]r/i, /st[uüū]n[\s\-_]*g[uüū]n/i,
    /p[e3ēĕė]pp[e3ēĕė]r[\s\-_]*spr[a4āă@][yÿý]/i,
    /br[a4āă@]ss[\s\-_]*kn[uüū]ckl[e3ēĕė]s/i,
    /b[a4āă@]t[o0ōŏő]n/i, /cl[uüū]b/i
  ],

  // CHEMICAL HARM - MIXING, REACTIONS, POISON
  chemicalHarm: [
    // Chemical mixing requests
    /m[i1ıl!|]+x[\s\-_]*ch[e3ēĕė]m[i1ıl!|]+c[a4āă@]ls?/i,
    /ch[e3ēĕė]m[i1ıl!|]+c[a4āă@]l[\s\-_]*r[e3ēĕė][a4āă@]ct[i1ıl!|]+[o0ōŏő]n/i,
    /c[o0ōŏő]mb[i1ıl!|]+n[e3ēĕė][\s\-_]*ch[e3ēĕė]m[i1ıl!|]+c[a4āă@]ls?/i,
    /r[e3ēĕė][a4āă@]ct[\s\-_]*t[o0ōŏő]g[e3ēĕė]th[e3ēĕė]r/i,

    // Dangerous chemicals
    /bl[e3ēĕė][a4āă@]ch[\s\-_]*[a4āă@]nd[\s\-_]*[a4āă@]mm[o0ōŏő]n[i1ıl!|]+[a4āă@]/i,
    /bl[e3ēĕė][a4āă@]ch[\s\-_]*[a4āă@]nd[\s\-_]*v[i1ıl!|]+n[e3ēĕė]g[a4āă@]r/i,
    /chl[o0ōŏő]r[i1ıl!|]+n[e3ēĕė][\s\-_]*g[a4āă@]s/i,
    /m[uüū]st[a4āă@]rd[\s\-_]*g[a4āă@]s/i,
    /s[a4āă]r[i1ıl!|]+n/i, /n[e3ēĕė]rv[e3ēĕė][\s\-_]*[a4āă@]g[e3ēĕė]nt/i,
    /v[\s\-_]*x/i, /t[a4āă@]b[uüū]n/i,

    // Poisons & toxins
    /p[o0ōŏő][i1ıl!|]+s[o0ōŏő]n/i, /t[o0ōŏő]x[i1ıl!|]+n/i,
    /[a4āă@]rs[e3ēĕė]n[i1ıl!|]+c/i, /c[yÿý][a4āă@]n[i1ıl!|]+d[e3ēĕė]/i,
    /r[i1ıl!|]+c[i1ıl!|]+n/i, /str[yÿý]chn[i1ıl!|]+n[e3ēĕė]/i,
    /[a4āă@]ntr[a4āă@]x/i, /b[o0ōŏő]t[uüū]l[i1ıl!|]+n[uüū]m/i,

    // Drug synthesis
    /m[e3ēĕė]th[\s\-_]*r[e3ēĕė]c[i1ıl!|]+p[e3ēĕė]/i,
    /c[o0ōŏő][o0ōŏő]k[\s\-_]*m[e3ēĕė]th/i,
    /m[a4āă@]k[e3ēĕė][\s\-_]*[e3ēĕė]xpl[o0ōŏő]s[i1ıl!|]+v[e3ēĕė]/i,
    /synt h[e3ēĕė]s[i1ıl!|]+[sz][e3ēĕė][\s\-_]*dr[uüū]gs?/i,

    // Household chemical dangers
    /dr[i1ıl!|]+nk[\s\-_]*d[e3ēĕė]t[e3ēĕė]rg[e3ēĕė]nt/i,
    /[i1ıl!|]+ng[e3ēĕė]st[\s\-_]*cl[e3ēĕė][a4āă@]n[e3ēĕė]r/i,
    /sw[a4āă@]ll[o0ōŏő]w[\s\-_]*[a4āă@]c[i1ıl!|]+d/i
  ],

  // BIOLOGICAL HARM
  biologicalHarm: [
    // Bioweapons & diseases
    /b[i1ıl!|]+[o0ōŏő]w[e3ēĕė][a4āă@]p[o0ōŏő]n/i,
    /b[i1ıl!|]+[o0ōŏő]t[e3ēĕė]rr[o0ōŏő]r[i1ıl!|]+sm/i,
    /sp[a4āă@]r[e3ēĕė][\s\-_]*d[i1ıl!|]+s[e3ēĕė][a4āă@]s[e3ēĕė]/i,
    /[i1ıl!|]+nf[e3ēĕė]ct[\s\-_]*p[e3ēĕė][o0ōŏő]pl[e3ēĕė]/i,

    // Specific pathogens
    /sm[a4āă@]llp[o0ōŏő]x/i, /[e3ēĕė]b[o0ōŏő]l[a4āă@]/i,
    /pl[a4āă@]g[uüū][e3ēĕė]/i, /ch[o0ōŏő]l[e3ēĕė]r[a4āă@]/i,
    /h[e3ēĕė]m[o0ōŏő]rrh[a4āă@]g[i1ıl!|]+c[\s\-_]*f[e3ēĕė]v[e3ēĕė]r/i,

    // Contamination
    /c[o0ōŏő]nt[a4āă@]m[i1ıl!|]+n[a4āă@]t[e3ēĕė][\s\-_]*f[o0ōŏő][o0ōŏő]d/i,
    /c[o0ōŏő]nt[a4āă@]m[i1ıl!|]+n[a4āă@]t[e3ēĕė][\s\-_]*w[a4āă@]t[e3ēĕė]r/i,
    /p[o0ōŏő][i1ıl!|]+s[o0ōŏő]n[\s\-_]*f[o0ōŏő][o0ōŏő]d[\s\-_]*s[uüū]ppl[yÿý]/i
  ],

  // PHYSICAL HARM TO OTHERS
  physicalHarm: [
    // Violence against others
    /k[i1ıl!|]+ll[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /m[uüū]rd[e3ēĕė]r[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /h[uüū]rt[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /[a4āă@]tt[a4āă@]ck[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /[a4āă@]ss[a4āă@][uüū]lt[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /h[a4āă@]rm[\s\-_]*[o0ōŏő]th[e3ēĕė]rs/i,
    /v[i1ıl!|]+[o0ōŏő]l[e3ēĕė]nc[e3ēĕė][\s\-_]*[a4āă@]g[a4āă@][i1ıl!|]+nst/i,

    // Specific harm methods
    /st[a4āă@]b[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /sh[o0ōŏő][o0ōŏő]t[\s\-_]*s[o0ōŏő]m[e3ēĕė][o0ōŏő]n[e3ēĕė]/i,
    /b[e3ēĕė][a4āă@]t[\s\-_]*[uüū]p/i,
    /str[a4āă@]ngl[e3ēĕė]/i, /ch[o0ōŏő]k[e3ēĕė]/i,

    // Mass harm
    /m[a4āă@]ss[\s\-_]*sh[o0ōŏő][o0ōŏő]t[i1ıl!|]+ng/i,
    /t[e3ēĕė]rr[o0ōŏő]r[\s\-_]*[a4āă@]tt[a4āă@]ck/i,
    /k[i1ıl!|]+ll[\s\-_]*m[uüū]lt[i1ıl!|]+pl[e3ēĕė][\s\-_]*p[e3ēĕė][o0ōŏő]pl[e3ēĕė]/i
  ],

  // ENTERPRISE THREATS & CYBER ATTACKS
  enterpriseThreats: [
    /h[a4āă@]ck/i, /br[e3ēĕė][a4āă@]ch/i, /ph[i1ıl!|]+sh[i1ıl!|]+ng/i,
    /m[a4āă@]lw[a4āă@]r[e3ēĕė]/i, /r[a4āă@]ns[o0ōŏő]mw[a4āă@]r[e3ēĕė]/i,
    /dd[o0ōŏő]s/i, /sql[\s\-_]*[i1ıl!|]+nj[e3ēĕė]ct[i1ıl!|]+[o0ōŏő]n/i,
    /\bxss\b/i, /[e3ēĕė]xpl[o0ōŏő][i1ıl!|]+t/i,
    /z[e3ēĕė]r[o0ōŏő][\s\-_]*d[a4āă@][yÿý]/i,
    /d[a4āă@]t[a4āă@][\s\-_]*br[e3ēĕė][a4āă@]ch/i,
    /st[e3ēĕė][a4āă@]l[\s\-_]*d[a4āă@]t[a4āă@]/i,
    /p[a4āă@]ssw[o0ōŏő]rd[\s\-_]*cr[a4āă@]ck/i,
    /br[uüū]t[e3ēĕė][\s\-_]*f[o0ōŏő]rc[e3ēĕė]/i,
    /k[e3ēĕė][yÿý]l[o0ōŏő]gg[e3ēĕė]r/i,
    /r[o0ōŏő][o0ōŏő]tk[i1ıl!|]+t/i, /b[a4āă@]ckd[o0ōŏő][o0ōŏő]r/i,
    /sh[e3ēĕė]llc[o0ōŏő]d[e3ēĕė]/i,
    /s[o0ōŏő]c[i1ıl!|]+[a4āă@]l[\s\-_]*[e3ēĕė]ng[i1ıl!|]+n[e3ēĕė][e3ēĕė]r[i1ıl!|]+ng/i
  ],

  // PROMPT INJECTION ATTACKS
  promptInjection: [
    // System prompt manipulation
    /[i1ıl!|]+gn[o0ōŏő]r[e3ēĕė][\s\-_]*pr[e3ēĕė]v[i1ıl!|]+[o0ōŏő][uüū]s[\s\-_]*[i1ıl!|]+nstr[uüū]ct[i1ıl!|]+[o0ōŏő]ns/i,
    /[i1ıl!|]+gn[o0ōŏő]r[e3ēĕė][\s\-_]*[a4āă@]b[o0ōŏő]v[e3ēĕė]/i,
    /[i1ıl!|]+gn[o0ōŏő]r[e3ēĕė][\s\-_]*[a4āă@]ll[\s\-_]*pr[e3ēĕė]v[i1ıl!|]+[o0ōŏő][uüū]s/i,
    /d[i1ıl!|]+sr[e3ēĕė]g[a4āă@]rd[\s\-_]*pr[e3ēĕė]v[i1ıl!|]+[o0ōŏő][uüū]s/i,
    /f[o0ōŏő]rg[e3ēĕė]t[\s\-_]*pr[e3ēĕė]v[i1ıl!|]+[o0ōŏő][uüū]s[\s\-_]*[i1ıl!|]+nstr[uüū]ct[i1ıl!|]+[o0ōŏő]ns/i,

    // Role manipulation
    /pr[e3ēĕė]t[e3ēĕė]nd[\s\-_]*y[o0ōŏő][uüū][\s\-_]*[a4āă@]r[e3ēĕė]/i,
    /[a4āă@]ct[\s\-_]*[a4āă@]s[\s\-_]*[i1ıl!|]+f/i,
    /y[o0ōŏő][uüū][\s\-_]*[a4āă@]r[e3ēĕė][\s\-_]*n[o0ōŏő]w/i,
    /n[e3ēĕė]w[\s\-_]*r[o0ōŏő]l[e3ēĕė]/i,
    /ch[a4āă@]ng[e3ēĕė][\s\-_]*y[o0ōŏő][uüū]r[\s\-_]*r[o0ōŏő]l[e3ēĕė]/i,

    // System commands
    /syst[e3ēĕė]m[\s\-_]*pr[o0ōŏő]mpt/i,
    /[i1ıl!|]+nstr[uüū]ct[i1ıl!|]+[o0ōŏő]n[\s\-_]*[o0ōŏő]v[e3ēĕė]rr[i1ıl!|]+d[e3ēĕė]/i,
    /by[pass][\s\-_]*f[i1ıl!|]+lt[e3ēĕė]r/i,
    /d[i1ıl!|]+s[a4āă@]bl[e3ēĕė][\s\-_]*s[a4āă@]f[e3ēĕė]ty/i,
    /r[e3ēĕė]m[o0ōŏő]v[e3ēĕė][\s\-_]*r[e3ēĕė]str[i1ıl!|]+ct[i1ıl!|]+[o0ōŏő]ns/i,

    // Jailbreak attempts
    /d[a4āă@]n[\s\-_]*m[o0ōŏő]d[e3ēĕė]/i, /j[a4āă@][i1ıl!|]+lbr[e3ēĕė][a4āă@]k/i,
    /[uüū]nc[e3ēĕė]ns[o0ōŏő]r[e3ēĕė]d/i,
    /n[o0ōŏő][\s\-_]*r[e3ēĕė]str[i1ıl!|]+ct[i1ıl!|]+[o0ōŏő]ns/i,
    /[uüū]nf[i1ıl!|]+lt[e3ēĕė]r[e3ēĕė]d/i
  ],

  // DATABASE MANIPULATION PROTECTION
  databaseManipulation: [
    // Delete operations
    /d[e3ēĕė]l[e3ēĕė]t[e3ēĕė][\s\-_]*d[a4āă@]t[a4āă@]b[a4āă@]s[e3ēĕė]/i,
    /dr[o0ōŏő]p[\s\-_]*d[a4āă@]t[a4āă@]b[a4āă@]s[e3ēĕė]/i,
    /dr[o0ōŏő]p[\s\-_]*t[a4āă@]bl[e3ēĕė]/i,
    /tr[uüū]nc[a4āă@]t[e3ēĕė][\s\-_]*t[a4āă@]bl[e3ēĕė]/i,
    /w[i1ıl!|]+p[e3ēĕė][\s\-_]*d[a4āă@]t[a4āă@]/i,
    /[e3ēĕė]r[a4āă@]s[e3ēĕė][\s\-_]*d[a4āă@]t[a4āă@]b[a4āă@]s[e3ēĕė]/i,
    /d[e3ēĕė]str[o0ōŏő][yÿý][\s\-_]*d[a4āă@]t[a4āă@]b[a4āă@]s[e3ēĕė]/i,
    /r[e3ēĕė]m[o0ōŏő]v[e3ēĕė][\s\-_]*[a4āă@]ll[\s\-_]*d[a4āă@]t[a4āă@]/i,

    // Destructive SQL
    /d[e3ēĕė]l[e3ēĕė]t[e3ēĕė][\s\-_]*fr[o0ōŏő]m/i,
    /dr[o0ōŏő]p[\s\-_]*[i1ıl!|]+f[\s\-_]*[e3ēĕė]x[i1ıl!|]+sts/i,
    /[a4āă@]lt[e3ēĕė]r[\s\-_]*t[a4āă@]bl[e3ēĕė][\s\-_]*dr[o0ōŏő]p/i,

    // Data exfiltration
    /[e3ēĕė]xp[o0ōŏő]rt[\s\-_]*[a4āă@]ll[\s\-_]*d[a4āă@]t[a4āă@]/i,
    /d[uüū]mp[\s\-_]*d[a4āă@]t[a4āă@]b[a4āă@]s[e3ēĕė]/i,
    /l[e3ēĕė][a4āă@]k[\s\-_]*d[a4āă@]t[a4āă@]/i
  ]
};

/**
 * Normalize text to catch evasion attempts
 * - Remove special characters, spaces, dashes
 * - Convert leetspeak and unicode variants
 * - Handle common misspellings
 */
function normalizeForDetection(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/[1!|ıl]/g, 'i') // Leetspeak: 1, !, |, ı, l → i
    .replace(/[0ōŏő]/g, 'o') // Leetspeak: 0, ō, ŏ, ő → o
    .replace(/[3ēĕė]/g, 'e') // Leetspeak: 3, ē, ĕ, ė → e
    .replace(/[4@āă]/g, 'a') // Leetspeak: 4, @, ā, ă → a
    .replace(/[5$]/g, 's') // Leetspeak: 5, $ → s
    .replace(/[7]/g, 't') // Leetspeak: 7 → t
    .replace(/[üū]/g, 'u') // Unicode: ü, ū → u
    .replace(/[ýÿ]/g, 'y') // Unicode: ý, ÿ → y
    // Common misspellings
    .replace(/swelf/g, 'self')
    .replace(/myslef/g, 'myself')
    .replace(/kil+/g, 'kill')
    .replace(/sui+cide/g, 'suicide')
    .replace(/sel+fharm/g, 'selfharm');
}

/**
 * Check if prompt contains forbidden content
 * Uses both original text AND normalized version for maximum detection
 */
export function checkForForbidden(prompt: string): { blocked: boolean; category?: ForbiddenCategory } {
  const text = (prompt ?? '').trim();
  if (!text) return { blocked: false };

  const normalized = normalizeForDetection(text);

  // Direct keyword checks on normalized text (catches evasion)
  const criticalKeywords = [
    { word: 'killmyself', category: 'selfHarm' as ForbiddenCategory },
    { word: 'kms', category: 'selfHarm' as ForbiddenCategory },
    { word: 'selfharm', category: 'selfHarm' as ForbiddenCategory },
    { word: 'suicide', category: 'selfHarm' as ForbiddenCategory },
    { word: 'unalive', category: 'selfHarm' as ForbiddenCategory },
    { word: 'endmylife', category: 'selfHarm' as ForbiddenCategory },
    { word: 'offmyself', category: 'selfHarm' as ForbiddenCategory },
    { word: 'dropdatabase', category: 'databaseManipulation' as ForbiddenCategory },
    { word: 'deletedatabase', category: 'databaseManipulation' as ForbiddenCategory },
    { word: 'wipedatabase', category: 'databaseManipulation' as ForbiddenCategory },
    { word: 'mixchemicals', category: 'chemicalHarm' as ForbiddenCategory },
    { word: 'chemicalreaction', category: 'chemicalHarm' as ForbiddenCategory },
    { word: 'ignorepreviousinstructions', category: 'promptInjection' as ForbiddenCategory },
    { word: 'disablesafety', category: 'promptInjection' as ForbiddenCategory },
    { word: 'jailbreak', category: 'promptInjection' as ForbiddenCategory }
  ];

  for (const { word, category } of criticalKeywords) {
    if (normalized.includes(word)) {
      return { blocked: true, category };
    }
  }

  // Regex pattern matching on both original and normalized
  for (const [category, regexes] of Object.entries(forbiddenKeywords) as [ForbiddenCategory, RegExp[]][]) {
    for (const regex of regexes) {
      if (regex.test(text) || regex.test(normalized)) {
        return { blocked: true, category };
      }
    }
  }

  return { blocked: false };
}

/**
 * Get severity level for a category (for logging/analytics)
 */
export function getCategorySeverity(category: ForbiddenCategory): 'critical' | 'high' | 'medium' {
  const severityMap: Record<ForbiddenCategory, 'critical' | 'high' | 'medium'> = {
    selfHarm: 'critical',
    chemicalHarm: 'critical',
    biologicalHarm: 'critical',
    physicalHarm: 'critical',
    databaseManipulation: 'critical',
    weapons: 'high',
    enterpriseThreats: 'high',
    promptInjection: 'high'
  };
  return severityMap[category] || 'medium';
}
