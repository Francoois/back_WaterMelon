# back_WaterMelon

This is a school project consisting in a Payment service based on Node.js.  
The project had to respect a few constraints :
 - Database script is provided and *cannot* be modified
 - Database requests have to be `SELECT *` request. Advanced ordering functions and triggers should be emulated with asynchronous functions

## Project Architecture

Architecture was inspired by following article advices : https://softwareontheroad.com/ideal-nodejs-project-structure/

The project code was splitted into three layers :

| |
| :------------- |
| Routers|
| Business Objects / Services |
| Database |

This architecture moves the business logic away from the node.js API Routes, to ensure separation of concerns.

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
