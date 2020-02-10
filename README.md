# rctf - RedpwnCTF's CTF Platform

rctf is RedpwnCTF's CTF platform. It is developed and maintained by the [redpwn](https://redpwn.net) CTF team.

## Design Goals

We have designed rctf with the following attributes in mind:

* scalability
* simplicity
* "modernness" (no PHP)

## Main Features

* simple integration with redpwn's [CTF deployment framework](https://github.com/redpwn/rdeploy)
* dynamic scoring

## Installation

### Database

The application is built on a PostgreSQL database. You should add the appropriate connection string in `.env`. Then run the following command to setup the database. 

```
yarn run migrate up
```

## Development

For hot reloading, use nodemon.

```javascript
yarn dev
```

To fix style errors, use standard. 

```
yarn lint --fix
```
