# backend/Dockerfile
# Multi-stage build para aplicación Node.js
# Versión: ${BACKEND_VERSION}

# Argumentos de build
ARG NODE_VERSION=18-alpine
ARG BACKEND_VERSION=1.0.0

# Etapa 1: Dependencias y build
FROM node:${NODE_VERSION} AS dependencies

# Instalar dependencias del sistema necesarias para compilación nativa
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci --silent

# Etapa 2: Build de la aplicación
FROM node:${NODE_VERSION} AS build

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./

# Copiar código fuente
COPY . .

# Ejecutar tests (opcional, comentar si no hay tests)
# RUN npm test

# Etapa 3: Producción
FROM node:${NODE_VERSION} AS production

# Etiquetas de metadatos
LABEL maintainer="ControlAcceso Team"
LABEL version="${BACKEND_VERSION}"
LABEL description="ControlAcceso Backend API"
LABEL org.opencontainers.image.title="ControlAcceso Backend"
LABEL org.opencontainers.image.description="Backend API para sistema de control de acceso"
LABEL org.opencontainers.image.version="${BACKEND_VERSION}"
LABEL org.opencontainers.image.created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LABEL org.opencontainers.image.source="https://github.com/tu-usuario/ControlAcceso"

# Instalar dependencias de seguridad y utilidades
RUN apk add --no-cache curl dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G nodejs -g nodejs nodejs

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production --silent && \
    npm cache clean --force

# Copiar código fuente desde la etapa de build
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/scripts ./scripts

# Crear directorios necesarios y establecer permisos
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar la aplicación
CMD ["node", "src/index.js"]
