# ─── Estágio 1: Build do React/Vite ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Recebe a URL da API como argumento de build
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ─── Estágio 2: Nginx para servir os arquivos estáticos ───────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
