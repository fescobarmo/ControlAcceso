# frontend/Dockerfile
# Multi-stage build para aplicación React con Nginx
# Versión: ${FRONTEND_VERSION}

# Argumentos de build
ARG NODE_VERSION=18-alpine
ARG NGINX_VERSION=1.25-alpine
ARG FRONTEND_VERSION=1.0.0

# Etapa 1: Build de la aplicación React
FROM node:${NODE_VERSION} AS build

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Servidor Nginx para servir la aplicación
FROM nginx:${NGINX_VERSION} AS production

# Etiquetas de metadatos
LABEL maintainer="ControlAcceso Team"
LABEL version="${FRONTEND_VERSION}"
LABEL description="ControlAcceso Frontend React App"
LABEL org.opencontainers.image.title="ControlAcceso Frontend"
LABEL org.opencontainers.image.description="Frontend React para sistema de control de acceso"
LABEL org.opencontainers.image.version="${FRONTEND_VERSION}"
LABEL org.opencontainers.image.created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LABEL org.opencontainers.image.source="https://github.com/tu-usuario/ControlAcceso"

# Instalar dependencias de seguridad
RUN apk add --no-cache curl

# El usuario nginx ya existe en la imagen base, solo ajustamos permisos

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/run /tmp/nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html /var/run /tmp/nginx

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Cambiar a usuario no-root
USER nginx

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
