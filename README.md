# Instructions:
npm install
npm start

cd concurrency
./concurrency

# Concerns
## Fast response time
* data is cached and the cache is used as much as possible
* fastify was used because it has the word fast in it
* ### Possible improvements
    * use uwebsockets
    * place file write on put request in a worker thread - figure out read/write lock logic
## High throughput
* minimize memory and read/write time by using flat object so read are always O(1)
* do not depend on the event loop - minimum use of async funcs
* go server in concurrency folder runs a primitive concurrency test - node was tried but its concurrency model limits requests/second
* ### Possible improvements
    * use time to first byte logic 
    * make sure to never reuse connection in go server
    * turn it into a CLI app with more options, don't hard code logic
## Minimal use of 3rd party modules
* only fastify was installed
* go server only uses the standard library
## Optimized js code
* classes were avoided to keep code simple
* closure to avoid global variable polution
* avoid the event loop
## Structured code
* typical db-models-services-handlers structure was used minus the services due to simplicity
* code is testable - there is no need to mock anything but the server
* if process.env.NODE_ENV === "test", we write to a different file name to avoid changing prod/dev data
* comments are avoided, as they can become a crutch
* the code is optimized to easily use another framework, very little fasitify specific logic exists
### Possible improvements
* possibly consider classes
* rethink how closures can be avoided


# Genreal concerns
## Cities and states are not validated 
* Cities and states are not validated - difficult to find a complete list of US cities
## Accessing cache concurrently
* If you add a new city, and immediately after try to GET that city, you could get an incorrect error due to the GET accessing an old version of the cache - stopping reads while writing goes against #1 goal of performance
## Measuring performance without lowering performance
* There are various hooks into resource related information, but they all slow things down. One solution is to do it but in a worker thread, have that thread write to a file things regarding performance, but the juice may not be worth the squeeze there.
* Measuring concurrency via api load test seems to be the best bet, but I could be wrong
## Put request can write to file in a worker thread and return 2xx response faster
* Since the user is expecting us to presist data, this would be an unreliable response
* Reading from cached data instead of waiting for a file read is enough
## Fastify specific code was avoided
* Hooking into a framework's logging and validation stages will always make it more difficult to switch later