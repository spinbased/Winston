# Winston N8N Workflows

This directory contains n8n workflow templates for integrating Winston with automation platforms.

## Available Workflows

### 1. winston-legal-assistant.json

Main workflow for handling legal queries through n8n.

**Features**:
- Webhook trigger for external queries
- Winston API integration
- Conditional tax law enhancement
- Redis caching
- Slack notifications
- Metrics tracking
- Database logging

**Setup**:

1. Import workflow into n8n
2. Configure credentials:
   - HTTP Header Auth for Winston API
   - Slack OAuth2
   - Redis connection
   - PostgreSQL (optional)

3. Set environment variables in n8n:
   ```
   WINSTON_API_URL=https://your-winston-instance.vercel.app
   SLACK_CHANNEL=#legal-queries
   TAX_EXPERT_API=https://optional-tax-service.com/api
   ```

4. Activate workflow

5. Test webhook:
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/winston-query \
     -H "Content-Type: application/json" \
     -d '{
       "question": "What are my rights during a traffic stop?",
       "userId": "user123",
       "context": {}
     }'
   ```

## Workflow Nodes

| Node | Purpose |
|------|---------|
| **Webhook** | Receives incoming queries |
| **Track Metrics** | Logs query metrics |
| **Call Winston API** | Sends query to Winston |
| **Is Tax Question?** | Routes tax queries to specialist |
| **Enhanced Tax Analysis** | Additional tax law processing |
| **Send to Slack** | Notifies Slack channel |
| **Cache Response** | Caches in Redis |
| **Log to Database** | Stores query logs |
| **Response** | Returns result to caller |

## Custom Workflows

You can create custom workflows for:

- **Scheduled Reports**: Daily/weekly legal insights
- **Document Processing**: Bulk contract analysis
- **Multi-Agent Research**: Parallel legal research
- **Alert System**: Monitor legal changes
- **Batch Processing**: Process multiple queries

## Integration Examples

### Slack → Winston → Email

```json
{
  "trigger": "Slack message in #legal-help",
  "process": "Send to Winston API",
  "action": "Email detailed response to user"
}
```

### CRM → Winston → Database

```json
{
  "trigger": "New client in CRM",
  "process": "Generate legal checklist with Winston",
  "action": "Store in client database"
}
```

### Scheduler → Winston → Report

```json
{
  "trigger": "Every Monday 9am",
  "process": "Generate weekly legal updates",
  "action": "Send PDF report to team"
}
```

## Best Practices

1. **Error Handling**: Add error nodes for failed API calls
2. **Rate Limiting**: Use delays between batch queries
3. **Caching**: Cache frequent queries in Redis
4. **Logging**: Always log queries for audit trail
5. **Security**: Use environment variables for secrets

## Support

For n8n workflow help:
- n8n Docs: https://docs.n8n.io
- Winston API: See main README.md
- Community: https://community.n8n.io

---

Built with ❤️ for Winston Legal AI
