#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import os from "os";

// Define the SVG to HTML tool
const SVG_TO_HTML_TOOL = {
  name: "svg_to_html",
  description: "Convert Claude's artifact TypeScript/SVG code to HTML page with Chart.js",
  inputSchema: {
    type: "object",
    properties: {
      artifact_content: {
        type: "string",
        description: "The TypeScript/SVG content of the artifact to convert"
      },
      artifact_version: {
        type: "string",
        description: "The version of the artifact (e.g., 'v1', 'latest')"
      }
    },
    required: ["artifact_content", "artifact_version"]
  }
};

const server = new Server(
  {
    name: "SVG to HTML Converter",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Function to validate arguments
function isSvgToHtmlArgs(args) {
  if (typeof args !== "object" || args === null) return false;
  
  const { artifact_content, artifact_version } = args;
  
  if (typeof artifact_content !== "string" || artifact_content.trim() === "") {
    return false;
  }
  
  if (typeof artifact_version !== "string" || artifact_version.trim() === "") {
    return false;
  }
  
  return true;
}

// Detect if content is SVG
function isSvgContent(content) {
  return content.trim().startsWith('<svg') || content.includes('<svg ');
}

// Function to convert SVG to HTML
function convertSvgToHtml(svgCode, version) {
  // Basic error checking
  if (!svgCode || svgCode.trim() === "") {
    return "Error: No SVG code provided";
  }

  // Create HTML wrapper with the SVG content
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>SVG Visualization (${version})</title>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<style>
  :root {
    --bg-color: #ffffff;
    --text-color: #000000;
    --grid-color: #cccccc;
    --label-color: #000000;
  }
  body.dark {
    --bg-color: #121212;
    --text-color: #ffffff;
    --grid-color: #444444;
    --label-color: #ffffff;
  }

  body {
    margin: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Segoe UI', sans-serif;
    padding-top: 80px;
  }

  .header {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--grid-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    z-index: 1000;
    color: var(--text-color);
  }

  .header h1 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .switch input[type="checkbox"] {
    appearance: none;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    outline: none;
    transition: background-color 0.3s;
  }

  .switch input[type="checkbox"]:checked {
    background-color: #4caf50;
  }

  .switch input[type="checkbox"]::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: white;
    top: 1px;
    left: 1px;
    transition: transform 0.3s;
  }

  .switch input[type="checkbox"]:checked::before {
    transform: translateX(20px);
  }

  .chart-container {
    max-width: 720px;
    width: 100%;
    margin: 0 auto 3rem auto;
    position: relative;
    height: auto;
    color: var(--text-color);
  }

  @media (max-width: 768px) {
    .chart-container {
      padding: 0 1rem;
    }
  }

  .svg-container {
    max-width: 720px;
    width: 100%;
    margin: 0 auto 3rem auto;
    position: relative;
    height: auto;
    color: var(--text-color);
  }

  h2 {
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  @media print {
    .header {
      position: relative;
      border: none;
      padding-bottom: 0;
    }
    .switch {
      display: none;
    }
    .chart-container, .svg-container {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
</style>
</head>
<body class="light">
<div class="header">
<h1>SVG Visualization (${version})</h1>
<div class="switch">
  <span>Dark Mode</span>
  <input type="checkbox" id="themeToggle">
</div>
</div>
<div class="svg-container">
${svgCode}
</div>
<script>
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
    });
  }
</script>
</body>
</html>`;

  return htmlContent;
}

// Function to convert TypeScript to HTML with Chart.js
function convertTsToHtml(tsCode, version) {
  // Basic error checking
  if (!tsCode || tsCode.trim() === "") {
    return "Error: No TypeScript code provided";
  }

  // Try to extract chart titles and data from the typescript code
  let title = "Chart Visualization";
  const titleMatch = tsCode.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
  }

  // Create an HTML wrapper with Chart.js
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>${title} (${version})</title>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<style>
  :root {
    --bg-color: #ffffff;
    --text-color: #000000;
    --grid-color: #cccccc;
    --label-color: #000000;
  }
  body.dark {
    --bg-color: #121212;
    --text-color: #ffffff;
    --grid-color: #444444;
    --label-color: #ffffff;
  }

  body {
    margin: 0;
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Segoe UI', sans-serif;
    padding-top: 80px;
  }

  .header {
    position: fixed;
    top: 0;
    width: 100%;
    background-color: var(--bg-color);
    border-bottom: 1px solid var(--grid-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    z-index: 1000;
    color: var(--text-color);
  }

  .header h1 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .switch input[type="checkbox"] {
    appearance: none;
    width: 40px;
    height: 20px;
    background-color: #ccc;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    outline: none;
    transition: background-color 0.3s;
  }

  .switch input[type="checkbox"]:checked {
    background-color: #4caf50;
  }

  .switch input[type="checkbox"]::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: white;
    top: 1px;
    left: 1px;
    transition: transform 0.3s;
  }

  .switch input[type="checkbox"]:checked::before {
    transform: translateX(20px);
  }

  .chart-container {
    max-width: 720px;
    width: 100%;
    margin: 0 auto 3rem auto;
    position: relative;
    height: auto;
    color: var(--text-color);
  }

  @media (max-width: 768px) {
    .chart-container {
      padding: 0 1rem;
    }
  }

  canvas {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 2 / 1;
  }

  h2 {
    text-align: center;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: var(--text-color);
  }

  @media print {
    .header {
      position: relative;
      border: none;
      padding-bottom: 0;
    }
    .switch {
      display: none;
    }
    canvas {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
</head>
<body class="light">
<div class="header">
<h1>${title}</h1>
<div class="switch">
  <span>Dark Mode</span>
  <input type="checkbox" id="themeToggle">
</div>
</div>
<div id="chart-container">
  <!-- Charts will be dynamically created here -->
</div>
<script>
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      updateChartsTheme(document.body.classList.contains("dark"));
    });
  }

  Chart.register(ChartDataLabels);

  // Store charts for theme updating
  window.charts = [];

  // Function to update chart themes
  function updateChartsTheme(isDark) {
    for (let chart of window.charts) {
      chart.update();
    }
  }

  // Common options for all charts
  const optionsBar = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        font: { size: 10 },
        color: 'var(--label-color)',
        anchor: 'end',
        align: 'top',
        formatter: v => v.toFixed(2)
      },
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, color: 'var(--label-color)' }
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 10 }, color: 'var(--label-color)' },
        grid: { color: 'var(--grid-color)' }
      },
      y: {
        ticks: { font: { size: 10 }, color: 'var(--label-color)' },
        grid: { color: 'var(--grid-color)' },
        beginAtZero: true
      }
    }
  };

  const pieOptions = (total) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: 'var(--label-color)',
        font: { size: 10 },
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label + ': ' + (value / total * 100).toFixed(1) + '%';
        }
      },
      legend: {
        position: 'bottom',
        labels: { font: { size: 10 }, color: 'var(--label-color)' }
      }
    }
  });

  // Helper functions for chart creation
  function createChartContainer(title) {
    const container = document.getElementById('chart-container');
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart-container';
    
    if (title) {
      const titleElem = document.createElement('h2');
      titleElem.textContent = title;
      chartDiv.appendChild(titleElem);
    }
    
    const canvas = document.createElement('canvas');
    chartDiv.appendChild(canvas);
    container.appendChild(chartDiv);
    
    return canvas;
  }
  
  // Define chart creation functions that the typescript code might use
  window.createBarChart = function(title, data, options = {}) {
    const canvas = createChartContainer(title);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: data,
      options: { ...optionsBar, ...options }
    });
    window.charts.push(chart);
    return chart;
  };
  
  window.createLineChart = function(title, data, options = {}) {
    const canvas = createChartContainer(title);
    const chart = new Chart(canvas, {
      type: 'line',
      data: data,
      options: { ...optionsBar, ...options }
    });
    window.charts.push(chart);
    return chart;
  };
  
  window.createPieChart = function(title, data, total, options = {}) {
    const canvas = createChartContainer(title);
    const chart = new Chart(canvas, {
      type: 'pie',
      data: data,
      options: { ...pieOptions(total), ...options }
    });
    window.charts.push(chart);
    return chart;
  };

  // Convert React components to chart creation calls
  function processReactComponent() {
    try {
      // Extract data from the TypeScript code
      ${processTypeScriptCode(tsCode)}
    } catch (error) {
      console.error('Error processing TypeScript code:', error);
      document.getElementById('chart-container').innerHTML = 
        '<div style="color: red; padding: 20px; text-align: center;">' +
        '<h2>Error processing React component</h2>' +
        '<p>' + error.message + '</p>' +
        '</div>';
    }
  }

  // Execute the code
  processReactComponent();
</script>
</body>
</html>`;

  return htmlContent;
}

// This function tries to extract chart data and convert React components to Chart.js calls
function processTypeScriptCode(tsCode) {
  // This is a simplified approach - for a full solution, we'd need a proper AST parser
  
  // Extract chart data arrays
  let processedCode = '';
  
  // Look for the main component declaration - it's usually after "const X = () => {"
  const mainComponentMatch = tsCode.match(/const\s+(\w+)\s*=\s*\(\s*\)\s*=>\s*{/);
  if (!mainComponentMatch) {
    // Try with "export default function Component() {"
    const exportFuncMatch = tsCode.match(/export\s+default\s+function\s+(\w+)\s*\(\s*\)\s*{/);
    if (!exportFuncMatch) {
      return '// Could not find main component in the code';
    }
  }

  // Extract data arrays
  const dataArrays = [];
  const dataRegex = /const\s+(\w+)\s*=\s*\[\s*[\s\S]*?\]\s*;/g;
  let match;
  while ((match = dataRegex.exec(tsCode)) !== null) {
    const varName = match[1];
    const arrayCode = match[0];
    processedCode += arrayCode + '\n';
    dataArrays.push(varName);
  }

  // Handle chart creation based on component types used in the code
  if (tsCode.includes('BarChart')) {
    dataArrays.forEach(dataVar => {
      if (tsCode.includes(`dataKey="${dataVar}"`) || tsCode.includes(`data={${dataVar}}`)) {
        processedCode += `
if (typeof ${dataVar} !== 'undefined') {
  createBarChart('${dataVar.replace(/Data$/, '')}', {
    labels: ${dataVar}.map(item => item.name),
    datasets: [{
      label: '${dataVar.replace(/Data$/, '')}',
      data: ${dataVar}.map(item => item.value),
      backgroundColor: ${dataVar}.map(item => item.color || item.fill || '#3a86ff')
    }]
  });
}
`;
      }
    });
  }

  if (tsCode.includes('PieChart')) {
    dataArrays.forEach(dataVar => {
      if (tsCode.includes(`data={${dataVar}}`) && tsCode.includes('Pie')) {
        processedCode += `
if (typeof ${dataVar} !== 'undefined') {
  const total = ${dataVar}.reduce((sum, item) => sum + item.value, 0);
  createPieChart('${dataVar.replace(/Data$/, '')}', {
    labels: ${dataVar}.map(item => item.name),
    datasets: [{
      data: ${dataVar}.map(item => item.value),
      backgroundColor: ${dataVar}.map(item => item.color || item.fill || '#3a86ff')
    }]
  }, total);
}
`;
      }
    });
  }

  if (tsCode.includes('LineChart')) {
    dataArrays.forEach(dataVar => {
      if (tsCode.includes(`data={${dataVar}}`) && tsCode.includes('Line')) {
        processedCode += `
if (typeof ${dataVar} !== 'undefined') {
  createLineChart('${dataVar.replace(/Data$/, '')}', {
    labels: ${dataVar}.map(item => item.name),
    datasets: [{
      label: '${dataVar.replace(/Data$/, '')}',
      data: ${dataVar}.map(item => item.value),
      borderColor: '#3a86ff',
      tension: 0.1
    }]
  });
}
`;
      }
    });
  }

  // If we couldn't extract charts, try with a more generic approach
  if (!processedCode.includes('createBarChart') && !processedCode.includes('createPieChart') && !processedCode.includes('createLineChart')) {
    dataArrays.forEach(dataVar => {
      // Skip small arrays or arrays that are likely not chart data
      if (tsCode.match(new RegExp(`${dataVar}\\s*=\\s*\\[\\s*[^\\]]{100,}`))) {
        const isBarData = tsCode.includes(`${dataVar}`) && (dataVar.includes('Bar') || dataVar.toLowerCase().includes('bar'));
        const isPieData = tsCode.includes(`${dataVar}`) && (dataVar.includes('Pie') || dataVar.toLowerCase().includes('pie'));
        const isLineData = tsCode.includes(`${dataVar}`) && (dataVar.includes('Line') || dataVar.toLowerCase().includes('line'));
        
        const chartType = isPieData ? 'Pie' : (isLineData ? 'Line' : 'Bar');
        
        processedCode += `
if (typeof ${dataVar} !== 'undefined') {
  const chartTitle = '${dataVar.replace(/Data$/, '')}';
  ${chartType === 'Pie' ? `const total = ${dataVar}.reduce((sum, item) => typeof item.value === 'number' ? sum + item.value : sum, 0);` : ''}
  create${chartType}Chart(chartTitle, {
    labels: ${dataVar}.map(item => item.name || item.label || ''),
    datasets: [{
      label: chartTitle,
      data: ${dataVar}.map(item => item.value || item.data || 0),
      backgroundColor: ${dataVar}.map(item => item.color || item.fill || item.backgroundColor || '#3a86ff')
    }]
  }${chartType === 'Pie' ? ', total' : ''});
}
`;
      }
    });
  }

  // Search for individual chart usage patterns if still no charts found
  if (!processedCode.includes('createBarChart') && !processedCode.includes('createPieChart') && !processedCode.includes('createLineChart')) {
    // Look for bar charts
    const barChartRegex = /<BarChart[\s\S]*?<\/BarChart>/g;
    let barChartMatch;
    let barChartCount = 0;
    while ((barChartMatch = barChartRegex.exec(tsCode)) !== null) {
      barChartCount++;
      processedCode += `
// Bar Chart ${barChartCount}
createBarChart('Bar Chart ${barChartCount}', {
  labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
  datasets: [{
    label: 'Sample Bar Chart',
    data: [12, 19, 3, 5, 2],
    backgroundColor: ['#3a86ff', '#ff006e', '#8ac926', '#ffbe0b', '#9d4edd']
  }]
});
`;
    }

    // Look for pie charts
    const pieChartRegex = /<PieChart[\s\S]*?<\/PieChart>/g;
    let pieChartMatch;
    let pieChartCount = 0;
    while ((pieChartMatch = pieChartRegex.exec(tsCode)) !== null) {
      pieChartCount++;
      processedCode += `
// Pie Chart ${pieChartCount}
createPieChart('Pie Chart ${pieChartCount}', {
  labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
  datasets: [{
    data: [30, 20, 25, 15, 10],
    backgroundColor: ['#3a86ff', '#ff006e', '#8ac926', '#ffbe0b', '#9d4edd']
  }]
}, 100);
`;
    }

    // Look for line charts
    const lineChartRegex = /<LineChart[\s\S]*?<\/LineChart>/g;
    let lineChartMatch;
    let lineChartCount = 0;
    while ((lineChartMatch = lineChartRegex.exec(tsCode)) !== null) {
      lineChartCount++;
      processedCode += `
// Line Chart ${lineChartCount}
createLineChart('Line Chart ${lineChartCount}', {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [{
    label: 'Sample Line Chart',
    data: [65, 59, 80, 81, 56],
    borderColor: '#3a86ff',
    tension: 0.1
  }]
});
`;
    }
  }

  // If all our attempts failed, create sample charts as fallback
  if (!processedCode.includes('createBarChart') && !processedCode.includes('createPieChart') && !processedCode.includes('createLineChart')) {
    processedCode += `
// Could not extract chart data from the React component
// Creating sample charts as a fallback

createBarChart('Sample Bar Chart', {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
  datasets: [{
    label: 'Sample Data',
    data: [12, 19, 3, 5, 2],
    backgroundColor: ['#ff006e', '#3a86ff', '#ffbe0b', '#8ac926', '#9d4edd']
  }]
});

createPieChart('Sample Pie Chart', {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
  datasets: [{
    data: [12, 19, 3, 5, 2],
    backgroundColor: ['#ff006e', '#3a86ff', '#ffbe0b', '#8ac926', '#9d4edd']
  }]
}, 41);
`;
  }

  return processedCode;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe) {
  return unsafe
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SVG_TO_HTML_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "svg_to_html") {
      if (!isSvgToHtmlArgs(args)) {
        // Check for specific missing arguments to provide helpful error messages
        const typedArgs = args;
        
        if (!typedArgs.artifact_content) {
          return {
            content: [{ 
              type: "text", 
              text: "Error: No artifact content provided. Please provide the TypeScript or SVG code from an artifact or ask Claude to create one first."
            }],
            isError: true
          };
        }
        
        if (!typedArgs.artifact_version) {
          return {
            content: [{ 
              type: "text", 
              text: "Error: No artifact version specified. Please specify a version (e.g., 'v1', 'latest')."
            }],
            isError: true
          };
        }
        
        throw new Error("Invalid arguments for SVG to HTML tool");
      }

      // Detect if the content is SVG or TypeScript and use the appropriate converter
      const isSvg = isSvgContent(args.artifact_content);
      const htmlOutput = isSvg 
        ? convertSvgToHtml(args.artifact_content, args.artifact_version)
        : convertTsToHtml(args.artifact_content, args.artifact_version);
      
      return {
        content: [{ 
          type: "text", 
          text: htmlOutput
        }],
        isError: false
      };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("SVG to HTML MCP Server running on stdio");