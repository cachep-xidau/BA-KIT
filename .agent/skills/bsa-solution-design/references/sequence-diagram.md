# Sequence Diagram (PlantUML)

## Basic Template

@startuml
!pragma teoz true
autonumber

actor User
participant "API" as API
database "DB" as DB

User -> API: Submit request
API -> DB: Query data
DB --> API: Return result
API --> User: Return response
@enduml

## Participant Types

| Type | Syntax | Use For |
|------|--------|---------|
| Actor | `actor User` | Human |
| Participant | `participant "Name" as Alias` | Component |
| Database | `database DB` | Database |
| Queue | `queue MQ` | Message queue |

## Arrow Types

`->` Sync request | `-->` Sync response | `->>` Async | `-->>` Async response

## Alt Pattern

@startuml
autonumber
actor User
participant API

User -> API: Submit request

alt success
  API --> User: Return data
else failure
  API --> User: Return error
end
@enduml

## Loop Pattern

@startuml
autonumber
participant Cart
participant Inventory

loop for each item in cart
  Cart -> Inventory: Check stock
  Inventory --> Cart: Return stock level
end
@enduml

## Combined Example

@startuml
!pragma teoz true
autonumber

actor Customer
participant Web
participant Cart
participant Payment

Customer -> Web: Initiate checkout

loop for each item
  Web -> Cart: Validate item
  Cart --> Web: Confirm available
end

alt all items available
  Web -> Payment: Process payment
  Payment --> Web: Confirm success
  Web --> Customer: Display confirmation
else items unavailable
  Web --> Customer: Show error
end
@enduml

## BSA Rules

1. **Action names only** - Use "Query users" not SQL code
2. **No JSON payloads** - Use "Return user data" not JSON
3. **No explanatory notes** - Keep diagram clean
4. **Raw PlantUML only** - No markdown fences around @startuml
