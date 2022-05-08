# Dumb Game Framework

Built as a learning exercise. The ECS portion of this project is almost completely lifted from [Maxwell Forbes](https://maxwellforbes.com/posts/typescript-ecs-implementation/). Thanks, Maxwell!


## Entity-Component-System (ECS)

ECS is a framework for modeling game behavior in which _Systems_ act upon _Entities_ which exhibit behavior via _Components_. It encourages composition in a similar way that OOP encourages inheritance. As games grow more complex, sharing behavior/logic via inheritance begins to break down. Probably. Another purported benefit ECS has is that its structure can be used to map game-state more cleanly into memory as contiguous blocks of data, allowing for more cache hits and less fragmentation.

### Entity

Basically an identifier. In fact, we literally have it defined as `type Entity = number`. It is largely used as a key into a dictionary that maps `Entity` keys to `Set<Component>`.


### Component
A bucket of state associated with an Entity. If the game has two players on screen, they may be represented as two `Entity`s, each of which have their own components to hold their state, e.g. `Position`, `Size,` `Velocity`.

### System

An bucket for logic that operates on an `Entity`'s state (their `Component`s). If the players should fall due to gravity, perhaps we have a `Physics` system that applies gravity by changing the players' `Position` components.
