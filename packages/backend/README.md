# Floro Backend


The floro backend is the heart of the remote service. It incorporates all of the other modules used by floro and is passed to the servers module.


It manages controller actions, graphql resolvers, and services consumed by controllers and resolvers.

```
src/
    controllers/
    resolvers/
    services/
```

the main entry for the module is `./src/Backend.ts`

### Adding modules to (module.ts)

If you create a new module, please remember to add it to `src/module.ts`.

We use inversify for Dependeny Injection. For a module to end up in the dependency graph you must bind it in `src/module.ts`.


### Why add DI to node???

It's been our experience that creating clear separation of concerns and API boundaries allows projects to scale to multiple contributors. DI also helps in enforcing composition and avoiding bad cyclic dependency patterns.