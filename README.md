#styl.io

##Flow
1. The client gets it's styles
2. The client sends the styles to the server
3. Server calculates style hashes
4. Server returns the styles with hashes to the client
5. Server sends the styles with hashes to the manager
6. Manager combines the styles from different clients
7. If there are more properties, manager should ping the clients, try out all the values, see which are supported and so determine the order of properties
8. When a property is changed, the manager knows the hash for every client
9. Manager sends a message to every affected client with the change request
10. Client finds the right style via the hash and makes the change
11. Client replies with the new value as a confirmation

##Communication

### Manager setup
1. Manager to server - manager:init
2. Server to manager - manager:init
3. Server to manager - device:add (for every active client)

### Client setup
1. Client to server - client:init
2. Server to client - client:init
3. Server to manager - device:add (if manager is active)

### Property check
1. Manager to client - property:check (list of values)
2. Client to manager - property:check:response (list: true if ok, false if invalid, string if something else)

### Change request
1. Manager to client - change:request
2. Client to manager - change:response (if the change happened, the server stores it too)

### Reset (TODO)
1. Manager to server & client - device:reset

### Client disconnected
1. Server to manager - device:remove