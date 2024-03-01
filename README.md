## Solid Stream Notifications Cache

The Solid Stream Notifications Cache is a service which works on top of one or more Solid Pods to provide an immediate cache for the clients to consume the streaming data stored in the Solid Pods. The Stream Registry maintains state with the Solid Pods and provides a REST API for the clients to interact with the registry instead of the Solid Pods directly. As the experiment done by the maintainers of [CSS](https://github.com/CommunitySolidServer/CommunitySolidServer) demonstrated [here](https://github.com/CommunitySolidServer/CommunitySolidServer/issues/1843#issuecomment-1948600398), the different configurations of the Solid Server can handle around 1k - 2k concurrent GET requests. Some configurations however, such as using the distributed locking approach with the Redis server, it can handle around 15k requests. However, only when the lock expiration time is set to a maximum of 5 minutes (which is not feasible). In cases where there are 3k concurrent GET requests, the response time for the requests is too high. In the expriment done, it took around 17 seconds to respond to 3k concurrent GET requests. This is not feasible for a real-time application as the 2999th client will have to wait for 17 seconds to get the response. The Solid Stream Notifications Cache is designed to solve this problem by providing a cache for the clients to consume the streaming data stored in the Solid Pods. 

An initial architecutre (not final) of the Solid Stream Notifications Cache is shown below:

![Solid Stream Notifications Cache Architecture](./architecture.png)

## License
This code is copyrighted by [Ghent University - imec](https://www.ugent.be/ea/idlab/en) and released under the [MIT License](./LICENSE). 

## Contact

For any questions, please contact [Kush](mailto:kushagrasingh.bisen@ugent.be) or create an issue in the repository [here](https://github.com/argahsuknesib/solid-stream-registry/issues).