#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import os from "os";

// Define the Artifact to HTML tool
const ARTIFACT_TO_HTML_TOOL = {
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
    name: "Artifact to HTML Converter",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Function to validate arguments
function isArtifactToHtmlArgs(args) {
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
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Visualization (${version})</title>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --label-color: #666666;
            --grid-color: #eeeeee;
        }
        
        body.dark {
            --bg-color: #1e1e1e;
            --text-color: #f0f0f0;
            --label-color: #bbbbbb;
            --grid-color: #333333;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            transition: background-color 0.3s, color 0.3s;
            margin: 0;
            padding: 0;
        }
        
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: var(--bg-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }
        
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .version {
            color: var(--label-color);
            font-size: 0.9em;
            margin-left: 10px;
        }
        
        .theme-toggle {
            display: flex;
            align-items: center;
        }
        
        .theme-toggle-label {
            margin-right: 8px;
            color: var(--label-color);
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #6d28d9;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #6d28d9;
        }
        
        input:checked + .slider:before {
            -webkit-transform: translateX(26px);
            -ms-transform: translateX(26px);
            transform: translateX(26px);
        }
        
        .container {
            max-width: 1200px;
            margin: 70px auto 20px;
            padding: 20px;
        }
        
        .svg-container {
            max-width: 720px;
            margin: 20px auto;
            padding: 15px;
            border-radius: 8px;
            background-color: var(--bg-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            break-inside: avoid;
        }
        
        @media print {
            .header {
                position: static;
                box-shadow: none;
                border-bottom: 1px solid #eee;
            }
            
            .theme-toggle {
                display: none;
            }
            
            .container {
                margin-top: 20px;
            }
            
            .svg-container {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #eee;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>SVG Visualization <span class="version">${version}</span></h1>
        </div>
        <div class="theme-toggle">
            <span class="theme-toggle-label">Dark Mode</span>
            <label class="switch">
                <input type="checkbox" id="theme-toggle">
                <span class="slider"></span>
            </label>
        </div>
    </div>
    <div class="container">
        <div class="svg-container">
            ${svgCode}
        </div>
    </div>
    <script>
        // Theme toggle functionality
        const toggleSwitch = document.getElementById('theme-toggle');
        
        // Check for saved theme preference or use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark');
            toggleSwitch.checked = true;
        }
        
        // Toggle theme when switch is clicked
        toggleSwitch.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        });
    </script>
</body>
</html>
  `;

  return htmlContent;
}

// Function to convert TypeScript to HTML with Chart.js
function convertTsToHtml(tsCode, version) {
  // Basic error checking
  if (!tsCode || tsCode.trim() === "") {
    return "Error: No TypeScript code provided";
  }

  // Create an HTML wrapper with Chart.js for visualization
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chart Visualization (${version})</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js"></script>
    <style>
        :root {
            --bg-color: #ffffff;
            --text-color: #333333;
            --label-color: #666666;
            --grid-color: #eeeeee;
        }
        
        body.dark {
            --bg-color: #1e1e1e;
            --text-color: #f0f0f0;
            --label-color: #bbbbbb;
            --grid-color: #333333;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
            transition: background-color 0.3s, color 0.3s;
            margin: 0;
            padding: 0;
        }
        
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background-color: var(--bg-color);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }
        
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .version {
            color: var(--label-color);
            font-size: 0.9em;
            margin-left: 10px;
        }
        
        .theme-toggle {
            display: flex;
            align-items: center;
        }
        
        .theme-toggle-label {
            margin-right: 8px;
            color: var(--label-color);
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 24px;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
        }
        
        input:checked + .slider {
            background-color: #6d28d9;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #6d28d9;
        }
        
        input:checked + .slider:before {
            -webkit-transform: translateX(26px);
            -ms-transform: translateX(26px);
            transform: translateX(26px);
        }
        
        .container {
            max-width: 1200px;
            margin: 70px auto 20px;
            padding: 20px;
        }
        
        .chart-container {
            max-width: 720px;
            margin: 20px auto;
            padding: 15px;
            border-radius: 8px;
            background-color: var(--bg-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            height: 400px;
            position: relative;
            break-inside: avoid;
        }
        
        @media print {
            .header {
                position: static;
                box-shadow: none;
                border-bottom: 1px solid #eee;
            }
            
            .theme-toggle {
                display: none;
            }
            
            .container {
                margin-top: 20px;
            }
            
            .chart-container {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid #eee;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>Chart Visualization <span class="version">${version}</span></h1>
        </div>
        <div class="theme-toggle">
            <span class="theme-toggle-label">Dark Mode</span>
            <label class="switch">
                <input type="checkbox" id="theme-toggle">
                <span class="slider"></span>
            </label>
        </div>
    </div>
    <div class="container" id="chart-container">
        <!-- Charts will be dynamically created here -->
    </div>
    
    <script>
        // Theme toggle functionality
        const toggleSwitch = document.getElementById('theme-toggle');
        
        // Check for saved theme preference or use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark');
            toggleSwitch.checked = true;
        }
        
        // Toggle theme when switch is clicked
        toggleSwitch.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                updateChartsTheme(true);
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                updateChartsTheme(false);
            }
        });
        
        // Register the datalabels plugin
        Chart.register(ChartDataLabels);
        
        // Default options for all charts
        const defaultChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                datalabels: {
                    color: function() {
                        return getComputedStyle(document.documentElement).getPropertyValue('--label-color');
                    },
                    font: {
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return value;
                    }
                },
                legend: {
                    labels: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--label-color');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--label-color');
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--label-color');
                        }
                    },
                    suggestedMax: function(context) {
                        const max = context.max;
                        return max * 1.1; // Add 10% extra headroom
                    }
                }
            }
        };
        
        // Function to update chart themes
        function updateChartsTheme(isDark) {
            // This will be called when theme changes
            // Force charts to redraw with new theme
            for (let chart of Chart.instances) {
                chart.update();
            }
        }
        
        // Execute the TypeScript code
        try {
            // Store charts for theme updating
            window.charts = [];
            
            // Wrap in IIFE to avoid global scope pollution
            (function() {
                // Container for charts
                const container = document.getElementById('chart-container');
                
                // Function to create chart containers
                function createChartContainer(title) {
                    const chartWrapper = document.createElement('div');
                    chartWrapper.className = 'chart-container';
                    
                    if (title) {
                        const titleElement = document.createElement('h2');
                        titleElement.textContent = title;
                        titleElement.style.marginTop = '0';
                        chartWrapper.appendChild(titleElement);
                    }
                    
                    const canvas = document.createElement('canvas');
                    chartWrapper.appendChild(canvas);
                    container.appendChild(chartWrapper);
                    
                    return canvas;
                }
                
                // Make chart creation methods available globally
                window.createBarChart = function(title, data, options = {}) {
                    const canvas = createChartContainer(title);
                    const mergedOptions = { ...defaultChartOptions, ...options };
                    
                    // Configure datalabels for bar charts
                    if (!mergedOptions.plugins.datalabels) {
                        mergedOptions.plugins.datalabels = {};
                    }
                    
                    mergedOptions.plugins.datalabels = {
                        ...mergedOptions.plugins.datalabels,
                        anchor: 'end',
                        align: 'top'
                    };
                    
                    const chart = new Chart(canvas, {
                        type: 'bar',
                        data: data,
                        options: mergedOptions
                    });
                    
                    window.charts.push(chart);
                    return chart;
                };
                
                window.createLineChart = function(title, data, options = {}) {
                    const canvas = createChartContainer(title);
                    const mergedOptions = { ...defaultChartOptions, ...options };
                    
                    const chart = new Chart(canvas, {
                        type: 'line',
                        data: data,
                        options: mergedOptions
                    });
                    
                    window.charts.push(chart);
                    return chart;
                };
                
                window.createPieChart = function(title, data, options = {}) {
                    const canvas = createChartContainer(title);
                    const mergedOptions = { ...defaultChartOptions, ...options };
                    
                    // Configure datalabels for pie charts
                    if (!mergedOptions.plugins.datalabels) {
                        mergedOptions.plugins.datalabels = {};
                    }
                    
                    mergedOptions.plugins.datalabels = {
                        ...mergedOptions.plugins.datalabels,
                        formatter: function(value, context) {
                            const label = context.chart.data.labels[context.dataIndex];
                            const percentage = Math.round((value / context.dataset.data.reduce((a, b) => a + b, 0)) * 100);
                            return label + ": " + percentage + "%";
                        }
                    };
                    
                    const chart = new Chart(canvas, {
                        type: 'pie',
                        data: data,
                        options: mergedOptions
                    });
                    
                    window.charts.push(chart);
                    return chart;
                };
                
                // Execute the TypeScript code
                ${tsCode}
            })();
        } catch (error) {
            console.error('Error executing TypeScript code:', error);
            const container = document.getElementById('chart-container');
            container.innerHTML =
              '<div style="color: red; padding: 20px;">' +
                '<h2>Error executing code</h2>' +
                '<pre>' + error.toString() + '</pre>' +
              '</div>';
        }
    </script>
</body>
</html>
  `;

  return htmlContent;
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
  tools: [ARTIFACT_TO_HTML_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    if (name === "svg_to_html") {
      if (!isArtifactToHtmlArgs(args)) {
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
        
        throw new Error("Invalid arguments for Artifact to HTML tool");
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
console.error("Artifact to HTML MCP Server running on stdio");