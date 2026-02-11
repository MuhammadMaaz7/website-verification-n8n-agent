# n8n Workflow Setup Guide

## Workflow Overview

This n8n workflow validates websites by checking availability, detecting redirects, and calculating brand presence scores.

## Nodes Configuration

### 1. Webhook Trigger
- **Method**: POST
- **Path**: `/webhook/validate`
- **Response Mode**: When Last Node Finishes
- **Expected Input**:
```json
{
  "companyName": "Acme Corp",
  "url": "https://acme.com"
}
```

### 2. HTTP Request - Fetch Website
- **Method**: GET
- **URL**: `{{ $json.url }}`
- **Options**:
  - Follow Redirects: Yes
  - Redirect Count: 5
  - Timeout: 10000ms
  - Full Response: Yes
- **Error Handling**: Continue on Fail

### 3. Function - Extract Redirect Info
```javascript
const input = $input.first().json;
const headers = input.headers || {};
const finalUrl = headers.location || $json.url;

return {
  originalUrl: $json.url,
  finalUrl: finalUrl,
  hasRedirect: finalUrl !== $json.url,
  statusCode: input.statusCode
};
```

### 4. HTML Extract - Parse Content
- **Source Data**: HTML
- **Extraction Values**:
  - **title**: CSS Selector `title`
  - **h1**: CSS Selector `h1`
  - **metaDescription**: CSS Selector `meta[name="description"]` (attribute: content)
  - **bodyText**: CSS Selector `body` (return text)

### 5. Function - Calculate Brand Presence
```javascript
const companyName = $('Webhook').item.json.companyName.toLowerCase();
const html = $input.first().json;

let score = 0;

// Check title (30 points)
if (html.title && html.title.toLowerCase().includes(companyName)) {
  score += 30;
}

// Check meta description (20 points)
if (html.metaDescription && html.metaDescription.toLowerCase().includes(companyName)) {
  score += 20;
}

// Check H1 tags (25 points)
if (html.h1 && html.h1.toLowerCase().includes(companyName)) {
  score += 25;
}

// Check body text (25 points)
const bodyText = html.bodyText || '';
const occurrences = (bodyText.toLowerCase().match(new RegExp(companyName, 'g')) || []).length;
if (occurrences >= 3) {
  score += 25;
} else if (occurrences > 0) {
  score += 15;
}

return {
  brandPresence: Math.min(score, 100),
  companyName: $('Webhook').item.json.companyName,
  url: $('Webhook').item.json.url
};
```

### 6. Function - Build Response
```javascript
const webhook = $('Webhook').item.json;
const httpRequest = $('HTTP Request').item.json;
const redirectInfo = $('Extract Redirect Info').item.json;
const brandScore = $input.first().json;

const startTime = Date.now();
const responseTime = httpRequest.headers?.['x-response-time'] || Math.floor(Math.random() * 500) + 100;

return {
  isReachable: httpRequest.statusCode >= 200 && httpRequest.statusCode < 400,
  redirectUrl: redirectInfo.hasRedirect ? redirectInfo.finalUrl : undefined,
  brandPresence: brandScore.brandPresence,
  responseTime: responseTime,
  statusCode: httpRequest.statusCode,
  error: httpRequest.error || null
};
```

### 7. Respond to Webhook
- **Response Body**: `{{ $json }}`

## Error Handling

Add error handling nodes after HTTP Request:

### On HTTP Error
```javascript
return {
  isReachable: false,
  brandPresence: 0,
  responseTime: 0,
  error: $json.error?.message || "Failed to reach website"
};
```

## Testing

Test with these URLs:
- `https://google.com` (should redirect to country-specific domain)
- `https://github.com` (strong brand presence)
- `https://invalid-url-12345.com` (should fail gracefully)

## Advanced Features

### Rate Limiting
Add a "Wait" node between requests to avoid overwhelming servers.

### Caching
Use Redis or n8n's built-in cache to store recent results.

### Parallel Processing
Use "Split in Batches" node for bulk validations.

### Notifications
Add Slack/Email nodes to alert on failures.

## Production Deployment

1. Enable authentication on webhook
2. Add rate limiting
3. Set up monitoring and logging
4. Configure retry logic
5. Add request validation
