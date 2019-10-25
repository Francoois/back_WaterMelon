# back_WaterMelon

This is a school project consisting in a Payment service based on Node.js.  
The project had to respect a few constraints :
 - Database script is provided and *cannot* be modified
 - Database requests have to be `SELECT *` request. Advanced ordering functions and triggers should be emulated with asynchronous functions

## Files Structure

 ```txt
 /
 └---src         # Main sources
 |   └--- api    # Routes files
 |   └--- data   # Contain data utilities and schema
 |   └--- model  # Business Objects, used by routers to interact with database
 |   └--- util   # Tools
 └---spec        # Jasmin tests and scripts
 └---res         # resource files

 ```

## Project Architecture

Architecture was inspired by following article advices : https://softwareontheroad.com/ideal-nodejs-project-structure/

The project code was splitted into three layers :

| |
| :------------- |
| Routers|
| Business Objects / Services |
| Database |

This architecture moves the business logic away from the node.js API Routes, to ensure separation of concerns.

### Routers

Routers files are located in `src/api`. Depending on user authentication, Routers are separated between :
- `visitorRouter`,
- `userRouter`,
- `adminRouter`  

I chose to have a separate files approach so that users and admin routes are not mixed, and I can have special assumptions in terms of privileges in each file without having to test it in every route.

### Services - Business objects.

For a better code reuse, I had to organise my Objects so that they can delegate to each others commonly used functions.

Following advices from *Kyle SIMPSON* in his *This & Object Prototype* book, I decided not to fake a class oriented pattern, but instead to use the style described as OLOO : Objects Linked to Other Objects.
That's why I use object delegation a lot trying to ban objects like synthax (like `new`, `class` and so on).

The object that every others share in their [[Prototype]] chain is the one returned by `datamodel`. It provides base functions for every other objects mapped to database entities, such as : general database querying, parameters checking etc...

Other objects have their own functions, and when they are asked for a general operation that is not on their prototype, they delegate to the datamodel object.

This allowed me to add new objects quickly using pre-existing functions !

### Database

The database is accessed from the `data/dbConnector` object. In fact this object is a Singleton, only used by `model/datamodel` Object, to ensure that only one connection to the database is used.

To allow to check parameters, the `data/dataIndex` object enumerate object parameters types.
To generate an *INSERT* or *UPDATE* query, an object can be a *string* or *non String* value.
To check parameters in *CREATE* and *PUT* we also check which parameters are *optional*, or *notUserDefined*, so that a user cannot set itself admin.

## Custom dependencies

### RequireJS

RequireJS is used to split the code into modules

### Jasmine

Jasmine is used for tests. Currently test exists only for *users* and *cards* on *admin* routes. They are located in the `spec` folder and have a `*.spec.js` name. 

To launch the , you have to take some manual config steps :
 - you have to perform a manual POST to /login to get an admin JSON Web Token
 - to test the cards you also have to specify a users id in `attributes.form.user_id` in `cardsCRUD.spec.js`

Then you can launch with :
```console
npm test 			# launch all the tests
npm test spec/foo.spec.js	# lauch tests in foo file
```
