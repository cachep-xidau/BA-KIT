# Non-Functional Requirements (NFRs)

## NFR Categories

| Category | Examples |
|----------|----------|
| Performance | Response time, throughput, latency |
| Scalability | Users, data, transactions growth |
| Availability | Uptime, redundancy, failover |
| Security | Auth, encryption, compliance |
| Reliability | Error rates, recovery, backup |
| Maintainability | Code quality, documentation |
| Usability | Accessibility, learnability |

## Platform-Specific NFR Metrics

| Category | Web | Mobile | Cross-Platform |
|----------|-----|--------|----------------|
| Performance | LCP <2.5s, FID <100ms | Cold start <2s, 60fps | Baseline metrics |
| Security | HTTPS, CSP, CORS, XSS | App signing, Certificate pinning | OAuth 2.0, Encryption |
| Usability | WCAG 2.1, Keyboard nav | HIG/Material, VoiceOver/TalkBack | Design system |
| Scalability | CDN, Load balancing | App size <100MB | Backend scaling |
| Reliability | 99.9% uptime | Offline mode, Retry | Graceful degradation |

## Performance Requirements

```
Response Time:
- Page load: <2 seconds (P95)
- API response: <200ms (P95)
- Database query: <50ms (P95)

Throughput:
- Concurrent users: 1,000
- Requests/second: 500
- Transactions/hour: 10,000
```

## Availability Targets

| Level | Uptime | Downtime/Year |
|-------|--------|---------------|
| 99% | 2 nines | 3.65 days |
| 99.9% | 3 nines | 8.76 hours |
| 99.99% | 4 nines | 52.6 minutes |
| 99.999% | 5 nines | 5.26 minutes |

## Scalability Design

**Vertical**: Add more resources to single node
**Horizontal**: Add more nodes
**Auto-scaling**: Dynamic resource adjustment

```
Load Balancer → [Server 1]
              → [Server 2]
              → [Server N]
```

## Security Requirements

- **Authentication**: MFA, SSO, session timeout
- **Authorization**: RBAC, least privilege
- **Data protection**: Encryption at rest/transit
- **Audit**: Logging, monitoring, alerting
- **Compliance**: GDPR, SOC2, HIPAA, PCI-DSS

## NFR Template

```
ID: NFR-###
Category: [Performance|Security|...]
Requirement: [Measurable statement]
Priority: [Must|Should|Could]
Metric: [How to measure]
Target: [Specific value]
Verification: [How to test]
```

## NFR List Template

| ID | NFR Name | Category | Platform | Priority | Target | Source Req |
|----|----------|----------|----------|----------|--------|------------|
| NFR-001 | Response time | Performance | Web | Must | <2s P95 | REQ-010 |
| NFR-002 | Offline mode | Reliability | Mobile | Must | Local cache | REQ-011 |
| NFR-003 | Uptime SLA | Availability | All | Must | 99.9% | REQ-012 |

## Common NFR Mistakes

- Vague ("fast", "secure", "scalable")
- Unmeasurable (no specific targets)
- Untestable (can't verify)
- Unrealistic (99.999% on $100 budget)
- Missing (discovered post-launch)

## NFR Checklist

- [ ] Performance targets defined
- [ ] Scalability limits specified
- [ ] Availability SLA agreed
- [ ] Security requirements documented
- [ ] Compliance needs identified
- [ ] Recovery objectives set (RTO/RPO)
- [ ] Monitoring strategy planned
- [ ] Testing approach defined

> See `functional-requirements.md` for FR decomposition and function mapping.
