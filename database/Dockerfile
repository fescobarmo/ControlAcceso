# database/Dockerfile
# Dockerfile para crear una imagen personalizada de PostgreSQL con esquema y datos iniciales
# Versión: ${DATABASE_VERSION}

# Argumentos de build
ARG POSTGRES_VERSION=15-alpine
ARG DATABASE_VERSION=1.0.0

FROM postgres:${POSTGRES_VERSION}

# Etiquetas de metadatos
LABEL maintainer="ControlAcceso Team"
LABEL version="${DATABASE_VERSION}"
LABEL description="ControlAcceso Database PostgreSQL"
LABEL org.opencontainers.image.title="ControlAcceso Database"
LABEL org.opencontainers.image.description="Base de datos PostgreSQL para sistema de control de acceso"
LABEL org.opencontainers.image.version="${DATABASE_VERSION}"
LABEL org.opencontainers.image.created="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
LABEL org.opencontainers.image.source="https://github.com/tu-usuario/ControlAcceso"

# Instalar dependencias adicionales si es necesario
RUN apk add --no-cache curl

# Copiar scripts de inicialización
COPY schema.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY init-db.js /docker-entrypoint-initdb.d/02-init-db.js
COPY verify-integrity.sql /docker-entrypoint-initdb.d/03-verify-integrity.sql

# Configurar permisos
RUN chmod 644 /docker-entrypoint-initdb.d/*.sql /docker-entrypoint-initdb.d/*.js

# Crear directorio para logs personalizados
RUN mkdir -p /var/log/postgresql && \
    chown postgres:postgres /var/log/postgresql

# Configurar variables de entorno por defecto
ENV POSTGRES_DB=controlacceso
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres123

# Exponer puerto
EXPOSE 5432

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1

# El comando por defecto de postgres:15-alpine ya maneja la inicialización
