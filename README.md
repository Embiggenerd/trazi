# Concerns
## Cities and states are not validated 
* Cities and states are not valited - difficult to find a complete list of US cities
## Accessing cache concurrently
* If you add a new city, and immediately after try to GET that city, you could get an incorrect error due to the GET accessing an old version of the cache - stopping reads while writing goes against #1 goal of performance
## Measuring performance without lowering performance
* There are various hooks into resource related information, but they all slow things down. One solution is to do it but in a worker thread, have that thread write to a file things regarding performance, but the juice may not be worth the squeeze there.
* Solution should be to run another server, make many requests, measure the rate at which correct responses arrive
## Put request can write to file in a worker thread and return 2xx response faster
* Since the user is expecting us to presist data, this would be an unreliable response
* Reading from cached data instead of waiting for a file read is enough