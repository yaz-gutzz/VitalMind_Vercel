<<<<<<< HEAD
# VitalMind con Docker

## Requisitos

1. Docker Desktop instalado y en ejecución.
2. No necesitas instalar MySQL manualmente si usas el compose.

## Levantar todo

Desde la raíz del proyecto:

```powershell
docker compose up --build
```

Eso levanta:

1. MySQL en `localhost:3306`
2. Backend en `localhost:4000`
3. Frontend en `http://localhost:5173`

## Parar los contenedores

```powershell
docker compose down
```

## Ver logs

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

## Comandos por separado

Backend:

```powershell
docker build -t vitalmind-backend ./Back_VitalMind
docker run --rm -p 4000:4000 ^
  -e NODE_ENV=production ^
  -e PORT=4000 ^
  -e CORS_ORIGIN=http://localhost:5173 ^
  -e MYSQL_HOST=host.docker.internal ^
  -e MYSQL_PORT=3306 ^
  -e MYSQL_USER=root ^
  -e MYSQL_PASSWORD=1234 ^
  -e MYSQL_DATABASE=vitalmind ^
  vitalmind-backend
```

Frontend:

```powershell
docker build -t vitalmind-frontend --build-arg VITE_API_URL=http://localhost:4000/api ./Front_VitalMind
docker run --rm -p 5173:80 vitalmind-frontend
```

## Notas

1. El frontend usa `VITE_API_URL=http://localhost:4000/api`.
2. El backend usa MySQL dentro del compose en el servicio `mysql`.
3. Si cambias puertos, actualiza `CORS_ORIGIN` y `VITE_API_URL`.
=======
# VitalMind_1
Repositorio para vercel de vitalmind
>>>>>>> 3a6a0bfd0cd5ecf32b12a01801f27c7786caf912
