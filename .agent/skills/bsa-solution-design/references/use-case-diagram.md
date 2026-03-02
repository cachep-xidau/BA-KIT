# Use Case Diagram (PlantUML)

Visualize user interactions with system using PlantUML syntax.

## Basic Elements

| Element | PlantUML | Description |
|---------|----------|-------------|
| Actor | `actor User` | User or external system |
| Use Case | `usecase "Login" as UC1` | System functionality |
| System | `rectangle System {}` | System boundary |
| Association | `User -- UC1` | Actor uses use case |
| Include | `UC1 ..> UC2 : <<include>>` | Required sub-function |
| Extend | `UC3 ..> UC1 : <<extend>>` | Optional extension |
| Generalization | `Admin --|> User` | Actor inheritance |

## Basic Template

```plantuml
@startuml
left to right direction

actor Customer
actor Admin

rectangle "E-Commerce System" {
  usecase "Browse Products" as UC1
  usecase "Add to Cart" as UC2
  usecase "Checkout" as UC3
  usecase "Manage Products" as UC4
}

Customer -- UC1
Customer -- UC2
Customer -- UC3
Admin -- UC4
Admin --|> Customer
@enduml
```

## Include Relationship

Use when a use case **always** includes another use case.

```plantuml
@startuml
left to right direction

actor User

rectangle System {
  usecase "Place Order" as UC1
  usecase "Validate Payment" as UC2
  usecase "Update Inventory" as UC3
}

User -- UC1
UC1 ..> UC2 : <<include>>
UC1 ..> UC3 : <<include>>
@enduml
```

## Extend Relationship

Use when a use case **optionally** extends another use case.

```plantuml
@startuml
left to right direction

actor Customer

rectangle System {
  usecase "Checkout" as UC1
  usecase "Apply Coupon" as UC2
  usecase "Add Gift Wrap" as UC3
}

Customer -- UC1
UC2 ..> UC1 : <<extend>>
UC3 ..> UC1 : <<extend>>
@enduml
```

## Actor Generalization

```plantuml
@startuml
left to right direction

actor User
actor Admin
actor "Super Admin" as SA

Admin --|> User
SA --|> Admin

rectangle System {
  usecase "View Data" as UC1
  usecase "Edit Data" as UC2
  usecase "Delete Data" as UC3
}

User -- UC1
Admin -- UC2
SA -- UC3
@enduml
```

## Best Practices

- **Naming**: Use verb phrases (e.g., "Place Order", not "Order")
- **Scope**: Keep 5-10 use cases per diagram
- **Actors**: Place primary actors on left, secondary on right
- **Direction**: Use `left to right direction` for horizontal layout
- **Boundaries**: Use `rectangle` to show system scope

## Use Case Description Template

```
Use Case: [UC-ID] [Name]
Actor: [Primary actor]
Precondition: [What must be true before]
Postcondition: [What is true after]

Main Flow:
1. Actor [action]
2. System [response]
3. ...

Alternative Flow:
3a. [Condition]: System [alternative action]

Exception Flow:
2e. [Error]: System [error handling]
```
