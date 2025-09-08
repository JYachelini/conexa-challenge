## Challenge Conexa

# Requisitos para ejecutar
* Docker
* Variables de entorno en .env


Ejemplo .env

```
APP_VERSION="1.0.0"
PORT="3000"
JWT_SECRET='shh'
JWT_REFRESH_SECRET='shhh'

DB_PORT=5432
DB_USER="starwars"
DB_PASSWORD="starwars"
DB_NAME="starwars"
DB_HOST="localhost"

STARWARS_API_URL="https://swapi.tech/api/"
```

Si las variables de entorno no están setteadas, la api devolverá un error al intentar ejecutar.

Docker levanta los contenedores de la DB (PostgreSQL) y la API.

# Levantar API


# CI/CD 

CI/CD implementado con vercel y github actions.

[API Publica deployada](https://conexa-challenge-nine.vercel.app/docs)

En el ambiente esta conectado con Supabase. Las credenciales las manejo con Doppler.
En caso de trabajar local, se consume las variables de entorno de .env

# Base de datos y entidades
Las entidades se manejan en cada modulo, en la carpeta entity. El modulo Database se encarga de generar la conexión.

Para una aplicación en desarrollo synchronize tendria que estar deshabilitada. Generar y correr migraciones en los pipelines es el scope buscado.
Por falta de tiempo y facilitar el desarrollo agregué el synchronize en true.

Al ejectuar la aplicación se genera un usuario con las siguientes credenciales:
```
username: 'admin'
password: 'admin123'
```


# Testing
Agregué testing unitario a controllers y services.
Me quedó pendiente agregar testeos unitarios para Guards, end to end con supertest y algunos componentes en core/
