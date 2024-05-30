console.log("Starting server via Bun!");

const server = Bun.serve({
    port: 3002,
    fetch(req) {
        return new Response("Bun!")
    },
})

console.log(`Listening on http://localhost:${server.port} ...`)