# Pixray Cloud Gaming - Operational Runbook

This runbook provides operational procedures for managing the Pixray Cloud Gaming platform.

## Table of Contents

1. [Common Operations](#common-operations)
2. [Incident Response](#incident-response)
3. [Monitoring](#monitoring)
4. [Secrets Management](#secrets-management)
5. [Disaster Recovery](#disaster-recovery)
6. [Cost Management](#cost-management)

---

## Common Operations

### Starting the Platform

1. **Verify Infrastructure**
   ```bash
   cd terraform
   terraform plan
   ```

2. **Check Secrets**
   ```bash
   aws secretsmanager get-secret-value --secret-id pixray/production --query SecretString --output text | jq
   ```

3. **Verify Application Health**
   ```bash
   curl https://pixray.cloud/api/health
   ```

### Deploying Updates

1. **Backend/Frontend Updates**
   ```bash
   git pull origin main
   npm install
   npm run build
   pm2 restart pixray-app # or your deployment method
   ```

2. **Database Migrations**
   ```bash
   # Review migration
   cat supabase/migrations/XXX_new_migration.sql

   # Apply in Supabase dashboard or:
   supabase db push
   ```

3. **Infrastructure Updates**
   ```bash
   cd terraform
   terraform plan
   terraform apply
   ```

### Scaling Operations

#### Scale Up Warm Pool

```bash
cd terraform
# Edit terraform.tfvars: warm_pool_size = 5
terraform apply
```

#### Scale Down Warm Pool

```bash
cd terraform
# Edit terraform.tfvars: warm_pool_size = 1
terraform apply
```

### Managing Gaming Instances

#### List Active Sessions

```bash
# Via Supabase
psql> SELECT * FROM active_sessions_view;

# Via AWS
aws ec2 describe-instances \\
  --filters "Name=tag:Application,Values=Pixray-Cloud" \\
            "Name=instance-state-name,Values=running"
```

#### Terminate Stuck Instance

```bash
# Via API
curl -X DELETE https://pixray.cloud/api/v1/sessions/{session-id} \\
  -H "Authorization: Bearer {token}"

# Via AWS CLI
aws ec2 terminate-instances --instance-ids i-xxxxx
```

#### Connect to Gaming Instance (RDP)

```bash
# Get instance IP
aws ec2 describe-instances --instance-ids i-xxxxx \\
  --query 'Reservations[0].Instances[0].PublicIpAddress' --output text

# RDP (from Windows)
mstsc /v:<instance-ip>

# Or use AWS Systems Manager
aws ssm start-session --target i-xxxxx
```

---

## Incident Response

### Session Creation Failures

**Symptoms**: Users report session creation failures, "Failed to create session" errors

**Diagnosis**:
1. Check CloudWatch Logs: `/pixray/gaming-sessions`
2. Verify AWS EC2 limits not exceeded:
   ```bash
   aws service-quotas get-service-quota \\
     --service-code ec2 \\
     --quota-code L-1216C47A
   ```
3. Check AMI availability:
   ```bash
   aws ec2 describe-images --image-ids ami-xxxxx
   ```

**Resolution**:
1. If quota exceeded, request increase via AWS console
2. If AMI missing, update AMI ID in Secrets Manager
3. Check security group allows outbound traffic
4. Review IAM role permissions

### Host Agent Not Registering

**Symptoms**: Session stuck in "launching" state, never reaches "pairing"

**Diagnosis**:
1. RDP into instance (if RDP access enabled)
2. Check host-agent logs: `C:\pixray\agent.log`
3. Check bootstrap logs: `C:\pixray\bootstrap.log`
4. Verify Sunshine service status:
   ```powershell
   Get-Service SunshineService
   ```

**Resolution**:
1. Restart host-agent:
   ```powershell
   Restart-Service PixrayHostAgent
   ```
2. Restart Sunshine:
   ```powershell
   Restart-Service SunshineService
   ```
3. Re-run bootstrap script:
   ```powershell
   C:\pixray\bootstrap.ps1
   ```
4. Check `HOST_AGENT_SECRET` matches between instance and Secrets Manager

### Payment Webhook Failures

**Symptoms**: Users report payments not reflected, webhook errors in Stripe dashboard

**Diagnosis**:
1. Check Stripe webhook logs in Stripe dashboard
2. Check application logs for webhook endpoint
3. Verify webhook signature validation

**Resolution**:
1. Verify `STRIPE_WEBHOOK_SECRET` is correct:
   ```bash
   aws secretsmanager get-secret-value --secret-id pixray/production
   ```
2. Re-send failed webhooks from Stripe dashboard
3. Manually reconcile affected transactions in database
4. Update user credits if needed:
   ```sql
   UPDATE users SET credits = credits + {amount} WHERE id = '{user-id}';
   ```

### Database Connection Issues

**Symptoms**: "Cannot connect to database" errors, timeouts

**Diagnosis**:
1. Check Supabase dashboard for outages
2. Verify connection pooling limits not exceeded
3. Check network connectivity to Supabase

**Resolution**:
1. Restart application to reset connection pool
2. Increase connection pool size if needed
3. Contact Supabase support if database down
4. Implement retry logic with exponential backoff

---

## Monitoring

### Key Metrics to Monitor

#### Application Metrics
- Active sessions count
- Session creation success rate
- Average session duration
- Credits consumed per hour

#### Infrastructure Metrics
- EC2 instance count
- GPU utilization
- Network throughput
- CloudWatch costs

#### Business Metrics
- New user signups
- Credit purchases
- Revenue per user
- Session completion rate

### CloudWatch Dashboards

Create dashboards for:

1. **Session Overview**
   - Active sessions (real-time)
   - Session lifecycle (pending → running → pairing → active)
   - Failed sessions by reason

2. **Host Health**
   - CPU usage per instance
   - GPU usage per instance
   - Memory usage per instance
   - Network I/O

3. **Billing**
   - Credits consumed (hourly)
   - Instance costs (hourly)
   - Stripe revenue (daily)

### Alerts

Configure CloudWatch Alarms:

```bash
# High failure rate
aws cloudwatch put-metric-alarm \\
  --alarm-name PixrayHighFailureRate \\
  --alarm-description "High session failure rate" \\
  --metric-name SessionFailed \\
  --namespace Pixray/Gaming \\
  --statistic Sum \\
  --period 300 \\
  --threshold 5 \\
  --comparison-operator GreaterThanThreshold \\
  --evaluation-periods 2

# GPU over-utilization
aws cloudwatch put-metric-alarm \\
  --alarm-name PixrayGPUOverUtilization \\
  --metric-name HostGPUUsage \\
  --namespace Pixray/Gaming \\
  --statistic Average \\
  --period 300 \\
  --threshold 95 \\
  --comparison-operator GreaterThanThreshold \\
  --evaluation-periods 3
```

---

## Secrets Management

### Rotating Secrets

#### Stripe Keys

1. Generate new keys in Stripe dashboard
2. Update Secrets Manager:
   ```bash
   aws secretsmanager update-secret \\
     --secret-id pixray/production \\
     --secret-string '{"STRIPE_SECRET_KEY":"sk_live_NEW_KEY",...}'
   ```
3. Restart application
4. Verify webhook still working
5. Revoke old keys in Stripe

#### HOST_AGENT_SECRET

1. Generate new secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update Secrets Manager
3. Update environment on all running instances:
   ```powershell
   [System.Environment]::SetEnvironmentVariable("PIXRAY_AGENT_SECRET", "new_secret", "Machine")
   Restart-Service PixrayHostAgent
   ```
4. Restart control plane application

#### AWS Access Keys

Use IAM roles instead of access keys when possible. For key rotation:
1. Create new access key in IAM
2. Update `.env` or deployment environment
3. Test new keys work
4. Deactivate old keys
5. Delete old keys after 24 hours

### Accessing Secrets

```bash
# Get all secrets
aws secretsmanager get-secret-value \\
  --secret-id pixray/production \\
  --query SecretString \\
  --output text | jq

# Get specific secret value
aws secretsmanager get-secret-value \\
  --secret-id pixray/production \\
  --query SecretString \\
  --output text | jq -r '.STRIPE_SECRET_KEY'
```

---

## Disaster Recovery

### Database Backup

Supabase handles automated backups. For manual backup:

```bash
# Export specific tables
pg_dump -h db.{project-id}.supabase.co \\
  -U postgres \\
  -t gaming_sessions \\
  -t users \\
  -t payment_transactions \\
  > backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
psql -h db.{project-id}.supabase.co \\
  -U postgres \\
  < backup_20250101.sql
```

### Infrastructure Disaster Recovery

1. **Recreate Infrastructure from Terraform**
   ```bash
   cd terraform
   terraform destroy # If needed
   terraform apply
   ```

2. **Update Secrets Manager**
   - Restore secrets from secure backup

3. **Deploy Application**
   ```bash
   npm run build
   # Deploy to hosting platform
   ```

4. **Verify Functionality**
   - Test session creation
   - Test payment flow
   - Verify database connectivity

### Backup Strategy

- **Database**: Supabase automatic backups (daily)
- **Infrastructure**: Terraform state in S3 (versioned)
- **Secrets**: Store encrypted backup in 1Password/Vault
- **Application Code**: GitHub (version controlled)

---

## Cost Management

### Daily Cost Monitoring

```bash
# Get yesterday's costs
aws ce get-cost-and-usage \\
  --time-period Start=2025-01-01,End=2025-01-02 \\
  --granularity DAILY \\
  --metrics BlendedCost \\
  --group-by Type=SERVICE
```

### Cost Optimization Checklist

- [ ] Enable EC2 Spot Instances (up to 70% savings)
- [ ] Set up auto-termination for idle instances (>30 min)
- [ ] Review CloudWatch log retention (reduce to 7-30 days)
- [ ] Use S3 Intelligent-Tiering for logs
- [ ] Monitor warm pool size (only enable in high-traffic periods)
- [ ] Review Security Group rules (remove unused)
- [ ] Delete unused EBS snapshots
- [ ] Use Reserved Instances for control plane (if applicable)

### Instance Cost Tracking

Track costs per session:

```sql
SELECT
  gs.id,
  gs.user_id,
  gs.instance_type,
  EXTRACT(EPOCH FROM (COALESCE(gs.ended_at, NOW()) - gs.launched_at)) / 3600 AS hours,
  (EXTRACT(EPOCH FROM (COALESCE(gs.ended_at, NOW()) - gs.launched_at)) / 3600) * 0.526 AS estimated_cost_usd
FROM gaming_sessions gs
WHERE gs.launched_at IS NOT NULL
ORDER BY gs.created_at DESC
LIMIT 100;
```

### Budget Alerts

Set up AWS Budgets:

```bash
aws budgets create-budget \\
  --account-id {account-id} \\
  --budget file://budget.json \\
  --notifications-with-subscribers file://notifications.json
```

---

## Troubleshooting Decision Tree

```
Session Creation Failed
├── Check CloudWatch Logs
│   ├── "Insufficient credits" → User needs to purchase credits
│   ├── "AMI not found" → Update AMI ID in Secrets Manager
│   ├── "Security group not found" → Verify Terraform deployment
│   └── "Capacity error" → Check EC2 limits, try different AZ
├── Host Agent Not Registering
│   ├── Check bootstrap logs on instance
│   ├── Verify HOST_AGENT_SECRET matches
│   └── Restart host-agent service
└── Moonlight Cannot Connect
    ├── Verify Security Group rules (47984, 47998-48010)
    ├── Check Sunshine service running
    └── Test connectivity with telnet
```

---

## Support Escalation

### Level 1: Application Issues
- Check logs and dashboards
- Restart services
- Follow troubleshooting guides

### Level 2: Infrastructure Issues
- AWS support for EC2/VPC issues
- Supabase support for database issues
- Stripe support for payment issues

### Level 3: Critical Incidents
- Multi-region outage
- Data loss
- Security breach

**Contact**: ops@pixray.cloud (configure accordingly)

---

## Maintenance Windows

Schedule maintenance for low-traffic periods:

1. **Weekly**: Database maintenance (automatic via Supabase)
2. **Monthly**: Terraform state verification, security updates
3. **Quarterly**: AMI updates, dependency updates, cost review

**Pre-Maintenance Checklist**:
- [ ] Notify users 48 hours in advance
- [ ] Backup database
- [ ] Test changes in staging environment
- [ ] Prepare rollback plan
- [ ] Have monitoring dashboard open

**Post-Maintenance Checklist**:
- [ ] Verify all services healthy
- [ ] Test session creation flow
- [ ] Check payment processing
- [ ] Monitor for anomalies (1 hour)

---

This runbook should be updated regularly as the platform evolves.
