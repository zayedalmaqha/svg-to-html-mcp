#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import os from "os";

// Define the SVG to HTML tool
const SVG_TO_HTML_TOOL: Tool = {
  name: "svg_to_html",
  description: "Convert Claude's artifact TypeScript code to HTML page",
  inputSchema: {
    type: "object",
    properties: {
      artifact_content: {
        type: "string",
        description: "The TypeScript content of the artifact to convert"
      },
      artifact_version: {
        type: "string",
        description: "The version of the artifact (e.g., 'v1', 'latest')"
      }
    },
    required: ["artifact_content", "artifact_version"]
  }
};

// Function to validate arguments
function isSvgToHtmlArgs(args: unknown): args is {
  artifact_content: string;
  artifact_version: string;
} {
  if (typeof args !== "object" || args === null) return false;
  
  const { artifact_content, artifact_version } = args as any;
  
  if (typeof artifact_content !== "string" || artifact_content.trim() === "") {
    return false;
  }
  
  if (typeof artifact_version !== "string" || artifact_version.trim() === "") {
    return false;
  }
  
  return true;
}

// Function to convert TypeScript to HTML
function convertTsToHtml(tsCode: string, version: string): string {
  // Basic error checking
  if (!tsCode || tsCode.trim() === "") {
    return "Error: No TypeScript code provided";
  }

  // Create a basic HTML wrapper with the TypeScript code
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Artifact (${version})</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        header {
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .version {
            color: #666;
            font-size: 0.9em;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            overflow: auto;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <header>
        <h1>Converted Artifact</h1>
        <div class="version">Version: ${version}</div>
    </header>
    <div class="content">
        <pre><code>${escapeHtml(tsCode)}</code></pre>
    </div>
    <script>
        // Here we'd execute or process the TypeScript code if needed
        // This would require additional processing like transpiling TS to JS
        
        // For now, we're just displaying the code
        console.log("Artifact version: ${version}");
    </script>
</body>
</html>
  `;

  return htmlContent;
}

// Helper function to escape HTML special characters
function escapeHtml(unsafe: string): string {
  return unsafe
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");
}

async function main() {
  console.error("SVG to HTML MCP Server starting...");
  
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
          const typedArgs = args as any;
          
          if (!typedArgs.artifact_content) {
            return {
              content: [{ 
                type: "text", 
                text: "Error: No artifact content provided. Please provide the TypeScript code from an artifact or ask Claude to create one first."
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

        const htmlOutput = convertTsToHtml(args.artifact_content, args.artifact_version);
        
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
}

// Run the server
main().catch(error => {
  console.error("Error starting SVG to HTML MCP Server:", error);
  process.exit(1);
});