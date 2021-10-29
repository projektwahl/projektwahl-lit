export function post(app, path, handler) {
    app.post(path, handler);
}
export function get(app, path, handler) {
    app.get(path, handler);
}
