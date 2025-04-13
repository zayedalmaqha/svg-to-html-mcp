# Artifact to HTML MCP Tool

A Model Context Protocol (MCP) tool that enables Claude to convert TypeScript/SVG artifacts to interactive HTML visualizations with Chart.js support.

## Features

- Converts TypeScript code with chart data to interactive Chart.js visualizations
- Supports Chart.js visualizations with data labels for improved readability
- Converts SVG code to HTML with proper styling
- Dark mode toggle with persistent preferences
- Print optimization with page break control
- Responsive layout with fixed header
- Maximum width limitation (720px) for chart containers
- CSS variables for consistent theming

## Technical Details

- Built on Chart.js with chartjs-plugin-datalabels
- Implements responsive charts with maintainAspectRatio: false
- Custom axis configuration with hidden grid lines
- Data labels for bars (top-anchored) and pie charts (percentage display)
- Dark mode implementation via CSS variables and body.dark class
- Media queries for print optimization

## Requirements

- Claude Desktop app installed
- Node.js 18.0.0 or higher

## Installation

### Automatic Installation (Recommended)

1. Install the tool using npx:

```bash
npx github:zayedalmaqha/svg-to-html-mcp#npx-compatible install-tool
```

2. Restart your Claude Desktop app

### Manual Installation

1. Add the following to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
"svg-to-html": {
  "command": "npx",
  "args": ["-y", "github:zayedalmaqha/svg-to-html-mcp#npx-compatible"]
}
```

2. Restart your Claude Desktop app

## Usage

In Claude, you can use the tool by:

1. Create a TypeScript artifact that uses chart data visualization
2. Ask Claude to convert it using the svg-to-html MCP tool:

```
Can you convert this artifact to an HTML page using the svg-to-html MCP tool?
```

### Supported Chart Types

The tool provides helper functions for creating different types of charts:

- `createBarChart(title, data, options)` - Creates a bar chart
- `createLineChart(title, data, options)` - Creates a line chart
- `createPieChart(title, data, options)` - Creates a pie chart with percentage labels

Each chart is created in its own container with appropriate styling and responsive behavior.

## Examples

To create a bar chart, your TypeScript code should do something like:

```typescript
const data = {
  labels: ['January', 'February', 'March'],
  datasets: [{
    label: 'Sales',
    data: [12, 19, 3],
    backgroundColor: ['#3a86ff', '#ff006e', '#8ac926']
  }]
};

createBarChart('Monthly Sales', data);
```

For pie charts with percentage labels:

```typescript
const data = {
  labels: ['Red', 'Blue', 'Yellow'],
  datasets: [{
    data: [300, 50, 100],
    backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
  }]
};

createPieChart('Color Distribution', data);
```

## License

MIT
