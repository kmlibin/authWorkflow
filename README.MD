# Backend for an ecommerce api

An API that could be used for an ecommerce frontend; features auth routes that register, log in, and log out users, as well as user routes where users can update their user information. When a user is logged in, a JWT is generated and stored in cookies. There are also protected routes that are only available to admin users, and authentication middleware works to ensure users can only access their own data. Of course, as it's an ecommerce API, there are routes to create and modify products, orders, and reviews. 

### Tech stack:
Node, Express, Mongoose, MongoDB