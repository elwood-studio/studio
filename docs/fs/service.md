# Elwood File System Service

## Endpoints

### `GET /fs/v1/tree/:path`

List children of an object

### `POST /fs/v1/tree/:path`

Create a new tree object

### `GET /fs/v1/blob/:path`

Get a blob object

### `POST /fs/v1/blob/:path`

Create a new blob object

### `GET /fs/v1/raw/:path`

Get the content of a blob object

### `GET /fs/v1/share/:path`

Share an object

### `GET|PATCH|DELETE|HEAD /fs/v1/tus`

Upload a file using the [TUS protocol](https://tus.io/)

### `POST /fs/v1/*`

Proxy a request to the [Rclone API](https://rclone.org/rc/)
