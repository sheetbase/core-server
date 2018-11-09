import { RouteHandler } from './types';

export class RouterService {
    private routes = {};
    private sharedMiddlewares = [];
    private routeMiddlewares = {};

    constructor () {}

    use(...handlers: any[]) {
        if (!!handlers[0] && handlers[0] instanceof Function) {
            this.sharedMiddlewares = this.sharedMiddlewares.concat(handlers);
        } else {
            const routeName = handlers.shift();
            this.register('ALL', routeName, handlers);
        }
    }

    all(routeName: string, ...handlers: any[]) {
        this.register('ALL', routeName, ...handlers);
    }
    get(routeName: string, ...handlers: any[]) {
        this.register('GET', routeName, ...handlers);
    }
    post(routeName: string, ...handlers: any[]) {
        this.register('POST', routeName, ...handlers);
    }
    put(routeName: string, ...handlers: any[]) {
        this.register('PUT', routeName, ...handlers);
    }
    patch(routeName: string, ...handlers: any[]) {
        this.register('PATCH', routeName, ...handlers);
    }
    delete(routeName: string, ...handlers: any[]) {
        this.register('DELETE', routeName, ...handlers);
    }

    route(method: string, routeName: string) {
        const notFoundHandler: RouteHandler = (req, res) => {
            try {
                return res.render('errors/404');
            } catch (error) {
                return res.html(`
					<h1>404!</h1>
					<p>Not found.</p>
				`);
            }
        };
        const handler = this.routes[method + ':' + routeName] || notFoundHandler;
        let handlers = this.routeMiddlewares[method + ':' + routeName] || [];
        // shared middlewares
        handlers = this.sharedMiddlewares.concat(handlers);
        // main handler
        handlers.push(handler);
        return handlers;
    }

    private register(method: string, routeName: string, ...handlers: any[]) {
        if (!routeName) {
            throw new Error('Invalid route name.');
        }
        if(handlers.length < 1) {
            throw new Error('No handlers.');
        }
        // remove invalid handlers
        for (let i = 0; i < handlers.length; i++) {
            if (!handlers[i] || (i !== 0 && !(handlers[i] instanceof Function))) {
                handlers.splice(i, 1);
            }
        }
        // register
        method = method || 'ALL';
        const handler = handlers.pop();
        if (method === 'ALL' || method === 'GET') {
            this.routes['GET:' + routeName] = handler;
            this.routeMiddlewares['GET:' + routeName] = handlers;
        }
        if (method === 'ALL' || method === 'POST') {
            this.routes['POST:' + routeName] = handler;
            this.routeMiddlewares['POST:' + routeName] = handlers;
        }
        if (method === 'ALL' || method === 'PUT') {
            this.routes['PUT:' + routeName] = handler;
            this.routeMiddlewares['PUT:' + routeName] = handlers;
        }
        if (method === 'ALL' || method === 'PATCH') {
            this.routes['PATCH:' + routeName] = handler;
            this.routeMiddlewares['PATCH:' + routeName] = handlers;
        }
        if (method === 'ALL' || method === 'DELETE') {
            this.routes['DELETE:' + routeName] = handler;
            this.routeMiddlewares['DELETE:' + routeName] = handlers;
        }
    }
}