/* ============================================================
   content.js — ALL text of the presentation lives here.
   Edit this file only (see AGENTS.md). No content in scene code.
   Kept deliberately SHORT — the presenter speaks the detail.
   ============================================================ */
window.JOURNEY_CONTENT = {

  meta: {
    presenterName: "Muhammed Safvan T P",
    fellowship:    "Gandhi Fellowship · GF-19",
    project:       "MNCH — GAVB",
    postedTo:      "Ramgarh Block, Dumka, Jharkhand",
    presenterFrom: "Kerala",
    deckTitle:     "Health System Immersion",
    beginLabel:    "Begin the Journey"
  },

  agenda: [
    "Objectives", "Area Profile", "Actions & Stakeholders",
    "Gaps & Actions", "Challenges & Changes", "Annexure"
  ],

  objectives: [
    { title: "Understand the health system",  detail: "structure & coordination, village to block" },
    { title: "Observe MNCH services",         detail: "VHSND, PMSMA, RI, ANC/PNC, meetings" },
    { title: "Map stakeholder roles",         detail: "Sahiya, ANM, AWW, CHO, BPM, MOIC…" },
    { title: "Identify last-mile gaps",       detail: "supplies, equipment, staffing, access" },
    { title: "Build technical knowledge",     detail: "immunization, cold chain, HRP, referrals" },
    { title: "Attend meetings & forums",      detail: "VHSNC, JAS, cluster meetings, Gram Sabha" }
  ],

  areaProfile: {
    place: "Ramgarh Block · Dumka District",
    intro: "The block I was placed in — the Santhal Pargana hills of Jharkhand.",
    stats: [
      { value: 347, suffix: "",      label: "Villages" },
      { value: 27,  suffix: "",      label: "Panchayats" },
      { value: 1.8, suffix: " lakh", label: "Population", decimals: 1 },
      { value: 1,   suffix: "",      label: "CHC" },
      { value: 4,   suffix: "",      label: "PHCs" },
      { value: 23,  suffix: "",      label: "AAM / HSC" },
      { value: 47,  suffix: "",      label: "ANMs" },
      { value: 8,   suffix: "",      label: "CHOs" },
      { value: 236, suffix: "",      label: "AWCs" }
    ],
    highlight: {
      big: "52%",
      caption: "of the population is SC / ST",
      note: "a young, dispersed, predominantly tribal community"
    }
  },

  actions: {
    facilities: { title: "Facilities", items: [
      "<b>CHC Ramgarh</b> — labour room, lab, cold chain",
      "<b>3 AAM Centres</b> — Moharia, Lakhanpur, Khairbani",
      "<b>9 Anganwadi Centres</b>"
    ]},
    programs: { title: "Programmes", items: [
      "<b>VHSND & RI sessions</b>",
      "<b>PMSMA</b> — ANC clinic day",
      "<b>ANC / PNC</b> contacts",
      "<b>NQAS</b> observation at Mohariya"
    ]},
    forums: { title: "Forums", items: [
      "<b>Sahiya Cluster Meeting</b> — Lakenpur",
      "<b>JAS & Sector Meetings</b>",
      "<b>Aam Sabha</b> — Dhoba (JSLPS)",
      "<b>Block · ICDS · JSLPS</b>"
    ]},
    jan: { title: "Jan Andolan", items: [
      "<b>SHG initiatives</b> seen at Aam Sabha",
      "<b>NQAS welcome</b> — with villagers & Sahiyas",
      "<b>HRB counselling</b> — breastfeeding, hygiene",
      "<b>Household MNCH counselling</b>"
    ]}
  },

  stakeholders: [
    { head: "Community",        items: ["Pregnant women", "Lactating mothers", "Children & families", "Mukhiya & leaders"] },
    { head: "Frontline workers", items: ["Sahiya & Sathi", "ANM", "AWW / Sevika", "Poshan Sakhi"] },
    { head: "Facility & block",  items: ["CHO & CCH", "BPM · BDM · BTT", "MOIC", "ICDS & JSLPS"] }
  ],

  gapsIntro: "Cracks I saw on the path — and how I helped repair them.",
  gaps: [
    { observed: "Low motivation",
      action: "Counselling & advocacy with follow-up — seen across areas & stakeholders" },
    { observed: "HRP & SAM not documented",
      action: "Awareness on why documentation matters" },
    { observed: "Digital entry problems",
      action: "Troubleshooting support; reported failures" },
    { observed: "Equipment & supply gaps",
      action: "Documented & escalated during visits" },
    { observed: "Low community demand",
      action: "Household MNCH & HRB counselling" }
  ],
  wayForward: [
    "<b>Digital-entry training</b> for FLWs — with the Govt. / state team",
    "<b>Public awareness programme</b> in the highest-HRP area"
  ],

  challenges: [
    { title: "Language",       detail: "records were in Hindi — I could not read them" },
    { title: "New world",      detail: "a fully rural life, in a new state" },
    { title: "Different path", detail: "education background, health assignment" },
    { title: "Transport",      detail: "no transport to dispersed field sites" }
  ],

  changes: {
    lensLeft:  { t: "Community lens", d: "how people experience care" },
    lensRight: { t: "System lens",    d: "how the system delivers it" },
    bridge:    "I am finding the way forward — to bridge the two and lead with the right initiatives."
  },

  annexure: {
    kicker: "Annexure — from my field diary",
    notes: [
      { img: "note1", caption: "VHSND observation" },
      { img: "note2", caption: "Facility visit" },
      { img: "note3", caption: "Follow-up & data" }
    ],
    photosTitle: "Field photographs",
    gallery1: {
      title: "Meetings & community",
      hint: "Aam Sabha · Sahiya meetings · forums · block discussions",
      photos: [
        { img: "g1_1", caption: "The Aam Sabha — full village gathering" },
        { img: "g1_2", caption: "Sahiya meeting under the shelter" },
        { img: "g1_3", caption: "Forum meeting at the block" },
        { img: "g1_4", caption: "With Sevika & SHG didis" },
        { img: "g1_5", caption: "Discussion at the block office" },
        { img: "g1_6", caption: "On the dais — NQAS welcome" }
      ]
    },
    gallery2: {
      title: "Facilities & fieldwork",
      hint: "AAM centres · anganwadi sessions · ANMs · field visits",
      photos: [
        { img: "g2_1", caption: "With an ANM at the centre" },
        { img: "g2_2", caption: "Session at the Anganwadi" },
        { img: "g2_3", caption: "Facility consultation" },
        { img: "g2_4", caption: "AAM Centre — Lakenpur" },
        { img: "g2_5", caption: "Walking the field path" },
        { img: "g2_6", caption: "With the community didis" }
      ]
    },
    closing: "At last, it's not about what the fellowship directed me to do — but how I lived my precious minutes.",
    signature: "— Muhammed Safvan T P"
  }
};
