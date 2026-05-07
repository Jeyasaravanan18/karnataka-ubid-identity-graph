import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Braces,
  Building2,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  DatabaseZap,
  Eye,
  Factory,
  FileSearch,
  Filter,
  Fingerprint,
  Gauge,
  GitMerge,
  History,
  KeyRound,
  Layers3,
  Link2,
  Network,
  RotateCcw,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Split,
  TimerReset,
  Workflow,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'

type Department = 'Shop' | 'Factories' | 'Labour' | 'KSPCB'
type Decision = 'auto-linked' | 'review' | 'separate'
type ActivityStatus = 'Active' | 'Dormant' | 'Closed'
type EventKind = 'inspection' | 'renewal' | 'filing' | 'utility' | 'closure' | 'notice'

type BusinessRecord = {
  id: string
  department: Department
  legalName: string
  address: string
  pin: string
  pan?: string
  gstin?: string
  sector: string
  risk: 'Low' | 'Medium' | 'High'
  lastUpdated: string
}

type MatchEvidence = {
  label: string
  score: number
  detail: string
}

type Cluster = {
  ubid: string
  title: string
  anchor: string
  confidence: number
  decision: Decision
  status: ActivityStatus
  statusConfidence: number
  records: string[]
  explanation: MatchEvidence[]
  reviewerNote?: string
}

type ActivityEvent = {
  id: string
  source: Department | 'BESCOM' | 'BWSSB' | 'Fire'
  kind: EventKind
  recordId?: string
  ubid?: string
  businessHint: string
  date: string
  signal: 'strong-active' | 'weak-active' | 'dormant' | 'closed' | 'risk'
  summary: string
  joinedConfidence: number
}

type ReviewItem = {
  id: string
  left: string
  right: string
  score: number
  reason: string
  factors: MatchEvidence[]
}

type AuditItem = {
  id: string
  actor: 'Resolver' | 'Reviewer' | 'Activity Engine' | 'Connector'
  action: string
  target: string
  time: string
  reversible: boolean
  detail: string
}

type Connector = {
  name: string
  mode: string
  records: number
  freshness: string
  piiControl: string
  status: 'Healthy' | 'Warning'
}

const records: BusinessRecord[] = [
  {
    id: 'SHOP-560058-091',
    department: 'Shop',
    legalName: 'Shakti Precision Components LLP',
    address: 'Plot 44, 4th Phase, Peenya Industrial Area, Bengaluru',
    pin: '560058',
    pan: 'AASFS2421J',
    gstin: '29AASFS2421J1ZB',
    sector: 'Auto components',
    risk: 'Medium',
    lastUpdated: '2026-03-14',
  },
  {
    id: 'FAC-KA-29188',
    department: 'Factories',
    legalName: 'Shakthi Precision Components',
    address: 'No. 44, Peenya Industrial Area Phase IV, Bangalore North',
    pin: '560058',
    pan: 'AASFS2421J',
    sector: 'Auto components',
    risk: 'High',
    lastUpdated: '2026-02-01',
  },
  {
    id: 'LAB-78221',
    department: 'Labour',
    legalName: 'Shakti Precision Component LLP',
    address: '44, Peenya Industrial Area, 4th Phase, Bengaluru',
    pin: '560058',
    sector: 'Auto components',
    risk: 'Medium',
    lastUpdated: '2026-04-02',
  },
  {
    id: 'PCB-11012',
    department: 'KSPCB',
    legalName: 'Shakthi Precision Components LLP',
    address: 'Plot No 44, Peenya Industrial Area, Bengaluru Urban',
    pin: '560058',
    gstin: '29AASFS2421J1ZB',
    sector: 'Engineering',
    risk: 'High',
    lastUpdated: '2026-01-19',
  },
  {
    id: 'SHOP-560058-144',
    department: 'Shop',
    legalName: 'Nandi Pack Works',
    address: 'Unit 8, 3rd Cross, Peenya Industrial Estate',
    pin: '560058',
    pan: 'ABCFN1172R',
    sector: 'Packaging',
    risk: 'Low',
    lastUpdated: '2025-09-22',
  },
  {
    id: 'LAB-79310',
    department: 'Labour',
    legalName: 'Nandi Packaging Works',
    address: '8, 3 Cross, Peenya Industrial Estate, Bengaluru',
    pin: '560058',
    pan: 'ABCFN1172R',
    sector: 'Packaging',
    risk: 'Low',
    lastUpdated: '2026-01-11',
  },
  {
    id: 'PCB-11880',
    department: 'KSPCB',
    legalName: 'Nandi Packworks',
    address: 'Unit 8, Peenya Industrial Estate',
    pin: '560058',
    sector: 'Packaging',
    risk: 'Medium',
    lastUpdated: '2025-05-03',
  },
  {
    id: 'FAC-KA-31109',
    department: 'Factories',
    legalName: 'Surya Textile Processors Pvt Ltd',
    address: 'Survey 16/2, Industrial Layout, Yelahanka',
    pin: '560064',
    pan: 'AAGCS8821K',
    sector: 'Textiles',
    risk: 'High',
    lastUpdated: '2024-11-17',
  },
  {
    id: 'SHOP-560064-028',
    department: 'Shop',
    legalName: 'Surya Tex Prints',
    address: '16/2, Yelahanka Industrial Area, Bengaluru',
    pin: '560064',
    sector: 'Textiles',
    risk: 'Medium',
    lastUpdated: '2026-02-21',
  },
  {
    id: 'LAB-76420',
    department: 'Labour',
    legalName: 'Surya Textile Processors Private Limited',
    address: 'Sy 16/2, Yelahanka Industrial Layout',
    pin: '560064',
    pan: 'AAGCS8821K',
    sector: 'Textiles',
    risk: 'High',
    lastUpdated: '2025-12-13',
  },
  {
    id: 'PCB-10221',
    department: 'KSPCB',
    legalName: 'GreenLeaf Foods',
    address: 'No 12, KIADB Food Park, Yelahanka',
    pin: '560064',
    gstin: '29AAHFG4117P1Z8',
    sector: 'Food processing',
    risk: 'Medium',
    lastUpdated: '2026-04-20',
  },
  {
    id: 'SHOP-560064-082',
    department: 'Shop',
    legalName: 'Green Leaf Food Products',
    address: '12 KIADB Food Park, Yelahanka Hobli, Bengaluru',
    pin: '560064',
    gstin: '29AAHFG4117P1Z8',
    sector: 'Food processing',
    risk: 'Medium',
    lastUpdated: '2026-04-21',
  },
  {
    id: 'FAC-KA-30401',
    department: 'Factories',
    legalName: 'Bharat Metal Finishers',
    address: 'Shed 19B, Peenya 2nd Stage',
    pin: '560058',
    pan: 'AACFB9981L',
    sector: 'Metal treatment',
    risk: 'High',
    lastUpdated: '2023-10-08',
  },
  {
    id: 'PCB-10774',
    department: 'KSPCB',
    legalName: 'Bharath Metal Finishing',
    address: '19 B, Peenya Second Stage, Bengaluru',
    pin: '560058',
    pan: 'AACFB9981L',
    sector: 'Metal treatment',
    risk: 'High',
    lastUpdated: '2024-01-12',
  },
]

const clusters: Cluster[] = [
  {
    ubid: 'UBID-KA-560058-0001',
    title: 'Shakti Precision Components LLP',
    anchor: 'PAN AASFS2421J + GSTIN 29AASFS2421J1ZB',
    confidence: 0.97,
    decision: 'auto-linked',
    status: 'Active',
    statusConfidence: 0.93,
    records: ['SHOP-560058-091', 'FAC-KA-29188', 'LAB-78221', 'PCB-11012'],
    explanation: [
      { label: 'Central identifier', score: 1, detail: 'PAN or GSTIN agrees across three source systems.' },
      { label: 'Name similarity', score: 0.94, detail: 'Shakti/Shakthi spelling variant normalized.' },
      { label: 'Address locality', score: 0.91, detail: 'Peenya Phase IV and plot 44 align after address token cleanup.' },
      { label: 'PIN code', score: 1, detail: 'All records are in 560058.' },
    ],
  },
  {
    ubid: 'UBID-KA-560058-0002',
    title: 'Nandi Pack Works',
    anchor: 'PAN ABCFN1172R',
    confidence: 0.83,
    decision: 'review',
    status: 'Active',
    statusConfidence: 0.84,
    records: ['SHOP-560058-144', 'LAB-79310', 'PCB-11880'],
    reviewerNote: 'KSPCB edge is held for reviewer confirmation because the row has no PAN/GSTIN anchor.',
    explanation: [
      { label: 'Central identifier', score: 1, detail: 'PAN is shared by Shop and Labour records.' },
      { label: 'Name similarity', score: 0.86, detail: 'Packaging/Pack Works token overlap is high.' },
      { label: 'Address locality', score: 0.82, detail: 'Unit 8 and Peenya Industrial Estate align.' },
      { label: 'Missing anchor handling', score: 0.72, detail: 'KSPCB row has no PAN/GSTIN, so it is retained with lower evidence weight.' },
    ],
  },
  {
    ubid: 'UBID-KA-560064-0003',
    title: 'Surya Textile Processors Pvt Ltd',
    anchor: 'PAN AAGCS8821K',
    confidence: 0.92,
    decision: 'auto-linked',
    status: 'Dormant',
    statusConfidence: 0.76,
    records: ['FAC-KA-31109', 'LAB-76420'],
    reviewerNote: 'SHOP-560064-028 remains in review until ownership is confirmed.',
    explanation: [
      { label: 'Central identifier', score: 1, detail: 'Factories and Labour records share PAN.' },
      { label: 'Legal suffix', score: 0.95, detail: 'Pvt Ltd and Private Limited canonicalized.' },
      { label: 'Address locality', score: 0.85, detail: 'Survey 16/2 and Yelahanka Industrial Layout align.' },
    ],
  },
  {
    ubid: 'UBID-KA-560064-0004',
    title: 'Green Leaf Food Products',
    anchor: 'GSTIN 29AAHFG4117P1Z8',
    confidence: 0.95,
    decision: 'auto-linked',
    status: 'Active',
    statusConfidence: 0.9,
    records: ['PCB-10221', 'SHOP-560064-082'],
    explanation: [
      { label: 'Central identifier', score: 1, detail: 'GSTIN agrees exactly.' },
      { label: 'Name similarity', score: 0.9, detail: 'GreenLeaf and Green Leaf Food Products canonicalize to the same tokens.' },
      { label: 'Address locality', score: 0.88, detail: 'KIADB Food Park, Yelahanka is consistent.' },
    ],
  },
  {
    ubid: 'UBID-KA-560058-0005',
    title: 'Bharat Metal Finishers',
    anchor: 'PAN AACFB9981L',
    confidence: 0.93,
    decision: 'auto-linked',
    status: 'Closed',
    statusConfidence: 0.88,
    records: ['FAC-KA-30401', 'PCB-10774'],
    explanation: [
      { label: 'Central identifier', score: 1, detail: 'PAN agrees exactly.' },
      { label: 'Name similarity', score: 0.89, detail: 'Bharat/Bharath and Finishers/Finishing normalized.' },
      { label: 'Address locality', score: 0.86, detail: 'Shed 19B and 19 B, Peenya Second Stage align.' },
    ],
  },
]

const reviewItems: ReviewItem[] = [
  {
    id: 'REV-001',
    left: 'FAC-KA-31109',
    right: 'SHOP-560064-028',
    score: 0.78,
    reason: 'Name and address are similar, but PAN is missing on one side and business style differs.',
    factors: [
      { label: 'Name similarity', score: 0.74, detail: 'Surya Textile Processors vs Surya Tex Prints share weak textile tokens.' },
      { label: 'Address locality', score: 0.81, detail: 'Both point to 16/2 in Yelahanka Industrial Area.' },
      { label: 'Identifier anchor', score: 0.25, detail: 'No PAN or GSTIN on Shop record, so automatic merge is blocked.' },
    ],
  },
  {
    id: 'REV-002',
    left: 'PCB-11880',
    right: 'SHOP-560058-144',
    score: 0.83,
    reason: 'Likely same entity, but KSPCB has no central identifier and a different pollution category.',
    factors: [
      { label: 'Name similarity', score: 0.88, detail: 'Nandi Packworks and Nandi Pack Works are almost identical.' },
      { label: 'Address locality', score: 0.79, detail: 'Unit 8 Peenya Industrial Estate aligns.' },
      { label: 'Regulatory context', score: 0.66, detail: 'KSPCB category differs from Shop sector, so reviewer can confirm.' },
    ],
  },
]

const events: ActivityEvent[] = [
  {
    id: 'EVT-92001',
    source: 'Factories',
    kind: 'inspection',
    recordId: 'FAC-KA-29188',
    ubid: 'UBID-KA-560058-0001',
    businessHint: 'Shakti Precision Components',
    date: '2024-09-18',
    signal: 'weak-active',
    summary: 'Factory inspection completed more than 18 months ago; now overdue for follow-up.',
    joinedConfidence: 0.98,
  },
  {
    id: 'EVT-92002',
    source: 'BESCOM',
    kind: 'utility',
    ubid: 'UBID-KA-560058-0001',
    businessHint: 'Shakthi Precision Components, Peenya',
    date: '2026-04-01',
    signal: 'strong-active',
    summary: 'Industrial power consumption stable above 19,000 kWh in last billing cycle.',
    joinedConfidence: 0.91,
  },
  {
    id: 'EVT-92003',
    source: 'Labour',
    kind: 'filing',
    recordId: 'LAB-79310',
    ubid: 'UBID-KA-560058-0002',
    businessHint: 'Nandi Packaging Works',
    date: '2026-01-28',
    signal: 'strong-active',
    summary: 'Employee return filed for 48 workers.',
    joinedConfidence: 0.96,
  },
  {
    id: 'EVT-92004',
    source: 'KSPCB',
    kind: 'renewal',
    recordId: 'PCB-11880',
    ubid: 'UBID-KA-560058-0002',
    businessHint: 'Nandi Packworks',
    date: '2025-08-12',
    signal: 'weak-active',
    summary: 'Consent renewal accepted; no inspection since renewal.',
    joinedConfidence: 0.84,
  },
  {
    id: 'EVT-92005',
    source: 'Factories',
    kind: 'inspection',
    recordId: 'FAC-KA-31109',
    ubid: 'UBID-KA-560064-0003',
    businessHint: 'Surya Textile Processors',
    date: '2024-09-10',
    signal: 'dormant',
    summary: 'No inspection or filing in last 18 months after this visit.',
    joinedConfidence: 0.94,
  },
  {
    id: 'EVT-92006',
    source: 'BESCOM',
    kind: 'utility',
    businessHint: 'Surya Tex Prints, 16/2 Yelahanka',
    date: '2026-03-04',
    signal: 'risk',
    summary: 'Event cannot be confidently joined: may belong to reviewed Surya record.',
    joinedConfidence: 0.58,
  },
  {
    id: 'EVT-92007',
    source: 'Fire',
    kind: 'notice',
    ubid: 'UBID-KA-560064-0004',
    businessHint: 'GreenLeaf Foods',
    date: '2026-04-24',
    signal: 'strong-active',
    summary: 'Fire NOC renewal submitted with updated floor plan.',
    joinedConfidence: 0.9,
  },
  {
    id: 'EVT-92008',
    source: 'KSPCB',
    kind: 'closure',
    recordId: 'PCB-10774',
    ubid: 'UBID-KA-560058-0005',
    businessHint: 'Bharath Metal Finishing',
    date: '2025-07-03',
    signal: 'closed',
    summary: 'Closure consent recorded; no utility consumption after August 2025.',
    joinedConfidence: 0.95,
  },
]

const auditLedger: AuditItem[] = [
  {
    id: 'AUD-20491',
    actor: 'Connector',
    action: 'Ingested scrambled master records',
    target: 'Shop, Factories, Labour, KSPCB',
    time: '2026-05-06 09:04',
    reversible: false,
    detail: 'Read-only import created immutable source snapshots without writing back to department systems.',
  },
  {
    id: 'AUD-20492',
    actor: 'Resolver',
    action: 'Auto-linked high-confidence records',
    target: 'UBID-KA-560058-0001',
    time: '2026-05-06 09:07',
    reversible: true,
    detail: 'PAN, GSTIN, address and PIN evidence crossed the auto-link threshold.',
  },
  {
    id: 'AUD-20493',
    actor: 'Resolver',
    action: 'Held ambiguous edge for review',
    target: 'PCB-11880 -> UBID-KA-560058-0002',
    time: '2026-05-06 09:08',
    reversible: true,
    detail: 'KSPCB row matched name and locality, but had no central identifier anchor.',
  },
  {
    id: 'AUD-20494',
    actor: 'Activity Engine',
    action: 'Classified business status',
    target: 'UBID-KA-560058-0005',
    time: '2026-05-06 09:10',
    reversible: true,
    detail: 'Closure consent and zero utility signal produced Closed verdict with visible evidence.',
  },
  {
    id: 'AUD-20495',
    actor: 'Reviewer',
    action: 'Training label captured',
    target: 'REV-001',
    time: 'Pending reviewer action',
    reversible: true,
    detail: 'Approval or rejection updates calibration ledger and does not overwrite source data.',
  },
]

const connectors: Connector[] = [
  {
    name: 'Shop Establishment',
    mode: 'Nightly read-only snapshot',
    records: 4,
    freshness: '12 min ago',
    piiControl: 'Scrambled PAN/GSTIN before scoring',
    status: 'Healthy',
  },
  {
    name: 'Factories',
    mode: 'Read-only registry API',
    records: 4,
    freshness: '19 min ago',
    piiControl: 'Identifier hashes retained for anchoring',
    status: 'Healthy',
  },
  {
    name: 'Labour',
    mode: 'One-way secure extract',
    records: 4,
    freshness: '24 min ago',
    piiControl: 'No hosted LLM processing',
    status: 'Healthy',
  },
  {
    name: 'KSPCB',
    mode: 'CSV drop-zone adapter',
    records: 4,
    freshness: '1 hr ago',
    piiControl: 'Missing anchors routed to review',
    status: 'Warning',
  },
]

const apiEndpoints = [
  ['GET', '/v1/lookup?pan=AASFS2421J', 'Return one UBID plus evidence dossier.'],
  ['GET', '/v1/ubids/UBID-KA-560058-0001/activity', 'Return Active/Dormant/Closed verdict and event timeline.'],
  ['POST', '/v1/reviews/REV-001/decision', 'Capture reviewer approve or reject label for calibration.'],
  ['GET', '/v1/queries/active-factories?pin=560058&inspectionGap=18m', 'Run cross-system policy intelligence query.'],
]

const recordById = new Map(records.map((record) => [record.id, record]))
const eventsByUbid = (ubid: string) => events.filter((event) => event.ubid === ubid)
const pct = (value: number) => `${Math.round(value * 100)}%`

function decisionLabel(decision: Decision) {
  if (decision === 'auto-linked') return 'Auto-linked'
  if (decision === 'review') return 'Needs review'
  return 'Kept separate'
}

function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [query, setQuery] = useState('')
  const [selectedUbid, setSelectedUbid] = useState(clusters[0].ubid)
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, 'approved' | 'rejected'>>({})
  const [thresholds, setThresholds] = useState({ auto: 88, review: 68 })
  const selectedCluster = clusters.find((cluster) => cluster.ubid === selectedUbid) ?? clusters[0]

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return clusters
    return clusters.filter((cluster) => {
      const linkedRecords = cluster.records.map((id) => recordById.get(id)).filter(Boolean) as BusinessRecord[]
      const haystack = [
        cluster.ubid,
        cluster.title,
        cluster.anchor,
        ...linkedRecords.flatMap((record) => [
          record.id,
          record.legalName,
          record.address,
          record.pin,
          record.pan ?? '',
          record.gstin ?? '',
        ]),
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(needle)
    })
  }, [query])

  const autoLinked = clusters.filter((cluster) => cluster.decision === 'auto-linked').length
  const reviewCount = reviewItems.filter((item) => !reviewDecisions[item.id]).length
  const unmatchedEvents = events.filter((event) => !event.ubid || event.joinedConfidence < 0.65)
  const sampleQuery = clusters.filter((cluster) => {
    const linkedRecords = cluster.records.map((id) => recordById.get(id)).filter(Boolean) as BusinessRecord[]
    const hasFactory = linkedRecords.some((record) => record.department === 'Factories')
    const pin560058 = linkedRecords.some((record) => record.pin === '560058')
    const recentInspection = eventsByUbid(cluster.ubid).some(
      (event) => event.kind === 'inspection' && new Date(event.date) >= new Date('2024-11-06'),
    )
    return cluster.status === 'Active' && hasFactory && pin560058 && !recentInspection
  })

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Fingerprint size={22} />
          </div>
          <div>
            <span>Karnataka</span>
            <strong>Business Identity Graph</strong>
          </div>
        </div>

        <div className="nav-cluster">
          <div className="nav-header">
            <span>Sections</span>
            <small>Switch workspace</small>
          </div>
          <nav className="nav-list">
            {[
              ['overview', BarChart3, 'Command Center'],
              ['lookup', FileSearch, 'Universal Lookup'],
              ['graph', Workflow, 'Identity Graph'],
              ['resolver', GitMerge, 'Entity Resolution'],
              ['activity', TimerReset, 'Activity Intelligence'],
              ['review', ClipboardCheck, 'Reviewer Workbench'],
              ['audit', BookOpen, 'Audit Ledger'],
              ['query', Filter, 'Policy Query Lab'],
              ['sandbox', Braces, 'Sandbox & APIs'],
            ].map(([id, Icon, label], index) => (
              <button
                className={activeTab === id ? 'nav-item active' : 'nav-item'}
                key={id as string}
                onClick={() => setActiveTab(id as string)}
                type="button"
              >
                <b className="nav-index">{String(index + 1).padStart(2, '0')}</b>
                <Icon className="nav-glyph" size={17} />
                <span>{label as string}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="trust-panel">
          <ShieldCheck size={18} />
          <div>
            <strong>No source rewrites</strong>
            <span>One-way connectors, scrambled data, reversible decisions.</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">UBID Intelligence Platform</p>
            <h1>Karnataka Business Identity Graph</h1>
            <p className="hero-subtitle">
              Unified UBID resolution, reviewer-safe identity graph and active business intelligence across
              untouched department systems.
            </p>
          </div>
          <div className="top-actions">
            <button className="ghost-button" type="button" onClick={() => setActiveTab('sandbox')}>
              <DatabaseZap size={17} />
              Sandbox run
            </button>
            <button className="primary-button" type="button" onClick={() => setActiveTab('review')}>
              <Eye size={17} />
              Review queue
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <section className="view-stack">
            <div className="metrics-grid">
              <Metric icon={Building2} label="Source records" value={records.length} detail="4 department schemas" />
              <Metric icon={Fingerprint} label="Resolved UBIDs" value={clusters.length} detail={`${autoLinked} auto-linked`} />
              <Metric icon={AlertTriangle} label="Ambiguous matches" value={reviewCount} detail="never silently merged" />
              <Metric icon={CircleDot} label="Unmatched events" value={unmatchedEvents.length} detail="surfaced for review" />
            </div>

            <div className="content-grid wide-left">
              <section className="panel command-map">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Live Operating Model</p>
                    <h2>From isolated department rows to explainable UBIDs</h2>
                  </div>
                  <BadgeCheck className="heading-icon" size={22} />
                </div>
                <div className="pipeline">
                  {[
                    ['Ingest', 'Read-only adapters pull Shop, Factories, Labour, KSPCB and event streams.'],
                    ['Normalize', 'Canonical name, address, PIN, PAN/GSTIN, sector and department metadata.'],
                    ['Resolve', 'Deterministic anchors plus calibrated fuzzy matching produce evidence scores.'],
                    ['Review', 'Ambiguous links are held for human confirmation with side-by-side evidence.'],
                    ['Classify', 'Activity signals infer Active, Dormant or Closed with a visible timeline.'],
                  ].map(([title, text], index) => (
                    <div className="pipeline-step" key={title}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{title}</strong>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Sample Query</p>
                    <h2>Active factories in 560058 with no inspection in 18 months</h2>
                  </div>
                  <Factory className="heading-icon" size={22} />
                </div>
                <div className="query-result-card">
                  <strong>{sampleQuery.length} result</strong>
                  {sampleQuery.map((cluster) => (
                    <button key={cluster.ubid} type="button" onClick={() => setSelectedUbid(cluster.ubid)}>
                      <span>{cluster.title}</span>
                      <small>{cluster.ubid}</small>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <ClusterExplorer selectedCluster={selectedCluster} setSelectedUbid={setSelectedUbid} />
          </section>
        )}

        {activeTab === 'lookup' && (
          <section className="view-stack">
            <section className="panel lookup-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Universal Lookup</p>
                  <h2>Search by department ID, PAN, GSTIN, name, address or PIN</h2>
                </div>
                <Search className="heading-icon" size={22} />
              </div>
              <div className="search-box">
                <Search size={19} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try FAC-KA-29188, AASFS2421J, Green Leaf, 560058"
                />
              </div>
              <div className="lookup-results">
                {searchResults.map((cluster) => (
                  <button
                    key={cluster.ubid}
                    type="button"
                    className={selectedUbid === cluster.ubid ? 'lookup-row selected' : 'lookup-row'}
                    onClick={() => setSelectedUbid(cluster.ubid)}
                  >
                    <div>
                      <strong>{cluster.title}</strong>
                      <span>{cluster.anchor}</span>
                    </div>
                    <StatusPill status={cluster.status} />
                    <span className="confidence">{pct(cluster.confidence)}</span>
                  </button>
                ))}
              </div>
            </section>
            <ClusterDetail cluster={selectedCluster} />
          </section>
        )}

        {activeTab === 'graph' && (
          <section className="view-stack">
            <IdentityGraph selectedCluster={selectedCluster} setSelectedUbid={setSelectedUbid} />
            <div className="content-grid">
              <DataQualityPanel />
              <ReviewerLearningPanel decisions={reviewDecisions} />
            </div>
          </section>
        )}

        {activeTab === 'resolver' && (
          <section className="view-stack">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Confidence Calibration</p>
                  <h2>Thresholds are explicit, auditable and reversible</h2>
                </div>
                <SlidersHorizontal className="heading-icon" size={22} />
              </div>
              <div className="threshold-grid">
                <label>
                  <span>Auto-link threshold</span>
                  <input
                    type="range"
                    min="75"
                    max="98"
                    value={thresholds.auto}
                    onChange={(event) => setThresholds({ ...thresholds, auto: Number(event.target.value) })}
                  />
                  <strong>{thresholds.auto}%</strong>
                </label>
                <label>
                  <span>Review threshold</span>
                  <input
                    type="range"
                    min="45"
                    max="82"
                    value={thresholds.review}
                    onChange={(event) => setThresholds({ ...thresholds, review: Number(event.target.value) })}
                  />
                  <strong>{thresholds.review}%</strong>
                </label>
              </div>
              <div className="decision-band">
                <div>
                  <Check size={18} />
                  <strong>Auto-link</strong>
                  <span>{thresholds.auto}% and above</span>
                </div>
                <div>
                  <AlertTriangle size={18} />
                  <strong>Human review</strong>
                  <span>{thresholds.review}% to {thresholds.auto - 1}%</span>
                </div>
                <div>
                  <Split size={18} />
                  <strong>Separate</strong>
                  <span>Below {thresholds.review}%</span>
                </div>
              </div>
            </section>
            <DataQualityPanel />
            <ClusterExplorer selectedCluster={selectedCluster} setSelectedUbid={setSelectedUbid} />
          </section>
        )}

        {activeTab === 'activity' && (
          <section className="view-stack">
            <div className="status-board">
              {clusters.map((cluster) => (
                <button
                  className={selectedUbid === cluster.ubid ? 'status-card selected' : 'status-card'}
                  key={cluster.ubid}
                  onClick={() => setSelectedUbid(cluster.ubid)}
                  type="button"
                >
                  <StatusPill status={cluster.status} />
                  <strong>{cluster.title}</strong>
                  <span>{cluster.ubid}</span>
                  <small>{pct(cluster.statusConfidence)} verdict confidence</small>
                </button>
              ))}
            </div>
            <ActivityTimeline cluster={selectedCluster} />
            <UnmatchedEvents />
          </section>
        )}

        {activeTab === 'review' && (
          <section className="view-stack">
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Human-in-the-loop</p>
                  <h2>Ambiguous records are queued with evidence, not merged silently</h2>
                </div>
                <ClipboardCheck className="heading-icon" size={22} />
              </div>
              <div className="review-list">
                {reviewItems.map((item) => (
                  <ReviewCard
                    item={item}
                    key={item.id}
                    decision={reviewDecisions[item.id]}
                    setDecision={(decision) => setReviewDecisions({ ...reviewDecisions, [item.id]: decision })}
                  />
                ))}
              </div>
            </section>
            <ReviewerLearningPanel decisions={reviewDecisions} />
          </section>
        )}

        {activeTab === 'audit' && (
          <section className="view-stack">
            <AuditLedger decisions={reviewDecisions} />
          </section>
        )}

        {activeTab === 'query' && (
          <section className="view-stack">
            <section className="panel query-lab">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Policy Query Lab</p>
                  <h2>Queries that were impossible across isolated systems</h2>
                </div>
                <Network className="heading-icon" size={22} />
              </div>
              <div className="sql-box">
                <code>
                  SELECT ubid, name, evidence FROM businesses WHERE status = 'Active' AND department =
                  'Factories' AND pin = '560058' AND last_inspection &lt; CURRENT_DATE - INTERVAL '18 months';
                </code>
              </div>
              <div className="query-table">
                <div className="query-row header">
                  <span>UBID</span>
                  <span>Business</span>
                  <span>Reason</span>
                  <span>Action</span>
                </div>
                {sampleQuery.map((cluster) => (
                  <div className="query-row" key={cluster.ubid}>
                    <span>{cluster.ubid}</span>
                    <strong>{cluster.title}</strong>
                    <span>Active power signal, factory row present, no inspection since Sep 2024.</span>
                    <button type="button" onClick={() => setSelectedUbid(cluster.ubid)}>
                      Evidence
                    </button>
                  </div>
                ))}
              </div>
            </section>
            <ClusterDetail cluster={selectedCluster} />
          </section>
        )}

        {activeTab === 'sandbox' && (
          <section className="view-stack">
            <SandboxApiHub />
          </section>
        )}
      </section>
    </main>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Building2
  label: string
  value: number
  detail: string
}) {
  return (
    <section className="metric-card">
      <Icon size={20} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </section>
  )
}

function StatusPill({ status }: { status: ActivityStatus }) {
  return <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
}

function DecisionPill({ decision }: { decision: Decision }) {
  return <span className={`decision-pill ${decision}`}>{decisionLabel(decision)}</span>
}

function ClusterExplorer({
  selectedCluster,
  setSelectedUbid,
}: {
  selectedCluster: Cluster
  setSelectedUbid: (ubid: string) => void
}) {
  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Resolved Businesses</p>
            <h2>UBID registry</h2>
          </div>
          <Layers3 className="heading-icon" size={22} />
        </div>
        <div className="cluster-list">
          {clusters.map((cluster) => (
            <button
              key={cluster.ubid}
              type="button"
              className={selectedCluster.ubid === cluster.ubid ? 'cluster-row selected' : 'cluster-row'}
              onClick={() => setSelectedUbid(cluster.ubid)}
            >
              <div>
                <strong>{cluster.title}</strong>
                <span>{cluster.ubid}</span>
              </div>
              <DecisionPill decision={cluster.decision} />
            </button>
          ))}
        </div>
      </section>
      <ClusterDetail cluster={selectedCluster} />
    </div>
  )
}

function ClusterDetail({ cluster }: { cluster: Cluster }) {
  const linkedRecords = cluster.records.map((id) => recordById.get(id)).filter(Boolean) as BusinessRecord[]

  return (
    <section className="panel detail-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Evidence Dossier</p>
          <h2>{cluster.title}</h2>
        </div>
        <StatusPill status={cluster.status} />
      </div>

      <div className="identity-strip">
        <div>
          <span>UBID</span>
          <strong>{cluster.ubid}</strong>
        </div>
        <div>
          <span>Anchor</span>
          <strong>{cluster.anchor}</strong>
        </div>
        <div>
          <span>Link confidence</span>
          <strong>{pct(cluster.confidence)}</strong>
        </div>
      </div>

      <div className="evidence-bars">
        {cluster.explanation.map((item) => (
          <div className="evidence-item" key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
            <meter min="0" max="1" value={item.score} />
            <b>{pct(item.score)}</b>
          </div>
        ))}
      </div>

      {cluster.reviewerNote && (
        <div className="note-row">
          <AlertTriangle size={17} />
          <span>{cluster.reviewerNote}</span>
        </div>
      )}

      <div className="records-table">
        <div className="records-row header">
          <span>Source</span>
          <span>Record</span>
          <span>Name</span>
          <span>PIN</span>
        </div>
        {linkedRecords.map((record) => (
          <div className="records-row" key={record.id}>
            <span>{record.department}</span>
            <strong>{record.id}</strong>
            <span>{record.legalName}</span>
            <span>{record.pin}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActivityTimeline({ cluster }: { cluster: Cluster }) {
  const timeline = eventsByUbid(cluster.ubid)
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Explainable Verdict</p>
          <h2>{cluster.status}: signals over the last 12 months</h2>
        </div>
        <History className="heading-icon" size={22} />
      </div>
      <div className="timeline">
        {timeline.map((event) => (
          <article className={`timeline-event ${event.signal}`} key={event.id}>
            <div className="timeline-date">{event.date}</div>
            <div>
              <strong>{event.source} {event.kind}</strong>
              <p>{event.summary}</p>
              <span>{pct(event.joinedConfidence)} join confidence</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function UnmatchedEvents() {
  const unmatched = events.filter((event) => !event.ubid || event.joinedConfidence < 0.65)
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Exception Handling</p>
          <h2>Events below join confidence are not dropped</h2>
        </div>
        <AlertTriangle className="heading-icon" size={22} />
      </div>
      <div className="unmatched-list">
        {unmatched.map((event) => (
          <div className="unmatched-row" key={event.id}>
            <div>
              <strong>{event.businessHint}</strong>
              <span>{event.summary}</span>
            </div>
            <b>{pct(event.joinedConfidence)}</b>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewCard({
  item,
  decision,
  setDecision,
}: {
  item: ReviewItem
  decision?: 'approved' | 'rejected'
  setDecision: (decision: 'approved' | 'rejected') => void
}) {
  const left = recordById.get(item.left)
  const right = recordById.get(item.right)

  return (
    <article className="review-card">
      <div className="review-card-head">
        <div>
          <strong>{item.id}</strong>
          <span>{item.reason}</span>
        </div>
        <b>{pct(item.score)}</b>
      </div>
      <div className="compare-grid">
        {[left, right].map((record) => (
          <div className="compare-card" key={record?.id}>
            <span>{record?.department}</span>
            <strong>{record?.legalName}</strong>
            <p>{record?.address}</p>
            <small>{record?.pan ?? record?.gstin ?? 'No central anchor captured'}</small>
          </div>
        ))}
      </div>
      <div className="factor-grid">
        {item.factors.map((factor) => (
          <div className="factor" key={factor.label}>
            <span>{factor.label}</span>
            <meter min="0" max="1" value={factor.score} />
            <small>{factor.detail}</small>
          </div>
        ))}
      </div>
      <div className="review-actions">
        {decision ? (
          <div className={`decision-confirm ${decision}`}>
            {decision === 'approved' ? <Check size={17} /> : <X size={17} />}
            <span>Reviewer {decision}. Training ledger updated for future calibration.</span>
            <button type="button" onClick={() => setDecision(decision === 'approved' ? 'rejected' : 'approved')}>
              <RotateCcw size={16} />
              Reverse
            </button>
          </div>
        ) : (
          <>
            <button className="approve" type="button" onClick={() => setDecision('approved')}>
              <Link2 size={17} />
              Approve merge
            </button>
            <button className="reject" type="button" onClick={() => setDecision('rejected')}>
              <Split size={17} />
              Keep separate
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function IdentityGraph({
  selectedCluster,
  setSelectedUbid,
}: {
  selectedCluster: Cluster
  setSelectedUbid: (ubid: string) => void
}) {
  const linkedRecords = selectedCluster.records.map((id) => recordById.get(id)).filter(Boolean) as BusinessRecord[]
  const pendingEdges = reviewItems.filter((item) => selectedCluster.records.includes(item.left) || selectedCluster.records.includes(item.right))

  return (
    <section className="panel graph-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Reversible Identity Graph</p>
          <h2>Records become edges, not irreversible database overwrites</h2>
        </div>
        <Workflow className="heading-icon" size={22} />
      </div>
      <div className="graph-layout">
        <div className="graph-picker">
          {clusters.map((cluster) => (
            <button
              key={cluster.ubid}
              type="button"
              className={cluster.ubid === selectedCluster.ubid ? 'graph-pick active' : 'graph-pick'}
              onClick={() => setSelectedUbid(cluster.ubid)}
            >
              <span>{cluster.title}</span>
              <b>{pct(cluster.confidence)}</b>
            </button>
          ))}
        </div>

        <div className="graph-canvas" aria-label="Identity graph visualization">
          <div className="ubid-node">
            <Fingerprint size={28} />
            <strong>{selectedCluster.ubid}</strong>
            <span>{selectedCluster.title}</span>
            <StatusPill status={selectedCluster.status} />
          </div>
          <div className="source-node-grid">
            {linkedRecords.map((record, index) => (
              <div className={`source-node n${index + 1}`} key={record.id}>
                <small>{record.department}</small>
                <strong>{record.id}</strong>
                <span>{record.pan ?? record.gstin ?? 'No anchor'}</span>
                <b>{record.pin}</b>
              </div>
            ))}
          </div>
          <div className="edge-legend">
            <span className="edge auto">Auto evidence</span>
            <span className="edge review">Review edge</span>
            <span className="edge event">Activity signal</span>
          </div>
        </div>

        <div className="graph-evidence">
          <strong>Selected edge policy</strong>
          <p>
            Central IDs can anchor a UBID, but name/address/PIN evidence still stays visible. Ambiguous edges become
            reviewer tasks and can be split later without touching source systems.
          </p>
          <div className="graph-stat">
            <span>Pending edges</span>
            <b>{pendingEdges.length}</b>
          </div>
          <div className="graph-stat">
            <span>Reversible records</span>
            <b>{selectedCluster.records.length}</b>
          </div>
        </div>
      </div>
    </section>
  )
}

function DataQualityPanel() {
  const rows = connectors.map((connector) => {
    const sourceRecords = records.filter((record) => record.department === connector.name || record.department === 'Shop' && connector.name === 'Shop Establishment')
    const missingPan = sourceRecords.filter((record) => !record.pan).length
    const missingGstin = sourceRecords.filter((record) => !record.gstin).length
    const reviewEdges = connector.name === 'KSPCB' ? 2 : connector.name === 'Shop Establishment' ? 1 : 0

    return {
      name: connector.name,
      missingPan,
      missingGstin,
      reviewEdges,
      quality: Math.max(42, 100 - missingPan * 12 - missingGstin * 8 - reviewEdges * 10),
    }
  })

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Data Quality Heatmap</p>
          <h2>Identity risk by source system</h2>
        </div>
        <Gauge className="heading-icon" size={22} />
      </div>
      <div className="quality-grid">
        {rows.map((row) => (
          <div className="quality-row" key={row.name}>
            <div>
              <strong>{row.name}</strong>
              <span>Missing PAN {row.missingPan} | Missing GSTIN {row.missingGstin} | Review edges {row.reviewEdges}</span>
            </div>
            <div className="heatbar">
              <i style={{ width: `${row.quality}%` }} />
            </div>
            <b>{row.quality}%</b>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReviewerLearningPanel({ decisions }: { decisions: Record<string, 'approved' | 'rejected'> }) {
  const labelled = Object.keys(decisions).length
  const approved = Object.values(decisions).filter((decision) => decision === 'approved').length
  const rejected = Object.values(decisions).filter((decision) => decision === 'rejected').length

  return (
    <section className="panel learning-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Reviewer Learning</p>
          <h2>Reviewer decisions update scoring rules</h2>
        </div>
        <Activity className="heading-icon" size={22} />
      </div>
      <div className="learning-grid">
        <div>
          <span>Labels captured</span>
          <strong>{labelled}</strong>
        </div>
        <div>
          <span>Approved merges</span>
          <strong>{approved}</strong>
        </div>
        <div>
          <span>Rejected merges</span>
          <strong>{rejected}</strong>
        </div>
      </div>
      <div className="learning-flow">
        <span>Reviewer label</span>
        <ArrowStep />
        <span>Calibration ledger</span>
        <ArrowStep />
        <span>Threshold tuning</span>
        <ArrowStep />
        <span>Updated scoring rules</span>
      </div>
      <p>
        Reviewer choices are stored as calibration labels for future weights and thresholds, while source department
        records remain unchanged.
      </p>
    </section>
  )
}

function ArrowStep() {
  return <ChevronRight size={16} aria-hidden="true" />
}

function AuditLedger({ decisions }: { decisions: Record<string, 'approved' | 'rejected'> }) {
  const reviewAudits: AuditItem[] = Object.entries(decisions).map(([id, decision], index) => ({
    id: `AUD-R${index + 1}`,
    actor: 'Reviewer',
    action: decision === 'approved' ? 'Approved ambiguous merge' : 'Rejected ambiguous merge',
    target: id,
    time: 'Current session',
    reversible: true,
    detail:
      decision === 'approved'
        ? 'Edge promoted to confirmed identity graph relationship and calibration label stored.'
        : 'Candidate edge retained as separate identity and negative calibration label stored.',
  }))
  const ledger = [...reviewAudits, ...auditLedger]

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Explainable and Reversible</p>
          <h2>Audit ledger for merges, splits, classifications and reviewer labels</h2>
        </div>
        <BookOpen className="heading-icon" size={22} />
      </div>
      <div className="audit-list">
        {ledger.map((item) => (
          <article className="audit-row" key={item.id}>
            <div className="audit-id">
              <strong>{item.id}</strong>
              <span>{item.actor}</span>
            </div>
            <div>
              <strong>{item.action}</strong>
              <p>{item.detail}</p>
              <small>{item.target}</small>
            </div>
            <div className="audit-meta">
              <span>{item.time}</span>
              <b>{item.reversible ? 'Reversible' : 'Immutable source snapshot'}</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function SandboxApiHub() {
  return (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Read-only Source Connectors</p>
            <h2>Designed to sit beside existing department systems</h2>
          </div>
          <Server className="heading-icon" size={22} />
        </div>
        <div className="connector-grid">
          {connectors.map((connector) => (
            <article className="connector-card" key={connector.name}>
              <div>
                <strong>{connector.name}</strong>
                <StatusDot status={connector.status} />
              </div>
              <span>{connector.mode}</span>
              <small>{connector.records} records | refreshed {connector.freshness}</small>
              <p>{connector.piiControl}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sandbox APIs</p>
            <h2>Integration contracts</h2>
          </div>
          <KeyRound className="heading-icon" size={22} />
        </div>
        <div className="sandbox-note">
          <ShieldCheck size={18} />
          <span>
            Read-only extracts are normalized into synthetic or scrambled fixtures. Matching runs on identifiers,
            normalized tokens and hashes without hosted LLM calls on raw PII.
          </span>
        </div>
        <div className="api-list">
          {apiEndpoints.map(([method, path, detail]) => (
            <div className="api-row" key={path}>
              <b>{method}</b>
              <code>{path}</code>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatusDot({ status }: { status: Connector['status'] }) {
  return <span className={`source-status ${status.toLowerCase()}`}>{status}</span>
}

export default App
