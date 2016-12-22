function SlimDependencyInjection(element) {

    if (element.dependencies) {
        element.dependencies.forEach( dep => {

            if (SlimDependencyInjection.injects[dep]) {
                element.dependency = element.dependency || {}
                element.dependency[dep] = SlimDependencyInjection.injects[dep]
            }
        })
    }
}
SlimDependencyInjection.injects = {}
SlimDependencyInjection.define = function(name, inject) {
    SlimDependencyInjection.injects[name] = inject
}

SlimDependencyInjection.define('TreeModel', ()=>{})

Slim.plugin('create', SlimDependencyInjection)