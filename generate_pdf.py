import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Don't draw running header on cover/first page
        if self._pageNumber > 1:
            # Running Header
            self.drawString(54, 800, "MobiLens AI — Human-Centric Mobility Intelligence & Intervention Simulator")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.6)
            self.line(54, 794, 541, 794)

        # Running Footer on all pages
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.6)
        self.line(54, 45, 541, 45)
        
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 32, page_text)
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — MOBILENS AI ARCHITECTURE")
        self.restoreState()

def build_pdf(filename="MobiLens_AI_Complete_Project_Overview.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F172A")    # Slate 900
    c_secondary = colors.HexColor("#0284C7")  # Sky 600
    c_dark_sky = colors.HexColor("#0369A1")   # Sky 700
    c_emerald = colors.HexColor("#059669")    # Emerald 600
    c_amber = colors.HexColor("#D97706")      # Amber 600
    c_rose = colors.HexColor("#E11D48")       # Rose 600
    c_slate_dark = colors.HexColor("#334155") # Slate 700
    c_slate_light = colors.HexColor("#F8FAFC")# Slate 50
    c_border = colors.HexColor("#CBD5E1")     # Slate 300

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        alignment=0,
        spaceAfter=8
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_secondary,
        alignment=0,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_dark_sky,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_slate_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_slate_dark,
        leftIndent=12,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9.5,
        leading=14,
        textColor=c_primary
    )

    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=c_slate_dark
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=c_primary
    )

    story = []

    # ==================== COVER / HEADER BANNER ====================
    banner_data = [
        [
            Paragraph("MOBILENS AI", ParagraphStyle('B1', fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor("#38BDF8"))),
            Paragraph("PRODUCTION ARCHITECTURE & SYSTEM OVERVIEW", ParagraphStyle('B2', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#94A3B8"), alignment=2))
        ]
    ]
    t_banner = Table(banner_data, colWidths=[240, 247])
    t_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
    ]))
    story.append(t_banner)
    story.append(Spacer(1, 14))

    story.append(Paragraph("MobiLens AI — Human-Centric Mobility Intelligence & Intervention Simulator", title_style))
    story.append(Paragraph("A Complete Guide to Concept, Mathematical Engine, Architecture, and All 13 Pages", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_secondary, spaceAfter=14))

    # Executive Callout Box
    quote_text = (
        "<b>Core Paradigm:</b> <i>\"Don't just tell people where the bus is. Tell them what that means for their entire human journey.\"</i><br/>"
        "Conventional transit tools are vehicle-centric (tracking dots on a map). MobiLens AI is human-centric: evaluating cumulative exertion, thermal heat exposure, transfer traps, accessibility barriers, and dynamic disruption recovery."
    )
    t_callout = Table([[Paragraph(quote_text, callout_style)]], colWidths=[487])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0F9FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BAE6FD")),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 12))

    # ==================== 1. CORE CONCEPT & PHILOSOPHY ====================
    story.append(Paragraph("1. Core Concept & The Human-Centric Paradigm", h1_style))
    story.append(Paragraph(
        "MobiLens AI addresses the critical missing link in modern urban transportation: the <b>Mobility Friction</b> experienced by everyday citizens, seniors, students, and persons with disabilities. While standard transit APIs track scheduled vehicle timings, commuters experience the friction of unshaded walkways, dangerous multi-lane highway transfers without crosswalks, delayed intermodal connections, and broken wheelchair access.",
        body_style
    ))
    story.append(Paragraph(
        "MobiLens AI operates on a continuous feedback loop:",
        body_style
    ))

    loop_data = [
        [
            Paragraph("<b>1. HUMAN JOURNEY</b><br/>User's complete trip door-to-door (Walk ➔ Bus ➔ Transfer ➔ Final Mile)", table_cell),
            Paragraph("<b>2. FRICTION AUDIT</b><br/>Real-time penalty scoring (Thermal heat, wait time, physical effort)", table_cell),
            Paragraph("<b>3. BOTTLENECK</b><br/>Detection of transfer traps & connection failure points", table_cell),
            Paragraph("<b>4. INTERVENTION</b><br/>AI-generated micro-fixes & policy simulation before spending capital", table_cell)
        ]
    ]
    t_loop = Table(loop_data, colWidths=[121, 122, 122, 122])
    t_loop.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.75, c_border),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_loop)
    story.append(Spacer(1, 12))

    # ==================== 2. MATHEMATICAL ENGINE: MFI ====================
    story.append(Paragraph("2. Mathematical Formulation: Mobility Friction Index (MFI)", h1_style))
    story.append(Paragraph(
        "The <b>Prototype Mobility Friction Index (MFI)</b> is a calibrated scalar index ranging from <b>0 (Frictionless)</b> to <b>100 (Critical Strain)</b>:",
        body_style
    ))
    
    formula_box = (
        "<b>MFI Equation:</b><br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>MFI = w₁·(Travel Time) + w₂·(Waiting Burden) + w₃·(Transfer Risk) + w₄·(Heat Multiplier) + w₅·(Accessibility Barriers)</b>"
    )
    t_formula = Table([[Paragraph(formula_box, ParagraphStyle('Form', fontName='Helvetica', fontSize=9, leading=13, textColor=c_primary))]], colWidths=[487])
    t_formula.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FCD34D")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_formula)
    story.append(Spacer(1, 8))

    mfi_table_data = [
        [Paragraph("Factor", table_header), Paragraph("Weight / Penalty", table_header), Paragraph("Behavioral & Empirical Justification", table_header)],
        [
            Paragraph("<b>Wait Burden</b>", table_cell_bold),
            Paragraph("<b>2.5× base time</b>", table_cell),
            Paragraph("Commuter perception studies demonstrate that waiting at unsheltered, unseated bus stops feels 2.5× longer than in-vehicle travel time.", table_cell)
        ],
        [
            Paragraph("<b>Transfer Trap Risk</b>", table_cell_bold),
            Paragraph("<b>+7 to +20 MFI</b>", table_cell),
            Paragraph("Penalizes multi-lane highway road crossings with high vehicular speeds, missing crosswalk signals, or unpaved shoulders.", table_cell)
        ],
        [
            Paragraph("<b>Heat Stress Multiplier</b>", table_cell_bold),
            Paragraph("<b>1.25× to 1.6×</b>", table_cell),
            Paragraph("Calculated dynamically from real-time ambient temperature (>32°C), direct midday sun exposure, and lack of tree canopy/shade.", table_cell)
        ],
        [
            Paragraph("<b>Accessibility Barrier</b>", table_cell_bold),
            Paragraph("<b>+35 to +60 MFI</b>", table_cell),
            Paragraph("Applied when steep ramp gradients (>1:12), broken curbs, or non-wheelchair-accessible high-floor buses are present on a route.", table_cell)
        ]
    ]
    t_mfi = Table(mfi_table_data, colWidths=[110, 110, 267])
    t_mfi.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,0), 'LEFT'),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_slate_light]),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(t_mfi)
    story.append(Spacer(1, 14))

    # ==================== 3. SYSTEM ARCHITECTURE & TECH STACK ====================
    story.append(Paragraph("3. Technical Stack & Deployment Architecture", h1_style))
    
    stack_data = [
        [Paragraph("Layer", table_header), Paragraph("Technologies", table_header), Paragraph("Key Responsibilities & Integrations", table_header)],
        [
            Paragraph("<b>Frontend UI</b>", table_cell_bold),
            Paragraph("React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons", table_cell),
            Paragraph("Zero-lag reactive user interface, glassmorphism design system, responsive mobile & desktop viewports.", table_cell)
        ],
        [
            Paragraph("<b>GIS Mapping</b>", table_cell_bold),
            Paragraph("Leaflet, React-Leaflet, OpenStreetMap Standard Tiles", table_cell),
            Paragraph("High-performance geospatial visualization, interactive polyline corridors, custom DivIcon bus capsules, zero watermark tiles.", table_cell)
        ],
        [
            Paragraph("<b>Backend API</b>", table_cell_bold),
            Paragraph("Python, FastAPI, Uvicorn, WebSockets", table_cell),
            Paragraph("RESTful endpoints, real-time vehicle coordinate interpolation, GTFS/GTFS-RT abstraction layer, risk engines.", table_cell)
        ],
        [
            Paragraph("<b>Database</b>", table_cell_bold),
            Paragraph("MongoDB Atlas Cloud Database (Cluster0)", table_cell),
            Paragraph("Persistent storage for user profiles, crowdsourced transfer traps, saved custom journeys, and historical city audits.", table_cell)
        ]
    ]
    t_stack = Table(stack_data, colWidths=[90, 140, 257])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark_sky),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_slate_light]),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(t_stack)
    
    story.append(PageBreak())

    # ==================== 4. COMPLETE PAGE-BY-PAGE DEEP DIVE (13 PAGES) ====================
    story.append(Paragraph("4. Complete Page-by-Page Deep Dive (All 13 Modules)", h1_style))
    story.append(Paragraph("The MobiLens AI suite features 13 purpose-built modules designed for citizens, planners, administrators, and accessibility advocates:", body_style))

    pages = [
        (
            "Page 1: Overview Dashboard (`/overview`)",
            "Executive City Mobility Health & District Comparisons",
            "Provides an aggregated city-wide view of Mobility Friction across Tamil Nadu districts (Tirunelveli, Chennai, Coimbatore, Madurai, Salem, etc.). Features a real-time MFI speedometer, district comparative cards, and a live ticker tracking active bus dispatches, citizen transfer trap reports, and high-heat corridor alerts."
        ),
        (
            "Page 2: My Journey (`/my-journey`)",
            "Personalized Multimodal Commute Intelligence",
            "Allows individual citizens to plan and inspect their door-to-door commute broken down into walk, bus, transfer, and feeder legs. Features the visual Heat Stress & Sun Exposure multiplier (fatigue meter) and the crowdsourced 'Report Transfer Trap' modal that directly feeds into the city planner database."
        ),
        (
            "Page 3: Live Journey & Bus Tracking (`/live-journey`)",
            "Contextual Real-Time Corridor Tracking & Disruption Recovery",
            "The flagship feature of MobiLens AI. Focuses specifically on the user's active travel corridor (Thoothukudi Airport TCR ➔ Francis Xavier Engineering College Vannarpettai on NH 138) with Bus 15 and Feeder 7B-EV. Features the transparent 'Can I Catch This Bus?' modal, 1-click delay simulation (+6 min), and 4 AI recovery alternatives."
        ),
        (
            "Page 4: Mobility Friction Map (`/mobility-map`)",
            "Spatial GIS Heatmaps & Friction Corridors",
            "Interactive geographic mapping layer visualizing transfer traps, high-friction bus stops, pedestrian choke points, and micro-bottlenecks. Planners can toggle layers for heat stress, accessibility, and stop crowding."
        ),
        (
            "Page 5: Journey Analyzer (`/journey-analyzer`)",
            "Deep Forensics on Route Exertion & Delay",
            "Performs granular forensics on every meter of a planned route. Deconstructs the friction score into physical walking exertion, shelter deficits, crossing risks, and schedule desynchronization."
        ),
        (
            "Page 6: AI Interventions (`/interventions`)",
            "Algorithmic Micro-Interventions & ROI Analysis",
            "Recommends targeted municipal interventions to eliminate bottlenecks: green pedestrian shaded corridors, high-frequency low-floor EV shuttles, smart crosswalk signals, and sheltered bus bays, complete with estimated MFI reduction and CAPEX ROI."
        ),
        (
            "Page 7: What-If Simulator (`/simulator`)",
            "Interactive Urban Planning Policy Sandbox",
            "Enables transport planners to drag policy sliders (e.g. increase feeder frequency by 50%, add sidewalk shading, introduce dedicated bus lanes) and immediately simulate the city-wide impact on citizen time saved, carbon reduction, and friction drops before allocating capital."
        ),
        (
            "Page 8: Accessibility Navigator (`/accessibility`)",
            "Inclusive Step-Free & Wheelchair Route Intelligence",
            "Dedicated navigation suite prioritizing step-free paths, tactile paving, curb-cut ramp availability (<1:12 slope), auditory signals, and wheelchair-accessible low-floor bus fleets (Route 7B-EV)."
        ),
        (
            "Page 9: Citizen Safe Routes (`/safe-routes`)",
            "Pedestrian & Women's Night Safety Routing",
            "Evaluates pedestrian corridors based on human safety parameters: street lighting continuity, crowd density, open commercial storefront activity, and proximity to emergency kiosks and police outposts."
        ),
        (
            "Page 10: City Intelligence Command Center (`/city-intelligence`)",
            "Municipal Transport Operations & Bottleneck Spotlight",
            "Enterprise command center for city transport corporations. Features the Live Transit Corridor Bottleneck Spotlight, tracking route delays, citizen trap submissions, and converting bottlenecks into municipal work orders."
        ),
        (
            "Page 11: Mobility Analytics (`/analytics`)",
            "Long-Term Trends & Modal Shift Reports",
            "Aggregates macro-level urban mobility metrics: average commuter delay distributions, seasonal heat impact trends, modal shift from private vehicles to public transit, and municipal carbon savings."
        ),
        (
            "Page 12: Pitch Deck & Vision (`/about`)",
            "Executive Narrative & Problem-Solution Canvas",
            "Comprehensive presentation canvas detailing the economic burden of transit friction, human stories of commuting barriers, technical architecture, and scalability across global metropolitan regions."
        ),
        (
            "Page 13: Persona Authentication (`/login`)",
            "Role-Based Access for 4 Distinct Stakeholders",
            "Configures the entire workspace dynamically based on 4 persona roles: Daily Commuter / Citizen, Urban Transport Planner, Accessibility Advocate / Wheelchair User, and City Administrator."
        )
    ]

    for title, subtitle, desc in pages:
        p_card = [
            [Paragraph(f"<b>{title}</b> — <font color='#0284C7'>{subtitle}</font>", table_cell_bold)],
            [Paragraph(desc, table_cell)]
        ]
        t_card = Table(p_card, colWidths=[487])
        t_card.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, c_border),
            ('LINELEFT', (0,0), (0,-1), 2.5, c_secondary),
            ('PADDING', (0,0), (-1,-1), 4.5),
        ]))
        story.append(t_card)
        story.append(Spacer(1, 4.5))

    story.append(PageBreak())

    # ==================== 5. FLAGSHIP CAPABILITY: LIVE JOURNEY SHOWCASE ====================
    story.append(Paragraph("5. Flagship Capability: The Live Journey Showcase", h1_style))
    story.append(Paragraph(
        "The Live Journey module represents the synthesis of live transit telemetry and human-centric journey intelligence. Instead of an overwhelming generic map with hundreds of congested buses, MobiLens AI displays an ultra-clean corridor tailored to the user's active commute:",
        body_style
    ))

    corridor_box = (
        "<b>Active Showcase Corridor: NH 138 Inter-District Highway</b><br/>"
        "• <b>Origin:</b> Thoothukudi Airport (TCR) Terminal (Lat: 8.7242, Lng: 78.0264)<br/>"
        "• <b>Intermediate Hubs:</b> Vagaikulam Feeder Stop, Vallanadu Junction, Thamirabarani River Bridge<br/>"
        "• <b>Destination:</b> Francis Xavier Engineering College (FXEC) Main Gate, Vannarpettai, Tirunelveli<br/>"
        "• <b>Assigned Vehicles:</b> Bus 15 (Highway Express) & Feeder 7B-EV (Zero-Emission Campus Connector)"
    )
    t_corr = Table([[Paragraph(corridor_box, table_cell)]], colWidths=[487])
    t_corr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_corr)
    story.append(Spacer(1, 10))

    story.append(Paragraph("A. \"Can I Catch This Bus?\" Transparent Arithmetic Calculator", h2_style))
    story.append(Paragraph(
        "Instead of a mysterious \"Yes/No\" indicator, MobiLens AI displays the exact transparent calculation so citizens feel empowered and in control:",
        body_style
    ))

    calc_data = [
        [Paragraph("Parameter", table_header), Paragraph("Value & Unit", table_header), Paragraph("Description in Transparent Arithmetic", table_header)],
        [Paragraph("Walking Distance", table_cell_bold), Paragraph("280 meters", table_cell), Paragraph("Direct Haversine pedestrian distance from user's origin to bus bay", table_cell)],
        [Paragraph("Walking Speed", table_cell_bold), Paragraph("4.5 km/h", table_cell), Paragraph("Standard pedestrian walking speed (adjusted to 3.2 km/h for wheelchair mode)", table_cell)],
        [Paragraph("Weather Multiplier", table_cell_bold), Paragraph("1.25× (Midday Sun)", table_cell), Paragraph("Thermal heat factor slowing physical walking velocity", table_cell)],
        [Paragraph("Required Walking Time", table_cell_bold), Paragraph("4.2 minutes", table_cell), Paragraph("Gross walking duration including safe road crossing buffer", table_cell)],
        [Paragraph("Bus Arrival ETA", table_cell_bold), Paragraph("6.0 minutes", table_cell), Paragraph("Live interpolated GPS countdown of approaching Bus 15", table_cell)],
        [Paragraph("Safety Buffer Margin", table_cell_bold), Paragraph("+1.8 minutes", table_cell), Paragraph("Positive buffer confirms user will comfortably catch the vehicle", table_cell)]
    ]
    t_calc = Table(calc_data, colWidths=[120, 100, 267])
    t_calc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_emerald),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_slate_light]),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(t_calc)
    story.append(Spacer(1, 10))

    story.append(Paragraph("B. Disruption & 4 Dynamic AI Recovery Alternatives", h2_style))
    story.append(Paragraph(
        "When unexpected traffic delays Bus 15 by +6 minutes, the system immediately recognizes that the transfer at the highway junction will fail. The algorithm dynamically recalculates and presents 4 recovery alternatives:",
        body_style
    ))

    alt_data = [
        [Paragraph("Alternative Option", table_header), Paragraph("Strategy & Transfer Mechanism", table_header), Paragraph("ETA / Friction / Risk", table_header)],
        [
            Paragraph("<b>Option A</b><br/>Stay on Delayed Bus", table_cell_bold),
            Paragraph("Accept delay and wait for subsequent connecting feeder service at junction.", table_cell),
            Paragraph("ETA: +18m late<br/>Friction: <b>68 (High)</b><br/>Risk: High", table_cell)
        ],
        [
            Paragraph("<b>Option B</b><br/>Rapid Bypass Shuttle", table_cell_bold),
            Paragraph("Board passing express shuttle at highway junction to bypass local city stop delays.", table_cell),
            Paragraph("ETA: <b>On Time (08:52)</b><br/>Friction: <b>38 (Low)</b><br/>Risk: Low", table_cell)
        ],
        [
            Paragraph("<b>Option C (Recommended)</b><br/>Campus Direct EV Feeder", table_cell_bold),
            Paragraph("Hop onto direct electric feeder linking airport terminal directly to FXEC campus gate.", table_cell),
            Paragraph("ETA: <b>12m early</b><br/>Friction: <b>24 (Smooth)</b><br/>Risk: Low", table_cell)
        ],
        [
            Paragraph("<b>Option D</b><br/>Reroute to Vallanadu Hub", table_cell_bold),
            Paragraph("Transfer at the sheltered Vallanadu depot rather than the highway shoulder.", table_cell),
            Paragraph("ETA: +6m late<br/>Friction: <b>46 (Moderate)</b><br/>Risk: Moderate", table_cell)
        ]
    ]
    t_alt = Table(alt_data, colWidths=[120, 240, 127])
    t_alt.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_slate_light]),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(t_alt)
    story.append(Spacer(1, 14))

    # ==================== 6. USER PERSONAS & WORKFLOWS ====================
    story.append(Paragraph("6. User Personas & Tailored Workflow Matrix", h1_style))
    
    persona_data = [
        [Paragraph("Persona Role", table_header), Paragraph("Target User Group", table_header), Paragraph("Default Features & Value Delivered", table_header)],
        [
            Paragraph("<b>Daily Commuter</b>", table_cell_bold),
            Paragraph("College students, office workers, everyday citizens", table_cell),
            Paragraph("My Journey planning, live bus countdowns, weather fatigue alerts, 1-click Transfer Trap reporting.", table_cell)
        ],
        [
            Paragraph("<b>Urban Planner</b>", table_cell_bold),
            Paragraph("Transit authorities, municipal engineers, traffic consultants", table_cell),
            Paragraph("What-If Simulation sandbox, policy testing, corridor bottleneck spotlights, AI intervention ROI models.", table_cell)
        ],
        [
            Paragraph("<b>Accessibility User</b>", table_cell_bold),
            Paragraph("Wheelchair users, senior citizens, visually impaired", table_cell),
            Paragraph("Step-free routing, curb-cut ramp audits, wheelchair-accessible low-floor bus dispatch filters (Route 7B-EV).", table_cell)
        ],
        [
            Paragraph("<b>City Administrator</b>", table_cell_bold),
            Paragraph("Transport commissioners, city mayors, transit directors", table_cell),
            Paragraph("City Intelligence Command Center, aggregate district MFI gauges, work-order dispatch for citizen trap reports.", table_cell)
        ]
    ]
    t_persona = Table(persona_data, colWidths=[95, 130, 262])
    t_persona.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_dark_sky),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_slate_light]),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
    ]))
    story.append(t_persona)
    story.append(Spacer(1, 14))

    # ==================== 7. VERIFICATION & CONCLUSION ====================
    story.append(Paragraph("7. Quality Assurance & System Verification", h1_style))
    story.append(Paragraph(
        "• <b>Production TypeScript Build:</b> Fully verified with <code>npx tsc --noEmit</code> (0 compilation errors).<br/>"
        "• <b>Map Cleanliness:</b> OpenStreetMap standard tiles deployed with zero API-key watermarks and de-cluttered corridor bus filtering.<br/>"
        "• <b>Real-Time Backend Services:</b> FastAPI Uvicorn engine running at <code>http://localhost:8000</code> with live MongoDB Atlas connectivity.<br/>"
        "• <b>Interactive Frontend:</b> Vite reactive development application serving at <code>http://localhost:5173</code>.",
        body_style
    ))
    story.append(Spacer(1, 10))

    # Footer Signoff Box
    signoff_text = (
        "<b>MobiLens AI — Empowering human mobility through actionable, human-centered intelligence.</b><br/>"
        "Document compiled and generated automatically on October 2, 2026."
    )
    t_sign = Table([[Paragraph(signoff_text, ParagraphStyle('Sign', fontName='Helvetica', fontSize=8.5, leading=12, textColor=colors.HexColor("#475569")))]], colWidths=[487])
    t_sign.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sign)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "MobiLens_AI_Complete_Project_Overview.pdf"
    build_pdf(out_file)
