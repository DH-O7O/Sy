# Synapse Prime Mobile - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This is an enterprise system requiring secure access:
- **SSO Implementation**:
  - Apple Sign-In (required for iOS)
  - Google Sign-In for Android
  - Mock auth flow in prototype with local state
- **Account Features**:
  - Enterprise user profile with role badge (Admin, Operator, Viewer)
  - Company affiliation display
  - API key management screen (nested under Settings > API Keys)
  - Two-factor authentication toggle
  - Session management with timeout settings
  - Logout with confirmation alert
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation
**Tab Navigation** (5 tabs) - Optimized for enterprise monitoring workflow:

**Tab 1: Dashboard** (Home icon)
- Real-time system overview
- Critical metrics at-a-glance
- Status indicators for all agents

**Tab 2: Agents** (Grid icon)
- Multi-agent control panel
- Individual agent status cards
- Quick action buttons

**Tab 3: Deploy** (Center - Floating Action Button)
- Primary deployment controls
- Quick deployment wizard
- Rollback options

**Tab 4: Analytics** (Chart icon)
- Business intelligence dashboards
- Performance metrics visualization
- Historical trend analysis

**Tab 5: Alerts** (Bell icon)
- Notification center
- Critical alerts feed
- System logs access

## Screen Specifications

### 1. Dashboard Screen (Home)
**Purpose**: Provide real-time overview of entire Synapse Prime deployment status

**Layout**:
- **Header**: Transparent with refresh button (right), notification badge indicator
- **Main Content**: Scrollable (ScrollView)
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

**Components**:
- System status card (online/offline indicator with pulse animation)
- 4 metric cards in 2x2 grid (CPU, Memory, Active Agents, Deployments Today)
- Horizontal scrolling list of recent deployments
- Quick actions section (3 prominent buttons)
- API connection status indicators (Gemini, Anthropic, Binance, etc.)

### 2. Agents Screen
**Purpose**: Manage and monitor all orchestrated agents

**Layout**:
- **Header**: Default with search bar, filter button (right)
- **Main Content**: FlatList of agent cards
- **Safe Area**: Bottom: tabBarHeight + Spacing.xl

**Components**:
- Agent status cards with:
  - Agent name and type badge
  - Status indicator (running/stopped/error with color coding)
  - Resource usage mini-graphs
  - Action buttons (start/stop/restart) with confirmation modals
- Pull-to-refresh for status updates
- Floating filter chip row above list

### 3. Deploy Screen (Modal)
**Purpose**: Execute deployment actions and manage deployment workflows

**Layout**:
- **Modal Presentation**: Full-screen modal with custom header
- **Header**: Custom with close button (left), deploy history (right)
- **Main Content**: Scrollable form
- **Safe Area**: Top: Spacing.xl + insets.top, Bottom: Spacing.xl + insets.bottom

**Components**:
- Deployment type selector (carousel of cards)
- Configuration form fields
- Progress indicator during deployment
- Deploy button (prominent, bottom of form)
- Cancel button in header

### 4. Analytics Screen
**Purpose**: Visualize business intelligence and performance metrics

**Layout**:
- **Header**: Transparent with time range selector (right), export button
- **Main Content**: Scrollable
- **Safe Area**: Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

**Components**:
- Segmented control for metric categories
- Interactive line/bar charts using react-native-chart-kit
- KPI summary cards
- Comparison time series graphs
- Trend indicators with up/down arrows

### 5. Alerts Screen
**Purpose**: Display notifications, alerts, and access system logs

**Layout**:
- **Header**: Default with filter button (right), mark all read (right)
- **Main Content**: SectionList (grouped by severity)
- **Safe Area**: Bottom: tabBarHeight + Spacing.xl

**Components**:
- Section headers for Critical, Warning, Info
- Alert cards with:
  - Severity icon and color
  - Timestamp
  - Alert message
  - Source (agent/system)
  - Swipe actions (dismiss, view details)
- Log viewer modal (accessible via header button)

### 6. Agent Detail Screen (Stack)
**Purpose**: In-depth view and control of individual agent

**Layout**:
- **Header**: Default with agent name as title, more options (right)
- **Main Content**: Scrollable
- **Safe Area**: Bottom: Spacing.xl + insets.bottom

**Components**:
- Status banner at top
- Tabbed interface (Overview, Metrics, Logs, Configuration)
- Real-time metric graphs
- Control buttons (prominent at bottom)
- Log stream with auto-scroll toggle

### 7. Deployment History Screen (Stack)
**Purpose**: Review past deployments and their outcomes

**Layout**:
- **Header**: Default with search bar
- **Main Content**: FlatList
- **Safe Area**: Bottom: Spacing.xl + insets.bottom

**Components**:
- Deployment cards with:
  - Timestamp
  - Status badge (success/failed/in-progress)
  - Duration
  - Deployed by user
- Filter chips (status, date range)
- Detail view on card tap

### 8. Settings Screen (Stack)
**Purpose**: Configure app preferences and manage account

**Layout**:
- **Header**: Default navigation header
- **Main Content**: Scrollable settings list
- **Safe Area**: Bottom: Spacing.xl + insets.bottom

**Components**:
- User profile section (avatar, name, role)
- Grouped settings lists
- Toggle switches for preferences
- Nested navigation for API Keys, Notifications, Account

## Design System

### Color Palette
**Enterprise Dark Theme** (primary theme):
- **Background**: 
  - Primary: #0A0E1A (deep navy)
  - Secondary: #151B2E (card background)
  - Tertiary: #1E2842 (elevated surfaces)
- **Accent Colors**:
  - Primary: #00D4FF (cyan - success, running states)
  - Warning: #FFB800 (amber)
  - Error: #FF3B5C (red)
  - Success: #00E676 (green)
- **Text**:
  - Primary: #FFFFFF (primary content)
  - Secondary: #A0AEC0 (secondary content)
  - Tertiary: #64748B (disabled, hints)
- **Chart Colors**: Gradient-based - cyan to purple for metrics

### Typography
- **Headers**: System font, Bold, 24-28pt
- **Subheaders**: System font, Semibold, 16-18pt
- **Body**: System font, Regular, 14-16pt
- **Captions**: System font, Regular, 12pt
- **Monospace** (for logs): Menlo/Courier, 12pt

### Spacing
- xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48

### Visual Design
- **Icons**: Feather icons from @expo/vector-icons, 24pt default
- **Cards**: 12pt border radius, subtle elevation with shadowOpacity: 0.15
- **Floating Action Button**: Circular, 56pt diameter, shadow (offset: {width: 0, height: 4}, opacity: 0.25, radius: 8)
- **Status Indicators**: 8pt circular dots with pulse animation for active states
- **Graphs**: Gradient fills, smooth line interpolation, interactive tooltips
- **Touchable Feedback**: Opacity 0.7 on press for standard touchables, scale animation (0.95) for cards

### Assets Required
1. **System Status Icons** (3 variants):
   - Healthy system icon (generated - abstract server/network visualization, cyan/green)
   - Warning system icon (amber version)
   - Error system icon (red version)

2. **Agent Type Icons** (4 variants):
   - Orchestrator agent (generated - circular nodes with connections)
   - Worker agent (generated - gear/process icon)
   - Monitor agent (generated - radar/pulse icon)
   - Analytics agent (generated - graph/analytics icon)

3. **Empty State Illustrations** (2 variants):
   - No deployments (generated - abstract deployment pipeline)
   - No alerts (generated - peaceful/calm system visualization)

### Interaction Design
- **Pull-to-refresh**: Standard iOS/Android pattern with loading indicator
- **Swipe actions**: Left swipe on alert cards reveals dismiss/view actions
- **Long press**: On agent cards shows quick action menu
- **Haptic feedback**: On critical actions (deploy, stop agent, delete)
- **Loading states**: Skeleton screens for data-heavy views, spinner overlays for actions
- **Error states**: Toast notifications at top with auto-dismiss (3s), persistent banners for critical errors

### Accessibility
- All interactive elements: minimum 44pt touch target
- Status indicators: include text labels in addition to colors
- Charts: alternative data table view available
- Dynamic type support: respect system font size preferences
- VoiceOver labels: all custom components properly labeled
- Color contrast: WCAG AA compliant minimum