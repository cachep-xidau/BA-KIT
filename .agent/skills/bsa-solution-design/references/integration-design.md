# Integration Design

## Integration Patterns

### Synchronous (Request-Response)
```
[Client] ─── request ──→ [Server]
         ←── response ──
```
**Use when**: Immediate response needed, simple operations

### Asynchronous (Message Queue)
```
[Producer] ──→ [Queue] ──→ [Consumer]
```
**Use when**: Decoupling, reliability, variable load

### Event-Driven
```
[Publisher] ──→ [Event Bus] ──→ [Subscriber 1]
                            ──→ [Subscriber 2]
```
**Use when**: Multiple consumers, loose coupling

## API Design Styles

| Style | Use Case | Example |
|-------|----------|---------|
| REST | CRUD operations, resources | `GET /users/123` |
| GraphQL | Flexible queries, mobile | `query { user(id:123) { name } }` |
| gRPC | High performance, microservices | Binary protocol |
| WebSocket | Real-time, bidirectional | Chat, live updates |

## REST API Design

**Resource naming**: Nouns, plural (`/users`, `/orders`)
**HTTP methods**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE
**Status codes**: 2xx success, 4xx client error, 5xx server error

```
GET    /api/v1/users          # List users
GET    /api/v1/users/{id}     # Get user
POST   /api/v1/users          # Create user
PUT    /api/v1/users/{id}     # Update user
DELETE /api/v1/users/{id}     # Delete user
```

## API Security

- **Authentication**: API keys, OAuth 2.0, JWT
- **Authorization**: Role-based, scope-based
- **Rate limiting**: Requests per minute/hour
- **HTTPS**: Always encrypt in transit
- **Input validation**: Sanitize all inputs

## Integration Checklist

- [ ] Protocol defined (REST/GraphQL/gRPC)
- [ ] Authentication mechanism selected
- [ ] Error handling strategy
- [ ] Retry/timeout policies
- [ ] Logging/monitoring plan
- [ ] API versioning strategy
- [ ] Documentation (OpenAPI/Swagger)

## Message Queue Patterns

| Pattern | Description |
|---------|-------------|
| Point-to-Point | One producer, one consumer |
| Pub/Sub | One producer, many consumers |
| Dead Letter | Failed message handling |
| Retry | Automatic retry with backoff |

## Data Format Selection

| Format | Pros | Cons |
|--------|------|------|
| JSON | Human-readable, universal | Verbose |
| XML | Schema validation, mature | Very verbose |
| Protobuf | Compact, fast | Binary, less readable |
| Avro | Schema evolution | Complexity |
