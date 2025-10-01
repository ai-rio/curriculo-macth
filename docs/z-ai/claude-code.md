# Claude Code

> Methods for integrating the latest GLM-4.5 series models from Z.AI with Claude Code

<Tip>
  [GLM Coding Plan](https://z.ai/subscribe?utm_source=zai\&utm_medium=link\&utm_term=glm-coding-plan\&utm_campaign=Platform_Ops&_channel_track_key=38C6fsgR) — designed for Claude Code users, starting at \$3/month to enjoy a premium coding experience! \
  Exclusive to PRO and higher plans: [Vision Understanding MCP Server](/devpack/mcp/vision-mcp-server) [Web Search MCP Server](\(/devpack/mcp/search-mcp-server\))
</Tip>

Z.AI's GLM-4.6 models can be integrated with Claude Code through an Anthropic API-compatible endpoint. This allows Claude Code to communicate with GLM-4.6 without requiring any code modifications to Claude Code itself.

## Step 1: Obtain Your Z.AI API Key

Visit Z.AI to get your [API Key](https://z.ai/manage-apikey/apikey-list)

## Step 2: Configure Environment Variables

After installing Claude Code, set up environment variables using one of the following two methods:

**Method 1: Using a Script (Recommended for First-Time Users)**

```bash
curl -O "http://bigmodel-us3-prod-marketplace.cn-wlcb.ufileos.com/1753683755292-30b3431f487b4cc1863e57a81d78e289.sh?ufileattname=claude_code_prod_zai.sh"
```

**Method 2: Manual Configuration**

```bash
export ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic

export ANTHROPIC_AUTH_TOKEN=YOUR_API_KEY
```

## Step 3: Quick Start with Claude Code

> If prompted with "Do you want to use this API key," select "Yes."

After launching, grant Claude Code permission to access files in your folder as shown below:

![Description](https://cdn.bigmodel.cn/markdown/1753631613096claude-2.png?attname=claude-2.png)

You can now use Claude Code for development!

Mark: Claude Code has two internal model environment variables. The ANTHROPIC_MODEL (main model) uses GLM-4.6 (for scenarios such as dialogue, planning, coding, and complex reasoning), while ANTHROPIC_SMALL_FAST_MODEL uses GLM-4.5-Air (for auxiliary scenarios such as file search and syntax checking). This is also our recommended usage, as it balances performance, speed, and cost. Other models (e.g., GLM-4.5-X / AirX / Flash) are not currently supported.

## How to Switch the Model in Use

> Currently, switching to other models is not supported.

1. Configure `~/.claude/settings.json` with the following content:

```text
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.6",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.6"
  }
}
```

2. Open a new terminal window and run `claude` to start Claude Code.
3. In Claude Code, enter `/status` to check the current model status.

<img src="https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=fbecf30664f94935333dda17b92e40e5" alt="claude-code" data-og-width="1212" width="1212" data-og-height="536" height="536" data-path="images/claudecode.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=280&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=c0cfef184f0882b8bc6d10fe6a0144c7 280w, https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=560&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=6a7f4ace8e98a1c23597a17dd44f6374 560w, https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=840&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=72a7614c3f4099cba9a5b3210b781d68 840w, https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=1100&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=76cd3eeb13e3a88889da31a12fe4f1b9 1100w, https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=1650&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=a734c0c0f1feb6254b4b7d962f4dbc7c 1650w, https://mintcdn.com/zhipu-32152247/fQm1SxNtD2jBDQ3i/images/claudecode.png?w=2500&fit=max&auto=format&n=fQm1SxNtD2jBDQ3i&q=85&s=f7d06ab49dadc15fb18eb778016fdde6 2500w" />

4. To switch back to the **GLM-4.5** model, modify `~/.claude/settings.json` as follows:

```text
{
  "env": {
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.5",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.5"
  }
}
```
